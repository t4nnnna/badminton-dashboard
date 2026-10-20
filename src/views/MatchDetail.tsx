import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { fmtDate, matchScore, opponentNames } from '../lib/format';
import { matchWon, pointsAgainst, pointsFor } from '../lib/stats';

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, loading, remove } = useMatches();
  const m = matches.find((x) => x.id === id);

  if (loading) return <p className="muted">Loading…</p>;
  if (!m) {
    return (
      <div className="empty">
        <div className="big">🤔</div>
        <p>Match not found.</p>
        <p>
          <Link to="/matches">Back to matches</Link>
        </p>
      </div>
    );
  }

  const won = matchWon(m);

  return (
    <>
      <p style={{ margin: '0 0 12px' }}>
        <Link to="/matches" className="small">
          ← All matches
        </Link>
      </p>

      <div className="card">
        <div className="detail-head">
          <div>
            <div className="detail-score">{matchScore(m)}</div>
            <div className="meta-line">
              <span>
                <strong>{opponentNames(m.opponents)}</strong>
              </span>
              <span>{fmtDate(m.date)}</span>
              <span>{m.format}</span>
              {m.partner && <span>with {m.partner}</span>}
              <span>
                {pointsFor(m)} pts for · {pointsAgainst(m)} against
              </span>
            </div>
          </div>
          <span className={`badge ${won ? 'w' : 'l'}`}>{won ? 'WIN' : 'LOSS'}</span>
        </div>

        <table className="sets-table">
          <thead>
            <tr>
              <th>Set</th>
              <th>You</th>
              <th>Opponent</th>
            </tr>
          </thead>
          <tbody>
            {m.sets.map((s, i) => (
              <tr key={i}>
                <td className="muted">Set {i + 1}</td>
                <td className={s.me > s.them ? 'win' : s.me < s.them ? 'loss' : ''}>{s.me}</td>
                <td className={s.them > s.me ? 'win' : s.them < s.me ? 'loss' : ''}>{s.them}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted small" style={{ marginTop: 8 }}>
          Set winner highlighted in green.
        </p>

        {m.notes && <div className="notes">{m.notes}</div>}

        <div className="actions">
          <Link className="btn" to={`/match/${m.id}/edit`}>
            Edit
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`Delete match vs ${opponentNames(m.opponents)}?`)) {
                void remove(m.id).then(() => navigate('/matches'));
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}