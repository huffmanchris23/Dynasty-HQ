/**
 * ============================== RANKING MOVEMENT (auto-diff) ==============================
 * Direct port of Code.gs's computeMovement_/applyMovement_/resetRankingSnapshots.
 *
 * NOT CALLED from getDashboardData() in the original — dead code left over
 * from an earlier iteration (the current Rankings tab has no movement
 * column). Ported as-is for parity; not wired into dashboard.ts, exactly
 * like the source.
 *
 * One implementation note: PropertiesService.getScriptProperties() has no
 * direct equivalent in a stateless Vercel function. This uses an in-memory
 * Map, which behaves like PropertiesService within a single warm instance
 * but does NOT persist across cold starts/deploys. If this code path is
 * ever wired back in, swap propsStore for a real key/value store (Vercel KV,
 * Upstash Redis, etc.) — the function signatures below wouldn't need to change.
 */

import type { PollEntry } from './types';

const propsStore = new Map<string, string>();

function props() {
  return {
    getProperty: (k: string) => propsStore.get(k) ?? null,
    setProperty: (k: string, v: string) => propsStore.set(k, v),
    deleteProperty: (k: string) => propsStore.delete(k),
  };
}

function loadSnapshotSet(kind: string) {
  const p = props();
  return {
    lastSeenWeek: p.getProperty(kind + '_LAST_SEEN_WEEK'),
    current: JSON.parse(p.getProperty(kind + '_CURRENT') || '{}'),
    previous: JSON.parse(p.getProperty(kind + '_PREVIOUS') || '{}'),
  };
}

function saveSnapshotSet(kind: string, lastSeenWeek: any, current: Record<string, number>, previous: Record<string, number>) {
  const p = props();
  p.setProperty(kind + '_LAST_SEEN_WEEK', String(lastSeenWeek || ''));
  p.setProperty(kind + '_CURRENT', JSON.stringify(current));
  p.setProperty(kind + '_PREVIOUS', JSON.stringify(previous));
}

/**
 * Computes movement for a list of {team, rank} entries and rotates the snapshot
 * forward if the current week label is new. Returns a map: team -> {dir, num}.
 * dir is 'UP' | 'DOWN' | 'SAME' | null (null = team has no prior-week baseline, e.g. just entered the poll).
 */
export function computeMovement(kind: string, currentWeekLabel: any, entries: { team: any; rank: number }[]) {
  const snap = loadSnapshotSet(kind);
  const liveMap: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.team) liveMap[String(e.team).toUpperCase()] = e.rank;
  });

  let basis = snap.previous;
  if (snap.lastSeenWeek !== currentWeekLabel) {
    // Week has advanced (or this is the very first run) — the OLD "current" snapshot
    // becomes the new diff basis, and we freeze this week's live poll as the new "current".
    basis = snap.lastSeenWeek ? snap.current : {}; // nothing to compare against on first-ever run
    saveSnapshotSet(kind, currentWeekLabel, liveMap, basis);
  }

  const moves: Record<string, { dir: 'UP' | 'DOWN' | 'SAME' | null; num: number | null; entered: boolean }> = {};
  entries.forEach((e) => {
    if (!e.team) return;
    const key = String(e.team).toUpperCase();
    const prior = basis[key];
    if (prior === undefined) {
      moves[key] = { dir: null, num: null, entered: true };
      return;
    }
    const delta = prior - e.rank; // positive = moved up (lower rank number is better)
    moves[key] = { dir: delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'SAME', num: Math.abs(delta), entered: false };
  });
  return moves;
}

export function applyMovement(entries: PollEntry[], moves: Record<string, { dir: any; num: any; entered: boolean }>): PollEntry[] {
  return entries.map((e) => {
    const m = e.team ? moves[String(e.team).toUpperCase()] : null;
    return Object.assign({}, e, {
      changeDir: m ? m.dir : null,
      changeNum: m ? m.num : null,
      enteredPoll: m ? !!m.entered : false,
    });
  });
}

/** Lets you manually clear the stored baseline (e.g. if a week was re-entered/corrected). */
export function resetRankingSnapshots(): string {
  ['RANK_AP', 'RANK_COACHES', 'PLAYOFF_SEEDS'].forEach((kind) => {
    props().deleteProperty(kind + '_LAST_SEEN_WEEK');
    props().deleteProperty(kind + '_CURRENT');
    props().deleteProperty(kind + '_PREVIOUS');
  });
  return 'Ranking snapshots cleared — movement will re-baseline from the next load.';
}
