import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { GameFormat, Match } from '../types';
import { getMatch, listMatches, putMatch } from '../lib/db';
import { newId, todayISO } from '../lib/format';

interface SetDraft {
  me: string;
  them: string;
}

function MatchForm({ initial, onDone }: { initial?: Match; onDone: () => void }) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [format, setFormat] = useState<GameFormat>(initial?.format ?? 'singles');
  const [opponents, setOpponents] = useState<string[]>(() => {
    if (!initial) return [''];
    const base = (initial.opponents ?? []).map((o) => o ?? '').slice(0, 2);
    const want = initial.format === 'doubles' ? 2 : 1;
    while (base.length < want) base.push('');
    return base.slice(0, want);
  });
  const [partner, setPartner] = useState(initial?.partner ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [sets, setSets] = useState<SetDraft[]>(() => {
    const out: SetDraft[] = (initial?.sets ?? []).map((s) => ({ me: String(s.me), them: String(s.them) }));
    if (out.length === 0) out.push({ me: '', them: '' });
    return out;
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [nameLists, setNameLists] = useState<{ opponents: string[]; partners: string[] }>({
    opponents: [],
    partners: [],
  });

  useEffect(() => {
    let alive = true;
    void listMatches().then((all) => {
      if (!alive) return;
      const opp = new Set<string>();
      const par = new Set<string>();
      for (const x of all) {
        for (const o of x.opponents ?? []) if (o.trim()) opp.add(o.trim());
        const p = (x.partner ?? '').trim();
        if (p) par.add(p);
      }
      setNameLists({
        opponents: [...opp].sort((a, b) => a.localeCompare(b)),
        partners: [...par].sort((a, b) => a.localeCompare(b)),
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  const parsed = sets.map((s) => ({
    me: Number.parseInt(s.me, 10) || 0,
    them: Number.parseInt(s.them, 10) || 0,
  }));
  const wonSets = parsed.filter((s) => s.me > s.them).length;
  const lostSets = parsed.filter((s) => s.them > s.me).length;
  const outcome: 'win' | 'loss' | 'level' =
    wonSets > lostSets ? 'win' : wonSets < lostSets ? 'loss' : 'level';

  const handleFormatChange = (fmt: GameFormat) => {
    setFormat(fmt);
    setOpponents((prev) => {
      const base = prev.length ? prev : [''];
      if (fmt === 'doubles') {
        return base.length >= 2 ? base.slice(0, 2) : [...base, ''];
      }
      return base.slice(0, 1);
    });
  };

  const updateOpponent = (i: number, value: string) =>
    setOpponents((prev) => prev.map((o, j) => (j === i ? value : o)));

  const updateSet = (i: number, key: keyof SetDraft, value: string) =>
    setSets((prev) => prev.map((s, j) => (j === i ? { ...s, [key]: value } : s)));
  const addSet = () => setSets((p) => (p.length >= 3 ? p : [...p, { me: '', them: '' }]));
  const removeSet = (i: number) => setSets((p) => (p.length <= 1 ? p : p.filter((_, j) => j !== i)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const cleanOpponents = opponents.map((o) => o.trim()).filter(Boolean);
    if (cleanOpponents.length === 0) {
      setError('Please add at least one opponent name.');
      return;
    }

    if (
      sets.some(
        (s) =>
          s.me.trim() === '' ||
          s.them.trim() === '' ||
          Number.isNaN(Number.parseInt(s.me, 10)) ||
          Number.isNaN(Number.parseInt(s.them, 10)),
      )
    ) {
      setError('Please enter points for every set.');
      return;
    }

    for (let i = 0; i < parsed.length; i++) {
      if (parsed[i].me === parsed[i].them) {
        setError(
          `Set ${i + 1} cannot end in a tie (${parsed[i].me}–${parsed[i].them}). In badminton, sets must have a winner.`,
        );
        return;
      }
    }

    if (wonSets === lostSets) {
      setError('Match sets are level. Please add a deciding set or adjust scores to determine a match winner.');
      return;
    }

    setError(null);
    setSaving(true);
    const now = new Date().toISOString();
    const m: Match = {
      id: initial?.id ?? newId(),
      date,
      format,
      opponents: cleanOpponents.slice(0, format === 'doubles' ? 2 : 1),
      partner: format === 'doubles' ? partner.trim() : '',
      sets: parsed,
      notes: notes.trim(),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    await putMatch(m);
    onDone();
  }

  return (
    <form onSubmit={submit} className="card">
      <datalist id="dl-opponent">
        {nameLists.opponents.map((n) => <option key={n} value={n} />)}
      </datalist>
      <datalist id="dl-partner">
        {nameLists.partners.map((n) => <option key={n} value={n} />)}
      </datalist>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="format">Format</label>
          <select
            id="format"
            value={format}
            onChange={(e) => handleFormatChange(e.target.value as GameFormat)}
          >
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
          </select>
        </div>

        {format === 'doubles' && (
          <div className="field span-2">
            <label>Partner (your teammate)</label>
            <input
              type="text"
              list="dl-partner"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="Who are you playing with?"
              aria-label="Partner"
            />
          </div>
        )}

        <div className="field span-2">
          <label>{format === 'doubles' ? 'Opponents' : 'Opponent'}</label>
          {opponents.map((name, i) => (
            <input
              key={i}
              type="text"
              list="dl-opponent"
              value={name}
              onChange={(e) => updateOpponent(i, e.target.value)}
              aria-label={format === 'doubles' ? `Opponent ${i + 1}` : 'Opponent'}
              placeholder={
                format === 'doubles'
                  ? i === 0
                    ? 'Opponent 1 name'
                    : 'Opponent 2 name (optional)'
                  : 'Opponent name'
              }
            />
          ))}
          {format === 'doubles' && (
            <span className="muted small">
              You can add both of your opponents, or just one.
            </span>
          )}
        </div>

        <div className="field span-2 sets-editor">
          <label>Sets (best of 3)</label>
          {sets.map((s, i) => (
            <div className="set-row" key={i}>
              <span className="set-num">Set {i + 1}</span>
              <input
                type="number"
                min={0}
                max={30}
                value={s.me}
                onChange={(e) => updateSet(i, 'me', e.target.value)}
                aria-label={`Set ${i + 1} my points`}
                placeholder="my pts"
              />
              <input
                type="number"
                min={0}
                max={30}
                value={s.them}
                onChange={(e) => updateSet(i, 'them', e.target.value)}
                aria-label={`Set ${i + 1} opponent points`}
                placeholder="their pts"
              />
              {sets.length > 1 ? (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeSet(i)}
                  title="Remove set"
                  aria-label={`Remove set ${i + 1}`}
                >
                  ✕
                </button>
              ) : (
                <div style={{ width: 36 }} />
              )}
            </div>
          ))}
          {sets.length < 3 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={addSet}>
              + Add set
            </button>
          )}
        </div>

        <div className="field span-2">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="anything worth remembering"
          />
        </div>
      </div>

      <div className="actions row-between">
        <div className={`result-preview ${outcome}`}>
          {outcome === 'win' && `You win ${wonSets}-${lostSets} sets`}
          {outcome === 'loss' && `You lose ${wonSets}-${lostSets} sets`}
          {outcome === 'level' && 'Sets level — add or adjust a set'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add match'}
          </button>
        </div>
      </div>
      {error && <p className="msg err">{error}</p>}
    </form>
  );
}

export default function MatchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<Match | undefined>(undefined);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    let alive = true;
    void getMatch(id).then((m) => {
      if (alive) {
        setInitial(m);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <p className="muted">Loading…</p>;
  if (id && !initial) {
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

  return (
    <>
      <h1 className="page-title">{id ? 'Edit match' : 'Add match'}</h1>
      <p className="page-sub">{id ? 'Update the details or set scores.' : 'Log a new match.'}</p>
      <MatchForm initial={initial} onDone={() => navigate(id ? `/match/${id}` : '/matches')} />
    </>
  );
}