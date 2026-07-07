import React, { useState } from 'react';
import { Phase, Batch, MIXING_TANK_OPTIONS, HOLDING_TANK_OPTIONS, MESIN_FILLING_OPTIONS } from '../types';
import { 
  Plus, Edit2, Archive, Trash2, Clock, Check, AlertCircle, FileText, 
  HelpCircle, ChevronRight, Play, CheckCircle2, RefreshCcw
} from 'lucide-react';

interface KanbanBoardProps {
  batches: Batch[];
  onAddBatch: (batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBatch: (id: string, updates: Partial<Batch>) => void;
  onDeleteBatch: (id: string) => void;
  onArchiveBatch: (id: string) => void;
  tankUsageHistory: Array<{
    id: string;
    tankName: string;
    tankType: 'MIXING' | 'HOLDING';
    batchNo: string;
    productName: string;
    phase: Phase;
    timestamp: string;
    action: string;
  }>;
  onClearCompletedTanks: () => void;
}

export default function KanbanBoard({ 
  batches, 
  onAddBatch, 
  onUpdateBatch, 
  onDeleteBatch, 
  onArchiveBatch,
  tankUsageHistory,
  onClearCompletedTanks
}: KanbanBoardProps) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // New batch form state
  const [newBatch, setNewBatch] = useState({
    namaProduk: '',
    noBatch: '',
    phase: 'MIXING' as Phase,
    mixingTank: 'N/A',
    mixingStart: '',
    mixingEnd: '',
    holdingTank: 'N/A',
    transferStart: '',
    transferEnd: '',
    mesinFilling: 'N/A',
    fillingStart: '',
    fillingEnd: '',
    outputAktual: 0,
    outputTarget: 1000,
    intervensi: '',
    catatanPenting: ''
  });

  // Edit batch form state
  const [editForm, setEditForm] = useState<Partial<Batch>>({});

  // Search/filter
  const [searchQuery, setSearchQuery] = useState('');

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, targetPhase: Phase) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    const batch = batches.find(b => b.id === id);
    if (!batch) return;

    // Automatically initialize/finalize times on phases move if blank
    const updates: Partial<Batch> = { phase: targetPhase, updatedAt: new Date().toISOString() };
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (targetPhase === 'MIXING' && !batch.mixingStart) {
      updates.mixingStart = currentTime;
    } else if (targetPhase === 'TRANSFER') {
      if (!batch.mixingEnd) updates.mixingEnd = currentTime;
      if (!batch.transferStart) updates.transferStart = currentTime;
    } else if (targetPhase === 'FILLING') {
      if (!batch.transferEnd) updates.transferEnd = currentTime;
      if (!batch.fillingStart) updates.fillingStart = currentTime;
    } else if (targetPhase === 'DONE') {
      if (!batch.fillingEnd) updates.fillingEnd = currentTime;
    }

    onUpdateBatch(id, updates);
  };

  // Trigger quick manual stage transition
  const handleMovePhase = (id: string, current: Phase, direction: 'forward' | 'backward') => {
    const phases: Phase[] = ['MIXING', 'TRANSFER', 'FILLING', 'DONE'];
    const idx = phases.indexOf(current);
    if (idx === -1) return;

    let targetIdx = direction === 'forward' ? idx + 1 : idx - 1;
    if (targetIdx >= 0 && targetIdx < phases.length) {
      const targetPhase = phases[targetIdx];
      const batch = batches.find(b => b.id === id);
      if (!batch) return;

      const updates: Partial<Batch> = { phase: targetPhase, updatedAt: new Date().toISOString() };
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      if (targetPhase === 'MIXING' && !batch.mixingStart) {
        updates.mixingStart = currentTime;
      } else if (targetPhase === 'TRANSFER') {
        if (!batch.mixingEnd) updates.mixingEnd = currentTime;
        if (!batch.transferStart) updates.transferStart = currentTime;
      } else if (targetPhase === 'FILLING') {
        if (!batch.transferEnd) updates.transferEnd = currentTime;
        if (!batch.fillingStart) updates.fillingStart = currentTime;
      } else if (targetPhase === 'DONE') {
        if (!batch.fillingEnd) updates.fillingEnd = currentTime;
      }

      onUpdateBatch(id, updates);
    }
  };

  const handleOpenEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setEditForm({ ...batch });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedBatch) return;
    onUpdateBatch(selectedBatch.id, editForm);
    setShowEditModal(false);
    setSelectedBatch(null);
  };

  const handleSaveAdd = () => {
    if (!newBatch.namaProduk || !newBatch.noBatch) {
      alert('Nama Produk dan No Batch wajib diisi!');
      return;
    }

    // Set default start time for Mixing if starts in Mixing
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const finalNewBatch = {
      ...newBatch,
      mixingStart: newBatch.mixingStart || (newBatch.phase === 'MIXING' ? currentTime : '')
    };

    onAddBatch(finalNewBatch);
    setShowAddModal(false);
    // Reset Form
    setNewBatch({
      namaProduk: '',
      noBatch: '',
      phase: 'MIXING',
      mixingTank: 'N/A',
      mixingStart: '',
      mixingEnd: '',
      holdingTank: 'N/A',
      transferStart: '',
      transferEnd: '',
      mesinFilling: 'N/A',
      fillingStart: '',
      fillingEnd: '',
      outputAktual: 0,
      outputTarget: 1000,
      intervensi: '',
      catatanPenting: ''
    });
  };

  // Filter batches
  const filteredBatches = batches.filter(
    b => b.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) ||
         b.noBatch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPhaseBatches = (p: Phase) => filteredBatches.filter(b => b.phase === p);

  const columns: { phase: Phase; title: string; color: string; desc: string; dot: string }[] = [
    { phase: 'MIXING', title: '1. Mixing', color: 'bg-blue-100/90 border-blue-200', desc: 'Akses: Hanya Tangki Mixing', dot: 'bg-blue-600' },
    { phase: 'TRANSFER', title: '2. Transfer', color: 'bg-yellow-100/90 border-yellow-200', desc: 'Akses: Hanya Holding Tank', dot: 'bg-amber-500' },
    { phase: 'FILLING', title: '3. Filling', color: 'bg-emerald-100/90 border-emerald-200', desc: 'Akses: Mesin & Output', dot: 'bg-emerald-600' },
    { phase: 'DONE', title: '4. Done', color: 'bg-slate-800 border-slate-700', desc: 'Arsip ke Google Sheets', dot: 'bg-slate-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Quick Action */}
      <div className="bento-card p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-96 relative">
          <input
            id="search_batch_input"
            type="text"
            placeholder="Cari Produk atau No Batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          id="btn_add_batch"
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm animate-pulse-slow"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          Tambah Batch Baru
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex overflow-x-auto pb-4 lg:grid lg:grid-cols-4 gap-4 xl:gap-6">
        {columns.map(({ phase, title, color, desc, dot }) => {
          const colBatches = getPhaseBatches(phase);
          const isDone = phase === 'DONE';
          return (
            <div 
              key={phase}
              id={`kanban_column_${phase}`}
              className={`p-4 rounded-xl border flex flex-col h-[650px] shadow-sm min-w-[270px] sm:min-w-[280px] lg:min-w-0 flex-shrink-0 ${color}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, phase)}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 ${isDone ? 'text-white' : 'text-slate-800'}`}>
                  <span>{title}</span>
                  <span className={`w-2 h-2 rounded-full ${dot}`}></span>
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bento-mono ${isDone ? 'bg-slate-700 text-slate-200 border border-slate-650' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  {colBatches.length}
                </span>
              </div>
              <p className={`text-[10px] font-semibold mb-4 uppercase tracking-wide ${isDone ? 'text-slate-400' : 'text-slate-450'}`}>{desc}</p>

              {/* Scrollable list of cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colBatches.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl ${isDone ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-350'}`}>
                    <p className="text-[10px] uppercase font-bold italic tracking-wider">Tarik kartu ke sini</p>
                  </div>
                ) : (
                  colBatches.map((batch) => {
                    const progress = batch.outputTarget > 0 ? Math.min(100, Math.round((batch.outputAktual / batch.outputTarget) * 100)) : 0;
                    return (
                      <div
                        key={batch.id}
                        id={`batch_card_${batch.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, batch.id)}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                      >
                        {/* Title and Edit Button */}
                        <div className="flex justify-between items-start gap-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-800 text-xs sm:text-[13px] leading-snug group-hover:text-blue-600 transition-colors mb-1 truncate" title={batch.namaProduk}>
                              {batch.namaProduk}
                            </h4>
                            <span className="inline-block font-bold text-[9px] text-blue-600 bg-blue-50/50 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider bento-mono">
                              {batch.noBatch}
                            </span>
                          </div>
                          <button
                            id={`edit_batch_btn_${batch.id}`}
                            onClick={() => handleOpenEdit(batch)}
                            className="text-slate-400 hover:text-blue-500 p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                            title="Edit Batch"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Phase Specific Fields Visualized */}
                        {phase === 'MIXING' && (
                          <div className="text-[11px] space-y-1 bg-blue-50/30 p-2 rounded-lg border border-blue-100/70">
                            <p className="text-slate-600 font-semibold"><span className="font-bold text-blue-900 uppercase tracking-wide">Tank:</span> {batch.mixingTank}</p>
                            <p className="text-[9px] text-slate-450 font-bold bento-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-blue-500" /> Mulai: {batch.mixingStart || '-'}
                            </p>
                          </div>
                        )}

                        {phase === 'TRANSFER' && (
                          <div className="text-[11px] space-y-1.5 bg-amber-50/30 p-2 rounded-lg border border-amber-100/70">
                            <div className="space-y-0.5">
                              <p className="text-slate-600 font-semibold flex items-center justify-between">
                                <span className="font-bold text-blue-900 uppercase tracking-wide text-[10px]">Mixing Tank:</span> 
                                <span className="text-slate-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-100/30 font-bold">{batch.mixingTank || '-'}</span>
                              </p>
                              <p className="text-slate-600 font-semibold flex items-center justify-between">
                                <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">Hold Tank:</span> 
                                <span className="text-slate-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-100/30 font-bold">{batch.holdingTank || '-'}</span>
                              </p>
                            </div>
                            <div className="border-t border-amber-150/40 pt-1">
                              <p className="text-[9px] text-slate-450 font-bold bento-mono flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-amber-500" /> Transfer: {batch.transferStart || '-'}
                              </p>
                            </div>
                          </div>
                        )}

                        {phase === 'FILLING' && (
                          <div className="space-y-1.5 bg-emerald-50/30 p-2 rounded-lg border border-emerald-100/70">
                            <div className="text-[11px] space-y-0.5">
                              <p className="text-slate-600 font-semibold"><span className="font-bold text-emerald-900 uppercase tracking-wide">Mesin:</span> {batch.mesinFilling}</p>
                              <p className="text-[9px] text-slate-500 font-bold bento-mono uppercase">
                                Out: <strong className="text-emerald-700">{batch.outputAktual.toLocaleString()}</strong>/{batch.outputTarget.toLocaleString()} pcs
                              </p>
                            </div>
                            
                            {/* Visual Progress Bar */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[8px] text-slate-450 font-bold bento-mono">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {phase === 'DONE' && (
                          <div className="space-y-1.5 bg-slate-100 p-2 rounded-lg border border-slate-200/70">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Selesai Produksi</p>
                            <p className="text-[11px] font-bold text-slate-700 bento-mono">Total: {batch.outputAktual.toLocaleString()} pcs</p>
                            
                            {/* Archive to Sheets trigger */}
                            <button
                              id={`archive_batch_btn_${batch.id}`}
                              onClick={() => onArchiveBatch(batch.id)}
                              className="w-full flex items-center justify-center gap-1 bg-[#1e293b] hover:bg-slate-800 text-white font-bold text-[9px] py-1.5 px-2 rounded transition-colors cursor-pointer uppercase tracking-wider"
                            >
                              <Archive className="w-3 h-3 text-blue-400" />
                              Arsip ke History
                            </button>
                          </div>
                        )}

                        {/* Interactive Phase Movers for touch devices or quick click */}
                        <div className="flex justify-between pt-1.5 border-t border-slate-100 text-[9px] font-bold uppercase tracking-wider">
                          {phase !== 'MIXING' ? (
                            <button 
                              onClick={() => handleMovePhase(batch.id, phase, 'backward')}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              &larr; Kembali
                            </button>
                          ) : <div />}

                          {phase !== 'DONE' ? (
                            <button 
                              onClick={() => handleMovePhase(batch.id, phase, 'forward')}
                              className="text-blue-500 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                            >
                              Lanjut &rarr;
                            </button>
                          ) : <div />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Tank usage summary section */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin-slow" />
              Riwayat Penggunaan Mixing Tank & Holding Tank
            </h3>
            <p className="text-xs text-slate-500">Log penjejakan real-time tangki mixing dan holding di setiap fase produksi.</p>
          </div>
          {tankUsageHistory.some(log => log.action === 'END') && (
            <button
              onClick={onClearCompletedTanks}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all hover:shadow-sm cursor-pointer select-none uppercase tracking-wider self-start sm:self-center"
              title="Bersihkan log aktivitas yang sudah selesai/bersih"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bersihkan Selesai
            </button>
          )}
        </div>
        
        {tankUsageHistory.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 uppercase font-bold tracking-wider">Belum ada riwayat aktivitas tangki.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3">Tanggal / Jam</th>
                  <th className="p-3">Nama Tangki</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">No. Batch</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold text-xs">
                {tankUsageHistory.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400 bento-mono font-bold">
                      {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-extrabold text-slate-800">{log.tankName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bento-mono ${
                        log.tankType === 'MIXING' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.tankType}
                      </span>
                    </td>
                    <td className="p-3 bento-mono text-slate-500 font-bold">{log.batchNo}</td>
                    <td className="p-3 truncate max-w-[200px] text-slate-600">{log.productName}</td>
                    <td className="p-3">
                      <span className={`font-bold text-[10px] uppercase tracking-wide ${
                        log.action === 'START' ? 'text-emerald-600' : 'text-slate-450'
                      }`}>
                        {log.action === 'START' ? 'Mulai Digunakan' : 'Selesai / Bersih'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD BATCH */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-indigo-600 text-white p-5">
              <h3 className="font-bold text-lg">Tambah Batch Produksi Baru</h3>
              <p className="text-xs text-indigo-100">Buat batch baru dan letakkan pada fase MIXING secara otomatis.</p>
            </div>

            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nama Produk *</label>
                  <input
                    id="add_nama_produk"
                    type="text"
                    required
                    placeholder="Contoh: Paracetamol Syrup"
                    value={newBatch.namaProduk}
                    onChange={(e) => setNewBatch({ ...newBatch, namaProduk: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">No. Batch *</label>
                  <input
                    id="add_no_batch"
                    type="text"
                    required
                    placeholder="Contoh: B260701"
                    value={newBatch.noBatch}
                    onChange={(e) => setNewBatch({ ...newBatch, noBatch: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mixing Tank Choice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 text-indigo-600">Pilih Mixing Tank (Khusus Mixing)</label>
                  <select
                    id="add_mixing_tank"
                    value={newBatch.mixingTank}
                    onChange={(e) => setNewBatch({ ...newBatch, mixingTank: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {MIXING_TANK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Output Target (pcs)</label>
                  <input
                    id="add_output_target"
                    type="number"
                    value={newBatch.outputTarget}
                    onChange={(e) => setNewBatch({ ...newBatch, outputTarget: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Disabled details at creation */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Keterangan Pembatasan Akses Fase
                </p>
                <p className="text-[11px] text-slate-400">
                  Sesuai metode Kanban SVP, Holding Tank, Mesin Filling, dan Output aktual hanya dapat diedit/diakses setelah batch berpindah ke fase transfer/filling masing-masing.
                </p>
              </div>

              {/* Interventions & Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Instruksi Intervensi</label>
                <textarea
                  id="add_intervensi"
                  placeholder="Tambahkan intervensi jika ada..."
                  value={newBatch.intervensi}
                  onChange={(e) => setNewBatch({ ...newBatch, intervensi: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Catatan Penting</label>
                <textarea
                  id="add_catatan_penting"
                  placeholder="Ketik catatan penting produksi..."
                  value={newBatch.catatanPenting}
                  onChange={(e) => setNewBatch({ ...newBatch, catatanPenting: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                id="btn_cancel_add"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn_save_add"
                onClick={handleSaveAdd}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Simpan Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BATCH (WITH STRICT ACCESS RESTRICTIONS BASED ON PHASE) */}
      {showEditModal && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className={`p-5 text-white flex justify-between items-center ${
              selectedBatch.phase === 'MIXING' ? 'bg-indigo-600' :
              selectedBatch.phase === 'TRANSFER' ? 'bg-amber-500' :
              selectedBatch.phase === 'FILLING' ? 'bg-emerald-600' : 'bg-slate-700'
            }`}>
              <div>
                <h3 className="font-bold text-lg">Edit Batch: {selectedBatch.noBatch}</h3>
                <p className="text-xs opacity-90">Fase Berjalan: <span className="font-bold uppercase">{selectedBatch.phase}</span></p>
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                SVP-Rules Active
              </span>
            </div>

            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {/* Product Info (Editable) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nama Produk</label>
                  <input
                    id="edit_nama_produk"
                    type="text"
                    value={editForm.namaProduk || ''}
                    onChange={(e) => setEditForm({ ...editForm, namaProduk: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">No. Batch</label>
                  <input
                    id="edit_no_batch"
                    type="text"
                    value={editForm.noBatch || ''}
                    onChange={(e) => setEditForm({ ...editForm, noBatch: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PHASE 1: MIXING TANK CONTROLS */}
              <div className={`p-4 rounded-xl border space-y-3 ${selectedBatch.phase === 'MIXING' ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Fase Mixing
                  </h4>
                  {selectedBatch.phase !== 'MIXING' && (
                    <span className="text-[10px] text-slate-400 italic">Terkunci (Hanya untuk Fase MIXING)</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-500">Mixing Tank</label>
                    <select
                      id="edit_mixing_tank"
                      disabled={selectedBatch.phase !== 'MIXING'}
                      value={editForm.mixingTank || 'N/A'}
                      onChange={(e) => setEditForm({ ...editForm, mixingTank: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    >
                      {MIXING_TANK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Jam Mulai Mixing</label>
                    <input
                      id="edit_mixing_start"
                      type="text"
                      placeholder="HH:MM"
                      disabled={selectedBatch.phase !== 'MIXING'}
                      value={editForm.mixingStart || ''}
                      onChange={(e) => setEditForm({ ...editForm, mixingStart: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Jam Selesai Mixing</label>
                    <input
                      id="edit_mixing_end"
                      type="text"
                      placeholder="HH:MM"
                      disabled={selectedBatch.phase !== 'MIXING'}
                      value={editForm.mixingEnd || ''}
                      onChange={(e) => setEditForm({ ...editForm, mixingEnd: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* PHASE 2: TRANSFER TANK CONTROLS */}
              <div className={`p-4 rounded-xl border space-y-3 ${selectedBatch.phase === 'TRANSFER' ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Fase Transfer
                  </h4>
                  {selectedBatch.phase !== 'TRANSFER' && (
                    <span className="text-[10px] text-slate-400 italic">Terkunci (Hanya untuk Fase TRANSFER)</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-500">Holding Tank</label>
                    <select
                      id="edit_holding_tank"
                      disabled={selectedBatch.phase !== 'TRANSFER'}
                      value={editForm.holdingTank || 'N/A'}
                      onChange={(e) => setEditForm({ ...editForm, holdingTank: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    >
                      {HOLDING_TANK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Jam Mulai Transfer</label>
                    <input
                      id="edit_transfer_start"
                      type="text"
                      placeholder="HH:MM"
                      disabled={selectedBatch.phase !== 'TRANSFER'}
                      value={editForm.transferStart || ''}
                      onChange={(e) => setEditForm({ ...editForm, transferStart: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Jam Selesai Transfer</label>
                    <input
                      id="edit_transfer_end"
                      type="text"
                      placeholder="HH:MM"
                      disabled={selectedBatch.phase !== 'TRANSFER'}
                      value={editForm.transferEnd || ''}
                      onChange={(e) => setEditForm({ ...editForm, transferEnd: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* PHASE 3: FILLING CONTROLS */}
              <div className={`p-4 rounded-xl border space-y-3 ${selectedBatch.phase === 'FILLING' ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Fase Filling
                  </h4>
                  {selectedBatch.phase !== 'FILLING' && (
                    <span className="text-[10px] text-slate-400 italic">Terkunci (Hanya untuk Fase FILLING)</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Mesin Filling</label>
                    <select
                      id="edit_mesin_filling"
                      disabled={selectedBatch.phase !== 'FILLING'}
                      value={editForm.mesinFilling || 'N/A'}
                      onChange={(e) => setEditForm({ ...editForm, mesinFilling: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    >
                      <option value="N/A">Pilih Mesin...</option>
                      {MESIN_FILLING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Output Target (pcs)</label>
                    <input
                      id="edit_output_target_val"
                      type="number"
                      disabled={selectedBatch.phase !== 'FILLING'}
                      value={editForm.outputTarget || 0}
                      onChange={(e) => setEditForm({ ...editForm, outputTarget: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 text-emerald-600 font-bold">Output Aktual (Sementara)</label>
                    <input
                      id="edit_output_aktual"
                      type="number"
                      disabled={selectedBatch.phase !== 'FILLING'}
                      value={editForm.outputAktual || 0}
                      onChange={(e) => setEditForm({ ...editForm, outputAktual: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-bold disabled:bg-slate-100 text-emerald-700"
                    />
                    {selectedBatch.phase === 'FILLING' && (
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide mt-1">
                        * Otomatis berpindah ke fase DONE jika output &ge; target ({editForm.outputTarget || 0} pcs) setelah disimpan.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Mulai Filling</label>
                      <input
                        id="edit_filling_start"
                        type="text"
                        placeholder="HH:MM"
                        disabled={selectedBatch.phase !== 'FILLING'}
                        value={editForm.fillingStart || ''}
                        onChange={(e) => setEditForm({ ...editForm, fillingStart: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs disabled:bg-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Selesai Filling</label>
                      <input
                        id="edit_filling_end"
                        type="text"
                        placeholder="HH:MM"
                        disabled={selectedBatch.phase !== 'FILLING'}
                        value={editForm.fillingEnd || ''}
                        onChange={(e) => setEditForm({ ...editForm, fillingEnd: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Interventions & Notes (Always accessible) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Intervensi</label>
                <textarea
                  id="edit_intervensi"
                  value={editForm.intervensi || ''}
                  onChange={(e) => setEditForm({ ...editForm, intervensi: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-16"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Catatan Penting</label>
                <textarea
                  id="edit_catatan_penting"
                  value={editForm.catatanPenting || ''}
                  onChange={(e) => setEditForm({ ...editForm, catatanPenting: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-16"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-between border-t border-slate-100">
              <button
                id="btn_delete_batch"
                onClick={() => {
                  if (window.confirm('Hapus batch ini secara permanen dari Kanban board?')) {
                    onDeleteBatch(selectedBatch.id);
                    setShowEditModal(false);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Batch
              </button>

              <div className="flex gap-2">
                <button
                  id="btn_cancel_edit"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn_save_edit"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
