import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, ArrowRight, TrendingUp, Swords, History as HistoryIcon } from 'lucide-react';
import { useMatches } from '../hooks/useMatches';
import SummaryCards from '../components/SummaryCards';
import MatchList from '../components/MatchList';
import { h2hStats, pointSeries, summarize } from '../lib/stats';
import type { GameFormat } from '../types';

type FilterMode = 'all' | GameFormat;

const FORMAT_LABELS: { mode: FilterMode; label: string }[] = [
  { mode: 'all', label: 'All' },
  { mode: 'singles', label: 'Singles' },
  { mode: 'doubles', label: 'Doubles' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { matches, loading } = useMatches();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredMatches = useMemo(
    () =>
      filterMode === 'all'
        ? matches
        : matches.filter((m) => m.format === filterMode),
    [matches, filterMode],
  );

  const topRivals = useMemo(() => h2hStats(filteredMatches).slice(0, 5), [filteredMatches]);
  const s = useMemo(() => summarize(filteredMatches), [filteredMatches]);
  const series = useMemo(() => pointSeries(filteredMatches), [filteredMatches]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="muted small">Loading dashboard...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your badminton record at a glance.</p>
        </div>
        <div className="card">
          <div className="empty">
            <div className="big">🏸</div>
            <p>No matches logged yet.</p>
            <p style={{ marginTop: 14 }}>
              <Link to="/new" className="btn btn-primary">
                <Plus size={15} />
                <span>Add your first match</span>
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  const recent = filteredMatches.slice(0, 8);
  const form = s.form.slice(-10);

  return (
    <>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your badminton record at a glance.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="format-toggle" role="group" aria-label="Filter by format">
            {FORMAT_LABELS.map(({ mode, label }) => (
              <button
                key={mode}
                className={`format-toggle-btn${filterMode === mode ? ' active' : ''}`}
                onClick={() => setFilterMode(mode)}
                aria-pressed={filterMode === mode}
              >
                {label}
              </button>
            ))}
          </div>
          <Link to="/new" className="btn btn-primary">
            <Plus size={15} />
            <span>Add match</span>
          </Link>
        </div>
      </div>

      <SummaryCards s={s} />

      {filteredMatches.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="big">🏸</div>
            <p>No {filterMode} matches logged yet.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                Recent Form <span className="muted small font-normal">(last {form.length} matches)</span>
              </h2>
            </div>
            <div className="form-dots">
              {form.map((r, i) => (
                <span key={i} className={`dot ${r === 'W' ? 'w' : 'l'}`}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          {series.length >= 2 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-row">
                  <TrendingUp size={16} className="card-header-icon" />
                  <h2 className="card-title">Points Per Match</h2>
                </div>
                <p className="card-description">Progression of your points vs opponents across matches</p>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#52525b"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    tickFormatter={(d: string) => {
                      try {
                        return format(parseISO(d), 'd/M');
                      } catch {
                        return d;
                      }
                    }}
                  />
                  <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#fafafa', fontWeight: 600, marginBottom: 4 }}
                    itemStyle={{ fontSize: 13 }}
                    labelFormatter={(label) => {
                      try {
                        return format(parseISO(String(label)), 'd MMM yyyy');
                      } catch {
                        return String(label);
                      }
                    }}
                    formatter={(value, name) => [String(value), name === 'me' ? 'My points' : 'Opponent']}
                  />
                  <Line
                    type="monotone"
                    dataKey="me"
                    name="me"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="them"
                    name="them"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {topRivals.length > 0 && (
            <div className="card">
              <div className="card-header row-between" style={{ marginBottom: 12 }}>
                <div className="card-title-row">
                  <Swords size={16} className="card-header-icon" />
                  <h2 className="card-title">Top Rivals &amp; Head-to-Head</h2>
                </div>
                <Link to="/h2h" className="link-subtle">
                  <span>All opponents</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
              <div className="table-responsive">
                <table className="matches">
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th>Played</th>
                      <th>Record (W–L)</th>
                      <th>Win %</th>
                      <th>Streak</th>
                      <th aria-label="actions" style={{ width: 80 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {topRivals.map((r) => (
                      <tr
                        key={r.opponent}
                        onClick={() => navigate(`/h2h?opponent=${encodeURIComponent(r.opponent)}`)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/h2h?opponent=${encodeURIComponent(r.opponent)}`);
                          }
                        }}
                      >
                        <td>
                          <strong>{r.opponent}</strong>
                        </td>
                        <td>{r.matches}</td>
                        <td>
                          <span style={{ color: '#34d399', fontWeight: 600 }}>{r.wins}</span>
                          {' – '}
                          <span style={{ color: '#f87171', fontWeight: 600 }}>{r.losses}</span>
                        </td>
                        <td
                          style={{
                            color: r.winRate >= 0.5 ? '#34d399' : '#f87171',
                            fontWeight: 600,
                          }}
                        >
                          {Math.round(r.winRate * 100)}%
                        </td>
                        <td>
                          {r.streak.count > 0 ? (
                            <span className={`badge ${r.streak.type === 'W' ? 'w' : 'l'}`}>
                              {r.streak.type}{r.streak.count}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span className="btn btn-ghost btn-sm">
                            <span>H2H</span>
                            <ArrowRight size={12} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header row-between" style={{ marginBottom: 12 }}>
              <div className="card-title-row">
                <HistoryIcon size={16} className="card-header-icon" />
                <h2 className="card-title">Recent Matches</h2>
              </div>
              <Link to="/matches" className="link-subtle">
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <MatchList matches={recent} emptyText="No matches yet." />
          </div>
        </>
      )}
    </>
  );
}
