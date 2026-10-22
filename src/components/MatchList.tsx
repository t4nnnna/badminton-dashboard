import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, Users } from 'lucide-react';
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
              <th style={{ width: 64 }}>Result</th>
              <th style={{ width: 110 }}>Date</th>
              <th>Opponent(s)</th>
              <th>Format</th>
              <th>Score</th>
              {onDelete && <th aria-label="actions" style={{ width: 44 }} />}
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
                    <span className={`badge ${won ? 'w' : 'l'}`}>{won ? 'WIN' : 'LOSS'}</span>
                  </td>
                  <td className="muted">{fmtDate(m.date)}</td>
                  <td>
                    <strong className="opponent-name">{opponentNames(m.opponents)}</strong>
                  </td>
                  <td>
                    <span className="format-cell">
                      {m.format === 'doubles' ? (
                        <Users size={13} className="format-icon" />
                      ) : (
                        <User size={13} className="format-icon" />
                      )}
                      <span>
                        {m.format}
                        {m.format === 'doubles' && m.partner ? ` · w/ ${m.partner}` : ''}
                      </span>
                    </span>
                  </td>
                  <td className="score-cell">{matchScore(m)}</td>
                  {onDelete && (
                    <td>
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
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={Boolean(matchToDelete)}
        title="Delete match"
        message={`Are you sure you want to delete the match vs ${
          matchToDelete ? opponentNames(matchToDelete.opponents) : ''
        }? This cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        onConfirm={() => {
          if (matchToDelete && onDelete) {
            onDelete(matchToDelete.id);
          }
          setMatchToDelete(null);
        }}
        onCancel={() => setMatchToDelete(null)}
      />
    </>
  );
}
