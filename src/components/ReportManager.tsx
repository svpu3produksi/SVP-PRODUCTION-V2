import React, { useState, useEffect } from 'react';
import { Batch, Machine, TankHistory, DowntimeLog } from '../types';
import { 
  FileText, Share2, Copy, Check, RotateCcw, Sparkles, Plus, Trash2, 
  Edit3, Eye, Calendar, Clock, Send, Smartphone, AlertTriangle, HelpCircle, Save 
} from 'lucide-react';

interface ReportManagerProps {
  batches: Batch[];
  historicalBatches: Batch[];
  machines: Machine[];
  downtimes: DowntimeLog[];
  tankUsageHistory: TankHistory[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  setTankUsageHistory: React.Dispatch<React.SetStateAction<TankHistory[]>>;
  setDowntimes?: React.Dispatch<React.SetStateAction<DowntimeLog[]>>;
}

interface TankStatus {
  id: string;
  name: string;
  statusText: string;
}

interface LiveMachineSyncProps {
  machineName: string;
  batches: Batch[];
  machines: Machine[];
  handleUpdateBatchPhase: (batchId: string, phase: Batch['phase']) => void;
  handleUpdateBatchOutput: (batchId: string, outputAktual: number, outputTarget: number) => void;
  handleConnectBatchToMachine: (batchId: string, machineName: string) => void;
  handleCreateBatchFromReport: (machineName: string) => void;
  handleUpdateMachineStatus: (machineId: string, status: Machine['status']) => void;
}

function LiveMachineSync({
  machineName,
  batches,
  machines,
  handleUpdateBatchPhase,
  handleUpdateBatchOutput,
  handleConnectBatchToMachine,
  handleCreateBatchFromReport,
  handleUpdateMachineStatus
}: LiveMachineSyncProps) {
  const activeBatch = batches.find(b => b.mesinFilling === machineName);
  const mach = machines.find(m => m.name === machineName);

  return (
    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/80 p-3.5 rounded-xl space-y-3 shadow-inner">
      <div className="flex justify-between items-center pb-2 border-b border-blue-100/50">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
            Integrasi Dashboard & Kanban
          </span>
        </div>
        
        {mach && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400">Status Mesin:</span>
            <select
              value={mach.status}
              onChange={(e) => handleUpdateMachineStatus(mach.id, e.target.value as any)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border cursor-pointer transition-colors ${
                mach.status === 'running' ? 'bg-emerald-500 text-white border-emerald-600' :
                mach.status === 'CIP SIP' ? 'bg-blue-600 text-white border-blue-700' :
                mach.status === 'maintenance' ? 'bg-amber-500 text-white border-amber-600' :
                'bg-slate-500 text-white border-slate-600'
              }`}
            >
              <option value="running">RUNNING</option>
              <option value="idle">IDLE</option>
              <option value="CIP SIP">CIP SIP</option>
              <option value="maintenance">MAINTENANCE</option>
            </select>
          </div>
        )}
      </div>

      {activeBatch ? (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <div className="text-xs font-black text-slate-800 tracking-tight">
                {activeBatch.namaProduk}
              </div>
              <div className="text-[9px] text-slate-400 font-bold">
                Batch: <span className="font-mono text-blue-600">{activeBatch.noBatch}</span>
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[9px] text-indigo-700 font-extrabold uppercase">
              Proses: {activeBatch.phase}
            </div>
          </div>

          {/* Flow Stages Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleUpdateBatchPhase(activeBatch.id, 'MIXING')}
              className={`py-1 rounded text-[9px] font-extrabold text-center transition-all cursor-pointer ${
                activeBatch.phase === 'MIXING'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-700'
              }`}
            >
              • Mixing
            </button>
            <button
              type="button"
              onClick={() => handleUpdateBatchPhase(activeBatch.id, 'TRANSFER')}
              className={`py-1 rounded text-[9px] font-extrabold text-center transition-all cursor-pointer ${
                activeBatch.phase === 'TRANSFER'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-700'
              }`}
            >
              • Transfer
            </button>
            <button
              type="button"
              onClick={() => handleUpdateBatchPhase(activeBatch.id, 'FILLING')}
              className={`py-1 rounded text-[9px] font-extrabold text-center transition-all cursor-pointer ${
                activeBatch.phase === 'FILLING'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-700'
              }`}
            >
              • Filling
            </button>
          </div>

          {/* Outputs */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100/50">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Output Aktual</span>
              <div className="relative">
                <input
                  type="number"
                  value={activeBatch.outputAktual}
                  onChange={(e) => handleUpdateBatchOutput(activeBatch.id, parseInt(e.target.value) || 0, activeBatch.outputTarget)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                />
                <span className="absolute right-1.5 top-1 font-mono text-[9px] text-slate-300 font-bold select-none">PCS</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Target Output</span>
              <div className="relative">
                <input
                  type="number"
                  value={activeBatch.outputTarget}
                  onChange={(e) => handleUpdateBatchOutput(activeBatch.id, activeBatch.outputAktual, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                />
                <span className="absolute right-1.5 top-1 font-mono text-[9px] text-slate-300 font-bold select-none">PCS</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <div className="text-slate-400 font-medium text-[11px] leading-snug">
            Tidak ada batch aktif di papan Kanban untuk mesin ini. Hubungkan batch yang ada atau buat batch baru.
          </div>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleConnectBatchToMachine(e.target.value, machineName);
                  e.target.value = '';
                }
              }}
              className="flex-grow px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Hubungkan Batch...</option>
              {batches.filter(b => b.mesinFilling !== machineName).map(b => (
                <option key={b.id} value={b.id}>
                  {b.namaProduk} ({b.noBatch})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleCreateBatchFromReport(machineName)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-black shadow-sm transition-colors cursor-pointer"
            >
              + Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportManager({ 
  batches, 
  historicalBatches, 
  machines, 
  downtimes, 
  tankUsageHistory,
  setBatches,
  setMachines,
  setTankUsageHistory,
  setDowntimes
}: ReportManagerProps) {
  // --- LIVE KANBAN & MACHINE INTEGRATION HELPERS ---
  const handleUpdateBatchPhase = (batchId: string, phase: Batch['phase']) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const updated = { ...b, phase, updatedAt: new Date().toISOString() };
      
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      if (phase === 'MIXING' && !updated.mixingStart) {
        updated.mixingStart = currentTime;
      } else if (phase === 'TRANSFER' && !updated.transferStart) {
        updated.transferStart = currentTime;
        updated.mixingEnd = currentTime;
      } else if (phase === 'FILLING' && !updated.fillingStart) {
        updated.fillingStart = currentTime;
        updated.transferEnd = currentTime;
      } else if (phase === 'DONE' && !updated.fillingEnd) {
        updated.fillingEnd = currentTime;
      }
      return updated;
    }));
  };

  const handleUpdateBatchOutput = (batchId: string, outputAktual: number, outputTarget: number) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const updated = { ...b, outputAktual, outputTarget, updatedAt: new Date().toISOString() };
      if (updated.phase === 'FILLING' && outputAktual >= outputTarget) {
        updated.phase = 'DONE';
        updated.fillingEnd = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      }
      return updated;
    }));
  };

  const handleConnectBatchToMachine = (batchId: string, machineName: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return { ...b, mesinFilling: machineName, updatedAt: new Date().toISOString() };
      }
      return b;
    }));
  };

  const handleCreateBatchFromReport = (machineName: string) => {
    const newId = `batch_rep_${Date.now()}`;
    const batchNo = `GG${Math.floor(1000 + Math.random() * 9000)}`;
    const products: Record<string, string> = {
      'Corima': 'Plasminex inj',
      'BS8010': 'Sankorbin inj',
      'IMA MD150': 'Mediafill',
      'IMA ED': 'Zophtal ED',
      'Fat Emulsion': 'Lipomed inf',
      'ICOS': 'Icos Vial',
      'SHINVA Rotary': 'Shinva Batch'
    };
    const defaultProduct = products[machineName] || 'Produk Baru';
    
    const newBatch: Batch = {
      id: newId,
      namaProduk: defaultProduct,
      noBatch: batchNo,
      phase: 'MIXING',
      mixingTank: 'N/A',
      mixingStart: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      mixingEnd: '',
      holdingTank: 'N/A',
      transferStart: '',
      transferEnd: '',
      mesinFilling: machineName,
      fillingStart: '',
      fillingEnd: '',
      outputAktual: 0,
      outputTarget: 5000,
      intervensi: '',
      catatanPenting: 'Dibuat dari modul Laporan.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setBatches(prev => [newBatch, ...prev]);
  };

  const handleUpdateMachineStatus = (machineId: string, status: Machine['status']) => {
    setMachines(prev => prev.map(m => {
      if (m.id === machineId) {
        return { ...m, status };
      }
      return m;
    }));
  };

  const handleQuickAddDowntimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDowntimeMachine) {
      alert('Silakan pilih mesin.');
      return;
    }
    const newId = `dt_${Date.now()}`;
    const newLog: DowntimeLog = {
      id: newId,
      machineName: quickDowntimeMachine,
      category: maintenanceCategory,
      durationMinutes: Number(quickDowntimeDuration) || 15,
      timestamp: new Date().toISOString(),
      notes: maintenanceIssue
    };

    if (setDowntimes) {
      setDowntimes(prev => [newLog, ...prev]);
      setConnectedDowntimeId(newId);
      setShowQuickAddDowntime(false);
      alert('Berhasil membuat dan menghubungkan Catatan Kejadian Downtime baru!');
    }
  };
  // Navigation inside Report Tab: "aseptic", "vision", or "maintenance"
  const [activeDivision, setActiveDivision] = useState<'aseptic' | 'vision' | 'maintenance'>('aseptic');
  
  // Editor Mode: "form" or "direct"
  const [editorMode, setEditorMode] = useState<'form' | 'direct'>('form');

  // Copy/Share state
  const [copied, setCopied] = useState(false);

  // --- FORM STATES FOR ASEPTIC ---
  const [asepticDate, setAsepticDate] = useState(() => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dayName}, ${dateStr}`;
  });
  const [asepticShift, setAsepticShift] = useState('Shift 3');
  const [asepticIssue, setAsepticIssue] = useState('N/A');
  const [asepticQcUpdate, setAsepticQcUpdate] = useState('N/A');
  const [asepticFedegari, setAsepticFedegari] = useState(() => {
    const saved = localStorage.getItem('svp_report_aseptic_fedegari_obj');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing asepticFedegari:', e);
      }
    }
    const oldVal = localStorage.getItem('svp_report_aseptic_fedegari') || 'N/A';
    return {
      status: oldVal,
      targetShift: '• N/A',
      targetShiftNo: 'Target Shift 1'
    };
  });

  // Custom Tank statuses (editable list)
  const [asepticTanks, setAsepticTanks] = useState<TankStatus[]>(() => {
    const saved = localStorage.getItem('svp_report_aseptic_tanks');
    if (saved) return JSON.parse(saved);
    
    // Initial standard template statuses
    return [
      { id: 't1', name: 'MT 60L A', statusText: 'steril 23.39 exdate 08/07/26' },
      { id: 't2', name: 'MT 60L B', statusText: 'steril 05.51 exdate 08/07/26' },
      { id: 't3', name: 'MT 100L A', statusText: 'Sankorbin inj GG 3426 sedang filling' },
      { id: 't4', name: 'MT 100L B', statusText: 'polidemisin ed GG 3509 Sedang Transfer Filter ke #3 65%' },
      { id: 't5', name: 'MT 100L C', statusText: 'Polidemisin ed GG 3509 Sedang transfer Filter ke #3 65%' },
      { id: 't6', name: 'MT 100L E', statusText: 'antri destruksi' },
      { id: 't7', name: 'MT 150L A', statusText: 'steril 01.35 exdate 08/07/26' },
      { id: 't8', name: 'MT 150L B', statusText: 'Antri SIP ( Sudah di cek kebocoran oleh engenering )' },
      { id: 't9', name: 'HT 100L P', statusText: 'anti cip' },
      { id: 't10', name: 'HT 100L Q', statusText: 'sanbe api 10ml GG 3406 sedang filling' },
      { id: 't11', name: 'HT 100L R', statusText: 'steril 07:40 exdate 08/07/26' },
      { id: 't12', name: 'HT 100L S', statusText: 'Mediafill ima MFG 13 siap filling' },
      { id: 't13', name: 'HT 100L T', statusText: 'antri cip' },
      { id: 't14', name: 'HT 150L', statusText: 'Sanbe api 12ml GG 3402 siap filling' },
      { id: 't15', name: 'MT 150L TRUKING', statusText: 'sanbreth nd GG 3507 sedang filling' },
      { id: 't16', name: 'MOVING TANK 200L A', statusText: 'antri cip' },
      { id: 't17', name: 'MOVING TANK 200L B', statusText: 'antri cip' },
      { id: 't18', name: 'PRESSURIZED TANK D', statusText: 'zophtal ed GF 3545 release (tunggu instruksi ada partikel hitam)' },
    ];
  });

  // Machine Sections for Aseptic
  const [asepticMachines, setAsepticMachines] = useState(() => {
    const saved = localStorage.getItem('svp_report_aseptic_machines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.corima && parsed.bs8010 && parsed.imaMd150 && parsed.bs8010AmpouleCompleteLine && parsed.truking && parsed.comas) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved aseptic_machines:', e);
      }
    }
    return {
      corima: {
        mixing: 'N/A',
        transfer: 'N/A',
        filling: 'Plasminex inj GG3401 selesai jam 14.35 - 01.30 output 27.700 pcs/ 67 tray',
        kesiapan: 'Mesin sudah CIP SIP\n- Ampul Sanbe Api 12 ml ready 1 batch\n- Filter filling for Sanbe Api 12ml ready\n- Sudah menampung WFI for Sanbe Api 12ml',
        targetShift: 'Filling Sanbe Api 12ml GG3402',
        targetShiftNo: 'Target shift 3'
      },
      bs8010: {
        mixing: 'Sankorbin Inj GG3426',
        transfer: 'Sankorbin Inj GG3426',
        filling: 'N/A',
        kesiapan: 'Mesin sudah CIP SIP\n- Sparepart sudah sterilisasi\n- Filter filling Sankorbin ready\n- Ampul Sankorbin inj ready 1 batch\nMT200L dan HT200L Vakumix sudah CIP SIP\nJalur transfer sudah CIP SIP\nFilter mixing dan transfer Santagesik Inj ready\nAmpul Santagesik Inj ready 36 tray, sisanya sedang dicuci',
        targetShift: 'Filling Sankorbin Inj GG3426\nMixing Santagesik Inj GG3427',
        targetShiftNo: 'Target shift 1'
      },
      bs8010AmpouleCompleteLine: {
        mixing: 'N/A',
        transfer: 'N/A',
        filling: 'N/A',
        kesiapan: 'Mesin ready\n- Filter ready',
        targetShift: 'Filling produk selanjutnya',
        targetShiftNo: 'Target shift 1'
      },
      imaMd150: {
        mixing: 'Media fill MFG13',
        transfer: 'Media fill MFG13',
        filling: 'N/A',
        kesiapan: 'Mesin sudah sanitasi\n- Ruangan sudah fogging\n- Sparepart sudah sterilisasi ulang ex 21.15 tgl 07/07/26\n- Vial, Alucap dan Rubber Mediafill ready 1 batch\n- Bahan baku PEG8000 release',
        targetShift: 'Filling Media fill MFG13',
        targetShiftNo: 'Target shift 1'
      },
      truking: {
        mixing: 'N/A',
        transfer: 'N/A',
        filling: 'N/A',
        kesiapan: 'Mesin ready',
        targetShift: 'Filling produk selanjutnya',
        targetShiftNo: 'Target shift 1'
      },
      comas: {
        mixing: 'N/A',
        transfer: 'N/A',
        filling: 'N/A',
        kesiapan: 'Mesin ready',
        targetShift: 'Filling produk selanjutnya',
        targetShiftNo: 'Target shift 1'
      }
    };
  });

  // --- FORM STATES FOR VISION ---
  const [visionDate, setVisionDate] = useState(() => {
    const today = new Date();
    // Default show current Sunday or just format current date
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dayName}, ${dateStr}`;
  });
  const [visionShift, setVisionShift] = useState('Shift 1');
  const [visionIssue, setVisionIssue] = useState('N/A');
  const [visionQcUpdate, setVisionQcUpdate] = useState('Zophtal ED GG3506 (Cek kadar)');
  const [visionShinva19, setVisionShinva19] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_shinva_19_obj');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing visionShinva19:', e);
      }
    }
    const oldVal = localStorage.getItem('svp_report_vision_shinva_19') || 'N/A';
    return {
      status: oldVal,
      targetShift: '• N/A',
      targetShiftNo: 'Target Shift 1'
    };
  });
  const [visionPreparation, setVisionPreparation] = useState({
    echung: 'Sanmol Inf GG3601 60/180 tray',
    corima: 'Sanbe api 10ml GG3406 151/150 tray',
    imaVega: 'N/A',
    lytzen: 'N/A',
    shinva: 'N/A'
  });
  const [visionAxomatic, setVisionAxomatic] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_axomatic');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing visionAxomatic:', e);
      }
    }
    return {
      mixing: 'N/A',
      transfer: 'N/A',
      filling: 'N/A',
      kesiapan: '• N/A',
      targetShift: '• N/A',
      targetShiftNo: 'Target Shift 1'
    };
  });
  const [visionImaF87, setVisionImaF87] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_ima_f87');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing visionImaF87:', e);
      }
    }
    return {
      mixing: 'Zophtal ED GG3506 (Cek kadar)',
      transfer: 'N/A',
      filling: 'Gaforin ED GF3544 selesai jam 16.25 - 09.30 output 7.215 botol / 16 Bags',
      kesiapan: 'Mesin sudah CIP SIP\n- Botol, Plug, Cap Zophtal ED ready 1 batch\n- Filter SLK for IMA F87 ready',
      targetShift: 'Filling Zophtal ED GG3506 (after kadar release)',
      targetShiftNo: 'Target Shift 2'
    };
  });
  const [visionFatEmulsion, setVisionFatEmulsion] = useState({
    mixing: 'Lipomed inf GF3625 (Validasi)\nFase Air\nFase Minyak\nEmulsifikasi',
    kesiapan: 'Tank Olsa sedang mixing\n- Botol Lipomed Inf belum dicuci',
    targetShift: 'Mixing Lipomed inf GF3625 (Emulsifikasi dan resirkulasi)',
    targetShiftNo: 'Target Shift 2'
  });
  const [visionBs1010, setVisionBs1010] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_bs1010');
    if (saved) return JSON.parse(saved);
    return {
      mixing: 'N/A',
      transfer: 'N/A',
      filling: 'N/A',
      kesiapan: 'Mesin sudah CIP SIP\n- Jalur transfer ready\n- Ampul ready',
      targetShift: 'Filling produk selanjutnya',
      targetShiftNo: 'Target Shift 1'
    };
  });
  const [visionPlumat, setVisionPlumat] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_plumat');
    if (saved) return JSON.parse(saved);
    return {
      mixing: 'N/A',
      transfer: 'N/A',
      filling: 'N/A',
      kesiapan: 'Mesin sudah CIP SIP\n- Infus bag ready',
      targetShift: 'Filling produk selanjutnya',
      targetShiftNo: 'Target Shift 1'
    };
  });
  const [visionIcos, setVisionIcos] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_icos_obj');
    if (saved) return JSON.parse(saved);
    const oldVal = localStorage.getItem('svp_report_vision_icos');
    return {
      status: oldVal || '• N/A',
      targetShift: '• N/A',
      targetShiftNo: 'Target Shift 1'
    };
  });
  const [shinvaRotary, setShinvaRotary] = useState(() => {
    const saved = localStorage.getItem('svp_report_vision_shinva_rotary_obj');
    if (saved) return JSON.parse(saved);
    const oldVal = localStorage.getItem('svp_report_vision_shinva_rotary');
    return {
      status: oldVal || '• N/A',
      targetShift: '• N/A',
      targetShiftNo: 'Target Shift 1'
    };
  });

  // New tank input form
  const [newTankName, setNewTankName] = useState('');
  const [newTankStatusText, setNewTankStatusText] = useState('');

  // Maintenance Form states
  const [maintenanceDate, setMaintenanceDate] = useState(() => {
    const saved = localStorage.getItem('svp_report_maint_date');
    if (saved) return saved;
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${dayName}, ${dateStr}`;
  });

  const [maintenanceShift, setMaintenanceShift] = useState(() => {
    return localStorage.getItem('svp_report_maint_shift') || 'Shift 3';
  });

  const [maintenanceReporter, setMaintenanceReporter] = useState(() => {
    return localStorage.getItem('svp_report_maint_reporter') || 'Kang Rohmat.';
  });

  const [maintenanceIssue, setMaintenanceIssue] = useState(() => {
    return localStorage.getItem('svp_report_maint_issue') || 'Terdapat alarm pada mesin IMA F87 “rack not in supply”.';
  });

  const [maintenancePhotoBefore, setMaintenancePhotoBefore] = useState(() => {
    return localStorage.getItem('svp_report_maint_photo_before') || 'Terlampir.';
  });

  const [maintenanceCause, setMaintenanceCause] = useState(() => {
    return localStorage.getItem('svp_report_maint_cause') || 'Coupling penggerak as pompa pada mesin IMA F87 stuck menyebabkan alarm tersebut.';
  });

  const [maintenanceComponent, setMaintenanceComponent] = useState(() => {
    return localStorage.getItem('svp_report_maint_component') || 'N/A';
  });

  const [maintenanceAction, setMaintenanceAction] = useState(() => {
    return localStorage.getItem('svp_report_maint_action') || 'Dilakukan penyemprotan desinfektan pada as pompa mesin IMA F87.';
  });

  const [maintenancePartReplacement, setMaintenancePartReplacement] = useState(() => {
    return localStorage.getItem('svp_report_maint_part_replacement') || 'N/A';
  });

  const [maintenanceTestResult, setMaintenanceTestResult] = useState(() => {
    return localStorage.getItem('svp_report_maint_test_result') || 'Ok, video terlampir.';
  });

  const [maintenancePhotoAfter, setMaintenancePhotoAfter] = useState(() => {
    return localStorage.getItem('svp_report_maint_photo_after') || 'Terlampir.';
  });

  const [maintenanceCategory, setMaintenanceCategory] = useState<'Mechanical' | 'Electrical' | 'Utility' | 'Maintenance' | 'Instrument'>(() => {
    return (localStorage.getItem('svp_report_maint_category') as any) || 'Mechanical';
  });

  const [connectedDowntimeId, setConnectedDowntimeId] = useState(() => {
    return localStorage.getItem('svp_report_maint_connected_downtime_id') || '';
  });

  const [showQuickAddDowntime, setShowQuickAddDowntime] = useState(false);
  const [quickDowntimeMachine, setQuickDowntimeMachine] = useState('IMA F87');
  const [quickDowntimeDuration, setQuickDowntimeDuration] = useState(15);

  // Manual edited direct texts
  const [directTextAseptic, setDirectTextAseptic] = useState('');
  const [directTextVision, setDirectTextVision] = useState('');
  const [directTextMaintenance, setDirectTextMaintenance] = useState('');

  // Persist tanks to local storage
  useEffect(() => {
    localStorage.setItem('svp_report_aseptic_tanks', JSON.stringify(asepticTanks));
  }, [asepticTanks]);

  // Persist aseptic machines to local storage
  useEffect(() => {
    localStorage.setItem('svp_report_aseptic_machines', JSON.stringify(asepticMachines));
  }, [asepticMachines]);

  // Persist maintenance form to local storage
  useEffect(() => {
    localStorage.setItem('svp_report_maint_date', maintenanceDate);
  }, [maintenanceDate]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_shift', maintenanceShift);
  }, [maintenanceShift]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_reporter', maintenanceReporter);
  }, [maintenanceReporter]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_issue', maintenanceIssue);
  }, [maintenanceIssue]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_photo_before', maintenancePhotoBefore);
  }, [maintenancePhotoBefore]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_cause', maintenanceCause);
  }, [maintenanceCause]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_component', maintenanceComponent);
  }, [maintenanceComponent]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_action', maintenanceAction);
  }, [maintenanceAction]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_part_replacement', maintenancePartReplacement);
  }, [maintenancePartReplacement]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_test_result', maintenanceTestResult);
  }, [maintenanceTestResult]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_photo_after', maintenancePhotoAfter);
  }, [maintenancePhotoAfter]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_category', maintenanceCategory);
  }, [maintenanceCategory]);

  useEffect(() => {
    localStorage.setItem('svp_report_maint_connected_downtime_id', connectedDowntimeId);
  }, [connectedDowntimeId]);

  // Persist BS1010 and Plumat to local storage
  useEffect(() => {
    localStorage.setItem('svp_report_vision_bs1010', JSON.stringify(visionBs1010));
  }, [visionBs1010]);

  useEffect(() => {
    localStorage.setItem('svp_report_vision_plumat', JSON.stringify(visionPlumat));
  }, [visionPlumat]);

  useEffect(() => {
    localStorage.setItem('svp_report_vision_icos_obj', JSON.stringify(visionIcos));
  }, [visionIcos]);

  useEffect(() => {
    localStorage.setItem('svp_report_vision_axomatic', JSON.stringify(visionAxomatic));
  }, [visionAxomatic]);

  useEffect(() => {
    localStorage.setItem('svp_report_vision_ima_f87', JSON.stringify(visionImaF87));
  }, [visionImaF87]);

  useEffect(() => {
    localStorage.setItem('svp_report_vision_shinva_rotary_obj', JSON.stringify(shinvaRotary));
  }, [shinvaRotary]);

  useEffect(() => {
    localStorage.setItem('svp_report_vision_shinva_19_obj', JSON.stringify(visionShinva19));
  }, [visionShinva19]);

  useEffect(() => {
    localStorage.setItem('svp_report_aseptic_fedegari_obj', JSON.stringify(asepticFedegari));
  }, [asepticFedegari]);

  // --- COMPILATION LOGIC (Generate formatted texts for WA) ---
  const formatTargetShift = (text: string) => {
    if (!text || text.trim() === '' || text.trim().toLowerCase() === 'n/a') {
      return '- N/A';
    }
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => {
        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
          return line;
        }
        return `- ${line}`;
      })
      .join('\n');
  };

  const compileAsepticReport = () => {
    const tankListStr = asepticTanks.map(t => `•  ${t.name} ${t.statusText}`).join('\n');
    return `*ASEPTIC*
——————

*${asepticDate}*
*${asepticShift}*

*ISSUE*
- ${asepticIssue}

*Update QC*
${asepticQcUpdate}

*Fedegari 18*
Status : ${asepticFedegari.status}

${asepticFedegari.targetShiftNo}:
${formatTargetShift(asepticFedegari.targetShift)}


*STATUS TANKI*
${tankListStr}

*CORIMA*
Mixing : ${asepticMachines.corima.mixing} 
Transfer : ${asepticMachines.corima.transfer}
Filling : ${asepticMachines.corima.filling} 

Kesiapan : 
${asepticMachines.corima.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')} 


${asepticMachines.corima.targetShiftNo} : 
${formatTargetShift(asepticMachines.corima.targetShift)}



*BS8010*
Mixing : ${asepticMachines.bs8010.mixing}
Transfer : ${asepticMachines.bs8010.transfer}
Filling : ${asepticMachines.bs8010.filling}

Kesiapan :
${asepticMachines.bs8010.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}


${asepticMachines.bs8010.targetShiftNo} : 
${formatTargetShift(asepticMachines.bs8010.targetShift)}


*BS8010 Ampoule Complete Line*
Mixing : ${asepticMachines.bs8010AmpouleCompleteLine.mixing}
Transfer : ${asepticMachines.bs8010AmpouleCompleteLine.transfer}
Filling : ${asepticMachines.bs8010AmpouleCompleteLine.filling}

Kesiapan :
${asepticMachines.bs8010AmpouleCompleteLine.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${asepticMachines.bs8010AmpouleCompleteLine.targetShiftNo} : 
${formatTargetShift(asepticMachines.bs8010AmpouleCompleteLine.targetShift)}



*IMA MD150*
Mixing : ${asepticMachines.imaMd150.mixing} 
Transfer : ${asepticMachines.imaMd150.transfer} 
Filling : ${asepticMachines.imaMd150.filling}

Kesiapan :
${asepticMachines.imaMd150.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${asepticMachines.imaMd150.targetShiftNo} : 
${formatTargetShift(asepticMachines.imaMd150.targetShift)}

*TRUKING*
Mixing : ${asepticMachines.truking.mixing}
Transfer : ${asepticMachines.truking.transfer}
Filling : ${asepticMachines.truking.filling}

Kesiapan :
${asepticMachines.truking.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${asepticMachines.truking.targetShiftNo} : 
${formatTargetShift(asepticMachines.truking.targetShift)}

*COMAS*
Mixing : ${asepticMachines.comas.mixing}
Transfer : ${asepticMachines.comas.transfer}
Filling : ${asepticMachines.comas.filling}

Kesiapan :
${asepticMachines.comas.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${asepticMachines.comas.targetShiftNo} : 
${formatTargetShift(asepticMachines.comas.targetShift)}`;
  };

  const compileVisionReport = () => {
    return `*VISION & FINAL STERILIZATION*
——————————————

*${visionDate}*
*${visionShift}*

*ISSUE*
- ${visionIssue}

*QC UPDATE*
- ${visionQcUpdate}

*SHINVA 19*
Status : ${visionShinva19.status}

${visionShinva19.targetShiftNo}:
${formatTargetShift(visionShinva19.targetShift)}

*PREPARATION LINE*
Echung : ${visionPreparation.echung}
Corima : ${visionPreparation.corima}
Ima Vega : ${visionPreparation.imaVega}
Lytzen : ${visionPreparation.lytzen}
Shinva : ${visionPreparation.shinva}

*AXOMATIC*
Mixing : ${visionAxomatic.mixing}
Transfer : ${visionAxomatic.transfer}
Filling : ${visionAxomatic.filling}

Kesiapan :
${visionAxomatic.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${visionAxomatic.targetShiftNo}:
${formatTargetShift(visionAxomatic.targetShift)}

*IMA F87*
Mixing : ${visionImaF87.mixing}
Transfer : ${visionImaF87.transfer}
Filling : ${visionImaF87.filling}

Kesiapan :
${visionImaF87.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${visionImaF87.targetShiftNo}:
${formatTargetShift(visionImaF87.targetShift)}

*FAT EMULSION*
Mixing : ${visionFatEmulsion.mixing}

Kesiapan :
${visionFatEmulsion.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${visionFatEmulsion.targetShiftNo}:
${formatTargetShift(visionFatEmulsion.targetShift)}

*BS1010*
Mixing : ${visionBs1010.mixing}
Transfer : ${visionBs1010.transfer}
Filling : ${visionBs1010.filling}

Kesiapan :
${visionBs1010.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${visionBs1010.targetShiftNo}:
${formatTargetShift(visionBs1010.targetShift)}

*PLUMAT*
Mixing : ${visionPlumat.mixing}
Transfer : ${visionPlumat.transfer}
Filling : ${visionPlumat.filling}

Kesiapan :
${visionPlumat.kesiapan.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}

${visionPlumat.targetShiftNo}:
${formatTargetShift(visionPlumat.targetShift)}

*ICOS*
Status : ${visionIcos.status}

${visionIcos.targetShiftNo}:
${formatTargetShift(visionIcos.targetShift)}

*SHINVA ROTARY*
Status : ${shinvaRotary.status}

${shinvaRotary.targetShiftNo}:
${formatTargetShift(shinvaRotary.targetShift)}`;
  };

  const compileMaintenanceReport = () => {
    const processPoints = (text: string) => {
      if (!text) return '- N/A';
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(line => {
          if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
            return line;
          }
          return `- ${line}`;
        })
        .join('\n');
    };

    return `*Report Maintenance SVP*
${maintenanceDate}
${maintenanceShift}

*Dilaporkan oleh :*
${processPoints(maintenanceReporter)}

*Keluhan/Kerusakan :*
${processPoints(maintenanceIssue)}

*Kategori Kerusakan :*
- ${maintenanceCategory}

*Foto Kerusakan (Before) :*
${processPoints(maintenancePhotoBefore)}

*Penyebab Kerusakan :*
${processPoints(maintenanceCause)}

*Komponen yang Rusak :*
${processPoints(maintenanceComponent)}

*Tindakan Perbaikan :*
${processPoints(maintenanceAction)}

*Pergantian Part :*
${processPoints(maintenancePartReplacement)}

*Hasil Test Running :*
${processPoints(maintenanceTestResult)}

*Foto Perbaikan (After) :*
${processPoints(maintenancePhotoAfter)}`;
  };

  // Sync Compiled texts to state for Direct mode or WhatsApp preview
  const currentCompiledText = activeDivision === 'aseptic' 
    ? (editorMode === 'direct' ? directTextAseptic : compileAsepticReport())
    : activeDivision === 'vision'
      ? (editorMode === 'direct' ? directTextVision : compileVisionReport())
      : (editorMode === 'direct' ? directTextMaintenance : compileMaintenanceReport());

  // Handle mode change to initialize direct text
  useEffect(() => {
    if (editorMode === 'direct') {
      setDirectTextAseptic(compileAsepticReport());
      setDirectTextVision(compileVisionReport());
      setDirectTextMaintenance(compileMaintenanceReport());
    }
  }, [editorMode]);

  // SMART AUTO-POPULATE SYSTEM
  const handleAutoPopulate = () => {
    // Determine current shift based on local hours
    const hours = new Date().getHours();
    let computedShift = 'Shift 1';
    let computedTargetShiftNo = 'Target Shift 2';
    let nextShiftNo = 'Target shift 1';
    
    if (hours >= 6 && hours < 14) {
      computedShift = 'Shift 1';
      computedTargetShiftNo = 'Target Shift 2';
      nextShiftNo = 'Target shift 2';
    } else if (hours >= 14 && hours < 22) {
      computedShift = 'Shift 2';
      computedTargetShiftNo = 'Target Shift 3';
      nextShiftNo = 'Target shift 3';
    } else {
      computedShift = 'Shift 3';
      computedTargetShiftNo = 'Target Shift 1';
      nextShiftNo = 'Target shift 1';
    }

    if (activeDivision === 'aseptic') {
      setAsepticShift(computedShift);
      
      // Auto populate current date
      const today = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[today.getDay()];
      const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setAsepticDate(`${dayName}, ${dateStr}`);

      // Extract details from active batches
      const updatedAsepticMachines = { ...asepticMachines };
      
      // Corima, BS8010, IMA MD150, BS8010 Ampoule Complete Line, Truking, Comas
      const targetMachines = ['Corima', 'BS8010', 'IMA MD150', 'BS8010 Ampoule Complete Line', 'Truking', 'Comas'];
      
      targetMachines.forEach(machName => {
        let key: 'corima' | 'bs8010' | 'imaMd150' | 'bs8010AmpouleCompleteLine' | 'truking' | 'comas';
        if (machName === 'Corima') key = 'corima';
        else if (machName === 'BS8010') key = 'bs8010';
        else if (machName === 'IMA MD150') key = 'imaMd150';
        else if (machName === 'BS8010 Ampoule Complete Line') key = 'bs8010AmpouleCompleteLine';
        else if (machName === 'Truking') key = 'truking';
        else if (machName === 'Comas') key = 'comas';
        else return;
        
        // Find batch currently assigned to this machine
        const activeBatch = batches.find(b => b.mesinFilling === machName);
        
        if (activeBatch) {
          // Fill based on current batch phase
          const mixingStr = activeBatch.phase === 'MIXING' 
            ? `${activeBatch.namaProduk} (${activeBatch.noBatch}) sedang proses mixing di ${activeBatch.mixingTank}`
            : (activeBatch.mixingTank !== 'N/A' ? `${activeBatch.namaProduk} (${activeBatch.noBatch}) Selesai` : 'N/A');
            
          const transferStr = activeBatch.phase === 'TRANSFER' 
            ? `${activeBatch.namaProduk} (${activeBatch.noBatch}) sedang transfer ke ${activeBatch.holdingTank}`
            : (activeBatch.holdingTank !== 'N/A' ? `${activeBatch.namaProduk} (${activeBatch.noBatch}) Selesai` : 'N/A');
            
          const fillingStr = activeBatch.phase === 'FILLING'
            ? `${activeBatch.namaProduk} (${activeBatch.noBatch}) Sedang filling (Target: ${activeBatch.outputTarget} pcs / Aktual: ${activeBatch.outputAktual} pcs)`
            : 'N/A';

          updatedAsepticMachines[key] = {
            ...updatedAsepticMachines[key],
            mixing: mixingStr,
            transfer: transferStr,
            filling: fillingStr,
          };
        } else {
          // Check historical or set to default if idle
          const machState = machines.find(m => m.name === machName);
          updatedAsepticMachines[key] = {
            ...updatedAsepticMachines[key],
            mixing: 'N/A',
            transfer: 'N/A',
            filling: machState?.status === 'CIP SIP' ? 'Mesin sedang CIP SIP' : 'N/A'
          };
        }
      });

      setAsepticMachines(updatedAsepticMachines);

      // Auto update Status Tanki based on active batches and tank usage
      const newTanks = asepticTanks.map(tank => {
        // Find if this tank is currently in use in active batches
        const activeBatchForMixing = batches.find(b => b.mixingTank === tank.name);
        const activeBatchForHolding = batches.find(b => b.holdingTank === tank.name);
        
        if (activeBatchForMixing) {
          return {
            ...tank,
            statusText: `${activeBatchForMixing.namaProduk} ed ${activeBatchForMixing.noBatch} sedang ${activeBatchForMixing.phase}`
          };
        } else if (activeBatchForHolding) {
          return {
            ...tank,
            statusText: `${activeBatchForHolding.namaProduk} ed ${activeBatchForHolding.noBatch} sedang ${activeBatchForHolding.phase}`
          };
        }
        return tank;
      });
      setAsepticTanks(newTanks);

    } else if (activeDivision === 'vision') {
      setVisionShift(computedShift);
      
      // Auto populate current date
      const today = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[today.getDay()];
      const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setVisionDate(`${dayName}, ${dateStr}`);

      // Auto populate Vision machines if assigned
      const imaF87Batch = batches.find(b => b.mesinFilling === 'IMA F87' || b.mesinFilling === 'Comas' || b.mesinFilling === 'IMA ED');
      if (imaF87Batch) {
        setVisionImaF87(prev => ({
          ...prev,
          mixing: imaF87Batch.phase === 'MIXING' ? `${imaF87Batch.namaProduk} (${imaF87Batch.noBatch})` : 'N/A',
          transfer: imaF87Batch.phase === 'TRANSFER' ? `${imaF87Batch.namaProduk} (${imaF87Batch.noBatch})` : 'N/A',
          filling: imaF87Batch.phase === 'FILLING' ? `${imaF87Batch.namaProduk} (${imaF87Batch.noBatch}) sedang filling output ${imaF87Batch.outputAktual} botol` : 'N/A',
        }));
      }

      const bs1010Batch = batches.find(b => b.mesinFilling === 'BS1010');
      if (bs1010Batch) {
        setVisionBs1010(prev => ({
          ...prev,
          mixing: bs1010Batch.phase === 'MIXING' ? `${bs1010Batch.namaProduk} (${bs1010Batch.noBatch})` : 'N/A',
          transfer: bs1010Batch.phase === 'TRANSFER' ? `${bs1010Batch.namaProduk} (${bs1010Batch.noBatch})` : 'N/A',
          filling: bs1010Batch.phase === 'FILLING' ? `${bs1010Batch.namaProduk} (${bs1010Batch.noBatch}) sedang filling output ${bs1010Batch.outputAktual} botol` : 'N/A',
        }));
      }

      const plumatBatch = batches.find(b => b.mesinFilling === 'Plumat');
      if (plumatBatch) {
        setVisionPlumat(prev => ({
          ...prev,
          mixing: plumatBatch.phase === 'MIXING' ? `${plumatBatch.namaProduk} (${plumatBatch.noBatch})` : 'N/A',
          transfer: plumatBatch.phase === 'TRANSFER' ? `${plumatBatch.namaProduk} (${plumatBatch.noBatch})` : 'N/A',
          filling: plumatBatch.phase === 'FILLING' ? `${plumatBatch.namaProduk} (${plumatBatch.noBatch}) sedang filling output ${plumatBatch.outputAktual} botol` : 'N/A',
        }));
      }

      const fatEmulsionBatch = batches.find(b => b.mesinFilling === 'Fat Emulsion');
      if (fatEmulsionBatch) {
        setVisionFatEmulsion(prev => ({
          ...prev,
          mixing: fatEmulsionBatch.phase === 'MIXING' ? `${fatEmulsionBatch.namaProduk} (${fatEmulsionBatch.noBatch})` : 'N/A',
        }));
      }

      const activeAxomatic = batches.find(b => b.mesinFilling === 'Axomatic');
      if (activeAxomatic) {
        setVisionAxomatic(prev => ({
          ...prev,
          mixing: activeAxomatic.phase === 'MIXING' ? `${activeAxomatic.namaProduk} (${activeAxomatic.noBatch})` : 'N/A',
          transfer: activeAxomatic.phase === 'TRANSFER' ? `${activeAxomatic.namaProduk} (${activeAxomatic.noBatch})` : 'N/A',
          filling: activeAxomatic.phase === 'FILLING' ? `${activeAxomatic.namaProduk} (${activeAxomatic.noBatch}) sedang filling output ${activeAxomatic.outputAktual} botol` : 'N/A',
        }));
      }

      const activeIcos = batches.find(b => b.mesinFilling === 'ICOS');
      if (activeIcos) {
        setVisionIcos(prev => ({
          ...prev,
          status: `${activeIcos.namaProduk} ed ${activeIcos.noBatch} sedang ${activeIcos.phase}`
        }));
      }

      const activeShinvaRotary = batches.find(b => b.mesinFilling === 'SHINVA Rotary' || b.mesinFilling === 'Shinva Rotary');
      if (activeShinvaRotary) {
        setShinvaRotary(prev => ({
          ...prev,
          status: `${activeShinvaRotary.namaProduk} ed ${activeShinvaRotary.noBatch} sedang ${activeShinvaRotary.phase}`
        }));
      }

      const activeShinva19 = batches.find(b => b.mesinFilling === 'SHINVA 19' || b.mesinFilling === 'Shinva 19');
      if (activeShinva19) {
        setVisionShinva19(prev => ({
          ...prev,
          status: `${activeShinva19.namaProduk} ed ${activeShinva19.noBatch} sedang ${activeShinva19.phase}`
        }));
      }

      const activeFedegari = batches.find(b => b.mesinFilling === 'Fedegari 18' || b.mesinFilling === 'Fedegari R. 18' || b.mesinFilling === 'Fedegari');
      if (activeFedegari) {
        setAsepticFedegari(prev => ({
          ...prev,
          status: `${activeFedegari.namaProduk} ed ${activeFedegari.noBatch} sedang ${activeFedegari.phase}`
        }));
      }

      // Check preparation lines from batches
      const prepUpdates = { ...visionPreparation };
      batches.forEach(b => {
        if (b.mesinFilling === 'Corima') {
          prepUpdates.corima = `${b.namaProduk} ${b.noBatch} ${b.outputAktual}/${b.outputTarget} tray`;
        }
      });
      setVisionPreparation(prepUpdates);
    } else if (activeDivision === 'maintenance') {
      setMaintenanceShift(computedShift);

      // Auto populate current date with YY format for maintenance report
      const today = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[today.getDay()];
      const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
      setMaintenanceDate(`${dayName}, ${dateStr}`);

      // Smart "Auto-Populate" based on machines or downtime logs
      const maintMachines = machines.filter(m => m.status === 'maintenance');
      const recentMaintLogs = downtimes.filter(d => ['Mechanical', 'Electrical', 'Maintenance'].includes(d.category));

      if (maintMachines.length > 0) {
        const machName = maintMachines[0].name;
        setMaintenanceIssue(`Terdapat alarm pada mesin ${machName} “kendala operasional / warning”.`);
        setMaintenanceCause(`Komponen sensor atau coupling penggerak pada mesin ${machName} stuck.`);
        setMaintenanceAction(`Dilakukan reset sistem, penyemprotan desinfektan, serta running test.`);
        setMaintenanceComponent('N/A');
        setMaintenancePartReplacement('N/A');
        setMaintenanceTestResult('Ok, running lancar.');
      } else if (recentMaintLogs.length > 0) {
        const log = recentMaintLogs[0];
        setMaintenanceIssue(`Kerusakan pada mesin ${log.machineName}: ${log.notes}`);
        setMaintenanceCause(`Masalah mekanikal/elektrikal terdeteksi selama masa produksi.`);
        setMaintenanceAction(`Dilakukan investigasi mendalam, pembersihan komponen, serta perbaikan.`);
        setMaintenanceComponent('Sensor / Coupling terkait');
        setMaintenancePartReplacement('N/A');
        setMaintenanceTestResult('Ok, video terlampir.');
      } else {
        // Fallback default sample data
        setMaintenanceReporter('Kang Rohmat.');
        setMaintenanceIssue('Terdapat alarm pada mesin IMA F87 “rack not in supply”.');
        setMaintenancePhotoBefore('Terlampir.');
        setMaintenanceCause('Coupling penggerak as pompa pada mesin IMA F87 stuck menyebabkan alarm tersebut.');
        setMaintenanceComponent('N/A');
        setMaintenanceAction('Dilakukan penyemprotan desinfektan pada as pompa mesin IMA F87.');
        setMaintenancePartReplacement('N/A');
        setMaintenanceTestResult('Ok, video terlampir.');
        setMaintenancePhotoAfter('Terlampir.');
      }
    }
  };

  // HANDLERS FOR STATUS TANKI MANAGER
  const handleAddTank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTankName || !newTankStatusText) return;

    const newTank: TankStatus = {
      id: `tank_${Date.now()}`,
      name: newTankName,
      statusText: newTankStatusText
    };

    setAsepticTanks(prev => [...prev, newTank]);
    setNewTankName('');
    setNewTankStatusText('');
  };

  const handleRemoveTank = (id: string) => {
    setAsepticTanks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTankStatus = (id: string, newText: string) => {
    setAsepticTanks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, statusText: newText };
      }
      return t;
    }));
  };

  // EXPORT / SHARING ACTIONS
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCompiledText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsapp = () => {
    const encodedText = encodeURIComponent(currentCompiledText);
    // WhatsApp Web URL
    const waUrl = `https://web.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  const shareToWhatsappMobile = () => {
    const encodedText = encodeURIComponent(currentCompiledText);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  const downloadReportTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([currentCompiledText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `SVP-Daily-Report-${activeDivision}-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper to parse WhatsApp formatting into styled HTML for live preview
  const renderWhatsAppHtml = (text: string) => {
    if (!text) return '';
    
    // Safety escape
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace *bold* with <strong>bold</strong>
    html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Replace _italic_ with <em>italic</em>
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Replace linebreaks with <br/>
    html = html.replace(/\n/g, '<br/>');

    return html;
  };

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-tight text-slate-800">
              Daily Production Report Generator
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Buat, edit, dan bagikan laporan harian shift langsung terintegrasi dengan data real-time.
            </p>
          </div>
        </div>

        {/* Division Selector Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveDivision('aseptic')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeDivision === 'aseptic' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Aseptic Division
          </button>
          <button
            onClick={() => setActiveDivision('vision')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeDivision === 'vision' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vision & Final Steril
          </button>
          <button
            onClick={() => setActiveDivision('maintenance')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeDivision === 'maintenance' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Maintenance SVP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: EDITOR PANEL (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Editor Header Controls */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">Mode Editor:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setEditorMode('form')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    editorMode === 'form' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Formulir
                </button>
                <button
                  onClick={() => setEditorMode('direct')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    editorMode === 'direct' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Direct Text
                </button>
              </div>
            </div>

            {/* Smart Auto Populate Button */}
            <button
              onClick={handleAutoPopulate}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Auto-Populate Data
            </button>
          </div>

          {/* DUAL-MODE AREA */}
          {editorMode === 'direct' ? (
            /* DIRECT TEXT EDITOR MODE */
            <div className="bento-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  Direct Text Editor (Markdown & WA Format)
                </h3>
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase">
                  Manual Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Tulis atau edit laporan secara manual di bawah. Anda bisa menggunakan format asterisk hiasan (seperti <code className="bg-slate-100 px-1 rounded text-slate-700 font-bold">*Teks*</code>) untuk otomatis mem-bold pesan di WhatsApp.
              </p>
              
              {activeDivision === 'aseptic' ? (
                <textarea
                  value={directTextAseptic}
                  onChange={(e) => setDirectTextAseptic(e.target.value)}
                  className="w-full h-[500px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed text-slate-700"
                  placeholder="Ketik laporan aseptic di sini..."
                />
              ) : activeDivision === 'vision' ? (
                <textarea
                  value={directTextVision}
                  onChange={(e) => setDirectTextVision(e.target.value)}
                  className="w-full h-[500px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed text-slate-700"
                  placeholder="Ketik laporan vision di sini..."
                />
              ) : (
                <textarea
                  value={directTextMaintenance}
                  onChange={(e) => setDirectTextMaintenance(e.target.value)}
                  className="w-full h-[500px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed text-slate-700"
                  placeholder="Ketik laporan maintenance di sini..."
                />
              )}
              
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-lg text-[10px] text-blue-700 font-bold">
                <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />
                <span>PERHATIAN: Mengubah teks secara langsung tidak akan meng-update kolom formulir. Gunakan mode Formulir jika ingin menginput data terstruktur kembali.</span>
              </div>
            </div>
          ) : (
            /* FORM-BASED EDITOR MODE */
            <div className="space-y-6">
              
              {/* DIVISION A: ASEPTIC FORM */}
              {activeDivision === 'aseptic' && (
                <div className="space-y-6">
                  {/* General Header Inputs */}
                  <div className="bento-card p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Informasi Umum (Aseptic)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tanggal Laporan</label>
                        <input
                          type="text"
                          value={asepticDate}
                          onChange={(e) => setAsepticDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Shift Kerja</label>
                        <select
                          value={asepticShift}
                          onChange={(e) => setAsepticShift(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Shift 1">Shift 1</option>
                          <option value="Shift 2">Shift 2</option>
                          <option value="Shift 3">Shift 3</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Issue Shift</label>
                        <input
                          type="text"
                          value={asepticIssue}
                          onChange={(e) => setAsepticIssue(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Update QC</label>
                        <input
                          type="text"
                          value={asepticQcUpdate}
                          onChange={(e) => setAsepticQcUpdate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* FEDEGARI 18 TARGET SHIFT SECTION */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
                            Fedegari 18
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                            <input
                              type="text"
                              value={asepticFedegari.targetShiftNo}
                              onChange={(e) => setAsepticFedegari({ ...asepticFedegari, targetShiftNo: e.target.value })}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Status</label>
                            <textarea
                              rows={2}
                              value={asepticFedegari.status}
                              onChange={(e) => setAsepticFedegari({ ...asepticFedegari, status: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Detail Target Shift</label>
                            <textarea
                              rows={2}
                              value={asepticFedegari.targetShift}
                              onChange={(e) => setAsepticFedegari({ ...asepticFedegari, targetShift: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                              placeholder="Contoh: - Sterilisasi..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Tanki Manager Sub-component */}
                  <div className="bento-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                        Status Tanki Manager
                      </h3>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-full">
                        {asepticTanks.length} Tanki
                      </span>
                    </div>

                    {/* Quick Add Tank */}
                    <form onSubmit={handleAddTank} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Nama Tanki</label>
                        <input
                          type="text"
                          required
                          value={newTankName}
                          onChange={(e) => setNewTankName(e.target.value)}
                          placeholder="Contoh: MT 100L A"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-6 space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Status / Keterangan</label>
                        <input
                          type="text"
                          required
                          value={newTankStatusText}
                          onChange={(e) => setNewTankStatusText(e.target.value)}
                          placeholder="steril 23.39 exdate 08/07/26"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end justify-center">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah
                        </button>
                      </div>
                    </form>

                    {/* Tank Scroll List */}
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/20">
                      {asepticTanks.map((tank) => (
                        <div key={tank.id} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <span className="text-xs font-extrabold text-slate-700">{tank.name}</span>
                            <input
                              type="text"
                              value={tank.statusText}
                              onChange={(e) => handleUpdateTankStatus(tank.id, e.target.value)}
                              className="sm:col-span-2 text-xs text-slate-600 font-medium bg-transparent border-b border-dashed border-slate-200 focus:border-blue-500 focus:outline-none px-1"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTank(tank.id)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aseptic Machines Section */}
                  <div className="bento-card p-6 space-y-6">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Kondisi Mesin & Aktivitas (Aseptic)
                    </h3>

                    {/* CORIMA */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">CORIMA</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={asepticMachines.corima.targetShiftNo}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              corima: { ...asepticMachines.corima, targetShiftNo: e.target.value }
                            })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="Corima"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={asepticMachines.corima.mixing}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              corima: { ...asepticMachines.corima, mixing: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={asepticMachines.corima.transfer}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              corima: { ...asepticMachines.corima, transfer: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={asepticMachines.corima.filling}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              corima: { ...asepticMachines.corima, filling: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.corima.kesiapan}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              corima: { ...asepticMachines.corima, kesiapan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.corima.targetShift}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              corima: { ...asepticMachines.corima, targetShift: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BS8010 */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">BS8010</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={asepticMachines.bs8010.targetShiftNo}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010: { ...asepticMachines.bs8010, targetShiftNo: e.target.value }
                            })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="BS8010"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={asepticMachines.bs8010.mixing}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010: { ...asepticMachines.bs8010, mixing: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={asepticMachines.bs8010.transfer}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010: { ...asepticMachines.bs8010, transfer: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={asepticMachines.bs8010.filling}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010: { ...asepticMachines.bs8010, filling: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.bs8010.kesiapan}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010: { ...asepticMachines.bs8010, kesiapan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.bs8010.targetShift}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010: { ...asepticMachines.bs8010, targetShift: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* IMA MD150 */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">IMA MD150</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={asepticMachines.imaMd150.targetShiftNo}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              imaMd150: { ...asepticMachines.imaMd150, targetShiftNo: e.target.value }
                            })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="IMA MD150"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={asepticMachines.imaMd150.mixing}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              imaMd150: { ...asepticMachines.imaMd150, mixing: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={asepticMachines.imaMd150.transfer}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              imaMd150: { ...asepticMachines.imaMd150, transfer: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={asepticMachines.imaMd150.filling}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              imaMd150: { ...asepticMachines.imaMd150, filling: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.imaMd150.kesiapan}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              imaMd150: { ...asepticMachines.imaMd150, kesiapan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.imaMd150.targetShift}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              imaMd150: { ...asepticMachines.imaMd150, targetShift: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BS8010 Ampoule Complete Line */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">BS8010 Ampoule Complete Line</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={asepticMachines.bs8010AmpouleCompleteLine.targetShiftNo}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010AmpouleCompleteLine: { ...asepticMachines.bs8010AmpouleCompleteLine, targetShiftNo: e.target.value }
                            })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="BS8010 Ampoule Complete Line"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={asepticMachines.bs8010AmpouleCompleteLine.mixing}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010AmpouleCompleteLine: { ...asepticMachines.bs8010AmpouleCompleteLine, mixing: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={asepticMachines.bs8010AmpouleCompleteLine.transfer}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010AmpouleCompleteLine: { ...asepticMachines.bs8010AmpouleCompleteLine, transfer: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={asepticMachines.bs8010AmpouleCompleteLine.filling}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010AmpouleCompleteLine: { ...asepticMachines.bs8010AmpouleCompleteLine, filling: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.bs8010AmpouleCompleteLine.kesiapan}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010AmpouleCompleteLine: { ...asepticMachines.bs8010AmpouleCompleteLine, kesiapan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.bs8010AmpouleCompleteLine.targetShift}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              bs8010AmpouleCompleteLine: { ...asepticMachines.bs8010AmpouleCompleteLine, targetShift: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* TRUKING */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">TRUKING</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={asepticMachines.truking.targetShiftNo}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              truking: { ...asepticMachines.truking, targetShiftNo: e.target.value }
                            })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="Truking"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={asepticMachines.truking.mixing}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              truking: { ...asepticMachines.truking, mixing: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={asepticMachines.truking.transfer}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              truking: { ...asepticMachines.truking, transfer: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={asepticMachines.truking.filling}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              truking: { ...asepticMachines.truking, filling: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.truking.kesiapan}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              truking: { ...asepticMachines.truking, kesiapan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.truking.targetShift}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              truking: { ...asepticMachines.truking, targetShift: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* COMAS */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">COMAS</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={asepticMachines.comas.targetShiftNo}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              comas: { ...asepticMachines.comas, targetShiftNo: e.target.value }
                            })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="Comas"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={asepticMachines.comas.mixing}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              comas: { ...asepticMachines.comas, mixing: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={asepticMachines.comas.transfer}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              comas: { ...asepticMachines.comas, transfer: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={asepticMachines.comas.filling}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              comas: { ...asepticMachines.comas, filling: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.comas.kesiapan}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              comas: { ...asepticMachines.comas, kesiapan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={3}
                            value={asepticMachines.comas.targetShift}
                            onChange={(e) => setAsepticMachines({
                              ...asepticMachines,
                              comas: { ...asepticMachines.comas, targetShift: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DIVISION B: VISION & FINAL STERILIZATION FORM */}
              {activeDivision === 'vision' && (
                <div className="space-y-6">
                  {/* General / Info */}
                  <div className="bento-card p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Informasi Umum (Vision & Final Steril)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tanggal Laporan</label>
                        <input
                          type="text"
                          value={visionDate}
                          onChange={(e) => setVisionDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Shift Kerja</label>
                        <select
                          value={visionShift}
                          onChange={(e) => setVisionShift(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="Shift 1">Shift 1</option>
                          <option value="Shift 2">Shift 2</option>
                          <option value="Shift 3">Shift 3</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Issue Shift</label>
                        <input
                          type="text"
                          value={visionIssue}
                          onChange={(e) => setVisionIssue(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">QC Update</label>
                        <input
                          type="text"
                          value={visionQcUpdate}
                          onChange={(e) => setVisionQcUpdate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preparation Line Sub-Section */}
                  <div className="bento-card p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Preparation Line (Vision)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Echung</label>
                        <input
                          type="text"
                          value={visionPreparation.echung}
                          onChange={(e) => setVisionPreparation({ ...visionPreparation, echung: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Corima</label>
                        <input
                          type="text"
                          value={visionPreparation.corima}
                          onChange={(e) => setVisionPreparation({ ...visionPreparation, corima: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Ima Vega</label>
                        <input
                          type="text"
                          value={visionPreparation.imaVega}
                          onChange={(e) => setVisionPreparation({ ...visionPreparation, imaVega: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Lytzen</label>
                        <input
                          type="text"
                          value={visionPreparation.lytzen}
                          onChange={(e) => setVisionPreparation({ ...visionPreparation, lytzen: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Shinva</label>
                        <input
                          type="text"
                          value={visionPreparation.shinva}
                          onChange={(e) => setVisionPreparation({ ...visionPreparation, shinva: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* IMA ED, FAT EMULSION and Axomatic */}
                  <div className="bento-card p-6 space-y-6">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Kondisi Mesin & Aktivitas (Vision)
                    </h3>

                    {/* AXOMATIC */}
                    <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">AXOMATIC</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={visionAxomatic.targetShiftNo}
                            onChange={(e) => setVisionAxomatic({ ...visionAxomatic, targetShiftNo: e.target.value })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="Axomatic"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Mixing</label>
                          <input
                            type="text"
                            value={visionAxomatic.mixing}
                            onChange={(e) => setVisionAxomatic({ ...visionAxomatic, mixing: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Transfer</label>
                          <input
                            type="text"
                            value={visionAxomatic.transfer}
                            onChange={(e) => setVisionAxomatic({ ...visionAxomatic, transfer: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Filling / Output</label>
                          <input
                            type="text"
                            value={visionAxomatic.filling}
                            onChange={(e) => setVisionAxomatic({ ...visionAxomatic, filling: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Kesiapan</label>
                          <textarea
                            rows={2}
                            value={visionAxomatic.kesiapan}
                            onChange={(e) => setVisionAxomatic({ ...visionAxomatic, kesiapan: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Detail Target Shift</label>
                          <textarea
                            rows={2}
                            value={visionAxomatic.targetShift}
                            onChange={(e) => setVisionAxomatic({ ...visionAxomatic, targetShift: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* IMA F87 */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">IMA F87</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={visionImaF87.targetShiftNo}
                            onChange={(e) => setVisionImaF87({ ...visionImaF87, targetShiftNo: e.target.value })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="IMA F87"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={visionImaF87.mixing}
                            onChange={(e) => setVisionImaF87({ ...visionImaF87, mixing: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={visionImaF87.transfer}
                            onChange={(e) => setVisionImaF87({ ...visionImaF87, transfer: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={visionImaF87.filling}
                            onChange={(e) => setVisionImaF87({ ...visionImaF87, filling: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={2}
                            value={visionImaF87.kesiapan}
                            onChange={(e) => setVisionImaF87({ ...visionImaF87, kesiapan: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={2}
                            value={visionImaF87.targetShift}
                            onChange={(e) => setVisionImaF87({ ...visionImaF87, targetShift: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FAT EMULSION */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">FAT EMULSION</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={visionFatEmulsion.targetShiftNo}
                            onChange={(e) => setVisionFatEmulsion({ ...visionFatEmulsion, targetShiftNo: e.target.value })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="Fat Emulsion"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="space-y-2">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing Details</label>
                        <textarea
                          rows={2}
                          value={visionFatEmulsion.mixing}
                          onChange={(e) => setVisionFatEmulsion({ ...visionFatEmulsion, mixing: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={2}
                            value={visionFatEmulsion.kesiapan}
                            onChange={(e) => setVisionFatEmulsion({ ...visionFatEmulsion, kesiapan: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={2}
                            value={visionFatEmulsion.targetShift}
                            onChange={(e) => setVisionFatEmulsion({ ...visionFatEmulsion, targetShift: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BS1010 */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">BS1010</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={visionBs1010.targetShiftNo}
                            onChange={(e) => setVisionBs1010({ ...visionBs1010, targetShiftNo: e.target.value })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="BS1010"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={visionBs1010.mixing}
                            onChange={(e) => setVisionBs1010({ ...visionBs1010, mixing: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={visionBs1010.transfer}
                            onChange={(e) => setVisionBs1010({ ...visionBs1010, transfer: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={visionBs1010.filling}
                            onChange={(e) => setVisionBs1010({ ...visionBs1010, filling: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={2}
                            value={visionBs1010.kesiapan}
                            onChange={(e) => setVisionBs1010({ ...visionBs1010, kesiapan: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={2}
                            value={visionBs1010.targetShift}
                            onChange={(e) => setVisionBs1010({ ...visionBs1010, targetShift: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PLUMAT */}
                    <div className="space-y-3 bg-slate-50/55 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">PLUMAT</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                          <input
                            type="text"
                            value={visionPlumat.targetShiftNo}
                            onChange={(e) => setVisionPlumat({ ...visionPlumat, targetShiftNo: e.target.value })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                          />
                        </div>
                      </div>

                      {/* Live Integration Console */}
                      <LiveMachineSync
                        machineName="Plumat"
                        batches={batches}
                        machines={machines}
                        handleUpdateBatchPhase={handleUpdateBatchPhase}
                        handleUpdateBatchOutput={handleUpdateBatchOutput}
                        handleConnectBatchToMachine={handleConnectBatchToMachine}
                        handleCreateBatchFromReport={handleCreateBatchFromReport}
                        handleUpdateMachineStatus={handleUpdateMachineStatus}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mixing</label>
                          <input
                            type="text"
                            value={visionPlumat.mixing}
                            onChange={(e) => setVisionPlumat({ ...visionPlumat, mixing: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Transfer</label>
                          <input
                            type="text"
                            value={visionPlumat.transfer}
                            onChange={(e) => setVisionPlumat({ ...visionPlumat, transfer: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Filling / Output</label>
                          <input
                            type="text"
                            value={visionPlumat.filling}
                            onChange={(e) => setVisionPlumat({ ...visionPlumat, filling: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Kesiapan</label>
                          <textarea
                            rows={2}
                            value={visionPlumat.kesiapan}
                            onChange={(e) => setVisionPlumat({ ...visionPlumat, kesiapan: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Detail Target Shift</label>
                          <textarea
                            rows={2}
                            value={visionPlumat.targetShift}
                            onChange={(e) => setVisionPlumat({ ...visionPlumat, targetShift: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ICOS, SHINVA ROTARY & SHINVA 19 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                      <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-black text-slate-800 tracking-wide uppercase">ICOS</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                            <input
                              type="text"
                              value={visionIcos.targetShiftNo}
                              onChange={(e) => setVisionIcos({ ...visionIcos, targetShiftNo: e.target.value })}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Status</label>
                            <textarea
                              rows={2}
                              value={visionIcos.status}
                              onChange={(e) => setVisionIcos({ ...visionIcos, status: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Detail Target Shift</label>
                            <textarea
                              rows={2}
                              value={visionIcos.targetShift}
                              onChange={(e) => setVisionIcos({ ...visionIcos, targetShift: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                              placeholder="Contoh: - Filling..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-black text-slate-800 tracking-wide uppercase">SHINVA 19</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                            <input
                              type="text"
                              value={visionShinva19.targetShiftNo}
                              onChange={(e) => setVisionShinva19({ ...visionShinva19, targetShiftNo: e.target.value })}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Status</label>
                            <textarea
                              rows={2}
                              value={visionShinva19.status}
                              onChange={(e) => setVisionShinva19({ ...visionShinva19, status: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Detail Target Shift</label>
                            <textarea
                              rows={2}
                              value={visionShinva19.targetShift}
                              onChange={(e) => setVisionShinva19({ ...visionShinva19, targetShift: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                              placeholder="Contoh: - Sterilisasi..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-black text-slate-800 tracking-wide uppercase">SHINVA ROTARY</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">Target Shift:</span>
                            <input
                              type="text"
                              value={shinvaRotary.targetShiftNo}
                              onChange={(e) => setShinvaRotary({ ...shinvaRotary, targetShiftNo: e.target.value })}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-extrabold text-slate-700 w-24 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Status</label>
                            <textarea
                              rows={2}
                              value={shinvaRotary.status}
                              onChange={(e) => setShinvaRotary({ ...shinvaRotary, status: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Detail Target Shift</label>
                            <textarea
                              rows={2}
                              value={shinvaRotary.targetShift}
                              onChange={(e) => setShinvaRotary({ ...shinvaRotary, targetShift: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                              placeholder="Contoh: - Sterilisasi..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DIVISION C: MAINTENANCE SVP FORM */}
              {activeDivision === 'maintenance' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* General Header Inputs */}
                  <div className="bento-card p-6 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Informasi Umum (Maintenance)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hari & Tanggal Laporan</label>
                        <input
                          type="text"
                          value={maintenanceDate}
                          onChange={(e) => setMaintenanceDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. Rabu, 09/07/26"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Shift Kerja</label>
                        <select
                          value={maintenanceShift}
                          onChange={(e) => setMaintenanceShift(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Shift 1">Shift 1</option>
                          <option value="Shift 2">Shift 2</option>
                          <option value="Shift 3">Shift 3</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Dilaporkan Oleh</label>
                      <input
                        type="text"
                        value={maintenanceReporter}
                        onChange={(e) => setMaintenanceReporter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Kang Rohmat."
                      />
                    </div>
                  </div>

                  {/* Integrasi Downtime Monitoring */}
                  <div className="bento-card p-6 space-y-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between border-b border-blue-100/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                          Integrasi Downtime Monitoring
                        </h3>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Live Sync
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Hubungkan ke Catatan Downtime Aktif
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={connectedDowntimeId}
                            onChange={(e) => {
                              const id = e.target.value;
                              setConnectedDowntimeId(id);
                              if (id) {
                                const log = downtimes.find(d => d.id === id);
                                if (log) {
                                  setMaintenanceIssue(log.notes);
                                  if (['Mechanical', 'Electrical', 'Utility', 'Maintenance', 'Instrument'].includes(log.category)) {
                                    setMaintenanceCategory(log.category as any);
                                  }
                                }
                              }
                            }}
                            className="flex-grow px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">-- Pilih Catatan Kejadian Downtime --</option>
                            {downtimes
                              .filter(d => ['Mechanical', 'Electrical', 'Utility', 'Maintenance', 'Instrument'].includes(d.category))
                              .map(d => (
                                <option key={d.id} value={d.id}>
                                  [{d.category}] {d.machineName} - {d.notes.slice(0, 45)}{d.notes.length > 45 ? '...' : ''} ({d.durationMinutes}m)
                                </option>
                              ))}
                          </select>
                          {connectedDowntimeId && (
                            <button
                              type="button"
                              onClick={() => setConnectedDowntimeId('')}
                              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Batal Hubung
                            </button>
                          )}
                        </div>
                      </div>

                      {(() => {
                        const connectedLog = downtimes.find(d => d.id === connectedDowntimeId);
                        if (connectedLog) {
                          return (
                            <div className="bg-white border border-blue-100 p-3.5 rounded-lg space-y-2.5 shadow-sm text-xs text-slate-600">
                              <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 uppercase">
                                <span>Terhubung dengan ID: {connectedLog.id}</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Terbaca & Tersinkronisasi
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                                <div>Mesin: <span className="text-slate-900 font-extrabold">{connectedLog.machineName}</span></div>
                                <div>Kategori: <span className="text-slate-900 font-extrabold">{connectedLog.category}</span></div>
                                <div>Durasi: <span className="text-slate-900 font-extrabold">{connectedLog.durationMinutes} menit</span></div>
                                <div>Waktu: <span className="text-slate-500 font-normal">{new Date(connectedLog.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span></div>
                              </div>
                              <div className="border-t border-slate-100 pt-2 space-y-2">
                                <p className="text-[10px] font-extrabold uppercase text-slate-400">Pembaruan Sinkronisasi:</p>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (setDowntimes) {
                                        setDowntimes(prev => prev.map(d => {
                                          if (d.id === connectedDowntimeId) {
                                            return {
                                              ...d,
                                              notes: maintenanceIssue,
                                              category: maintenanceCategory as any
                                            };
                                          }
                                          return d;
                                        }));
                                        alert('Selesai! Catatan Kejadian Downtime berhasil disinkronkan dengan data laporan ini.');
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Save className="w-3.5 h-3.5" /> Sinkronkan & Perbarui Downtime
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMaintenanceIssue(connectedLog.notes);
                                      if (['Mechanical', 'Electrical', 'Utility', 'Maintenance', 'Instrument'].includes(connectedLog.category)) {
                                        setMaintenanceCategory(connectedLog.category as any);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" /> Ambil Data dari Downtime
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="bg-white/50 border border-dashed border-slate-200 p-4 rounded-lg text-center space-y-3">
                              <p className="text-xs text-slate-500 font-medium">
                                Belum terhubung ke catatan kejadian downtime yang aktif.
                              </p>
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => setShowQuickAddDowntime(true)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Buat Catatan Downtime Baru
                                </button>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Keluhan & Penyebab */}
                  <div className="bento-card p-6 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Keluhan & Analisa Kerusakan
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Kategori Kerusakan</label>
                          <select
                            value={maintenanceCategory}
                            onChange={(e) => setMaintenanceCategory(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Mechanical">Mechanical</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Utility">Utility</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Instrument">Instrument</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Foto Kerusakan (Before)</label>
                          <input
                            type="text"
                            value={maintenancePhotoBefore}
                            onChange={(e) => setMaintenancePhotoBefore(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. Terlampir."
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Keluhan / Kerusakan</label>
                        <textarea
                          rows={2}
                          value={maintenanceIssue}
                          onChange={(e) => setMaintenanceIssue(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. Terdapat alarm pada mesin IMA F87 “rack not in supply”."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Penyebab Kerusakan</label>
                        <textarea
                          rows={2}
                          value={maintenanceCause}
                          onChange={(e) => setMaintenanceCause(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. Coupling penggerak as pompa pada mesin IMA F87 stuck menyebabkan alarm tersebut."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tindakan & Komponen */}
                  <div className="bento-card p-6 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Tindakan Perbaikan & Suku Cadang
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Komponen yang Rusak</label>
                        <input
                          type="text"
                          value={maintenanceComponent}
                          onChange={(e) => setMaintenanceComponent(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. N/A"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Tindakan Perbaikan</label>
                        <textarea
                          rows={2}
                          value={maintenanceAction}
                          onChange={(e) => setMaintenanceAction(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. Dilakukan penyemprotan desinfektan pada as pompa mesin IMA F87."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Pergantian Part</label>
                        <input
                          type="text"
                          value={maintenancePartReplacement}
                          onChange={(e) => setMaintenancePartReplacement(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. N/A"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hasil Akhir */}
                  <div className="bento-card p-6 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Hasil Akhir & Dokumentasi After
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Hasil Test Running</label>
                        <input
                          type="text"
                          value={maintenanceTestResult}
                          onChange={(e) => setMaintenanceTestResult(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. Ok, video terlampir."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Foto Perbaikan (After)</label>
                        <input
                          type="text"
                          value={maintenancePhotoAfter}
                          onChange={(e) => setMaintenancePhotoAfter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. Terlampir."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WHATSAPP SIMULATOR & ACTION BAR (5 cols) */}
        <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-6">
          
          {/* Action Quick Bar */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wide">
              Bagikan & Ekspor Laporan
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Copy */}
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin Teks'}
              </button>
              
              {/* Download */}
              <button
                onClick={downloadReportTxt}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 transform rotate-180" />
                Download .txt
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Kirim langsung ke WhatsApp:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={shareToWhatsapp}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  WA Web Client
                </button>
                <button
                  onClick={shareToWhatsappMobile}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  WA Mobile/API
                </button>
              </div>
            </div>
          </div>

          {/* WHATSAPP PHONE SIMULATOR */}
          <div className="bg-[#efeae2] border border-slate-300 rounded-3xl overflow-hidden shadow-lg relative flex flex-col max-h-[700px]">
            {/* Phone Status Bar / Top notch decoration */}
            <div className="bg-[#075e54] text-white px-5 py-3 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-xs font-black uppercase shadow">
                  SVP
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-tight">SVP U3 Produksi</h4>
                  <span className="text-[9px] text-emerald-300 font-medium">Online (Live Preview)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-mono tracking-widest text-emerald-200">ACTIVE</span>
              </div>
            </div>

            {/* Simulated chat message area */}
            <div className="p-4 overflow-y-auto space-y-4 flex-grow min-h-[400px] max-h-[500px] relative select-text">
              {/* Decorative chat day separator */}
              <div className="flex justify-center select-none">
                <span className="bg-white/90 text-slate-500 text-[10px] px-3 py-1 rounded-lg font-bold shadow-sm border border-slate-100 uppercase tracking-wider">
                  Hari Ini
                </span>
              </div>

              {/* Chat Bubble right-aligned */}
              <div className="flex justify-end pl-6">
                <div className="bg-[#d9fdd3] text-slate-800 px-4 py-3 rounded-2xl rounded-tr-none shadow-sm border border-[#c1e9b9] max-w-full relative text-xs">
                  {/* Compilation viewer */}
                  <div 
                    className="font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap selection:bg-emerald-200"
                    dangerouslySetInnerHTML={{ __html: renderWhatsAppHtml(currentCompiledText) }}
                  />
                  
                  {/* Simulated timestamp */}
                  <div className="text-right text-[9px] text-slate-400 font-semibold mt-2.5 select-none flex items-center justify-end gap-1">
                    <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[#34b7f1] text-[11px] leading-none">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Input styling for completeness */}
            <div className="bg-[#f0f2f5] p-3 border-t border-slate-200 flex items-center gap-2.5 shrink-0 select-none">
              <div className="bg-white rounded-full px-4 py-2 flex-grow border border-slate-200 text-[11px] text-slate-400 font-semibold">
                SVP Daily Report compiling automatically...
              </div>
              <div className="w-9 h-9 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-[#008f72] transition-colors" title="Copy to clipboard shortcut" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Help box */}
          <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wide block">Petunjuk Sharing</span>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Pesan akan diformat menggunakan markup khusus WhatsApp seperti bintang (<code className="bg-slate-200/50 px-0.5 rounded font-bold">*</code>) untuk teks tebal. Saat Anda mengklik "Salin Teks" atau tombol kirim WhatsApp, karakter hiasan ini akan otomatis diterjemahkan oleh WhatsApp menjadi cetak tebal yang rapi.
              </p>
            </div>
          </div>

        </div>
      </div>

      {showQuickAddDowntime && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  Downtime Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddDowntime(false)}
                className="text-white hover:text-slate-200 text-lg font-black bg-white/10 hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickAddDowntimeSubmit} className="p-6 space-y-4 animate-fadeIn">
              <p className="text-xs text-slate-500 font-medium">
                Sistem akan membuat Catatan Kejadian Downtime baru dengan kategori <strong className="text-blue-600">{maintenanceCategory}</strong> dan menghubungkannya langsung ke laporan maintenance ini.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Pilih Mesin</label>
                <select
                  value={quickDowntimeMachine}
                  onChange={(e) => setQuickDowntimeMachine(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                  {/* Fallback standard machines if list is empty */}
                  {machines.length === 0 && [
                    'IMA F87', 'Corima', 'BS8010', 'BS1010', 'IMA MD150', 'Plumat', 'Axomatic', 'Comas', 'Truking'
                  ].map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Durasi Downtime (Menit)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={quickDowntimeDuration}
                    onChange={(e) => setQuickDowntimeDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 font-mono text-[10px] text-slate-400 font-bold select-none">MENIT</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Catatan / Kejadian</label>
                <textarea
                  rows={3}
                  value={maintenanceIssue}
                  onChange={(e) => setMaintenanceIssue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Deskripsi kerusakan..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddDowntime(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
