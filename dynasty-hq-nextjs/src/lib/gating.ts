/**
 * ============================== GATING ==============================
 * Direct port of gateInfo()/tabLocked()/subtabLockedIds() from
 * JavaScript.html. Fail-safe behavior preserved verbatim: if
 * settings.currentWeek isn't present, gating is skipped entirely
 * (treated as week 999 → everything unlocked).
 */

import type { DashboardData } from './types';

export interface GateInfo {
  week: number;
  isLocked: boolean;
  statsUnlocked: boolean;
  playoffsUnlocked: boolean;
  awardsAdvUnlocked: boolean;
}

export interface TabDef {
  id: string;
  label: string;
  subtabs?: { id: string; label: string }[];
}

export const TABS: TabDef[] = [
  { id: 'home', label: 'Home' },
  { id: 'schedule', label: 'Schedule', subtabs: [{ id: 'team', label: 'Team' }, { id: 'top25', label: 'Top 25' }] },
  { id: 'rankings', label: 'Rankings', subtabs: [{ id: 'ap', label: 'AP' }, { id: 'coaches', label: 'Coaches' }] },
  { id: 'conference', label: 'Conference' },
  { id: 'playoffs', label: 'Playoffs', subtabs: [{ id: 'top25', label: 'Top 25' }, { id: 'bracket', label: 'Bracket' }] },
  { id: 'stats', label: 'Stats', subtabs: [{ id: 'team', label: 'Team' }, { id: 'player', label: 'Player' }] },
  { id: 'roster', label: 'Roster', subtabs: [{ id: 'depth', label: 'Depth Charts' }, { id: 'recruiting', label: 'Recruiting' }] },
  { id: 'awards', label: 'Awards', subtabs: [{ id: 'heisman', label: 'Heisman' }, { id: 'coordinator', label: 'Coordinator' }, { id: 'coach', label: 'Coach' }] },
  { id: 'coachingcorner', label: 'Coaching Corner', subtabs: [{ id: 'mycoach', label: 'My Coach' }, { id: 'hotseat', label: 'Hot Seats' }] },
];

export const PRESETS = [
  { name: 'Crimson & Gray', primary: '#7A2426', secondary: '#C9962E' },
  { name: 'Navy & Gold', primary: '#12233F', secondary: '#D9B34F' },
  { name: 'Forest & White', primary: '#0F2318', secondary: '#E3E3E3' },
  { name: 'Scarlet & Black', primary: '#8C1D22', secondary: '#E3E3E3' },
  { name: 'Royal & Orange', primary: '#152D63', secondary: '#D9852E' },
  { name: 'Purple & Gold', primary: '#3A2560', secondary: '#D9B34F' },
];

export function gateInfo(data: DashboardData | null): GateInfo {
  const s = (data && data.settings) || {};
  const hasWeekData = s.currentWeek !== undefined && s.currentWeek !== null && s.currentWeek !== '';
  const week = hasWeekData ? Number(s.currentWeek) || 0 : 999;
  const haveGame = String(s.haveGameThisWeek || '').toUpperCase() === 'YES';
  return {
    week,
    isLocked: hasWeekData ? week === 0 && !haveGame : false,
    statsUnlocked: hasWeekData ? week >= 1 : true,
    playoffsUnlocked: hasWeekData ? week >= 10 : true,
    awardsAdvUnlocked: hasWeekData ? week >= 12 : true,
  };
}

export function tabLocked(t: TabDef, g: GateInfo): boolean {
  if (t.id === 'playoffs') return !g.playoffsUnlocked;
  if (t.id === 'stats') return !g.statsUnlocked;
  if (t.id === 'roster') return g.isLocked;
  return false;
}

export function subtabLockedIds(tabId: string, g: GateInfo): string[] {
  if (tabId === 'coachingcorner') return g.statsUnlocked ? [] : ['hotseat'];
  if (tabId === 'awards') return g.awardsAdvUnlocked ? [] : ['coordinator', 'coach'];
  return [];
}
