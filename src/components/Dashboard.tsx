import React, { useState, useEffect } from 'react';
import { Batch, Machine, DowntimeLog } from '../types';
import { Play, Coffee, AlertTriangle, CheckCircle, Package, TrendingUp, Settings, BarChart2, Edit2, Plus, Trash2, X, Calendar, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  batches: Batch[];
  machines: Machine[];
  downtimes: DowntimeLog[];
  historicalBatches: Batch[];
  onNavigate: (tab: string) => void;
  onUpdateMachine?: (machineId: string, updates: Partial<Machine>) => void;
}

export default function Dashboard({ batches, machines, downtimes, historicalBatches, onNavigate, onUpdateMachine }: DashboardProps) {
  // Editing state for machines
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Machine['status']>('idle');
  const [editSpeed, setEditSpeed] = useState<number>(100);

  // Cancellation of The Week (CTW)
  const [ctwItems, setCtwItems] = useState<{ id: string; noBatch: string; namaProduk: string; tanggal: string; notes?: string }[]>(() => {
    const saved = localStorage.getItem('svp_ctw_items');
    return saved ? JSON.parse(saved) : [
      { id: 'ctw-1', noBatch: 'B2607A1', namaProduk: 'Susu UHT Cokelat 250ml', tanggal: '05 Juli 2026', notes: 'Mesin Filling 02 Overhaul' },
      { id: 'ctw-2', noBatch: 'B2607A4', namaProduk: 'Susu UHT Stroberi 125ml', tanggal: '06 Juli 2026', notes: 'Keterlambatan supply raw material' }
    ];
  });

  // Addition of The Week (ATW)
  const [atwItems, setAtwItems] = useState<{ id: string; noBatch: string; namaProduk: string; tanggal: string; notes?: string }[]>(() => {
    const saved = localStorage.getItem('svp_atw_items');
    return saved ? JSON.parse(saved) : [
      { id: 'atw-1', noBatch: 'B2607A9', namaProduk: 'Susu UHT Full Cream 1000ml', tanggal: '07 Juli 2026', notes: 'Permintaan tambahan distributor' }
    ];
  });

  // CTW / ATW Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalType, setModalType] = useState<'CTW' | 'ATW'>('CTW');
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [itemIdToEdit, setItemIdToEdit] = useState<string | null>(null);
  const [formNoBatch, setFormNoBatch] = useState('');
  const [formNamaProduk, setFormNamaProduk] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Persist CTW / ATW
  useEffect(() => {
    localStorage.setItem('svp_ctw_items', JSON.stringify(ctwItems));
  }, [ctwItems]);

  useEffect(() => {
    localStorage.setItem('svp_atw_items', JSON.stringify(atwItems));
  }, [atwItems]);

  // CTW / ATW Handlers
  const handleAddOrEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNoBatch || !formNamaProduk) return;

    if (modalMode === 'add') {
      const newItem = {
        id: `${modalType.toLowerCase()}-${Date.now()}`,
        noBatch: formNoBatch,
        namaProduk: formNamaProduk,
        tanggal: formTanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        notes: formNotes
      };

      if (modalType === 'CTW') {
        setCtwItems(prev => [newItem, ...prev]);
      } else {
        setAtwItems(prev => [newItem, ...prev]);
      }
    } else {
      if (itemIdToEdit) {
        if (modalType === 'CTW') {
          setCtwItems(prev => prev.map(item => item.id === itemIdToEdit ? {
            ...item,
            noBatch: formNoBatch,
            namaProduk: formNamaProduk,
            tanggal: formTanggal,
            notes: formNotes
          } : item));
        } else {
          setAtwItems(prev => prev.map(item => item.id === itemIdToEdit ? {
            ...item,
            noBatch: formNoBatch,
            namaProduk: formNamaProduk,
            tanggal: formTanggal,
            notes: formNotes
          } : item));
        }
      }
    }

    // Reset and Close
    setShowItemModal(false);
    setItemIdToEdit(null);
    setFormNoBatch('');
    setFormNamaProduk('');
    setFormTanggal('');
    setFormNotes('');
  };

  const handleOpenAdd = (type: 'CTW' | 'ATW') => {
    setModalType(type);
    setModalMode('add');
    setItemIdToEdit(null);
    setFormNoBatch('');
    setFormNamaProduk('');
    setFormTanggal(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setFormNotes('');
    setShowItemModal(true);
  };

  const handleOpenEdit = (type: 'CTW' | 'ATW', item: { id: string; noBatch: string; namaProduk: string; tanggal: string; notes?: string }) => {
    setModalType(type);
    setModalMode('edit');
    setItemIdToEdit(item.id);
    setFormNoBatch(item.noBatch);
    setFormNamaProduk(item.namaProduk);
    setFormTanggal(item.tanggal);
    setFormNotes(item.notes || '');
    setShowItemModal(true);
  };

  const handleDeleteItem = (type: 'CTW' | 'ATW', id: string) => {
    if (type === 'CTW') {
      setCtwItems(prev => prev.filter(item => item.id !== id));
    } else {
      setAtwItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleStartEdit = (machine: Machine) => {
    setEditingMachineId(machine.id);
    setEditStatus(machine.status);
    setEditSpeed(machine.speed);
  };

  const handleCancelEdit = () => {
    setEditingMachineId(null);
  };

  const handleSaveEdit = (e: React.FormEvent, machineId: string) => {
    e.preventDefault();
    if (onUpdateMachine) {
      onUpdateMachine(machineId, {
        status: editStatus,
        speed: editSpeed,
      });
    }
    setEditingMachineId(null);
  };

  // Calculations
  const runningMachines = machines.filter(m => m.status === 'running').length;
  const idleMachines = machines.filter(m => m.status === 'idle').length;
  const cipMachines = machines.filter(m => m.status === 'CIP SIP').length;
  const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;

  const totalActualOutput = historicalBatches.reduce((acc, b) => acc + b.outputAktual, 0) + 
                             batches.filter(b => b.phase === 'FILLING').reduce((acc, b) => acc + b.outputAktual, 0);

  // Status color mapper
  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'idle':
        return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200', label: 'Idle' };
      case 'running':
        return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-200', label: 'Running / Filling' };
      case 'CIP SIP':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200', label: 'CIP / SIP' };
      case 'maintenance':
        return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-200', label: 'Maintenance' };
    }
  };

  // Process trend data from completed batches and active ones
  const trendData = [
    { name: 'Shift A - Pagi', output: 12400 },
    { name: 'Shift B - Siang', output: 14800 },
    { name: 'Shift C - Malam', output: 11200 },
    { name: 'Hari ini', output: totalActualOutput > 0 ? totalActualOutput : 18500 }
  ];

  return (
    <div id="dashboard_screen" className="space-y-6">
      {/* Header and Welcome */}
      <div className="bento-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">SVP Production Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Sistem Pemantauan Proses Produksi Riil & Analisis Efisiensi Mesin.</p>
        </div>
        <div className="flex gap-2">
          <button 
            id="btn_to_kanban"
            onClick={() => onNavigate('kanban')}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <BarChart2 className="w-4 h-4 text-blue-400" />
            Buka Kanban Board
          </button>
        </div>
      </div>

      {/* Metric Quick Stats - Bento Grid Pattern */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Play className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mesin Running</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 bento-mono">{runningMachines} <span className="text-xs font-normal text-slate-400">/ 10</span></h3>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Output Aktual</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 bento-mono">{totalActualOutput.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span></h3>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 border border-yellow-100">
            <Coffee className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mesin CIP/SIP</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 bento-mono">{cipMachines} <span className="text-xs font-normal text-slate-400">unit</span></h3>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Downtime / Maintenance</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 bento-mono">{maintenanceMachines} <span className="text-xs font-normal text-slate-400">unit</span></h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Machine Grid & Trend Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Machine Statuses */}
        <div className="bento-card p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-150 gap-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500 animate-spin-slow" />
              Status Mesin Filling
            </h2>
            <div className="flex flex-wrap gap-2.5 text-[10px] font-bold uppercase bento-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Idle ({idleMachines})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Running ({runningMachines})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> CIP SIP ({cipMachines})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> MT ({maintenanceMachines})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.map((machine) => {
              const b = getStatusBadge(machine.status);
              const isEditing = editingMachineId === machine.id;
              return (
                <div 
                  key={machine.id} 
                  id={`machine_card_${machine.id}`}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{machine.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Kecepatan mesin: {machine.speed} pcs/m</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1.5 ${b.text} bg-white border ${b.border} uppercase bento-mono`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${b.bg}`}></span>
                        {b.label}
                      </span>
                      {!isEditing && (
                        <button 
                          onClick={() => handleStartEdit(machine)}
                          className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
                          title="Edit Status / Batch Mesin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveEdit(e, machine.id)} className="space-y-3 pt-1 border-t border-slate-100 mt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Mesin</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as Machine['status'])}
                            className="w-full text-xs font-bold border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="idle">Idle</option>
                            <option value="running">Running / Filling</option>
                            <option value="CIP SIP">CIP / SIP</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kecepatan Mesin</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={editSpeed}
                              onChange={(e) => setEditSpeed(Number(e.target.value) || 0)}
                              placeholder="Kecepatan"
                              className="w-full text-xs font-bold border border-slate-200 rounded-md pl-2.5 pr-10 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                              min="1"
                              required
                              disabled={editStatus !== 'running'}
                            />
                            <span className="absolute right-2 text-[9px] font-bold text-slate-400 uppercase">pcs/m</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded border border-slate-200 uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {machine.status === 'running' ? (
                        <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase bento-mono">Batch Aktif: {machine.activeBatchNo}</p>
                          <p className="text-[11px] font-semibold text-slate-700 mt-0.5 truncate">{machine.activeBatchName}</p>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-100/50 rounded-lg border border-dashed border-slate-200">
                          <p className="text-[10px] text-slate-400 italic">Mesin sedang tidak memproses batch</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: CTW, ATW and Output Trend Chart */}
        <div className="space-y-6 lg:col-span-1">
          {/* Cancellation of The Week (CTW) */}
          <div className="bento-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Cancellation of The Week (CTW)
                </h3>
              </div>
              <button
                onClick={() => handleOpenAdd('CTW')}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-150 px-2 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer select-none"
                title="Tambah Produk Cancel"
              >
                <Plus className="w-3 h-3" />
                Tambah
              </button>
            </div>

            {ctwItems.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center">Tidak ada produk yang di-cancel minggu ini.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ctwItems.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg border border-red-100 bg-red-50/10 hover:bg-red-50/30 transition-all flex justify-between items-start gap-3 group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 px-1 py-0.2 rounded uppercase bento-mono shrink-0">
                          {item.noBatch}
                        </span>
                        <p className="font-bold text-slate-800 text-xs truncate" title={item.namaProduk}>{item.namaProduk}</p>
                      </div>
                      <p className="text-[10px] text-slate-450 font-medium mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {item.tanggal}
                      </p>
                      {item.notes && (
                        <p className="text-[10px] text-slate-500 italic mt-1 border-l-2 border-red-200 pl-1.5 leading-snug">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleOpenEdit('CTW', item)}
                        className="p-1 hover:bg-slate-200/50 rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('CTW', item.id)}
                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Addition of The Week (ATW) */}
          <div className="bento-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Addition of The Week (ATW)
                </h3>
              </div>
              <button
                onClick={() => handleOpenAdd('ATW')}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-150 px-2 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer select-none"
                title="Tambah Produk Tambahan"
              >
                <Plus className="w-3 h-3" />
                Tambah
              </button>
            </div>

            {atwItems.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center">Tidak ada produk tambahan minggu ini.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {atwItems.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/30 transition-all flex justify-between items-start gap-3 group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded uppercase bento-mono shrink-0">
                          {item.noBatch}
                        </span>
                        <p className="font-bold text-slate-800 text-xs truncate" title={item.namaProduk}>{item.namaProduk}</p>
                      </div>
                      <p className="text-[10px] text-slate-450 font-medium mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {item.tanggal}
                      </p>
                      {item.notes && (
                        <p className="text-[10px] text-slate-500 italic mt-1 border-l-2 border-emerald-200 pl-1.5 leading-snug">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleOpenEdit('ATW', item)}
                        className="p-1 hover:bg-slate-200/50 rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('ATW', item.id)}
                        className="p-1 hover:bg-emerald-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Output Trend Chart */}
          <div className="bento-card p-6 flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Tren Output Produksi
              </h2>
              <p className="text-xs text-slate-500">Representasi output per Shift kerja berjalan.</p>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="output" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOutput)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-slate-150 pt-3 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Target: <strong className="text-slate-800 font-bold bento-mono">5,000 pcs</strong> /batch</span>
              <button onClick={() => onNavigate('analytics')} className="text-blue-500 hover:underline font-bold text-xs uppercase tracking-wider cursor-pointer">Lihat Analitik &rarr;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Batches and Completed Batches Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Batches */}
        <div className="bento-card p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Proses Produksi Sedang Berjalan ({batches.length})</h3>
          {batches.length === 0 ? (
            <p className="text-xs text-slate-450 italic py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Tidak ada proses aktif. Tambahkan batch baru di Kanban Board.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {batches.map((batch) => (
                <div key={batch.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{batch.namaProduk}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-1">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold bento-mono">{batch.noBatch}</span>
                      <span>&bull;</span>
                      <span className="bento-mono font-bold">Target: {batch.outputTarget} pcs</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bento-mono
                    ${batch.phase === 'MIXING' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                    ${batch.phase === 'TRANSFER' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                    ${batch.phase === 'FILLING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ''}
                  `}>
                    {batch.phase}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Completed Batches */}
        <div className="bento-card p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Riwayat Selesai Produksi (Historical Production - {historicalBatches.length})</h3>
          {historicalBatches.length === 0 ? (
            <p className="text-xs text-slate-450 italic py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Belum ada batch selesai dipindahkan ke historical production.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {historicalBatches.map((batch) => (
                <div key={batch.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{batch.namaProduk}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-1">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold bento-mono">{batch.noBatch}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-600 font-bold bento-mono">Output: {batch.outputAktual} pcs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 bento-mono">
                      <CheckCircle className="w-3 h-3" />
                      DONE
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 bento-mono">Selesai: {batch.fillingEnd || '16:00'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTW / ATW Add & Edit Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden">
            <div className="bg-[#1e293b] px-5 py-4 flex justify-between items-center text-white">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${modalType === 'CTW' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                  {modalMode === 'add' ? 'Tambah' : 'Edit'} {modalType === 'CTW' ? 'Cancellation of The Week' : 'Addition of The Week'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Isi informasi detail produk di bawah ini.</p>
              </div>
              <button 
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOrEditItem} className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">No Batch</label>
                  <input
                    type="text"
                    value={formNoBatch}
                    onChange={(e) => setFormNoBatch(e.target.value)}
                    placeholder="Contoh: B2607A1"
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Nama Produk</label>
                  <input
                    type="text"
                    value={formNamaProduk}
                    onChange={(e) => setFormNamaProduk(e.target.value)}
                    placeholder="Contoh: Susu UHT Cokelat 250ml"
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal / Batas Waktu</label>
                  <input
                    type="text"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    placeholder="Contoh: 05 Juli 2026"
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Catatan / Alasan (Opsional)</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Masukkan catatan pendukung atau alasan..."
                    rows={3}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
