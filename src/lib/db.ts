import { openDB, type IDBPDatabase } from 'idb';
import type { Match } from '../types';

const DB_NAME = 'badminton';
const STORE = 'matches';
const VERSION = 1;

interface DBSchema {
  matches: {
    value: Match;
    indexes: { byDate: string };
  };
}

let dbPromise: Promise<IDBPDatabase<DBSchema>> | null = null;

function getDB(): Promise<IDBPDatabase<DBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<DBSchema>(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('byDate', 'date');
        }
      },
    });
  }
  return dbPromise;
}

// BroadcastChannel for seamless cross-tab synchronization
const syncChannel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('badminton_db_sync')
    : null;

export function notifyChange(): void {
  syncChannel?.postMessage({ type: 'sync', timestamp: Date.now() });
}

export function onDBSync(callback: () => void): () => void {
  if (!syncChannel) return () => {};
  const handler = () => callback();
  syncChannel.addEventListener('message', handler);
  return () => syncChannel.removeEventListener('message', handler);
}

/** All matches, newest first (date desc, then createdAt desc). */
export async function listMatches(): Promise<Match[]> {
  const db = await getDB();
  const all = await db.getAll(STORE);
  return all.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}

export async function getMatch(id: string): Promise<Match | undefined> {
  if (!id) return undefined;
  const db = await getDB();
  return (await db.get(STORE, id)) as Match | undefined;
}

export async function putMatch(m: Match): Promise<void> {
  const db = await getDB();
  await db.put(STORE, m);
  notifyChange();
}

/** Fast batch insert/update using a single IndexedDB transaction. */
export async function putMatches(matches: Match[]): Promise<void> {
  if (matches.length === 0) return;
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  await Promise.all(matches.map((m) => tx.store.put(m)));
  await tx.done;
  notifyChange();
}

export async function removeMatch(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
  notifyChange();
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
  notifyChange();
}

export function exportJSON(matches: Match[]): string {
  return JSON.stringify(
    { app: 'badminton-dashboard', version: 1, exportedAt: new Date().toISOString(), matches },
    null,
    2,
  );
}

/** Parse + validate an exported JSON file. Throws with a readable message on bad input. */
export function parseImport(text: string): Match[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  const raw = Array.isArray(data) ? data : (data as { matches?: unknown })?.matches;
  if (!Array.isArray(raw)) throw new Error('No "matches" array found in file.');

  return raw.map((r, i) => {
    const m = r as Partial<Match>;
    if (!m || typeof m.id !== 'string' || typeof m.date !== 'string' || !Array.isArray(m.sets)) {
      throw new Error(`Match #${i + 1} is malformed (needs id, date, sets).`);
    }
    const now = new Date().toISOString();
    const legacyOpp = (m as { opponent?: string }).opponent;
    const rawOpponents = Array.isArray(m.opponents)
      ? m.opponents.map((o) => (typeof o === 'string' ? o.trim() : '')).filter(Boolean).slice(0, 2)
      : typeof legacyOpp === 'string' && legacyOpp.trim()
        ? [legacyOpp.trim()]
        : [];
    const fmt = m.format === 'doubles' ? 'doubles' : 'singles';

    return {
      id: m.id,
      date: m.date,
      format: fmt,
      opponents: rawOpponents,
      partner: fmt === 'doubles' && typeof m.partner === 'string' ? m.partner.trim() : '',
      sets: m.sets.map((s) => ({
        me: Math.max(0, Number((s as { me?: number })?.me) || 0),
        them: Math.max(0, Number((s as { them?: number })?.them) || 0),
      })),
      notes: typeof m.notes === 'string' ? m.notes : '',
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : now,
      updatedAt: typeof m.updatedAt === 'string' ? m.updatedAt : now,
    } as Match;
  });
}