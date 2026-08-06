/**
 * ============================== STORY BRIEF ==============================
 * Direct port of buildStoryBrief_ from Code.gs. Kept verbatim, including the
 * 'OPPONENT' / 'OPPONENT ' (trailing-space) key fallback, which exists
 * because the Last_Week_Recap sheet's own header has a trailing space.
 */

import { safeNum } from './parsers';
import type { DashboardData, StoryBriefItem } from './types';

function buildStoryBrief(d: Partial<DashboardData>, myTeamName: any): StoryBriefItem[] {
  const items: StoryBriefItem[] = [];
  const norm = (s: any) => String(s || '').toUpperCase();

  // Rankings: entered/exited Top 25, 5+ spot jump, movement within Top 10
  (['ap', 'coaches'] as const).forEach((pollKey) => {
    const list = (d.rank && d.rank[pollKey]) || [];
    const mine = list.find((r) => norm(r.team) === norm(myTeamName));
    const pollLabel = pollKey === 'ap' ? 'AP Poll' : 'Coaches Poll';
    if (mine) {
      if (mine.enteredPoll) {
        items.push({ tag: 'Notable', text: `${myTeamName} entered the ${pollLabel} at #${mine.rank}.` });
      } else if ((mine.changeNum ?? 0) >= 5) {
        items.push({
          tag: 'Notable',
          text: `${myTeamName} ${mine.changeDir === 'UP' ? 'jumped' : 'dropped'} ${mine.changeNum} spots in the ${pollLabel} to #${mine.rank}.`,
        });
      } else if (mine.rank <= 10 && mine.changeNum) {
        items.push({
          tag: 'Top 10',
          text: `${myTeamName} moved ${mine.changeDir === 'UP' ? 'up' : 'down'} ${mine.changeNum} within the Top 10 (${pollLabel}), now #${mine.rank}.`,
        });
      }
    }
  });

  // Close games: my team, 1-score or OT, from Last_Week_Recap
  const my = d.recap && d.recap.myBox;
  if (my && my.FINAL_SCORE !== undefined) {
    const oppBox = d.recap && d.recap.oppBox;
    const oppKey = oppBox && Object.keys(oppBox).length ? oppBox : null;
    if (oppKey && oppKey.FINAL_SCORE !== undefined) {
      const margin = Math.abs(safeNum(my.FINAL_SCORE) - safeNum(oppKey.FINAL_SCORE));
      if (margin <= 8) {
        const oppName = my['OPPONENT'] || my['OPPONENT '] || '';
        items.push({
          tag: 'Close Game',
          text: `${myTeamName} ${safeNum(my.FINAL_SCORE) > safeNum(oppKey.FINAL_SCORE) ? 'beat' : 'lost to'} ${oppName} ${my.FINAL_SCORE}-${oppKey.FINAL_SCORE}.`,
        });
      }
    }
  }

  // Heisman: only when a player newly enters the Top 5 — Phase 1 can only flag current Top 5 presence
  const heisman = (d.awards && d.awards.heisman) || [];
  const myHeisman = heisman.find((h) => norm(h.team) === norm(myTeamName) && h.rank <= 5);
  if (myHeisman) items.push({ tag: 'Heisman', text: `${myHeisman.name} (${myTeamName}) is #${myHeisman.rank} in the Heisman race.` });

  // Hot seat: only flag if below 35% security
  const hotSeats = (d.coach && d.coach.hotSeats) || [];
  const myHotSeat = hotSeats.find((h) => norm(h.team) === norm(myTeamName));
  if (myHotSeat && Number(myHotSeat.security) < 35) {
    items.push({ tag: 'Hot Seat', text: `${myHotSeat.coach} is on the hot seat at ${myTeamName} — ${myHotSeat.security}% job security.` });
  }

  return items;
  // TODO (Phase 2 / needs more data): league-wide upsets and injuries require box scores
  // and injury reports beyond what's currently scoped into the weekly sheet.
}

/* ============================== MAIN AGGREGATOR ============================== */

import { readSettings, readAssets, findTeamAsset, getWeeklySpreadsheetId, tabValues } from './sheets';
import {
  parseLastWeekRecap,
  parsePreview,
  parsePreseasonPreview,
  parseSchedule,
  parseTop25Schedule,
  parsePoll,
  parsePlayoff,
  parsePlayoffBracket,
  parseConf,
  parseTeamStats,
  parsePlayerStats,
  parseRecruit,
  parseRoster,
  parseCoach,
  parseAwards,
  parseMyCoach,
  parseContent,
} from './parsers';

/** Direct port of getDashboardData(). */
export async function getDashboardData(): Promise<DashboardData> {
  const settings = await readSettings();
  const assets = await readAssets();
  const myTeamName = settings.CURRENT_TEAM;
  const myAsset = findTeamAsset(assets, myTeamName);
  const weeklyId = getWeeklySpreadsheetId(settings);

  const tv = (name: string) => tabValues(weeklyId, name);

  const recap = parseLastWeekRecap(await tv('Last_Week_Recap'));
  const preview = parsePreview(await tv('Game_Preview'));
  const preseasonPreview = parsePreseasonPreview(await tv('Preseason_Preview'));
  const schedule = parseSchedule(await tv('Team_Schedule'));
  schedule.top25 = parseTop25Schedule(await tv('Top_25_Schedule'));
  const rank = { ap: parsePoll(await tv('AP Poll')), coaches: parsePoll(await tv('Coaches Poll')) };
  const playoff = parsePlayoff(await tv('Playoff'));
  const playoffBracketUrl = parsePlayoffBracket(await tv('Playoff_Bracket'));
  const conf = parseConf(await tv('Conf'));
  const teamStats = parseTeamStats(await tv('Team_Stats'));
  const playerStats = parsePlayerStats(await tv('Player_Stats'));
  const recruit = parseRecruit(await tv('Recruit'));
  const roster = parseRoster(await tv('Depth_Charts'));
  const coach = parseCoach(await tv('Coach'));
  const awards = parseAwards(await tv('Awards'));
  const myCoach = parseMyCoach(await tv('MyCoach'));
  const content = parseContent(await tv('Content'));

  // record + AP rank derived from schedule/rank tabs
  let wins = 0,
    losses = 0;
  schedule.games.forEach((g) => {
    if (g.result === 'W') wins++;
    else if (g.result === 'L') losses++;
  });
  const weekLabel = settings.CURRENT_SHEET_NAME;

  const myApRank = rank.ap.find((r) => String(r.team).toUpperCase() === String(myTeamName).toUpperCase());
  const myCoachesRank = rank.coaches.find((r) => String(r.team).toUpperCase() === String(myTeamName).toUpperCase());
  const oppAsset = preview && preview.oppTeam ? findTeamAsset(assets, preview.oppTeam) : null;

  const result: DashboardData = {
    settings: {
      currentDataSheet: weekLabel,
      currentTeam: myTeamName,
      currentWeek: settings.CURRENT_WEEK,
      haveGameThisWeek: settings.HAVE_GAME_THIS_WEEK,
    },
    team: myAsset,
    opponent: oppAsset,
    record: { wins, losses, apRank: myApRank ? myApRank.rank : null, coachesRank: myCoachesRank ? myCoachesRank.rank : null },
    recap,
    preview,
    preseasonPreview,
    schedule,
    rank,
    playoff,
    playoffBracketUrl,
    conf,
    teamStats,
    playerStats,
    recruit,
    roster,
    coach,
    awards,
    myCoach,
    content,
    storyBrief: [],
  };
  result.storyBrief = buildStoryBrief(result, myTeamName);
  return result;
}

/** Direct port of getMyTeamName(). Exposed via GET /api/team if ever needed client-side. */
export async function getMyTeamName(): Promise<any> {
  const settings = await readSettings();
  return settings.CURRENT_TEAM;
}
