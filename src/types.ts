export type GameFormat = 'singles' | 'doubles';

export interface SetScore {
  me: number;
  them: number;
}

export interface Match {
  id: string;
  /** ISO calendar date: yyyy-mm-dd */
  date: string;
  format: GameFormat;
  /** 1 name for singles, up to 2 for doubles */
  opponents: string[];
  /** your partner's name (doubles only, '' for singles) */
  partner: string;
  /** 1–3 sets, in order played */
  sets: SetScore[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}