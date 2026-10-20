import type { Match } from '../types';
import { opponentNames } from './format';

export function setsWon(m: Match): number {
  return (m?.sets ?? []).filter((s) => (s?.me ?? 0) > (s?.them ?? 0)).length;
}

export function setsLost(m: Match): number {
  return (m?.sets ?? []).filter((s) => (s?.them ?? 0) > (s?.me ?? 0)).length;
}

export function matchWon(m: Match): boolean {
  return setsWon(m) > setsLost(m);
}

export function pointsFor(m: Match): number {
  return (m?.sets ?? []).reduce((a, s) => a + (s?.me || 0), 0);
}

export function pointsAgainst(m: Match): number {
  return (m?.sets ?? []).reduce((a, s) => a + (s?.them || 0), 0);
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

export interface H2HPartnerRecord {
  partner: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface H2HOpponentSummary {
  opponent: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  lastPlayed: string;
  streak: { type: 'W' | 'L'; count: number };
  recentForm: ('W' | 'L')[];
  singles: { matches: number; wins: number; losses: number; winRate: number };
  doubles: { matches: number; wins: number; losses: number; winRate: number };
  partners: H2HPartnerRecord[];
  matchesList: Match[];
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

export function h2hStats(
  matches: Match[],
  mode: 'individual' | 'pair' = 'individual',
): H2HOpponentSummary[] {
  interface Acc {
    display: string;
    matchesList: Match[];
    singlesMatches: Match[];
    doublesMatches: Match[];
    partnersMap: Map<string, { display: string; matches: number; wins: number; losses: number }>;
  }

  const map = new Map<string, Acc>();

  for (const m of matches) {
    let opponentKeys: { key: string; display: string }[] = [];

    if (mode === 'pair') {
      const display = opponentNames(m.opponents);
      opponentKeys = [{ key: display.toLowerCase(), display }];
    } else {
      const names = (m.opponents ?? []).map((o) => o.trim()).filter(Boolean);
      if (names.length === 0) {
        opponentKeys = [{ key: '(unknown)', display: '(unknown)' }];
      } else {
        const seen = new Set<string>();
        for (const name of names) {
          const k = name.toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            opponentKeys.push({ key: k, display: name });
          }
        }
      }
    }

    for (const { key, display } of opponentKeys) {
      let entry = map.get(key);
      if (!entry) {
        entry = {
          display,
          matchesList: [],
          singlesMatches: [],
          doublesMatches: [],
          partnersMap: new Map(),
        };
        map.set(key, entry);
      }

      entry.matchesList.push(m);
      if (m.format === 'singles') {
        entry.singlesMatches.push(m);
      } else {
        entry.doublesMatches.push(m);
        const pName = (m.partner ?? '').trim();
        if (pName) {
          const pKey = pName.toLowerCase();
          let pEntry = entry.partnersMap.get(pKey);
          if (!pEntry) {
            pEntry = { display: pName, matches: 0, wins: 0, losses: 0 };
            entry.partnersMap.set(pKey, pEntry);
          }
          pEntry.matches += 1;
          if (matchWon(m)) pEntry.wins += 1;
          else pEntry.losses += 1;
        }
      }
    }
  }

  return [...map.values()]
    .map((e) => {
      // Sort matches newest first (assuming matches input is already newest-first or sort by date)
      const sortedMatches = [...e.matchesList].sort((a, b) => {
        if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      const total = sortedMatches.length;
      const wins = sortedMatches.filter(matchWon).length;
      const losses = total - wins;
      const setsW = sortedMatches.reduce((acc, m) => acc + setsWon(m), 0);
      const setsL = sortedMatches.reduce((acc, m) => acc + setsLost(m), 0);
      const ptsFor = sortedMatches.reduce((acc, m) => acc + pointsFor(m), 0);
      const ptsAgainst = sortedMatches.reduce((acc, m) => acc + pointsAgainst(m), 0);

      // Chronological for form and streak
      const chrono = [...sortedMatches].reverse();
      const form = chrono.map((m) => (matchWon(m) ? 'W' : 'L')) as ('W' | 'L')[];
      let streak = { type: 'W' as 'W' | 'L', count: 0 };
      if (total > 0) {
        const last = form[form.length - 1];
        let n = 0;
        for (let i = form.length - 1; i >= 0; i--) {
          if (form[i] === last) n++;
          else break;
        }
        streak = { type: last, count: n };
      }

      const sWins = e.singlesMatches.filter(matchWon).length;
      const sTotal = e.singlesMatches.length;
      const dWins = e.doublesMatches.filter(matchWon).length;
      const dTotal = e.doublesMatches.length;

      const partners = [...e.partnersMap.values()]
        .map((p) => ({
          partner: p.display,
          matches: p.matches,
          wins: p.wins,
          losses: p.losses,
          winRate: p.matches ? p.wins / p.matches : 0,
        }))
        .sort((a, b) => b.matches - a.matches);

      return {
        opponent: e.display,
        matches: total,
        wins,
        losses,
        winRate: total ? wins / total : 0,
        setsWon: setsW,
        setsLost: setsL,
        pointsFor: ptsFor,
        pointsAgainst: ptsAgainst,
        pointDiff: ptsFor - ptsAgainst,
        lastPlayed: sortedMatches[0]?.date ?? '',
        streak,
        recentForm: form.slice(-5),
        singles: {
          matches: sTotal,
          wins: sWins,
          losses: sTotal - sWins,
          winRate: sTotal ? sWins / sTotal : 0,
        },
        doubles: {
          matches: dTotal,
          wins: dWins,
          losses: dTotal - dWins,
          winRate: dTotal ? dWins / dTotal : 0,
        },
        partners,
        matchesList: sortedMatches,
      };
    })
    .sort((a, b) => {
      if (b.matches !== a.matches) return b.matches - a.matches;
      return b.winRate - a.winRate;
    });
}

export function getH2HForOpponent(
  matches: Match[],
  opponentName: string,
  mode: 'individual' | 'pair' = 'individual',
): H2HOpponentSummary | null {
  const all = h2hStats(matches, mode);
  const target = opponentName.trim().toLowerCase();
  const found = all.find((h) => h.opponent.toLowerCase() === target);
  if (found) return found;

  // If not found in current mode, try the other mode
  const alternateMode = mode === 'individual' ? 'pair' : 'individual';
  const altAll = h2hStats(matches, alternateMode);
  return altAll.find((h) => h.opponent.toLowerCase() === target) ?? null;
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