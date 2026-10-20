import { useMemo } from 'react';
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
import { useMatches } from '../hooks/useMatches';
import SummaryCards from '../components/SummaryCards';
import MatchList from '../components/MatchList';
import { h2hStats, pointSeries, summarize } from '../lib/stats';

export default function Dashboard() {
  const navigate = useNavigate();
  const { matches, loading } = useMatches();
  const topRivals = useMemo(() => h2hStats(matches).slice(0, 5), [matches]);
  const s = summarize(matches);
  const series = pointSeries(matches);

  if (loading) return <p className="muted">Loading…</p>;

  if (matches.length === 0) {
    return (
      <>
        <h1 className="page-title">Dashboard</h1>
        <div className="card">
          <div className="empty">
            <div className="big">🏸</div>
            <p>No matches logged yet.</p>
            <p style={{ marginTop: 14 }}>
              <Link to="/new" className="btn btn-primary">
                Add your first match
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  const recent = matches.slice(0, 8);
  const form = s.form.slice(-10);

  return (
    <>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your badminton record at a glance.</p>
        </div>
        <Link to="/new" className="btn btn-primary">
          + Add match
        </Link>
      </div>

      <SummaryCards s={s} />

      <div className="card">
        <h2>
          Recent form <span className="muted small">(last {form.length})</span>
        </h2>
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
          <h2>Points per match</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
              <CartesianGrid stroke="#2a3342" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8d97a8', fontSize: 11 }}
                tickFormatter={(d: string) => {
                  try {
                    return format(parseISO(d), 'd/M');
                  } catch {
                    return d;
                  }
                }}
              />
              <YAxis tick={{ fill: '#8d97a8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1c2330', border: '1px solid #2a3342', borderRadius: 8 }}
                labelStyle={{ color: '#e7ecf3' }}
                labelFormatter={(label) => {
                  try {
                    return format(parseISO(String(label)), 'd MMM yyyy');
                  } catch {
                    return String(label);
                  }
                }}
                formatter={(value, name) => [String(value), name === 'me' ? 'My points' : 'Opponent']}
              />
              <Line type="monotone" dataKey="me" name="me" stroke="#3ecf8e" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="them" name="them" stroke="#e5484d" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {topRivals.length > 0 && (
        <div className="card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <h2>Top Rivals &amp; Head to Head</h2>
            <Link to="/h2h" className="small">
              All opponents →
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
                  <th aria-label="actions" />
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
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.wins}</span>
                      {' – '}
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{r.losses}</span>
                    </td>
                    <td
                      style={{
                        color: r.winRate >= 0.5 ? 'var(--accent)' : 'var(--danger)',
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
                      <span
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 8px', fontSize: 12 }}
                      >
                        H2H →
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
        <div className="row-between">
          <h2>Recent matches</h2>
          <Link to="/matches" className="small">
            View all →
          </Link>
        </div>
        <MatchList matches={recent} emptyText="No matches yet." />
      </div>
    </>
  );
}