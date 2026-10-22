import { useRef, useState } from 'react';
import { Download, Upload, Trash2, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    setMsg({ ok: true, text: `Exported ${matches.length} matches successfully.` });
  }

  async function doImport(file: File) {
    try {
      const text = await file.text();
      const list = parseImport(text);
      await importAll(list);
      setMsg({ ok: true, text: `Imported ${list.length} matches (existing IDs updated).` });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Import failed.' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handleConfirmClear() {
    void clear();
    setShowClearModal(false);
    setMsg({ ok: true, text: 'All matches deleted successfully.' });
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings &amp; Data</h1>
        <p className="page-sub">
          Manage your match data storage, backup archives, and application data.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title-row">
            <Database size={17} className="card-header-icon" />
            <h2 className="card-title">Backup &amp; Restore</h2>
          </div>
          <p className="card-description">
            Your data is stored locally in IndexedDB. Export to back up or migrate between devices.
          </p>
        </div>
        <div className="card-content">
          <p className="muted small" style={{ margin: '0 0 16px' }}>
            Currently storing <strong>{matches.length}</strong> match records locally.
          </p>
          <div className="actions">
            <button className="btn btn-outline" onClick={doExport}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>
              <Upload size={14} />
              <span>Import JSON</span>
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
          {msg && (
            <div className={`msg-banner ${msg.ok ? 'msg-ok' : 'msg-err'}`}>
              {msg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{msg.text}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card danger-card">
        <div className="card-header">
          <h2 className="card-title text-destructive">Danger Zone</h2>
          <p className="card-description">
            Permanently clear all stored matches. This action is irreversible.
          </p>
        </div>
        <div className="card-content">
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn btn-danger" onClick={() => setShowClearModal(true)}>
              <Trash2 size={14} />
              <span>Delete All Matches</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        title="Delete all match data?"
        message="This will permanently delete all stored matches from your browser. Ensure you have exported a backup if you need this data."
        confirmLabel="Yes, delete everything"
        cancelLabel="Cancel"
        isDanger
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearModal(false)}
      />
    </>
  );
}
