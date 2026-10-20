import { useCallback, useEffect, useState } from 'react';
import type { Match } from '../types';
import * as db from '../lib/db';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setMatches(await db.listMatches());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (m: Match) => {
      await db.putMatch(m);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await db.removeMatch(id);
      await refresh();
    },
    [refresh],
  );

  /** Import a list; matches with existing ids are upserted. */
  const importAll = useCallback(
    async (list: Match[]) => {
      for (const m of list) await db.putMatch(m);
      await refresh();
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    await db.clearAll();
    await refresh();
  }, [refresh]);

  return { matches, loading, refresh, add, remove, importAll, clear };
}

export type MatchesStore = ReturnType<typeof useMatches>;