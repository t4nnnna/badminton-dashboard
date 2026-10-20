import type { Summary } from '../lib/stats';

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function SummaryCards({ s }: { s: Summary }) {
  const streakText = s.total
    ? `${s.streak.n} ${
        s.streak.type === 'W'
          ? s.streak.n === 1
            ? 'win'
            : 'wins'
          : s.streak.n === 1
            ? 'loss'
            : 'losses'
      }`
    : '—';

  return (
    <div className="cards-grid">
      <div className="stat">
        <div className="label">Matches</div>
        <div className="value">{s.total}</div>
        <div className="sub">{s.thisMonth} this month</div>
      </div>
      <div className="stat">
        <div className="label">Win rate</div>
        <div className="value">{pct(s.winRate)}</div>
        <div className="sub">
          {s.wins}W – {s.losses}L
        </div>
      </div>
      <div className="stat">
        <div className="label">Current streak</div>
        <div className={`value ${s.total ? (s.streak.type === 'W' ? 'win' : 'lose') : ''}`}>
          {streakText}
        </div>
        <div className="sub">consecutive</div>
      </div>
      <div className="stat">
        <div className="label">Points / set (avg)</div>
        <div className="value">{s.avgPointsPerSet.toFixed(1)}</div>
        <div className="sub">
          {s.pointsFor} for · {s.pointsAgainst} against
        </div>
      </div>
    </div>
  );
}