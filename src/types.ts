export type Phase = 'MIXING' | 'TRANSFER' | 'FILLING' | 'DONE';

export interface Batch {
  id: string;
  namaProduk: string;
  noBatch: string;
  phase: Phase;
  
  // Mixing details
  mixingTank: string;
  mixingStart: string;
  mixingEnd: string;
  
  // Transfer details
  holdingTank: string;
  transferStart: string;
  transferEnd: string;
  
  // Filling details
  mesinFilling: string;
  fillingStart: string;
  fillingEnd: string;
  outputAktual: number;
  outputTarget: number;
  
  // Other fields
  intervensi: string;
  catatanPenting: string;
  
  // Phase timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Machine {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'CIP SIP' | 'maintenance';
  activeBatchId?: string;
  activeBatchName?: string;
  activeBatchNo?: string;
  speed: number; // pcs/min or similar for OEE calculation
}

export type DowntimeCategory =
  | 'Mechanical'
  | 'Electrical'
  | 'Utility'
  | 'Material'
  | 'Operator'
  | 'Quality'
  | 'CIP SIP'
  | 'Changeover'
  | 'Maintenance'
  | 'Instrument'
  | 'Waiting';

export interface DowntimeLog {
  id: string;
  machineName: string;
  category: DowntimeCategory;
  durationMinutes: number; // duration in minutes
  timestamp: string;
  notes: string;
}

export interface TankHistory {
  id: string;
  tankName: string;
  tankType: 'MIXING' | 'HOLDING';
  batchNo: string;
  productName: string;
  phase: Phase;
  timestamp: string;
  action: 'START' | 'END' | 'USE';
}

export const MIXING_TANK_OPTIONS = [
  'MT60L A',
  'MT60L B',
  'MT100L A',
  'MT100L B',
  'MT100L C',
  'MT100L E',
  'MT150L A',
  'MT150L B',
  'MT200L A',
  'MT200L B',
  'MT300L Truking (Exp 1)',
  'MT200L Vakumix (Exp 2)',
  'MT200L Truking (Exp 2)',
  'MT1000L ABS-1 Vakumix',
  'MT1000L ABS-2 Vakumix',
  'Pressurized Tank',
  'Axomatic',
  'N/A'
];

export const HOLDING_TANK_OPTIONS = [
  'MT60L A',
  'MT60L B',
  'MT100L A',
  'MT100B',
  'MT100L C',
  'HT100L P',
  'HT100L Q',
  'HT100L R',
  'HT100L S',
  'HT100L T',
  'HT150L Tetra Pak',
  'HT150L Truking',
  'HT300L Truking (Exp 1)',
  'HT200L Vakumix (Exp 2)',
  'HT200L Truking (Exp 2)',
  'Pressurized Tank',
  'N/A'
];

export const MESIN_FILLING_OPTIONS = [
  'Corima',
  'BS8010',
  'BS1010',
  'IMA F87',
  'IMA MD150',
  'Truking',
  'Plumat',
  'Axomatic',
  'BS8010 Ampoule Complete Line',
  'Comas'
];

export const DOWNTIME_CATEGORIES: DowntimeCategory[] = [
  'Mechanical',
  'Electrical',
  'Utility',
  'Material',
  'Operator',
  'Quality',
  'CIP SIP',
  'Changeover',
  'Maintenance',
  'Instrument',
  'Waiting'
];
