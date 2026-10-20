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

/** All matches, newest first (date desc, then createdAt desc). */
export async function listMatches(): Promise<Match[]> {
  const db = await getDB();
  const all = await db.getAll(STORE);
  return all.sort((a, b) =>
    a.date === b.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.date < b.date ? 1 : -1,
  );
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const db = await getDB();
  return (await db.get(STORE, id)) as Match | undefined;
}

export async function putMatch(m: Match): Promise<void> {
  const db = await getDB();
  await db.put(STORE, m);
}

export async function removeMatch(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
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
    return {
      id: m.id,
      date: m.date,
      format: m.format === 'doubles' ? 'doubles' : 'singles',
      opponents: Array.isArray(m.opponents)
        ? m.opponents.map((o) => (typeof o === 'string' ? o : '')).slice(0, 2)
        : typeof legacyOpp === 'string' && legacyOpp
          ? [legacyOpp]
          : [],
      partner: typeof m.partner === 'string' ? m.partner : '',
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