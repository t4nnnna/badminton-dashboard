import { Link } from 'react-router-dom';
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
import { pointSeries, summarize } from '../lib/stats';

export default function Dashboard() {
  const { matches, loading } = useMatches();
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
                tickFormatter={(d: string) => format(parseISO(d), 'd/M')}
              />
              <YAxis tick={{ fill: '#8d97a8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1c2330', border: '1px solid #2a3342', borderRadius: 8 }}
                labelStyle={{ color: '#e7ecf3' }}
                labelFormatter={(label) => format(parseISO(String(label)), 'd MMM yyyy')}
                formatter={(value, name) => [String(value), name === 'me' ? 'My points' : 'Opponent']}
              />
              <Line type="monotone" dataKey="me" name="me" stroke="#3ecf8e" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="them" name="them" stroke="#e5484d" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
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