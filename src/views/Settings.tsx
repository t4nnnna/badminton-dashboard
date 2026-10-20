import { useRef, useState } from 'react';
import { useMatches } from '../hooks/useMatches';
import { exportJSON, parseImport } from '../lib/db';
import { todayISO } from '../lib/format';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const { matches, importAll, clear } = useMatches();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  function doExport() {
    const blob = new Blob([exportJSON(matches)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badminton-matches-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: `Exported ${matches.length} matches.` });
  }

  async function doImport(file: File) {
    try {
      const text = await file.text();
      const list = parseImport(text);
      await importAll(list);
      setMsg({ ok: true, text: `Imported ${list.length} matches (existing ids updated).` });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Import failed.' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handleConfirmClear() {
    void clear();
    setShowClearModal(false);
    setMsg({ ok: true, text: 'All matches deleted.' });
  }

  return (
    <>
      <h1 className="page-title">Settings &amp; data</h1>
      <p className="page-sub">
        Your data lives in this browser (IndexedDB). Use export to back up or move it to another
        device.
      </p>

      <div className="card">
        <h2>Backup &amp; restore</h2>
        <p className="muted small" style={{ marginTop: 0 }}>
          Currently storing <strong>{matches.length}</strong> matches.
        </p>
        <div className="actions">
          <button className="btn" onClick={doExport}>
            ⬇ Export JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆ Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
            }}
          />
        </div>
        {msg && <p className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</p>}
      </div>

      <div className="card">
        <h2>Danger zone</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <button className="btn btn-danger" onClick={() => setShowClearModal(true)}>
            Delete all matches
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        title="Delete all matches?"
        message="This will permanently delete all match history from this browser. This action cannot be undone. Please ensure you have exported a JSON backup first if you want to keep your data."
        confirmLabel="Yes, delete everything"
        isDanger
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearModal(false)}
      />
    </>
  );
}