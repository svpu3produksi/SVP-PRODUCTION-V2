import React, { useState, useEffect } from 'react';
import { Phase, Batch, Machine, DowntimeLog, TankHistory } from './types';
import { 
  INITIAL_BATCHES, INITIAL_MACHINES, INITIAL_DOWNTIME_LOGS, INITIAL_TANK_HISTORY, INITIAL_HISTORICAL_BATCHES 
} from './data/mockData';
import { syncBatchToSheets } from './lib/sheets';
import { initAuth, googleSignIn, logout } from './lib/firebaseAuth';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import OeeDowntime from './components/OeeDowntime';
import Analytics from './components/Analytics';
import SheetsSync from './components/SheetsSync';
import ReportManager from './components/ReportManager';
import { 
  LayoutDashboard, Kanban, BarChart2, TrendingUp, FileSpreadsheet, FileText,
  Clock, Calendar, CheckCircle2, User as UserIcon, RefreshCw, Sparkles, LogOut 
} from 'lucide-react';

export default function App() {
  // Navigation Tabs: dashboard, kanban, oee, analytics, sheets
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core State Engine
  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('svp_active_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [historicalBatches, setHistoricalBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('svp_historical_batches');
    return saved ? JSON.parse(saved) : INITIAL_HISTORICAL_BATCHES;
  });

  const [downtimes, setDowntimes] = useState<DowntimeLog[]>(() => {
    const saved = localStorage.getItem('svp_downtimes');
    return saved ? JSON.parse(saved) : INITIAL_DOWNTIME_LOGS;
  });

  const [tankUsageHistory, setTankUsageHistory] = useState<TankHistory[]>(() => {
    const saved = localStorage.getItem('svp_tank_usage_history');
    return saved ? JSON.parse(saved) : INITIAL_TANK_HISTORY;
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('svp_machines');
    return saved ? JSON.parse(saved) : INITIAL_MACHINES;
  });

  // Clock state
  const [time, setTime] = useState(new Date());

  // OAuth token & User state managed via Firebase Auth
  const [oauthToken, setOauthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setOauthToken(token);
      },
      () => {
        setCurrentUser(null);
        setOauthToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setOauthToken(result.accessToken);
      }
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setOauthToken(null);
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  // Sync to Local Storage automatically
  useEffect(() => {
    localStorage.setItem('svp_active_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('svp_historical_batches', JSON.stringify(historicalBatches));
  }, [historicalBatches]);

  useEffect(() => {
    localStorage.setItem('svp_downtimes', JSON.stringify(downtimes));
  }, [downtimes]);

  useEffect(() => {
    localStorage.setItem('svp_tank_usage_history', JSON.stringify(tankUsageHistory));
  }, [tankUsageHistory]);

  useEffect(() => {
    localStorage.setItem('svp_machines', JSON.stringify(machines));
  }, [machines]);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // AUTOMATED MACHINE INTEGRATION:
  // Dynamically compute active machine statuses based on currently FILLING batches on the Kanban board!
  const computedMachines = React.useMemo(() => {
    // Start with a clone of current machines state
    const baseMachines = machines.map(m => ({ ...m, status: m.status as Machine['status'] }));
    
    // Find any batch currently in the FILLING phase
    const fillingBatches = batches.filter(b => b.phase === 'FILLING' && b.mesinFilling && b.mesinFilling !== 'N/A');

    // Update active statuses
    baseMachines.forEach(m => {
      const activeBatch = fillingBatches.find(b => b.mesinFilling === m.name);
      if (activeBatch) {
        m.status = 'running'; // Automatically force to 'running' (representing "Filling")
        m.activeBatchId = activeBatch.id;
        m.activeBatchName = activeBatch.namaProduk;
        m.activeBatchNo = activeBatch.noBatch;
      } else {
        // If it was marked running but doesn't have an active batch in Kanban, set it to idle
        if (m.status === 'running') {
          m.status = 'idle';
          m.activeBatchId = undefined;
          m.activeBatchName = undefined;
          m.activeBatchNo = undefined;
        }
      }
    });

    return baseMachines;
  }, [machines, batches]);

  const handleUpdateMachine = (machineId: string, updates: Partial<Machine>) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;

      const updated = { ...m, ...updates };

      // Synchronize with active batches
      if (updated.status === 'running') {
        const activeBatchName = updates.activeBatchName || m.activeBatchName || 'Produk Baru';
        const activeBatchNo = updates.activeBatchNo || m.activeBatchNo || `B${Date.now().toString().slice(-6)}`;
        
        // Find if there is an active batch on this machine in FILLING phase
        const existingBatch = batches.find(b => b.phase === 'FILLING' && b.mesinFilling === m.name);
        if (existingBatch) {
          // Update the existing batch
          setBatches(prevBatches => prevBatches.map(b => {
            if (b.id === existingBatch.id) {
              return {
                ...b,
                namaProduk: activeBatchName,
                noBatch: activeBatchNo,
                updatedAt: new Date().toISOString()
              };
            }
            return b;
          }));
        } else {
          // Create a new active batch for this machine on the fly!
          const newBatchId = `batch_m_${Date.now()}`;
          const timestamp = new Date().toISOString();
          const newBatch: Batch = {
            id: newBatchId,
            namaProduk: activeBatchName,
            noBatch: activeBatchNo,
            phase: 'FILLING',
            mixingTank: 'N/A',
            mixingStart: '',
            mixingEnd: '',
            holdingTank: 'N/A',
            transferStart: '',
            transferEnd: '',
            mesinFilling: m.name,
            fillingStart: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            fillingEnd: '',
            outputAktual: 0,
            outputTarget: 5000,
            intervensi: '',
            catatanPenting: 'Dibuat langsung dari edit mesin.',
            createdAt: timestamp,
            updatedAt: timestamp
          };
          setBatches(prevBatches => [newBatch, ...prevBatches]);
        }
      } else {
        // If changing from running to something else (idle, CIP SIP, maintenance),
        // we should disassociate any active batch currently in FILLING assigned to this machine
        const existingBatch = batches.find(b => b.phase === 'FILLING' && b.mesinFilling === m.name);
        if (existingBatch) {
          setBatches(prevBatches => prevBatches.map(b => {
            if (b.id === existingBatch.id) {
              return {
                ...b,
                mesinFilling: 'N/A',
                updatedAt: new Date().toISOString()
              };
            }
            return b;
          }));
        }
      }

      return updated;
    }));
  };

  // Handlers for Active Batches
  const handleAddBatch = (newBatchData: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `batch_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const fullNewBatch: Batch = {
      ...newBatchData,
      id: newId,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Log Tank Usage if selected
    if (fullNewBatch.mixingTank && fullNewBatch.mixingTank !== 'N/A') {
      const logId = `th_${Date.now()}`;
      const newTankLog: TankHistory = {
        id: logId,
        tankName: fullNewBatch.mixingTank,
        tankType: 'MIXING',
        batchNo: fullNewBatch.noBatch,
        productName: fullNewBatch.namaProduk,
        phase: 'MIXING',
        timestamp: timestamp,
        action: 'START'
      };
      setTankUsageHistory(prev => [newTankLog, ...prev]);
    }

    setBatches(prev => [fullNewBatch, ...prev]);
  };

  const handleUpdateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== id) return b;

      const previous = { ...b };
      const current = { ...b, ...updates, updatedAt: new Date().toISOString() };

      // Automatic phase transition from FILLING to DONE if outputAktual meets or exceeds outputTarget
      if (current.phase === 'FILLING' && current.outputAktual >= current.outputTarget) {
        current.phase = 'DONE';
        const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        if (!current.fillingEnd) {
          current.fillingEnd = currentTime;
        }
      }

      // Tank History logging on updates:
      const timestamp = new Date().toISOString();

      // Case 1: Mixing tank changes or starting usage
      if (current.phase === 'MIXING' && current.mixingTank !== 'N/A' && current.mixingTank !== previous.mixingTank) {
        // If previous had a tank, log END for it
        if (previous.mixingTank && previous.mixingTank !== 'N/A') {
          setTankUsageHistory(h => [{
            id: `th_end_${Date.now()}_1`,
            tankName: previous.mixingTank,
            tankType: 'MIXING',
            batchNo: previous.noBatch,
            productName: previous.namaProduk,
            phase: 'MIXING',
            timestamp: timestamp,
            action: 'END'
          }, ...h]);
        }
        // Log START for new tank
        setTankUsageHistory(h => [{
          id: `th_start_${Date.now()}_2`,
          tankName: current.mixingTank,
          tankType: 'MIXING',
          batchNo: current.noBatch,
          productName: current.namaProduk,
          phase: 'MIXING',
          timestamp: timestamp,
          action: 'START'
        }, ...h]);
      }

      // Case 2: Transfer tank changes
      if (current.phase === 'TRANSFER' && current.holdingTank !== 'N/A' && current.holdingTank !== previous.holdingTank) {
        if (previous.holdingTank && previous.holdingTank !== 'N/A') {
          setTankUsageHistory(h => [{
            id: `th_end_${Date.now()}_3`,
            tankName: previous.holdingTank,
            tankType: 'HOLDING',
            batchNo: previous.noBatch,
            productName: previous.namaProduk,
            phase: 'TRANSFER',
            timestamp: timestamp,
            action: 'END'
          }, ...h]);
        }
        setTankUsageHistory(h => [{
          id: `th_start_${Date.now()}_4`,
          tankName: current.holdingTank,
          tankType: 'HOLDING',
          batchNo: current.noBatch,
          productName: current.namaProduk,
          phase: 'TRANSFER',
          timestamp: timestamp,
          action: 'START'
        }, ...h]);
      }

      // Case 3: Transition out of MIXING to TRANSFER (End Mixing tank)
      if (previous.phase === 'MIXING' && current.phase === 'TRANSFER' && previous.mixingTank && previous.mixingTank !== 'N/A') {
        setTankUsageHistory(h => [{
          id: `th_end_trans_${Date.now()}`,
          tankName: previous.mixingTank,
          tankType: 'MIXING',
          batchNo: previous.noBatch,
          productName: previous.namaProduk,
          phase: 'MIXING',
          timestamp: timestamp,
          action: 'END'
        }, ...h]);
      }

      // Case 4: Transition out of TRANSFER to FILLING (End Holding tank)
      if (previous.phase === 'TRANSFER' && current.phase === 'FILLING' && previous.holdingTank && previous.holdingTank !== 'N/A') {
        setTankUsageHistory(h => [{
          id: `th_end_fill_${Date.now()}`,
          tankName: previous.holdingTank,
          tankType: 'HOLDING',
          batchNo: previous.noBatch,
          productName: previous.namaProduk,
          phase: 'TRANSFER',
          timestamp: timestamp,
          action: 'END'
        }, ...h]);
      }

      return current;
    }));
  };

  const handleDeleteBatch = (id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  const handleDeleteCompletedBatch = (id: string) => {
    setHistoricalBatches(prev => prev.filter(b => b.id !== id));
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  // Archive a DONE batch to Historical Production + Sync to Google Sheets
  const handleArchiveBatch = async (id: string) => {
    const target = batches.find(b => b.id === id);
    if (!target) return;

    const updatedTarget = {
      ...target,
      completedAt: new Date().toISOString()
    };

    // Remove from active batches list
    setBatches(prev => prev.filter(b => b.id !== id));
    
    // Add to historical batches list
    setHistoricalBatches(prev => [updatedTarget, ...prev]);

    // Trigger Sync to Google Sheets
    try {
      const syncRes = await syncBatchToSheets(updatedTarget, oauthToken);
      if (syncRes.success) {
        alert(`Sukses Mengarsipkan! ${syncRes.message}`);
      } else {
        alert(`Arsip disimpan secara lokal. Google Sheets Sync Alert: ${syncRes.message}`);
      }
    } catch (e) {
      console.error(e);
      alert('Arsip disimpan lokal.');
    }
  };

  // Handlers for Downtimes
  const handleAddDowntime = (newLogData: Omit<DowntimeLog, 'id' | 'timestamp'>) => {
    const newLog: DowntimeLog = {
      ...newLogData,
      id: `dt_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setDowntimes(prev => [newLog, ...prev]);
  };

  const handleClearDowntimes = () => {
    setDowntimes([]);
  };

  const handleClearCompletedTanks = () => {
    setTankUsageHistory(prev => prev.filter(log => log.action !== 'END'));
  };

  // Manual trigger to sync ALL historical batches to Google Sheets
  const handleSyncAllToSheets = async (): Promise<{ success: boolean; message: string }> => {
    if (historicalBatches.length === 0) {
      return { success: false, message: 'Tidak ada data historical untuk disinkronisasi.' };
    }

    let successCount = 0;
    for (const b of historicalBatches) {
      const res = await syncBatchToSheets(b, oauthToken);
      if (res.success) successCount++;
    }

    return { 
      success: true, 
      message: `Berhasil mensinkronisasi ${successCount} dari ${historicalBatches.length} batch ke Google Sheet!` 
    };
  };

  // Navigation tabs config
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'oee', label: 'OEE & Downtime', icon: BarChart2 },
    { id: 'analytics', label: 'Grafik Analitik', icon: TrendingUp },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'sheets', label: 'Google Sheets Sync', icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col antialiased">
      {/* Top Bento Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 select-none print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1e293b] p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                SVP Production Monitoring
              </h1>
              <span className="bg-[#1e293b] text-white text-[10px] px-2.5 py-0.5 rounded font-bold tracking-wider uppercase">
                System V1.0
              </span>
            </div>
          </div>

          {/* Bento Clock, Date & Auth Displays */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl bento-mono font-bold">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
              <span className="text-slate-300">|</span>
              <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
              <span>{time.toLocaleTimeString('id-ID')}</span>
            </div>

            {/* Auth Button / Profile Bar */}
            <div className="flex items-center">
              {currentUser ? (
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 pl-2.5 pr-3.5 py-1.5 rounded-xl text-xs font-semibold">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'Google Account'} 
                      className="w-6 h-6 rounded-full border border-slate-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                      {(currentUser.displayName || currentUser.email || 'G').slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Sheets Active</span>
                    <span className="text-[11px] text-slate-700 truncate font-bold max-w-[120px]" title={currentUser.email}>
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-1.5 p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3-.97 4.17v3.46h6.48c3.8-3.5 5.97-8.67 5.97-14.48z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-6.48-3.46c-1.8.84-3.87 1.34-6.04 1.34-4.65 0-8.58-3.14-9.99-7.37H.94v3.58C3.04 19.38 7.21 24 12 24z" />
                    <path fill="#FBBC05" d="M2.01 11.6c-.36-1.08-.56-2.22-.56-3.4s.2-2.32.56-3.4V1.22H.94C.34 2.42 0 3.77 0 5.2c0 1.43.34 2.78.94 3.98l1.07 2.42z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.21 0 3.04 4.62.94 8.78l7.98 6.19c1.41-4.23 5.34-7.37 9.99-7.37z" />
                  </svg>
                  Connect Sheets
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bento Main Tab Bar Navigation */}
      <nav className="bg-white border-b border-slate-200 shrink-0 select-none print:hidden">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_tab_${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 py-3.5 px-1 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Primary Application Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        {/* Render Active View */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            batches={batches}
            machines={computedMachines}
            downtimes={downtimes}
            historicalBatches={historicalBatches}
            onNavigate={(tab) => setActiveTab(tab)}
            onUpdateMachine={handleUpdateMachine}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard 
            batches={batches}
            onAddBatch={handleAddBatch}
            onUpdateBatch={handleUpdateBatch}
            onDeleteBatch={handleDeleteBatch}
            onArchiveBatch={handleArchiveBatch}
            tankUsageHistory={tankUsageHistory}
            onClearCompletedTanks={handleClearCompletedTanks}
          />
        )}

        {activeTab === 'oee' && (
          <OeeDowntime 
            downtimes={downtimes}
            onAddDowntime={handleAddDowntime}
            onClearDowntimes={handleClearDowntimes}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            batches={batches}
            historicalBatches={historicalBatches}
            machines={computedMachines}
            onDeleteBatch={handleDeleteCompletedBatch}
          />
        )}

        {activeTab === 'report' && (
          <ReportManager
            batches={batches}
            historicalBatches={historicalBatches}
            machines={computedMachines}
            downtimes={downtimes}
            tankUsageHistory={tankUsageHistory}
            setBatches={setBatches}
            setMachines={setMachines}
            setTankUsageHistory={setTankUsageHistory}
          />
        )}

        {activeTab === 'sheets' && (
          <SheetsSync 
            onSyncAll={handleSyncAllToSheets}
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer info banner */}
      <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400 select-none print:hidden shrink-0">
        <p>&copy; 2026 Production Process Monitoring SVP Production. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
