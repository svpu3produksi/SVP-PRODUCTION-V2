import React, { useState } from 'react';
import { DowntimeLog, DowntimeCategory, DOWNTIME_CATEGORIES, MESIN_FILLING_OPTIONS } from '../types';
import { 
  Activity, AlertOctagon, BarChart2, Calendar, Clock, Disc, Plus, 
  TrendingUp, TrendingDown, RefreshCcw, Sliders 
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

interface OeeDowntimeProps {
  downtimes: DowntimeLog[];
  onAddDowntime: (log: Omit<DowntimeLog, 'id' | 'timestamp'>) => void;
  onClearDowntimes: () => void;
}

export default function OeeDowntime({ downtimes, onAddDowntime, onClearDowntimes }: OeeDowntimeProps) {
  // Downtime logger form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({
    machineName: MESIN_FILLING_OPTIONS[0],
    category: 'Mechanical' as DowntimeCategory,
    durationMinutes: 30,
    notes: ''
  });

  // Selected Machine for Monitoring
  const [selectedMachine, setSelectedMachine] = useState<string>('Semua Mesin');

  // OEE Inputs / Modifiers per machine (or cumulative)
  const [machineInputs, setMachineInputs] = useState<Record<string, {
    plannedProductionTime: number;
    actualOutput: number;
    idealOutput: number;
    goodProduct: number;
  }>>(() => {
    const initial: Record<string, any> = {
      'Semua Mesin': {
        plannedProductionTime: 480,
        actualOutput: 24000,
        idealOutput: 28000,
        goodProduct: 23850
      }
    };
    MESIN_FILLING_OPTIONS.forEach(m => {
      initial[m] = {
        plannedProductionTime: 480,
        actualOutput: 2400,
        idealOutput: 2800,
        goodProduct: 2380
      };
    });
    return initial;
  });

  const currentInputs = machineInputs[selectedMachine] || {
    plannedProductionTime: 480,
    actualOutput: 24000,
    idealOutput: 28000,
    goodProduct: 23850
  };

  const plannedProductionTime = currentInputs.plannedProductionTime;
  const actualOutput = currentInputs.actualOutput;
  const idealOutput = currentInputs.idealOutput;
  const goodProduct = currentInputs.goodProduct;

  const setPlannedProductionTime = (val: number) => {
    setMachineInputs(prev => ({
      ...prev,
      [selectedMachine]: { ...prev[selectedMachine], plannedProductionTime: val }
    }));
  };
  const setActualOutput = (val: number) => {
    setMachineInputs(prev => ({
      ...prev,
      [selectedMachine]: { ...prev[selectedMachine], actualOutput: val }
    }));
  };
  const setIdealOutput = (val: number) => {
    setMachineInputs(prev => ({
      ...prev,
      [selectedMachine]: { ...prev[selectedMachine], idealOutput: val }
    }));
  };
  const setGoodProduct = (val: number) => {
    setMachineInputs(prev => ({
      ...prev,
      [selectedMachine]: { ...prev[selectedMachine], goodProduct: val }
    }));
  };

  // Filter downtimes by selected machine
  const filteredDowntimes = selectedMachine === 'Semua Mesin'
    ? downtimes
    : downtimes.filter(d => d.machineName === selectedMachine);

  // Dynamic calculations based on filtered downtimes
  const totalDowntimeMinutes = filteredDowntimes.reduce((sum, d) => sum + d.durationMinutes, 0);
  
  // Calculate availability dynamically
  const calculatedOperatingTime = Math.max(0, plannedProductionTime - totalDowntimeMinutes);
  const availability = plannedProductionTime > 0 ? (calculatedOperatingTime / plannedProductionTime) : 0;
  
  const performance = idealOutput > 0 ? (actualOutput / idealOutput) : 0;
  const quality = actualOutput > 0 ? (goodProduct / actualOutput) : 0;
  const oee = availability * performance * quality;

  // Format percentage
  const pct = (num: number) => Math.round(num * 1000) / 10;

  // Donut chart data for OEE factors
  const oeeFactorsData = [
    { name: 'Availability', value: pct(availability), color: '#4f46e5' },
    { name: 'Performance', value: pct(performance), color: '#10b981' },
    { name: 'Quality', value: pct(quality), color: '#f59e0b' }
  ];

  // OEE Gauge data (semi-donut)
  const oeeGaugeData = [
    { value: pct(oee) },
    { value: 100 - pct(oee) }
  ];

  // OEE historical trend
  const oeeTrendData = [
    { day: 'Senin', OEE: 78.5, Availability: 85, Performance: 95, Quality: 97 },
    { day: 'Selasa', OEE: 82.1, Availability: 88, Performance: 96, Quality: 97.2 },
    { day: 'Rabu', OEE: 75.4, Availability: 80, Performance: 94, Quality: 100 },
    { day: 'Kamis', OEE: 84.8, Availability: 90, Performance: 96, Quality: 98 },
    { day: 'Jumat', OEE: pct(oee), Availability: pct(availability), Performance: pct(performance), Quality: pct(quality) }
  ];

  // Compile Pareto Data for Downtime Categories
  const categoryDurations: Record<DowntimeCategory, number> = {} as any;
  DOWNTIME_CATEGORIES.forEach(cat => {
    categoryDurations[cat] = 0;
  });

  filteredDowntimes.forEach(log => {
    if (categoryDurations[log.category] !== undefined) {
      categoryDurations[log.category] += log.durationMinutes;
    }
  });

  // Sort by duration descending
  const sortedParetoRaw = Object.entries(categoryDurations)
    .map(([category, duration]) => ({ category, duration }))
    .sort((a, b) => b.duration - a.duration);

  const totalDowntimeAll = sortedParetoRaw.reduce((sum, item) => sum + item.duration, 0);

  let runningSum = 0;
  const paretoChartData = sortedParetoRaw.map(item => {
    runningSum += item.duration;
    const cumulativePercent = totalDowntimeAll > 0 ? Math.round((runningSum / totalDowntimeAll) * 100) : 0;
    return {
      category: item.category,
      Duration: item.duration,
      'Cumulative %': cumulativePercent
    };
  });

  // Handle Log submit
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDowntime(newLog);
    setShowLogForm(false);
    setNewLog({
      machineName: MESIN_FILLING_OPTIONS[0],
      category: 'Mechanical',
      durationMinutes: 30,
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header & KPI Modifiers */}
      <div className="bento-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              OEE & Downtime Monitoring SVP Production
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kalkulasi efisiensi OEE otomatis terintegrasi dengan pencatatan downtime riil.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Mesin:</span>
              <select
                id="select_machine_filter"
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Semua Mesin">Semua Mesin (Kumulatif)</option>
                {MESIN_FILLING_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button
              id="btn_log_downtime"
              onClick={() => setShowLogForm(true)}
              className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shadow-sm shrink-0 justify-center"
            >
              <Plus className="w-4 h-4 text-red-400 animate-pulse" />
              Log Downtime Baru
            </button>
          </div>
        </div>
 
        {/* Live Controller Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Planned Production (Min)</label>
            <input
              id="input_planned_prod_time"
              type="number"
              value={plannedProductionTime}
              onChange={(e) => setPlannedProductionTime(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Downtime Aktif (Min)</label>
            <input
              id="input_total_downtime"
              type="number"
              disabled
              value={totalDowntimeMinutes}
              className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold bento-mono text-red-600 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Target Output (Ideal)</label>
            <input
              id="input_ideal_output"
              type="number"
              value={idealOutput}
              onChange={(e) => setIdealOutput(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Output Aktual (pcs)</label>
            <input
              id="input_actual_output"
              type="number"
              value={actualOutput}
              onChange={(e) => setActualOutput(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Produk Bagus (pcs)</label>
            <input
              id="input_good_product"
              type="number"
              value={goodProduct}
              onChange={(e) => setGoodProduct(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold bento-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
 
      {/* OEE Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Availability</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 bento-mono">{pct(availability)}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase bento-mono">{calculatedOperatingTime} Min / {plannedProductionTime} Min</p>
          </div>
        </div>
        <div className="bento-card p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Performance</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 bento-mono">{pct(performance)}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase bento-mono">{actualOutput.toLocaleString()} / {idealOutput.toLocaleString()} pcs</p>
          </div>
        </div>
        <div className="bento-card p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Quality</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 bento-mono">{pct(quality)}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase bento-mono">{goodProduct.toLocaleString()} / {actualOutput.toLocaleString()} pcs</p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-xl text-white shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 text-blue-400">OEE SVP SCORE</span>
          <div className="mt-4">
            <h3 className="text-3xl font-black bento-mono">{pct(oee)}%</h3>
            <p className="text-[10px] opacity-75 font-semibold mt-1 uppercase">World-Class Target: 85%</p>
          </div>
        </div>
      </div>
 
      {/* OEE Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* OEE Gauge / Circle Widget */}
        <div className="bento-card p-6 flex flex-col items-center justify-between text-center min-h-[300px]">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">OEE Gauge Chart</h4>
          
          <div className="relative w-48 h-24 mt-4 overflow-hidden">
            {/* Simple Elegant SVG Gauge */}
            <svg className="w-full h-full" viewBox="0 0 100 50">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#3b82f6" strokeWidth="12" 
                    strokeDasharray="125" strokeDashoffset={125 - (125 * Math.min(100, pct(oee))) / 100} />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <span className="text-xl font-black text-slate-800 bento-mono">{pct(oee)}%</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Target 85%</span>
            </div>
          </div>
 
          <p className="text-xs text-slate-500 max-w-[200px] mt-2">
            Status: <span className={`font-bold ${pct(oee) >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {pct(oee) >= 85 ? 'Sangat Baik (World-Class)' : 'Perlu Optimalisasi'}
            </span>
          </p>
        </div>
 
        {/* Donut Chart Comparison */}
        <div className="bento-card p-6 flex flex-col justify-between min-h-[300px]">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-150">OEE Factor Breakdown</h4>
          
          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={oeeFactorsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {oeeFactorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Rata-rata</span>
              <span className="text-base font-bold text-slate-700 bento-mono">
                {Math.round((pct(availability) + pct(performance) + pct(quality)) / 3)}%
              </span>
            </div>
          </div>
 
          <div className="flex justify-around text-[10px] font-bold uppercase bento-mono">
            {oeeFactorsData.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }}></span>
                <span>{f.name}: {f.value}%</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* OEE Trend chart */}
        <div className="bento-card p-6 flex flex-col justify-between min-h-[300px]">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-150">OEE Performance Trend</h4>
          
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oeeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Area type="monotone" dataKey="OEE" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.1} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
 
      {/* Downtime Monitoring Pareto Chart & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pareto Chart for Downtimes */}
        <div className="bento-card p-6 lg:col-span-2 space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Pareto Chart & Analisis Downtime</h3>
            <p className="text-xs text-slate-500">Hukum Pareto 80/20 untuk mengidentifikasi penyebab utama kegagalan/pemberhentian mesin.</p>
          </div>
 
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoChartData} margin={{ top: 20, right: -10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} label={{ value: 'Durasi (Min)', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} domain={[0, 100]} label={{ value: 'Kumulatif %', angle: 90, position: 'insideRight', fontSize: 9 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Duration" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="Cumulative %" stroke="#1e293b" strokeWidth={2} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* Downtime Durations Lists per categories */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-150 pb-2">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Distribusi Durasi Downtime</h3>
            <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded bento-mono">{totalDowntimeMinutes} Menit</span>
          </div>
 
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {sortedParetoRaw.map((item, idx) => {
              const share = totalDowntimeAll > 0 ? Math.round((item.duration / totalDowntimeAll) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-bold text-slate-800 text-[11px]">{item.category}</span>
                    <span className="bento-mono font-bold text-[10px] text-slate-450">{item.duration}m ({share}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${share}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* Downtime Event Logger History Table */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Riwayat & Log Pemberhentian Mesin (Downtime History)</h3>
            <p className="text-xs text-slate-500">Pencatatan rincian kejadian downtime per mesin untuk analisis berkelanjutan.</p>
          </div>
          <button
            id="btn_clear_downtime_history"
            onClick={() => {
              if (window.confirm('Hapus semua log riwayat downtime untuk memulai shift baru?')) {
                onClearDowntimes();
              }
            }}
            className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hover:text-red-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Bersihkan Log
          </button>
        </div>
 
        {filteredDowntimes.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 uppercase font-bold tracking-wider">
            {selectedMachine === 'Semua Mesin' 
              ? 'Belum ada kejadian downtime tercatat hari ini.' 
              : `Belum ada kejadian downtime tercatat untuk mesin ${selectedMachine} hari ini.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3">Waktu Kejadian</th>
                  <th className="p-3">Nama Mesin</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Durasi</th>
                  <th className="p-3">Catatan / Analisis Kerusakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold text-xs">
                {filteredDowntimes.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400 bento-mono font-bold">
                      {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-extrabold text-slate-800">{log.machineName}</td>
                    <td className="p-3">
                      <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bento-mono">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 bento-mono font-bold text-red-600">{log.durationMinutes} menit</td>
                    <td className="p-3 max-w-xs truncate text-slate-500 font-medium" title={log.notes}>{log.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOG DOWNTIME MODAL */}
      {showLogForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleLogSubmit} className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-red-600 text-white p-5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Catat Kejadian Downtime Baru
              </h3>
              <p className="text-xs text-red-100">Pemberhentian mesin akan mengurangi waktu operasional dan OEE otomatis.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Pilih Mesin Filling *</label>
                <select
                  value={newLog.machineName}
                  onChange={(e) => setNewLog({ ...newLog, machineName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {MESIN_FILLING_OPTIONS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Kategori Kerusakan / Stop *</label>
                <select
                  value={newLog.category}
                  onChange={(e) => setNewLog({ ...newLog, category: e.target.value as DowntimeCategory })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {DOWNTIME_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Durasi Downtime (Menit) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newLog.durationMinutes}
                  onChange={(e) => setNewLog({ ...newLog, durationMinutes: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Catatan Detail Kendala</label>
                <textarea
                  placeholder="Deskripsikan root cause kendala..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none h-20"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer animate-pulse-slow"
              >
                Simpan Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
