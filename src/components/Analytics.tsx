import React, { useState } from 'react';
import { Batch, Machine, MESIN_FILLING_OPTIONS } from '../types';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, AreaChart, Area
} from 'recharts';
import { FileSpreadsheet, FileText, TrendingUp, Sparkles, Trash2 } from 'lucide-react';

interface AnalyticsProps {
  batches: Batch[];
  historicalBatches: Batch[];
  machines: Machine[];
  onDeleteBatch?: (id: string) => void;
}

export default function Analytics({ batches, historicalBatches, machines, onDeleteBatch }: AnalyticsProps) {
  // Persistent Target configuration states
  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('svp_monthly_target');
    return saved ? Number(saved) : 120000;
  });

  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month'>('week');

  const handleUpdateMonthlyTarget = (val: number) => {
    setMonthlyTarget(val);
    localStorage.setItem('svp_monthly_target', String(val));
  };

  // Combine active finished or historical batches for stats
  const allCompleted = [...historicalBatches, ...batches.filter(b => b.phase === 'DONE')];

  // 1. Total output calculation for dynamic metrics
  const machineOutputMap: Record<string, number> = {};
  MESIN_FILLING_OPTIONS.forEach(m => {
    machineOutputMap[m] = 0;
  });

  allCompleted.forEach(b => {
    if (b.mesinFilling && machineOutputMap[b.mesinFilling] !== undefined) {
      machineOutputMap[b.mesinFilling] += b.outputAktual;
    }
  });

  // Also count active filling outputs to make chart dynamic
  batches.filter(b => b.phase === 'FILLING').forEach(b => {
    if (b.mesinFilling && machineOutputMap[b.mesinFilling] !== undefined) {
      machineOutputMap[b.mesinFilling] += b.outputAktual;
    }
  });

  const machineOutputData = Object.entries(machineOutputMap)
    .map(([machine, total]) => ({ machine, Output: total }));

  const totalCompletedOutput = machineOutputData.reduce((sum, item) => sum + item.Output, 0);

  // 2. Weekly Output Trend Data (SVP Weekly Target dynamically distributed based on Monthly target)
  const weeklyData = [
    { period: 'Minggu 1', Target: Math.round(monthlyTarget * 0.2), Aktual: 23400 },
    { period: 'Minggu 2', Target: Math.round(monthlyTarget * 0.25), Aktual: 26800 },
    { period: 'Minggu 3', Target: Math.round(monthlyTarget * 0.25), Aktual: 28900 },
    { period: 'Minggu 4', Target: Math.round(monthlyTarget * 0.3), Aktual: totalCompletedOutput > 0 ? totalCompletedOutput : 31200 }
  ];

  // 3. Monthly Output Trend Data
  const monthlyData = [
    { period: 'April 2026', Target: 100000, Aktual: 98000 },
    { period: 'Mei 2026', Target: 110000, Aktual: 115400 },
    { period: 'Juni 2026', Target: 120000, Aktual: 118000 },
    { period: 'Juli 2026 (Berjalan)', Target: monthlyTarget, Aktual: totalCompletedOutput > 0 ? totalCompletedOutput : 34500 }
  ];

  const currentTrendData = trendPeriod === 'week' ? weeklyData : monthlyData;

  // 4. EXPORTS
  // Export to Excel-compatible CSV Spreadsheet
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'No,Nama Produk,No Batch,Mixing Tank,Holding Tank,Mesin Filling,Output Aktual,Target,Status,Tanggal Selesai\n';
    
    allCompleted.forEach((b, idx) => {
      const row = [
        idx + 1,
        `"${b.namaProduk}"`,
        b.noBatch,
        b.mixingTank,
        b.holdingTank,
        b.mesinFilling,
        b.outputAktual,
        b.outputTarget,
        b.phase,
        b.completedAt || new Date().toLocaleDateString()
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SVP_Production_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Triggers structured high-fidelity Print view)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Analytics Hero / Selector */}
      <div className="bento-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 animate-pulse" />
            Laporan Grafik Analitik SVP Production
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analisis tren produksi, parameter target bulanan, dan log riwayat SVP. Tekan Export untuk mengunduh.
          </p>
        </div>
        
        {/* Export buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            id="btn_export_csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/60 text-[10px] font-extrabold px-3 py-2 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel / CSV
          </button>

          <button
            id="btn_export_pdf"
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-800 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Target Setting Input & Period Toggle */}
      <div className="bento-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
            Target Output Bulanan (Juli 2026)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="input_monthly_target"
              type="number"
              value={monthlyTarget}
              onChange={(e) => handleUpdateMonthlyTarget(Number(e.target.value) || 0)}
              className="w-48 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan target bulanan"
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase bento-mono">pcs</span>
          </div>
          <p className="text-[10px] text-slate-400">Sesuaikan target produksi bulanan SVP untuk memperbarui grafik dan porsi target mingguan.</p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
            Filter Periode Tren
          </span>
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => setTrendPeriod('week')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                trendPeriod === 'week' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setTrendPeriod('month')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                trendPeriod === 'month' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>
      </div>

      {/* Production Trend Analysis */}
      <div className="bento-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500 animate-pulse" />
              Production Trend Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis performa output produksi keseluruhan, perbandingan target, dan tren akumulasi ({trendPeriod === 'week' ? 'Mingguan' : 'Bulanan'}).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Output Aktual</span>
              <span className="text-xs font-black text-slate-800 bento-mono">
                {totalCompletedOutput.toLocaleString()} pcs
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Pencapaian Target</span>
              <span className="text-xs font-black text-blue-600 bento-mono">
                {monthlyTarget > 0 ? Math.round((totalCompletedOutput / monthlyTarget) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Perbandingan Target vs Aktual */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Grafik Perbandingan Target vs Aktual
            </h4>
            <div className="h-72 bg-slate-50/40 p-3 rounded-xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentTrendData} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} pcs`} />
                  <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                  <Bar name="Target Produksi" dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar name="Aktual Produksi" dataKey="Aktual" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Tren Akumulasi / Proyeksi Output */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Kurva Trend Pertumbuhan Output
            </h4>
            <div className="h-72 bg-slate-50/40 p-3 rounded-xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentTrendData} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} pcs`} />
                  <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                  <Area name="Tren Output Aktual" type="monotone" dataKey="Aktual" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAktual)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Production Output Summary Table */}
      <div className="bento-card p-6 space-y-4">
        <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Detail Log Produksi Historical (Siap Di-export)</h3>
        
        {allCompleted.length === 0 ? (
          <p className="text-xs text-slate-450 italic text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 uppercase font-bold tracking-wider">Belum ada batch selesai produksi untuk di-analisis.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3">No. Batch</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Mixing Tank</th>
                  <th className="p-3">Holding Tank</th>
                  <th className="p-3">Mesin Filling</th>
                  <th className="p-3">Output Aktual</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold text-xs">
                {allCompleted.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50">
                    <td className="p-3 bento-mono font-bold text-slate-800">{batch.noBatch}</td>
                    <td className="p-3 font-extrabold text-slate-900">{batch.namaProduk}</td>
                    <td className="p-3 font-medium text-slate-600">{batch.mixingTank}</td>
                    <td className="p-3 font-medium text-slate-600">{batch.holdingTank}</td>
                    <td className="p-3 font-extrabold text-slate-800">{batch.mesinFilling}</td>
                    <td className="p-3 text-emerald-600 font-bold bento-mono">{batch.outputAktual.toLocaleString()}</td>
                    <td className="p-3 text-slate-400 bento-mono">{batch.outputTarget.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-750 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-200 uppercase tracking-wider bento-mono">
                        {batch.phase}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteBatch?.(batch.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Hapus dari log historical"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
