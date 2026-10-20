import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { fmtDate, matchScore, opponentNames } from '../lib/format';
import { matchWon, pointsAgainst, pointsFor } from '../lib/stats';
import ConfirmModal from '../components/ConfirmModal';

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, loading, remove } = useMatches();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
              <span style={{ textTransform: 'capitalize' }}>{m.format}</span>
              {m.format === 'doubles' && m.partner && <span>with {m.partner}</span>}
              <span>
                {pointsFor(m)} pts for · {pointsAgainst(m)} against
              </span>
            </div>
          </div>
          <span className={`badge ${won ? 'w' : 'l'}`}>{won ? 'WIN' : 'LOSS'}</span>
        </div>

        <div className="table-responsive">
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
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>
          Set winner highlighted in green.
        </p>

        {m.notes && <div className="notes">{m.notes}</div>}

        <div className="actions">
          <Link className="btn" to={`/match/${m.id}/edit`}>
            Edit
          </Link>
          {m.opponents
            .filter((o) => Boolean(o && o.trim()))
            .map((opp) => (
              <Link
                key={opp}
                className="btn btn-ghost"
                to={`/h2h?opponent=${encodeURIComponent(opp.trim())}`}
              >
                H2H vs {opp.trim()}
              </Link>
            ))}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete match"
        message={`Are you sure you want to delete this match vs ${opponentNames(m.opponents)} (${fmtDate(m.date)})? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        onConfirm={() => {
          void remove(m.id).then(() => navigate('/matches'));
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}