import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Match } from '../types';
import { matchWon } from '../lib/stats';
import { fmtDate, matchScore, opponentNames } from '../lib/format';
import ConfirmModal from './ConfirmModal';

interface Props {
  matches: Match[];
  onDelete?: (id: string) => void;
  emptyText?: string;
}

export default function MatchList({ matches, onDelete, emptyText }: Props) {
  const navigate = useNavigate();
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  if (matches.length === 0) {
    return <div className="empty">{emptyText ?? 'No matches here yet.'}</div>;
  }

  return (
    <>
      <div className="table-responsive">
        <table className="matches">
          <thead>
            <tr>
              <th>Res</th>
              <th>Date</th>
              <th>Opponent(s)</th>
              <th>Format</th>
              <th>Score</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => {
              const won = matchWon(m);
              return (
                <tr
                  key={m.id}
                  className={won ? 'row-win' : 'row-loss'}
                  onClick={() => navigate(`/match/${m.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/match/${m.id}`);
                    }
                  }}
                >
                  <td>
                    <span className={`badge ${won ? 'w' : 'l'}`}>{won ? 'W' : 'L'}</span>
                  </td>
                  <td className="muted">{fmtDate(m.date)}</td>
                  <td>
                    <strong>{opponentNames(m.opponents)}</strong>
                  </td>
                  <td className="muted">
                    {m.format}
                    {m.format === 'doubles' && m.partner ? ` · w/ ${m.partner}` : ''}
                  </td>
                  <td>{matchScore(m)}</td>
                  <td>
                    {onDelete && (
                      <button
                        type="button"
                        className="icon-btn"
                        title="Delete match"
                        aria-label="Delete match"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMatchToDelete(m);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={Boolean(matchToDelete)}
        title="Delete match"
        message={
          matchToDelete
            ? `Are you sure you want to delete the match vs ${opponentNames(matchToDelete.opponents)} on ${fmtDate(matchToDelete.date)}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isDanger
        onConfirm={() => {
          if (matchToDelete && onDelete) {
            onDelete(matchToDelete.id);
            setMatchToDelete(null);
          }
        }}
        onCancel={() => setMatchToDelete(null)}
      />
    </>
  );
}