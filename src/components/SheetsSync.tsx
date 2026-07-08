import React, { useState, useEffect } from 'react';
import { getSyncConfig, saveSyncConfig, getGoogleAppsScriptCode } from '../lib/sheets';
import { FileSpreadsheet, Copy, Check, ShieldCheck, HelpCircle, Link2, Wifi, RefreshCw } from 'lucide-react';

interface SheetsSyncProps {
  onSyncAll: () => Promise<{ success: boolean; message: string }>;
  currentUser?: any | null;
  onLogin?: () => Promise<void>;
  onLogout?: () => Promise<void>;
}

export default function SheetsSync({ onSyncAll, currentUser, onLogin, onLogout }: SheetsSyncProps) {
  const [config, setConfig] = useState({
    appScriptUrl: '',
    spreadsheetId: '',
    useOAuth: false
  });

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getSyncConfig();
    setConfig(loaded);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSyncConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getGoogleAppsScriptCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const result = await onSyncAll();
      if (result.success) {
        setSyncStatus(`Sukses: ${result.message}`);
      } else {
        setSyncStatus(`Gagal: ${result.message}`);
      }
    } catch (err: any) {
      setSyncStatus(`Error: ${err.message || err}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bento-card p-6">
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 animate-pulse" />
          Google Sheets Database & Apps Script Integration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hubungkan aplikasi ke Google Spreadsheet Anda secara langsung sebagai database cloud handal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Form & Manual trigger */}
        <div className="space-y-6">
          <form onSubmit={handleSave} className="bento-card p-6 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-500" />
              Parameter Sinkronisasi Sheets
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                Google Apps Script Web App URL
                <span className="text-emerald-600 text-[9px] bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded font-bold uppercase">Direkomendasikan</span>
              </label>
              <input
                id="input_app_script_url"
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={config.appScriptUrl}
                onChange={(e) => setConfig({ ...config, appScriptUrl: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[9px] text-slate-400 font-medium">Gunakan opsi ini untuk sinkronisasi otomatis multi-user tanpa login Google Auth tambahan.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Spreadsheet ID (Alternatif OAuth)</label>
              <input
                id="input_spreadsheet_id"
                type="text"
                placeholder="1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                value={config.spreadsheetId}
                onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[9px] text-slate-400 font-medium">ID unik Spreadsheet Anda (diambil dari baris URL Spreadsheet).</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Status: Aktif
              </span>
              <button
                type="submit"
                id="btn_save_config"
                className="bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100/60 text-[10px] font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                {saved ? 'Konfigurasi Disimpan!' : 'Simpan Parameter'}
              </button>
            </div>
          </form>

          {/* Test & Manual Sync panel */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin-slow" />
              Sinkronisasi Manual & Pengujian
            </h3>
            <p className="text-xs text-slate-500">
              Kirim semua riwayat batch yang tersimpan di memori browser lokal ini langsung ke baris Google Sheet yang telah dikonfigurasi.
            </p>
            
            <button
              id="btn_trigger_manual_sync"
              disabled={syncing}
              onClick={handleManualSync}
              className="w-full flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sedang Sinkronisasi...' : 'Sinkronisasikan Semua Data Ke Google Sheets'}
            </button>

            {syncStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                syncStatus.startsWith('Sukses') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
              }`}>
                {syncStatus}
              </div>
            )}
          </div>
        </div>

        {/* Copy paste Google Apps Script Guide */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-150">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Kode Google Apps Script
            </h3>
            <button
              onClick={handleCopyCode}
              id="btn_copy_script"
              className="flex items-center gap-1.5 text-[10px] text-blue-600 hover:text-blue-850 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin Kode'}
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Tempel kode Apps Script di bawah ini ke Spreadsheet Anda (pilih menu <strong>Extensions &gt; Apps Script</strong>). Simpan dan deploy sebagai <strong>Web App</strong> dengan akses diset ke <strong>Anyone</strong>.
          </p>

          <pre className="p-3.5 bg-slate-50 rounded-xl text-[10px] bento-mono text-slate-500 overflow-x-auto max-h-72 border border-slate-200 leading-normal">
            {getGoogleAppsScriptCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}
