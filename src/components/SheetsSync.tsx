import React, { useState, useEffect } from 'react';
import { getSyncConfig, saveSyncConfig, getGoogleAppsScriptCode } from '../lib/sheets';
import { FileSpreadsheet, Copy, Check, ShieldCheck, HelpCircle, Link2, Wifi, RefreshCw } from 'lucide-react';

interface SheetsSyncProps {
  onSyncAll: () => Promise<{ success: boolean; message: string }>;
  currentUser: any | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
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
          {/* Google Sheets API Auth Card */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Otorisasi Google Sheets API (OAuth)
            </h3>
            {currentUser ? (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-grow space-y-1">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Telah Terkoneksi</p>
                  <p className="text-[11px] text-emerald-700">
                    Aplikasi terhubung langsung ke Google Sheets API sebagai <strong>{currentUser.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-2 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 border-b border-emerald-300 hover:border-emerald-600 uppercase tracking-wider cursor-pointer"
                  >
                    Putuskan Koneksi Google Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Masuk dengan Google untuk mengizinkan aplikasi menulis data secara real-time langsung ke file Google Spreadsheet Anda menggunakan Spreadsheet ID.
                </p>
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all text-slate-700 hover:text-slate-900 cursor-pointer uppercase tracking-wider"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3-.97 4.17v3.46h6.48c3.8-3.5 5.97-8.67 5.97-14.48z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-6.48-3.46c-1.8.84-3.87 1.34-6.04 1.34-4.65 0-8.58-3.14-9.99-7.37H.94v3.58C3.04 19.38 7.21 24 12 24z" />
                    <path fill="#FBBC05" d="M2.01 11.6c-.36-1.08-.56-2.22-.56-3.4s.2-2.32.56-3.4V1.22H.94C.34 2.42 0 3.77 0 5.2c0 1.43.34 2.78.94 3.98l1.07 2.42z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.21 0 3.04 4.62.94 8.78l7.98 6.19c1.41-4.23 5.34-7.37 9.99-7.37z" />
                  </svg>
                  Connect Google Account
                </button>
                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg space-y-1 mt-2">
                  <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wide">💡 Tips Koneksi IFrame</p>
                  <p className="text-[10px] text-blue-700 leading-normal font-medium">
                    Jika login gagal atau jendela pop-up tertutup otomatis karena kendala iFrame (Preview), silakan klik tombol <strong>"Open in a new tab"</strong> di pojok kanan atas layar Anda untuk membuka aplikasi secara penuh, lalu hubungkan kembali akun Google Anda di tab tersebut.
                  </p>
                </div>
              </div>
            )}
          </div>

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
