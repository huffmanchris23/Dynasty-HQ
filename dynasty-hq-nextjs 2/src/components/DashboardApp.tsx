'use client';

import { useEffect, useState } from 'react';
import type { DashboardData } from '@/lib/types';
import { TABS, PRESETS, gateInfo, tabLocked, subtabLockedIds, type TabDef } from '@/lib/gating';
import Badge from '@/components/shared/Badge';
import LockedCard from '@/components/shared/LockedCard';
import HistoryPlaceholder from '@/components/shared/HistoryPlaceholder';
import ColorPicker, { type ColorState } from '@/components/shared/ColorPicker';

import Home from '@/components/tabs/Home';
import { ScheduleTeam, ScheduleTop25 } from '@/components/tabs/Schedule';
import Rankings from '@/components/tabs/Rankings';
import Conference from '@/components/tabs/Conference';
import { PlayoffRankings, Bracket } from '@/components/tabs/Playoffs';
import { TeamStats, PlayerStats } from '@/components/tabs/Stats';
import { DepthCharts, Recruiting } from '@/components/tabs/Roster';
import Awards from '@/components/tabs/Awards';
import { MyCoach, HotSeats } from '@/components/tabs/CoachingCorner';

/* ============================== TAB BODY ROUTER ============================== */
/* Direct port of renderTabBody(). */

function TabBody({ data, tab, subtab, statType, onStatTypeChange }: {
  data: DashboardData;
  tab: string;
  subtab: string | null;
  statType: string;
  onStatTypeChange: (id: string) => void;
}) {
  const g = gateInfo(data);
  switch (tab) {
    case 'home':
      return <Home d={data} />;
    case 'schedule':
      return subtab === 'top25' ? <ScheduleTop25 d={data} /> : <ScheduleTeam d={data} />;
    case 'rankings':
      return <Rankings d={data} subtab={subtab} />;
    case 'conference':
      return <Conference d={data} />;
    case 'playoffs':
      if (!g.playoffsUnlocked) return <LockedCard untilWeek={10} />;
      return subtab === 'bracket' ? <Bracket d={data} /> : <PlayoffRankings d={data} />;
    case 'stats':
      if (!g.statsUnlocked) return <LockedCard untilWeek={1} />;
      return subtab === 'player' ? <PlayerStats d={data} statType={statType} onStatTypeChange={onStatTypeChange} /> : <TeamStats d={data} />;
    case 'roster':
      if (g.isLocked) return <LockedCard untilWeek={0} />;
      return subtab === 'recruiting' ? <Recruiting d={data} /> : <DepthCharts d={data} />;
    case 'awards':
      if ((subtab === 'coordinator' || subtab === 'coach') && !g.awardsAdvUnlocked) return <LockedCard untilWeek={12} />;
      return <Awards d={data} subtab={subtab} />;
    case 'coachingcorner':
      if (subtab === 'hotseat') return g.statsUnlocked ? <HotSeats d={data} /> : <LockedCard untilWeek={1} />;
      return <MyCoach d={data} />;
    default:
      return null;
  }
}

/* ============================== SUBTAB BAR ============================== */
/* Port of renderSubtabBar(). */

function SubtabBar({ subtabs, active, lockedIds, onSelect }: { subtabs: { id: string; label: string }[]; active: string | null; lockedIds: string[]; onSelect: (id: string) => void }) {
  return (
    <div className="subtab-bar">
      {subtabs.map((s) => (
        <button key={s.id} className={`subtab-btn ${active === s.id ? 'active' : ''}`} onClick={() => onSelect(s.id)}>
          {s.label}
          {lockedIds.indexOf(s.id) > -1 ? ' 🔒' : ''}
        </button>
      ))}
    </div>
  );
}

/* ============================== APP SHELL ============================== */
/* Port of render()/selectTab()/selectSubtab()/selectStatType()/onSeasonChange(). */

export default function DashboardApp({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState('home');
  const [subtab, setSubtab] = useState<string | null>(null);
  const [statType, setStatType] = useState('passing');
  const [season, setSeason] = useState<'s1' | 'history'>('s1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colors, setColors] = useState<ColorState>(() =>
    data.team
      ? { name: 'Team Colors', primary: data.team.PRIMARY_COLOR || PRESETS[0].primary, secondary: data.team.SECONDARY_COLOR || PRESETS[0].secondary }
      : PRESETS[0]
  );

  // root.style.setProperty('--primary'/'--accent', ...) from render()
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--accent', colors.secondary);
  }, [colors]);

  function selectTab(id: string) {
    setTab(id);
    const def = TABS.find((t) => t.id === id);
    setSubtab(def && def.subtabs ? def.subtabs[0].id : null);
  }

  const team = data.team || ({} as NonNullable<DashboardData['team']>);
  const rec = data.record || ({} as DashboardData['record']);
  const recordStr = `${rec.wins || 0}-${rec.losses || 0}`;
  const apRank = rec.apRank ? `#${rec.apRank} AP` : 'NR';
  const currentTabDef = TABS.find((t) => t.id === tab) as TabDef | undefined;
  const g = gateInfo(data);

  return (
    <>
      <div className="wrap">
        <div className="header-band">
          <div className="header-inner">
            <div className="header-top">
              <div className="header-tag">Dynasty HQ — {data.settings.currentDataSheet || ''}</div>
              <button className="palette-btn" onClick={() => setShowColorPicker(true)}>
                🎨
              </button>
            </div>
            <div className="header-row">
              <div className="header-team">
                <Badge text={team.TEAM_NAME || '??'} size={32} mine />
                <h1>{team.TEAM_NAME || 'Loading'}</h1>
              </div>
              <div className="header-record">
                <div className="rec">{recordStr}</div>
                <div className="rk">{apRank}</div>
              </div>
            </div>
          </div>
          <div className="tabstrip-outer">
            <div className="tabstrip">
              {TABS.map((t) => (
                <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => selectTab(t.id)}>
                  {t.label}
                  {tabLocked(t, g) ? ' 🔒' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <main>
          {season === 'history' ? (
            <HistoryPlaceholder />
          ) : (
            <>
              {currentTabDef && currentTabDef.subtabs ? (
                <SubtabBar subtabs={currentTabDef.subtabs} active={subtab} lockedIds={subtabLockedIds(currentTabDef.id, g)} onSelect={setSubtab} />
              ) : null}
              <div className="stack">
                <TabBody data={data} tab={tab} subtab={subtab} statType={statType} onStatTypeChange={setStatType} />
              </div>
            </>
          )}
        </main>

        <div className="season-bar">
          <span className="lbl">Viewing</span>
          <select className="season-select" value={season} onChange={(e) => setSeason(e.target.value as 's1' | 'history')}>
            <option value="s1">Season 1 — Current</option>
            <option value="history">History</option>
          </select>
        </div>
      </div>

      {showColorPicker ? <ColorPicker data={data} colors={colors} onClose={() => setShowColorPicker(false)} onChange={setColors} /> : null}
    </>
  );
}
