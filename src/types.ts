export interface Nap {
  id: string;
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
}

export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD (the date the sleep belongs to)
  sleepStart: string; // ISO timestamp
  sleepEnd: string;   // ISO timestamp
  naps: Nap[];
  createdAt: string;
  updatedAt: string;
}

export type Page = 'today' | 'history' | 'insights' | 'settings';
