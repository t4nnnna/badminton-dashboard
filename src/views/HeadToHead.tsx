import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import MatchList from '../components/MatchList';
import { h2hStats } from '../lib/stats';
import { fmtDate } from '../lib/format';
import type { GameFormat, Match } from '../types';

const pct = (n: number) => `${Math.round(n * 100)}%`;
const wrColor = (n: number) => (n >= 0.5 ? 'var(--accent)' : 'var(--danger)');

export default function HeadToHead() {
  const { matches, loading, remove } = useMatches();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedOpponentName = searchParams.get('opponent') ?? '';

  const [mode, setMode] = useState<'individual' | 'pair'>('individual');
  const [formatFilter, setFormatFilter] = useState<'all' | GameFormat>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'played' | 'winRate' | 'name' | 'lastPlayed'>('played');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter matches by format if selected
  const filteredMatches = useMemo(() => {
    if (formatFilter === 'all') return matches;
    return matches.filter((m) => m.format === formatFilter);
  }, [matches, formatFilter]);

  // Compute all H2H stats
  const allH2H = useMemo(() => {
    return h2hStats(filteredMatches, mode);
  }, [filteredMatches, mode]);

  // Selected opponent data
  const selectedH2H = useMemo(() => {
    if (!selectedOpponentName) return null;
    const target = selectedOpponentName.trim().toLowerCase();
    return allH2H.find((h) => h.opponent.toLowerCase() === target) ?? null;
  }, [allH2H, selectedOpponentName]);

  // Filter and sort the opponent table
  const displayedH2H = useMemo(() => {
    let list = allH2H;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((h) => h.opponent.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      let comp = 0;
      if (sortBy === 'played') {
        comp = a.matches - b.matches;
      } else if (sortBy === 'winRate') {
        comp = a.winRate - b.winRate;
      } else if (sortBy === 'name') {
        comp = a.opponent.localeCompare(b.opponent);
      } else if (sortBy === 'lastPlayed') {
        comp = a.lastPlayed.localeCompare(b.lastPlayed);
      }
      return sortDir === 'desc' ? -comp : comp;
    });
  }, [allH2H, searchQuery, sortBy, sortDir]);

  // Top 5 rivals for quick-select chips
  const topRivals = useMemo(() => {
    return allH2H.slice(0, 5);
  }, [allH2H]);

  const selectOpponent = (name: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (name) {
        next.set('opponent', name);
      } else {
        next.delete('opponent');
      }
      return next;
    });
  };

  const toggleSort = (field: 'played' | 'winRate' | 'name' | 'lastPlayed') => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Head to Head</h1>
          <p className="page-sub">
            Track your match records, set tallies, and rivalry trends against every opponent.
          </p>
        </div>
      </div>

      {/* Quick filters & rivals */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="field">
            <label htmlFor="h2h-search">Search opponent</label>
            <input
              id="h2h-search"
              type="search"
              placeholder="Filter by opponent name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="h2h-mode">Group Opponents</label>
            <select
              id="h2h-mode"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as 'individual' | 'pair');
                if (selectedOpponentName) {
                  // Keep or clear selected opponent depending on search
                }
              }}
            >
              <option value="individual">By Individual Player</option>
              <option value="pair">By Pair / Opponent Team</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="h2h-format">Match Format</label>
            <select
              id="h2h-format"
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as 'all' | GameFormat)}
            >
              <option value="all">All Formats</option>
              <option value="singles">Singles Only</option>
              <option value="doubles">Doubles Only</option>
            </select>
          </div>
        </div>

        {topRivals.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="muted small" style={{ fontWeight: 600 }}>
              Top Rivals:
            </span>
            {topRivals.map((r) => {
              const isSelected = selectedOpponentName.toLowerCase() === r.opponent.toLowerCase();
              return (
                <button
                  key={r.opponent}
                  type="button"
                  onClick={() => selectOpponent(isSelected ? '' : r.opponent)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    padding: '3px 10px',
                    fontSize: 12,
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                  }}
                >
                  {r.opponent} <span className="muted" style={{ marginLeft: 4 }}>({r.matches}m)</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Opponent Deep Dive */}
      {selectedOpponentName && selectedH2H && (
        <div className="card h2h-detail-card" style={{ marginBottom: 20, borderColor: 'var(--accent)' }}>
          <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 20, margin: 0 }}>
                  You vs <span style={{ color: 'var(--accent)' }}>{selectedH2H.opponent}</span>
                </h2>
                {selectedH2H.streak.count > 0 && (
                  <span className={`badge ${selectedH2H.streak.type === 'W' ? 'w' : 'l'}`}>
                    {selectedH2H.streak.type === 'W' ? `🔥 ${selectedH2H.streak.count}W Streak` : `${selectedH2H.streak.count}L Streak`}
                  </span>
                )}
              </div>
              <p className="muted small" style={{ margin: '4px 0 0' }}>
                {selectedH2H.matches} match{selectedH2H.matches === 1 ? '' : 'es'} played · Last played{' '}
                {selectedH2H.lastPlayed ? fmtDate(selectedH2H.lastPlayed) : 'N/A'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => selectOpponent('')}
              title="Close detailed view"
            >
              ✕ Clear selection
            </button>
          </div>

          {/* Win/Loss Split Bar */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                height: 10,
                borderRadius: 5,
                overflow: 'hidden',
                background: 'var(--surface-2)',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: `${selectedH2H.winRate * 100}%`,
                  background: 'var(--accent)',
                  transition: 'width 0.3s ease',
                }}
                title={`Wins: ${selectedH2H.wins}`}
              />
              <div
                style={{
                  width: `${(1 - selectedH2H.winRate) * 100}%`,
                  background: 'var(--danger)',
                  transition: 'width 0.3s ease',
                }}
                title={`Losses: ${selectedH2H.losses}`}
              />
            </div>
            <div className="row-between" style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {selectedH2H.wins} Won ({pct(selectedH2H.winRate)})
              </span>
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                {selectedH2H.losses} Lost ({pct(1 - selectedH2H.winRate)})
              </span>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="cards-grid" style={{ marginBottom: 16 }}>
            <div className="stat">
              <div className="label">Matches</div>
              <div className="value">
                <span className="win">{selectedH2H.wins}</span>
                <span className="muted" style={{ margin: '0 6px', fontSize: 20 }}>–</span>
                <span className="lose">{selectedH2H.losses}</span>
              </div>
              <div className="sub">{pct(selectedH2H.winRate)} win rate</div>
            </div>

            <div className="stat">
              <div className="label">Sets (W–L)</div>
              <div className="value">
                {selectedH2H.setsWon} – {selectedH2H.setsLost}
              </div>
              <div className="sub">
                {selectedH2H.setsWon + selectedH2H.setsLost > 0
                  ? pct(selectedH2H.setsWon / (selectedH2H.setsWon + selectedH2H.setsLost))
                  : '0%'}{' '}
                set win rate
              </div>
            </div>

            <div className="stat">
              <div className="label">Points (For–Against)</div>
              <div className="value">
                {selectedH2H.pointsFor} – {selectedH2H.pointsAgainst}
              </div>
              <div className="sub">
                {selectedH2H.pointDiff >= 0 ? `+${selectedH2H.pointDiff}` : selectedH2H.pointDiff} diff
              </div>
            </div>

            <div className="stat">
              <div className="label">Format Split</div>
              <div className="value" style={{ fontSize: 16, marginTop: 8 }}>
                Singles: {selectedH2H.singles.wins}–{selectedH2H.singles.losses}
              </div>
              <div className="sub" style={{ marginTop: 4 }}>
                Doubles: {selectedH2H.doubles.wins}–{selectedH2H.doubles.losses}
              </div>
            </div>
          </div>

          {/* Form dots */}
          {selectedH2H.recentForm.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span className="muted small" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Recent Form vs {selectedH2H.opponent} (latest matches):
              </span>
              <div className="form-dots">
                {selectedH2H.recentForm.map((res, i) => (
                  <span key={i} className={`dot ${res === 'W' ? 'w' : 'l'}`}>
                    {res}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Partners played with vs this opponent */}
          {selectedH2H.partners.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, margin: '0 0 10px', color: 'var(--text)' }}>
                Your doubles partners vs {selectedH2H.opponent}
              </h3>
              <div className="table-responsive">
                <table className="matches">
                  <thead>
                    <tr>
                      <th>Partner</th>
                      <th>Matches</th>
                      <th>W</th>
                      <th>L</th>
                      <th>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedH2H.partners.map((p) => (
                      <tr key={p.partner}>
                        <td><strong>{p.partner}</strong></td>
                        <td>{p.matches}</td>
                        <td>{p.wins}</td>
                        <td>{p.losses}</td>
                        <td style={{ color: wrColor(p.winRate), fontWeight: 600 }}>{pct(p.winRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full match history vs this opponent */}
          <div>
            <h3 style={{ fontSize: 14, margin: '0 0 10px', color: 'var(--text)' }}>
              Match History vs {selectedH2H.opponent} ({selectedH2H.matchesList.length})
            </h3>
            <MatchList matches={selectedH2H.matchesList} onDelete={remove} />
          </div>
        </div>
      )}

      {/* Opponents Leaderboard / Comparison Table */}
      <div className="card">
        <div className="row-between" style={{ marginBottom: 12 }}>
          <h2>
            {selectedH2H ? 'All Opponents Comparison' : 'Opponents Comparison'} (
            {displayedH2H.length})
          </h2>
          {searchQuery && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Reset search
            </button>
          )}
        </div>

        {displayedH2H.length === 0 ? (
          <div className="empty">
            <div className="big">🏸</div>
            <p>
              {allH2H.length === 0
                ? 'No matches recorded yet.'
                : 'No opponents match your current filters.'}
            </p>
            {allH2H.length === 0 && (
              <p style={{ marginTop: 14 }}>
                <Link to="/new" className="btn btn-primary">
                  Add your first match
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="matches">
              <thead>
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSort('name')}
                    title="Sort by name"
                  >
                    Opponent {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSort('played')}
                    title="Sort by matches played"
                  >
                    Played {sortBy === 'played' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>W – L</th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSort('winRate')}
                    title="Sort by win rate"
                  >
                    Win % {sortBy === 'winRate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Sets (W–L)</th>
                  <th>Pts (For–Ag)</th>
                  <th>Streak</th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleSort('lastPlayed')}
                    title="Sort by last played date"
                  >
                    Last Played {sortBy === 'lastPlayed' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {displayedH2H.map((item) => {
                  const isSelected = selectedOpponentName.toLowerCase() === item.opponent.toLowerCase();
                  return (
                    <tr
                      key={item.opponent}
                      onClick={() => selectOpponent(isSelected ? '' : item.opponent)}
                      style={{
                        background: isSelected ? 'var(--surface-2)' : undefined,
                      }}
                    >
                      <td>
                        <strong>{item.opponent}</strong>
                      </td>
                      <td>{item.matches}</td>
                      <td>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{item.wins}</span>
                        {' – '}
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{item.losses}</span>
                      </td>
                      <td style={{ color: wrColor(item.winRate), fontWeight: 600 }}>
                        {pct(item.winRate)}
                      </td>
                      <td>
                        {item.setsWon}–{item.setsLost}
                      </td>
                      <td>
                        {item.pointsFor}–{item.pointsAgainst}{' '}
                        <span className="muted small">
                          ({item.pointDiff >= 0 ? `+${item.pointDiff}` : item.pointDiff})
                        </span>
                      </td>
                      <td>
                        {item.streak.count > 0 ? (
                          <span className={`badge ${item.streak.type === 'W' ? 'w' : 'l'}`}>
                            {item.streak.type}{item.streak.count}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="muted">{item.lastPlayed ? fmtDate(item.lastPlayed) : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 8px', fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectOpponent(isSelected ? '' : item.opponent);
                          }}
                        >
                          {isSelected ? 'Viewing' : 'Compare'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

