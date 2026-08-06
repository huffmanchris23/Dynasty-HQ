/**
 * ============================== TAB PARSERS ==============================
 * Direct port of every parse*_ function from Code.gs. Row/column indexing,
 * loop bounds, and field names are unchanged — only the input type changes
 * (values: any[][] instead of a Range's getValues() result).
 */

import type {
  Recap,
  Preview,
  PreseasonPreview,
  Schedule,
  Top25Game,
  PollEntry,
  Playoff,
  ConfRow,
  TeamStats,
  PlayerStats,
  PlayerStatBlock,
  Recruit,
  Roster,
  Coach,
  Awards,
  MyCoach,
  Content,
} from './types';

/* ---------------- small helpers (fmtTime_ / fmtDate_ / safeNum_ / toTitleCase_ / isBlankRow_) ---------------- */

/**
 * Apps Script's fmtTime_/fmtDate_ used Utilities.formatDate() when the cell
 * came back as a real Date object. The Sheets API's FORMATTED_VALUE render
 * option already returns the display string (e.g. "7:00 PM"), so these are
 * now pass-throughs — same output, no Date-detection needed.
 */
export function fmtTime(v: any): string {
  if (!v) return '';
  return String(v);
}
export function fmtDate(v: any): string {
  if (!v) return '';
  return String(v);
}

export function toTitleCase(s: any): string {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
}

export function isBlankRow(row: any[]): boolean {
  return row.every((c) => c === '' || c === null || c === undefined);
}

export function safeNum(v: any, fallback?: number): number {
  const n = Number(v);
  return isNaN(n) ? (fallback === undefined ? 0 : fallback) : n;
}

/* ============================== parseLastWeekRecap_ ============================== */

export function parseLastWeekRecap(values: any[][]): Recap {
  const my: Record<string, any> = {};
  const opp: Record<string, any> = {};
  for (let i = 0; i <= 12 && i < values.length; i++) {
    const k = values[i][0],
      v = values[i][1];
    if (k) my[String(k).trim()] = v;
  }
  for (let i = 13; i <= 21 && i < values.length; i++) {
    const k = values[i][0],
      v = values[i][1];
    if (k) opp[String(k).trim()] = v;
  }
  const leaders: Record<string, any> = {};
  for (let i = 0; i <= 21 && i < values.length; i++) {
    const k = values[i][3],
      v = values[i][4];
    if (k) leaders[String(k).trim()] = v;
  }

  const rushing = [
    { name: leaders.RUSHING_NAME, yards: leaders.RUSHING_YARDS, td: leaders.RUSHING_TD },
    { name: leaders.RUSHING_2_NAME, yards: leaders.RUSHING_2_YARDS, td: leaders.RUSHING_2_TD },
    { name: leaders.RUSHING_3_NAME, yards: leaders.RUSHING_3_YARDS, td: leaders.RUSHING_3_TD },
  ].filter((r) => r.name);
  const receiving = [
    { name: leaders.RECEIVING_NAME, yards: leaders.RECEIVING_YARDS, td: leaders.RECEIVING_TD },
    { name: leaders.RECEIVING_2_NAME, yards: leaders.RECEIVING_2_YARDS, td: leaders.RECEIVING_2_TD },
    { name: leaders.RECEIVING_3_NAME, yards: leaders.RECEIVING_3_YARDS, td: leaders.RECEIVING_3_TD },
  ].filter((r) => r.name);

  return {
    myBox: my,
    oppBox: opp,
    leaders: {
      team: leaders.TEAM,
      passing: leaders.PASSING_NAME
        ? { name: leaders.PASSING_NAME, yards: leaders.PASSING_YARDS, td: leaders.PASSING_TD }
        : null,
      rushing,
      receiving,
    },
  };
}

/* ============================== parsePreview_ ============================== */

export function parsePreview(values: any[][]): Preview | null {
  if (!values.length) return null;
  const myTeam = values[0][1];
  const oppTeam = values[0][2];
  const compare: Record<string, { mine: any; opp: any }> = {};
  for (let i = 1; i < values.length; i++) {
    const label = values[i][0];
    if (!label) continue;
    compare[String(label).trim()] = { mine: values[i][1], opp: values[i][2] };
  }
  const info: Record<string, any> = {};
  for (let i = 1; i < values.length; i++) {
    const label = values[i][4];
    if (!label) continue;
    info[String(label).trim()] = values[i][5];
  }
  return {
    myTeam,
    oppTeam,
    compare,
    time: fmtTime(info.TIME),
    day: info.DAY,
    date: fmtDate(info.DATE),
    broadcast: info.BROADCAST,
    location: info.LOCATION,
  };
}

/* ============================== parsePreseasonPreview_ ============================== */

export function parsePreseasonPreview(values: any[][]): PreseasonPreview {
  const kv: Record<string, any> = {};
  values.forEach((row) => {
    if (row[0]) kv[String(row[0]).trim()] = row[1];
  });
  return {
    overall: kv.OVERALL_RATING,
    offense: kv.OFFENSE_RATING,
    defense: kv.DEFENSE_RATING,
    aaOffense: kv.PRESEASON_ALL_AMERICANS_OFFENSE,
    aaDefense: kv.PRESEASON_ALL_AMERICANS_DEFENSE,
    acOffense: kv.PRESEASON_ALL_CONFERENCE_OFFENSE,
    acDefense: kv.PRESEASON_ALL_CONFERENCE_DEFENSE,
  };
}

/* ============================== parseSchedule_ ============================== */

const POSTSEASON_LABELS = [
  'CONFERENCE_CHAMPIONSHIP',
  'BOWL_GAME',
  'PLAYOFF_ROUND_1',
  'PLAYOFF_ROUND_2',
  'PLAYOFF_ROUND_3',
  'PLAYOFF_NATIONAL CHAMPIONSHIP',
];

export function parseSchedule(values: any[][]): Schedule {
  const games: Schedule['games'] = [];
  for (let i = 1; i < values.length; i++) {
    const label = values[i][0];
    if (!label) continue;
    const s = String(label);
    if (!s.startsWith('WEEK_')) continue; // postseason placeholder rows captured separately below
    games.push({
      week: s.replace('WEEK_', ''),
      homeAway: values[i][1] || null,
      opponent: values[i][2] || null,
      oppWins: values[i][3],
      oppLosses: values[i][4],
      result: values[i][5] || null,
      teamScore: values[i][6],
      oppScore: values[i][7],
      bye: !values[i][1] && String(values[i][2] || '').toUpperCase() === 'BYE',
    });
  }
  const postseason: Schedule['postseason'] = [];
  for (let i = 1; i < values.length; i++) {
    const label = String(values[i][0] || '');
    if (POSTSEASON_LABELS.indexOf(label) === -1) continue;
    if (!values[i][2]) continue; // not reached yet — don't show a placeholder row
    postseason.push({
      label: toTitleCase(label.replace(/_/g, ' ')),
      opponent: values[i][2] || null,
      result: values[i][5] || null,
    });
  }
  return { games, postseason, top25: [] };
}

/* ============================== parseTop25Schedule_ ============================== */

export function parseTop25Schedule(values: any[][]): Top25Game[] {
  const out: Top25Game[] = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue; // no GAME_NUMBER, skip
    out.push({
      away: row[1],
      awayRank: row[2],
      home: row[3],
      homeRank: row[4],
      time: fmtTime(row[5]),
      broadcast: row[6],
      spreadFavorite: row[7],
      spreadNumber: row[8],
    });
  }
  return out;
}

/* ============================== parsePoll_ ============================== */

export function parsePoll(values: any[][]): PollEntry[] {
  const out: PollEntry[] = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0] || !row[1]) continue;
    out.push({ rank: safeNum(row[0]), team: row[1], wins: safeNum(row[2]), losses: safeNum(row[3]) });
  }
  return out;
}

/* ============================== parsePlayoff_ ============================== */

export function parsePlayoff(values: any[][]): Playoff {
  const seeds: Playoff['seeds'] = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0] === '' || row[0] === null || row[0] === undefined) continue;
    if (!row[1]) continue; // team not filled yet
    seeds.push({ rank: safeNum(row[0]), team: row[1], wins: safeNum(row[2]), losses: safeNum(row[3]) });
  }
  return { seeds };
}

/* ============================== parsePlayoffBracket_ ============================== */

export function parsePlayoffBracket(values: any[][]): string | null {
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) return String(values[i][0]);
  }
  return null;
}

/* ============================== parseConf_ ============================== */

export function parseConf(values: any[][]): ConfRow[] {
  const rows: ConfRow[] = [];
  let currentConf: any = null;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[1]) continue;
    if (row[0]) currentConf = row[0];
    rows.push({
      conference: currentConf,
      team: row[1],
      confW: row[2],
      confL: row[3],
      overallW: row[4],
      overallL: row[5],
      pf: row[6],
      pa: row[7],
    });
  }
  return rows;
}

/* ============================== parseTeamStats_ ============================== */

export function parseTeamStats(values: any[][]): TeamStats {
  const national: TeamStats['national'] = [];
  for (let i = 1; i <= 10 && i < values.length; i++) {
    const row = values[i];
    if (!row[1]) continue;
    national.push({ rank: safeNum(row[0]), team: row[1], ppg: row[2], ypg: row[3], passYpg: row[4], rushYpg: row[5] });
  }
  const userRow = values.find((r) => String(r[0]).trim() === 'USER_TEAM');
  const userRankRow = values.find((r) => String(r[0]).trim() === 'USER_TEAM_RANK_FOR_CATEGORY');
  const mine = userRow ? { team: userRow[1], ppg: userRow[2], ypg: userRow[3], passYpg: userRow[4], rushYpg: userRow[5] } : null;
  const mineRank = userRankRow ? { ppg: userRankRow[2], ypg: userRankRow[3], passYpg: userRankRow[4], rushYpg: userRankRow[5] } : null;
  return { national, mine, mineRank };
}

/* ============================== parsePlayerStats_ ============================== */

export function parsePlayerStats(values: any[][]): PlayerStats {
  function block(colOffset: number): PlayerStatBlock {
    const rows: PlayerStatBlock['national'] = [];
    for (let i = 2; i <= 11 && i < values.length; i++) {
      const row = values[i];
      const rank = row[colOffset];
      if (rank === '' || rank === null || rank === undefined || !row[colOffset + 1]) continue;
      rows.push({ rank: safeNum(rank), name: row[colOffset + 1], team: row[colOffset + 2], td: row[colOffset + 3], yards: row[colOffset + 4] });
    }
    const leaders: PlayerStatBlock['leaders'] = [];
    for (let i = 12; i < values.length; i++) {
      const row = values[i];
      const tag = String(row[colOffset] || '');
      if (tag.indexOf('USER_TEAM') !== 0) continue;
      if (!row[colOffset + 1]) continue;
      leaders.push({ name: row[colOffset + 1], team: row[colOffset + 2], td: row[colOffset + 3], yards: row[colOffset + 4] });
    }
    return { national: rows, leaders };
  }
  return {
    passing: block(0),
    rushing: block(5),
    receiving: block(10),
  };
}

/* ============================== parseRecruit_ ============================== */

export function parseRecruit(values: any[][]): Recruit {
  const board: Recruit['board'] = [];
  for (let i = 2; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    board.push({ name: row[0], position: row[1], stars: safeNum(row[2]), status: row[3] });
  }
  const classRankings: Recruit['classRankings'] = [];
  let userTeamClass: Recruit['myClass'] = null;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rank = row[4];
    if (rank === '' || rank === null || rank === undefined) continue;
    if (String(rank) === 'USER_TEAM') {
      userTeamClass = { team: row[5], avgStars: row[6], commits: row[7] };
      continue;
    }
    if (!row[5]) continue;
    classRankings.push({ rank: safeNum(rank), team: row[5], avgStars: row[6], commits: row[7] });
  }
  return { board, classRankings, myClass: userTeamClass };
}

/* ============================== parseRoster_ ============================== */

export function parseRoster(values: any[][]): Roster {
  const kv: Record<string, any> = {};
  values.forEach((row) => {
    if (row[0]) kv[String(row[0]).trim()] = row[1];
  });
  return {
    depthChartLinkOffense: kv.DEPTH_CHART_LINK_OFFENSE || null,
    depthChartLinkDefense: kv.DEPTH_CHART_LINK_DEFENSE || null,
  };
}

/* ============================== parseCoach_ ============================== */

export function parseCoach(values: any[][]): Coach {
  const hotSeats: Coach['hotSeats'] = [];
  for (let i = 2; i < values.length; i++) {
    const row = values[i];
    if (row[0]) hotSeats.push({ team: row[0], coach: row[1], security: row[2] });
  }
  return { hotSeats };
}

/* ============================== parseAwards_ ============================== */

export function parseAwards(values: any[][]): Awards {
  function block(colOffset: number): Awards['heisman'] {
    const rows: Awards['heisman'] = [];
    for (let i = 2; i < values.length; i++) {
      const row = values[i];
      const rank = row[colOffset];
      if (rank === '' || rank === null || rank === undefined || !row[colOffset + 1]) continue;
      rows.push({ rank: safeNum(rank), name: row[colOffset + 1], team: row[colOffset + 2], pos: row[colOffset + 3] });
    }
    return rows;
  }
  return {
    heisman: block(0),
    coordinator: block(5),
    coach: block(10),
  };
}

/* ============================== parseMyCoach_ ============================== */

export function parseMyCoach(values: any[][]): MyCoach {
  const headerRow = values[0] || [];
  const dataRow = values[1] || [];
  const bio: Record<string, any> = {};
  headerRow.forEach((h, i) => {
    if (h) bio[String(h).trim()] = dataRow[i];
  });

  const bioHeaderRow = values[3] || [];
  const bioDataRow = values[4] || [];
  const bio2: Record<string, any> = {};
  bioHeaderRow.forEach((h, i) => {
    if (h) bio2[String(h).trim()] = bioDataRow[i];
  });

  const history: MyCoach['history'] = [];
  for (let i = 7; i < values.length; i++) {
    const row = values[i];
    if (!row[1]) continue;
    history.push({ season: row[0], team: row[1], position: row[2], wins: row[3], losses: row[4] });
  }

  return {
    name: bio.COACH_NAME,
    overallW: bio.OVERALL_WINS,
    overallL: bio.OVERALL_LOSSES,
    bowlWins: bio.BOWL_WINS,
    confTitles: bio.CONF_TITLES,
    playoffApps: bio.PLAYOFF_APPS,
    natTitles: bio.NATIONAL_TITLES,
    awards: bio.COACH_AWARDS,
    almaMater: bio2.COACH_ALMA_MATER,
    pipeline: bio2.COACH_PIPELINE,
    offensePlaybook: bio2.COACH_OFFENSE_PLAYBOOK,
    defensePlaybook: bio2.COACH_DEFENSE_PLAYBOOK,
    photoLink: bio2.PHOTO_LINK,
    history,
  };
}

/* ============================== parseContent_ ============================== */

export function parseContent(values: any[][]): Content {
  const out: Content = { podcast: [], social: [], newspaper: [], headlines: [] };
  const map: Record<string, keyof Content> = {
    PODCAST: 'podcast',
    TEAM_NEWS: 'newspaper',
    NATIONAL_HEADLINE_1: 'headlines',
    NATIONAL_HEADLINE_2: 'headlines',
    NATIONAL_HEADLINE_3: 'headlines',
  };
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const key = map[String(row[0] || '').trim()];
    if (!key) continue;
    if (!row[2]) continue; // no headline yet
    out[key].push({ link: row[1], headline: row[2], subHeadline: row[3], homePage: row[4], contentTab: row[5] });
  }
  return out;
}
