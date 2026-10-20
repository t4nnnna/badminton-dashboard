import { format, parseISO } from 'date-fns';
import type { Match, SetScore } from '../types';

export function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM yyyy');
  } catch {
    return iso;
  }
}

export function setScore(s: SetScore): string {
  return `${s.me}-${s.them}`;
}

export function matchScore(m: Match): string {
  return m.sets.map(setScore).join('  ');
}

/** Join one or two opponent names for display. */
export function opponentNames(opponents: string[]): string {
  const names = (opponents ?? []).map((o) => o.trim()).filter(Boolean);
  if (names.length === 0) return '(unknown)';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return names.join(', ');
}

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}