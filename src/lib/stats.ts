import type { Match } from '../types';
import { opponentNames } from './format';

export function setsWon(m: Match): number {
  return m.sets.filter((s) => s.me > s.them).length;
}

export function setsLost(m: Match): number {
  return m.sets.filter((s) => s.them > s.me).length;
}

export function matchWon(m: Match): boolean {
  return setsWon(m) > setsLost(m);
}

export function pointsFor(m: Match): number {
  return m.sets.reduce((a, s) => a + s.me, 0);
}

export function pointsAgainst(m: Match): number {
  return m.sets.reduce((a, s) => a + s.them, 0);
}

export interface Summary {
  total: number;
  wins: number;
  losses: number;
  /** 0..1 */
  winRate: number;
  /** Result per match, oldest → newest */
  form: ('W' | 'L')[];
  streak: { type: 'W' | 'L'; n: number };
  pointsFor: number;
  pointsAgainst: number;
  avgPointsPerSet: number;
  thisMonth: number;
}

export function summarize(matches: Match[]): Summary {
  const total = matches.length;
  // `matches` arrives newest-first; flip to chronological for form/streak
  const chrono = [...matches].reverse();
  const wins = chrono.filter(matchWon).length;
  const losses = total - wins;
  const form = chrono.map((m) => (matchWon(m) ? 'W' : 'L')) as ('W' | 'L')[];

  let streak = { type: 'W' as 'W' | 'L', n: 0 };
  if (total > 0) {
    const last = form[form.length - 1];
    let n = 0;
    for (let i = form.length - 1; i >= 0; i--) {
      if (form[i] === last) n++;
      else break;
    }
    streak = { type: last, n };
  }

  const totalPointsFor = matches.reduce((a, m) => a + pointsFor(m), 0);
  const totalPointsAgainst = matches.reduce((a, m) => a + pointsAgainst(m), 0);
  const setCount = matches.reduce((a, m) => a + (m.sets?.length || 0), 0);
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const thisMonth = matches.filter((m) => {
    if (!m.date) return false;
    const [y, mo] = m.date.split('-').map(Number);
    return y === curYear && mo === curMonth;
  }).length;

  return {
    total,
    wins,
    losses,
    winRate: total ? wins / total : 0,
    form,
    streak,
    pointsFor: totalPointsFor,
    pointsAgainst: totalPointsAgainst,
    avgPointsPerSet: setCount ? totalPointsFor / setCount : 0,
    thisMonth,
  };
}

export interface HeadToHead {
  opponent: string;
  played: number;
  wins: number;
}

export function headToHead(matches: Match[]): HeadToHead[] {
  const map = new Map<string, HeadToHead>();
  for (const m of matches) {
    const names = (m.opponents ?? []).map((o) => o.trim()).filter(Boolean);
    const keys = names.length ? [...new Set(names)] : ['(unknown)'];
    for (const name of keys) {
      const h = map.get(name) ?? { opponent: name, played: 0, wins: 0 };
      h.played += 1;
      if (matchWon(m)) h.wins += 1;
      map.set(name, h);
    }
  }
  return [...map.values()].sort((a, b) => b.played - a.played);
}

export interface PointRow {
  date: string;
  me: number;
  them: number;
  won: boolean;
}

/** Oldest → newest, for charts. */
export function pointSeries(matches: Match[]): PointRow[] {
  return [...matches].reverse().map((m) => ({
    date: m.date,
    me: pointsFor(m),
    them: pointsAgainst(m),
    won: matchWon(m),
  }));
}

export interface PartnerOppRecord {
  opponent: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface PartnerStat {
  partner: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  opponents: PartnerOppRecord[];
}

export function partnerStats(matches: Match[]): PartnerStat[] {
  interface Acc {
    display: string;
    matches: number;
    wins: number;
    losses: number;
    setsWon: number;
    setsLost: number;
    pointsFor: number;
    pointsAgainst: number;
    opp: Map<string, { display: string; matches: number; wins: number; losses: number }>;
  }
  const byPartner = new Map<string, Acc>();
  for (const m of matches) {
    if (m.format !== 'doubles') continue;
    const pName = (m.partner ?? '').trim();
    if (!pName) continue;
    const pKey = pName.toLowerCase();
    let entry = byPartner.get(pKey);
    if (!entry) {
      entry = { display: pName, matches: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0, opp: new Map() };
      byPartner.set(pKey, entry);
    }
    const won = matchWon(m);
    entry.matches += 1;
    if (won) entry.wins += 1;
    else entry.losses += 1;
    entry.setsWon += setsWon(m);
    entry.setsLost += setsLost(m);
    entry.pointsFor += pointsFor(m);
    entry.pointsAgainst += pointsAgainst(m);

    const oppDisplay = opponentNames(m.opponents);
    const oppKey = oppDisplay.toLowerCase();
    let o = entry.opp.get(oppKey);
    if (!o) {
      o = { display: oppDisplay, matches: 0, wins: 0, losses: 0 };
      entry.opp.set(oppKey, o);
    }
    o.matches += 1;
    if (won) o.wins += 1;
    else o.losses += 1;
  }
  return [...byPartner.values()]
    .map((e) => ({
      partner: e.display,
      matches: e.matches,
      wins: e.wins,
      losses: e.losses,
      winRate: e.matches ? e.wins / e.matches : 0,
      setsWon: e.setsWon,
      setsLost: e.setsLost,
      pointsFor: e.pointsFor,
      pointsAgainst: e.pointsAgainst,
      opponents: [...e.opp.values()]
        .map((o) => ({ opponent: o.display, matches: o.matches, wins: o.wins, losses: o.losses, winRate: o.matches ? o.wins / o.matches : 0 }))
        .sort((a, b) => b.matches - a.matches),
    }))
    .sort((a, b) => b.matches - a.matches);
}