import { openDB, IDBPDatabase } from 'idb';
import { SleepEntry } from './types';

const DB_NAME = 'sleep-journal';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllEntries(): Promise<SleepEntry[]> {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEntryByDate(date: string): Promise<SleepEntry | undefined> {
  const db = await getDB();
  return db.getFromIndex(STORE_NAME, 'date', date);
}

export async function saveEntry(entry: SleepEntry): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, entry);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllEntries(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function exportData(): Promise<string> {
  const entries = await getAllEntries();
  return JSON.stringify(entries, null, 2);
}

export async function importData(json: string): Promise<number> {
  const entries: SleepEntry[] = JSON.parse(json);
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  let count = 0;
  for (const entry of entries) {
    await tx.store.put(entry);
    count++;
  }
  await tx.done;
  return count;
}
