import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import MatchList from '../components/MatchList';
import { matchWon } from '../lib/stats';
import { opponentNames } from '../lib/format';
import type { GameFormat } from '../types';

export default function History() {
  const { matches, loading, remove } = useMatches();
  const [q, setQ] = useState('');
  const [fmt, setFmt] = useState<'all' | GameFormat>('all');
  const [res, setRes] = useState<'all' | 'W' | 'L'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const hasFilters = Boolean(q || fmt !== 'all' || res !== 'all' || from || to);

  const resetFilters = () => {
    setQ('');
    setFmt('all');
    setRes('all');
    setFrom('');
    setTo('');
  };

  const filtered = useMemo(
    () =>
      matches.filter((m) => {
        if (fmt !== 'all' && m.format !== fmt) return false;
        if (res !== 'all' && (matchWon(m) ? 'W' : 'L') !== res) return false;
        if (from && m.date < from) return false;
        if (to && m.date > to) return false;
        if (q.trim()) {
          const needle = q.trim().toLowerCase();
          const hay = `${opponentNames(m.opponents)} ${m.partner} ${m.notes}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      }),
    [matches, q, fmt, res, from, to],
  );

  return (
    <>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Matches</h1>
          <p className="page-sub">
            {filtered.length} of {matches.length} matches
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 12, padding: '2px 8px', fontSize: 12 }}
              >
                Reset filters
              </button>
            )}
          </p>
        </div>
        <Link to="/new" className="btn btn-primary">
          + Add match
        </Link>
      </div>

      <div className="card">
        <div className="filters">
          <div className="field">
            <label htmlFor="f-q">Search</label>
            <input
              id="f-q"
              type="search"
              placeholder="opponent, notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-fmt">Format</label>
            <select
              id="f-fmt"
              value={fmt}
              onChange={(e) => setFmt(e.target.value as 'all' | GameFormat)}
            >
              <option value="all">All</option>
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-res">Result</label>
            <select id="f-res" value={res} onChange={(e) => setRes(e.target.value as 'all' | 'W' | 'L')}>
              <option value="all">All</option>
              <option value="W">Wins</option>
              <option value="L">Losses</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-from">From</label>
            <input id="f-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-to">To</label>
            <input id="f-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <MatchList
            matches={filtered}
            onDelete={(id) => void remove(id)}
            emptyText="No matches match your filters."
          />
        )}
      </div>
    </>
  );
}