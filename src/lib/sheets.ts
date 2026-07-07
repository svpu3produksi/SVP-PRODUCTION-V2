import { Batch } from '../types';

export interface SyncConfig {
  appScriptUrl: string;
  spreadsheetId: string;
  useOAuth: boolean;
}

// Default config stored in localStorage
const STORAGE_KEY_CONFIG = 'svp_sheets_sync_config';

export function getSyncConfig(): SyncConfig {
  const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  return {
    appScriptUrl: '',
    spreadsheetId: '',
    useOAuth: false
  };
}

export function saveSyncConfig(config: SyncConfig) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

/**
 * Generates the Google Apps Script code that the user can paste in their Google Sheet.
 */
export function getGoogleAppsScriptCode(): string {
  return `/**
 * Google Apps Script - Database Backend
 * "Production Process Monitoring SVP Production"
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet.
 * 2. Rename the active sheet to "SVP Production" or add a new sheet with that name.
 * 3. Set up the column headers in Row 1:
 *    A1: "Nama Produk", B1: "No. Batch", C1: "Mixing Tank", D1: "Holding Tank", E1: "Mesin Filling", F1: "Output", G1: "Timestamp"
 * 4. Go to Extensions > Apps Script.
 * 5. Replace all code in the editor with this script.
 * 6. Click "Deploy" > "New deployment".
 * 7. Choose "Web app" as deployment type.
 * 8. Set "Execute as" to "Me" (your email) and "Who has access" to "Anyone".
 * 9. Copy the Web App URL and paste it into the SVP Production App Sync Panel.
 */

function doGet(e) {
  return HtmlService.createHtmlOutput("SVP Production Apps Script Active");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10 seconds for concurrent writes
  
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("SVP Production");
    if (!sheet) {
      sheet = doc.insertSheet("SVP Production");
      sheet.appendRow(["Nama Produk", "No. Batch", "Mixing Tank", "Holding Tank", "Mesin Filling", "Output", "Timestamp"]);
    }
    
    if (action === "syncBatch") {
      var batch = postData.data;
      
      // Check if batch already exists in sheets to avoid double entries
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var foundIndex = -1;
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][1] === batch.noBatch) { // matching No. Batch (Column B)
          foundIndex = i + 1; // 1-indexed row
          break;
        }
      }
      
      var rowData = [
        batch.namaProduk,
        batch.noBatch,
        batch.mixingTank,
        batch.holdingTank,
        batch.mesinFilling,
        batch.outputAktual,
        new Date().toLocaleString()
      ];
      
      if (foundIndex !== -1) {
        // Update existing row
        sheet.getRange(foundIndex, 1, 1, 7).setValues([rowData]);
      } else {
        // Append new row
        sheet.appendRow(rowData);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Batch synced successfully" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getAll") {
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var headers = values[0];
      var list = [];
      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        list.push({
          namaProduk: row[0],
          noBatch: row[1],
          mixingTank: row[2],
          holdingTank: row[3],
          mesinFilling: row[4],
          outputAktual: Number(row[5]) || 0,
          timestamp: row[6]
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: list }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;
}

/**
 * Send batch to Google Sheets, trying either Apps Script Web App URL or direct Google Sheets API with token
 */
export async function syncBatchToSheets(batch: Batch, oauthToken?: string | null): Promise<{ success: boolean; message: string }> {
  const config = getSyncConfig();

  // Mode 1: Apps Script URL (most common and versatile for Apps Script base)
  if (config.appScriptUrl) {
    try {
      const response = await fetch(config.appScriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain', // avoid pre-flight options error in simple AppScript setup
        },
        body: JSON.stringify({
          action: 'syncBatch',
          data: batch
        })
      });
      const resData = await response.json();
      if (resData.status === 'success') {
        return { success: true, message: 'Berhasil disinkronisasi ke Google Sheet melalui Apps Script!' };
      } else {
        return { success: false, message: resData.message || 'Gagal sinkronisasi.' };
      }
    } catch (e: any) {
      console.warn('Apps Script Web App direct call blocked or failed. Saving to Spreadsheet via Google Sheets API if token exists...', e);
      // Let's fall back to direct sheets API if signed in or local save
    }
  }

  // Mode 2: Direct Google Sheets API using OAuth token
  if (config.spreadsheetId && oauthToken) {
    try {
      // Fetch sheet info first to check if sheet "SVP Production" exists
      const sheetCheckRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}`, {
        headers: { Authorization: `Bearer ${oauthToken}` }
      });
      
      if (!sheetCheckRes.ok) {
        throw new Error('Gagal mengakses Spreadsheet ID. Pastikan ID Spreadsheet benar.');
      }

      const sheetData = await sheetCheckRes.json();
      const hasSvpSheet = sheetData.sheets.some((s: any) => s.properties.title === 'SVP Production');
      
      // If the sheet doesn't exist, create it
      if (!hasSvpSheet) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${oauthToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              addSheet: {
                properties: { title: 'SVP Production' }
              }
            }]
          })
        });

        // Initialize header row
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/SVP Production!A1:G1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${oauthToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [['Nama Produk', 'No. Batch', 'Mixing Tank', 'Holding Tank', 'Mesin Filling', 'Output', 'Timestamp']]
          })
        });
      }

      // Check if batch already exists in Column B (No. Batch) to avoid duplicate rows
      const readRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/SVP Production!A:G`, {
        headers: { Authorization: `Bearer ${oauthToken}` }
      });
      const readData = await readRes.json();
      const rows = readData.values || [];
      let foundRowIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === batch.noBatch) {
          foundRowIndex = i + 1; // row number in Sheets (1-indexed)
          break;
        }
      }

      const newRow = [
        batch.namaProduk,
        batch.noBatch,
        batch.mixingTank,
        batch.holdingTank,
        batch.mesinFilling,
        batch.outputAktual,
        new Date().toLocaleString('id-ID')
      ];

      if (foundRowIndex !== -1) {
        // Update row
        const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/SVP Production!A${foundRowIndex}:G${foundRowIndex}?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${oauthToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [newRow] })
        });
        if (updateRes.ok) {
          return { success: true, message: 'Berhasil mengupdate baris batch di Google Sheet.' };
        }
      } else {
        // Append row
        const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/SVP Production!A:G:append?valueInputOption=USER_ENTERED`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${oauthToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [newRow] })
        });
        if (appendRes.ok) {
          return { success: true, message: 'Berhasil menambahkan baris batch ke Google Sheet.' };
        }
      }
      
      throw new Error('Gagal menulis data ke Spreadsheet.');
    } catch (e: any) {
      console.error('Direct Sheets API failed:', e);
      return { success: false, message: `Gagal sinkronisasi Google Sheets API: ${e.message || e}` };
    }
  }

  // Fallback: Local database status message (Always succeeds locally)
  return { 
    success: true, 
    message: 'Data disimpan lokal! (Hubungkan Google Sheets / Apps Script di panel sinkronisasi untuk menyimpan di cloud)' 
  };
}
