import { useMatches } from '../hooks/useMatches';
import { partnerStats } from '../lib/stats';

const pct = (n: number) => `${Math.round(n * 100)}%`;
const wrColor = (n: number) => (n >= 0.5 ? 'var(--accent)' : 'var(--danger)');

export default function Partners() {
  const { matches, loading } = useMatches();

  if (loading) return <p className="muted">Loading…</p>;

  const stats = partnerStats(matches);

  return (
    <>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Partner Performance</h1>
          <p className="page-sub">Your doubles record by partner, and by the opposing pair.</p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="big">🤝</div>
            <p>No doubles matches with a recorded partner yet.</p>
            <p className="small">Log a doubles match and add your partner to see stats here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>By partner</h2>
            <table className="matches">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>M</th>
                  <th>W</th>
                  <th>L</th>
                  <th>Win %</th>
                  <th>Sets (W–L)</th>
                  <th>Pts (For–Against)</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((p) => (
                  <tr key={p.partner}>
                    <td><strong>{p.partner}</strong></td>
                    <td>{p.matches}</td>
                    <td>{p.wins}</td>
                    <td>{p.losses}</td>
                    <td style={{ color: wrColor(p.winRate), fontWeight: 600 }}>{pct(p.winRate)}</td>
                    <td>{p.setsWon}–{p.setsLost}</td>
                    <td>{p.pointsFor}–{p.pointsAgainst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats.map((p) => (
            <div className="card" key={p.partner}>
              <h2>With {p.partner}</h2>
              <table className="matches">
                <thead>
                  <tr>
                    <th>vs Opponents</th>
                    <th>M</th>
                    <th>W</th>
                    <th>L</th>
                    <th>Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {p.opponents.map((o) => (
                    <tr key={o.opponent}>
                      <td><strong>{o.opponent}</strong></td>
                      <td>{o.matches}</td>
                      <td>{o.wins}</td>
                      <td>{o.losses}</td>
                      <td style={{ color: wrColor(o.winRate), fontWeight: 600 }}>{pct(o.winRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </>
  );
}