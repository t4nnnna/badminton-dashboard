import { useNavigate } from 'react-router-dom';
import type { Match } from '../types';
import { matchWon } from '../lib/stats';
import { fmtDate, matchScore, opponentNames } from '../lib/format';

interface Props {
  matches: Match[];
  onDelete?: (id: string) => void;
  emptyText?: string;
}

export default function MatchList({ matches, onDelete, emptyText }: Props) {
  const navigate = useNavigate();

  if (matches.length === 0) {
    return <div className="empty">{emptyText ?? 'No matches here yet.'}</div>;
  }

  return (
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
            >
              <td>
                <span className={`badge ${won ? 'w' : 'l'}`}>{won ? 'W' : 'L'}</span>
              </td>
              <td className="muted">{fmtDate(m.date)}</td>
              <td>
                <strong>{opponentNames(m.opponents)}</strong>
              </td>
              <td className="muted">{m.format}{m.partner ? ` · w/ ${m.partner}` : ''}</td>
              <td>{matchScore(m)}</td>
              <td>
                {onDelete && (
                  <button
                    className="icon-btn"
                    title="Delete match"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete match vs ${opponentNames(m.opponents)} (${fmtDate(m.date)})?`)) onDelete(m.id);
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
  );
}