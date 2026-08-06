/**
 * Shape of the JSON getDashboardData() returns. This is a 1:1 mirror of the
 * object built at the bottom of Code.gs — field names are unchanged so the
 * render layer didn't need to change either.
 */

export type SheetRow = any[];
export type SheetValues = SheetRow[];

export interface TeamAsset {
  TEAM_ABBREVIATION?: string;
  TEAM_NAME?: string;
  TEAM_MASCOT?: string;
  TEAM_CONFERENCE?: string;
  CITY?: string;
  STATE?: string;
  PRIMARY_COLOR?: string;
  SECONDARY_COLOR?: string;
  LOGO_URL?: string;
  [key: string]: any;
}

export interface Settings {
  currentDataSheet?: string;
  currentTeam?: string;
  currentWeek?: any;
  haveGameThisWeek?: any;
}

export interface RecapLeader {
  name: any;
  yards: any;
  td: any;
}

export interface Recap {
  myBox: Record<string, any>;
  oppBox: Record<string, any>;
  leaders: {
    team: any;
    passing: RecapLeader | null;
    rushing: RecapLeader[];
    receiving: RecapLeader[];
  };
}

export interface Preview {
  myTeam: any;
  oppTeam: any;
  compare: Record<string, { mine: any; opp: any }>;
  time: string;
  day: any;
  date: string;
  broadcast: any;
  location: any;
}

export interface PreseasonPreview {
  overall: any;
  offense: any;
  defense: any;
  aaOffense: any;
  aaDefense: any;
  acOffense: any;
  acDefense: any;
}

export interface ScheduleGame {
  week: string;
  homeAway: any;
  opponent: any;
  oppWins: any;
  oppLosses: any;
  result: any;
  teamScore: any;
  oppScore: any;
  bye: boolean;
}

export interface PostseasonGame {
  label: string;
  opponent: any;
  result: any;
}

export interface Top25Game {
  away: any;
  awayRank: any;
  home: any;
  homeRank: any;
  time: string;
  broadcast: any;
  spreadFavorite: any;
  spreadNumber: any;
}

export interface Schedule {
  games: ScheduleGame[];
  postseason: PostseasonGame[];
  top25: Top25Game[];
}

export interface PollEntry {
  rank: number;
  team: any;
  wins: number;
  losses: number;
  // Populated only if applyMovement_ is ever wired in (see snapshot.ts) —
  // unused today, kept for parity with the original dead code path.
  changeDir?: 'UP' | 'DOWN' | 'SAME' | null;
  changeNum?: number | null;
  enteredPoll?: boolean;
}

export interface Rank {
  ap: PollEntry[];
  coaches: PollEntry[];
}

export interface PlayoffSeed {
  rank: number;
  team: any;
  wins: any;
  losses: any;
}

export interface Playoff {
  seeds: PlayoffSeed[];
}

export interface ConfRow {
  conference: any;
  team: any;
  confW: any;
  confL: any;
  overallW: any;
  overallL: any;
  pf: any;
  pa: any;
}

export interface TeamStatsNational {
  rank: number;
  team: any;
  ppg: any;
  ypg: any;
  passYpg: any;
  rushYpg: any;
}

export interface TeamStats {
  national: TeamStatsNational[];
  mine: { team: any; ppg: any; ypg: any; passYpg: any; rushYpg: any } | null;
  mineRank: { ppg: any; ypg: any; passYpg: any; rushYpg: any } | null;
}

export interface PlayerStatRow {
  rank: number;
  name: any;
  team: any;
  td: any;
  yards: any;
}

export interface PlayerStatLeader {
  name: any;
  team: any;
  td: any;
  yards: any;
}

export interface PlayerStatBlock {
  national: PlayerStatRow[];
  leaders: PlayerStatLeader[];
}

export interface PlayerStats {
  passing: PlayerStatBlock;
  rushing: PlayerStatBlock;
  receiving: PlayerStatBlock;
}

export interface RecruitBoardRow {
  name: any;
  position: any;
  stars: number;
  status: any;
}

export interface ClassRankingRow {
  rank: number;
  team: any;
  avgStars: any;
  commits: any;
}

export interface Recruit {
  board: RecruitBoardRow[];
  classRankings: ClassRankingRow[];
  myClass: { team: any; avgStars: any; commits: any } | null;
}

export interface Roster {
  depthChartLinkOffense: string | null;
  depthChartLinkDefense: string | null;
}

export interface HotSeat {
  team: any;
  coach: any;
  security: any;
}

export interface CoachMove {
  coach: any;
  oldTeam: any;
  newTeam: any;
}

export interface Coach {
  hotSeats: HotSeat[];
  moves?: CoachMove[];
}

export interface AwardRow {
  rank: number;
  name: any;
  team: any;
  pos: any;
}

export interface Awards {
  heisman: AwardRow[];
  coordinator: AwardRow[];
  coach: AwardRow[];
}

export interface MyCoachHistory {
  season: any;
  team: any;
  position: any;
  wins: any;
  losses: any;
}

export interface MyCoach {
  name: any;
  overallW: any;
  overallL: any;
  bowlWins: any;
  confTitles: any;
  playoffApps: any;
  natTitles: any;
  awards: any;
  almaMater: any;
  pipeline: any;
  offensePlaybook: any;
  defensePlaybook: any;
  photoLink: any;
  history: MyCoachHistory[];
}

export interface ContentItem {
  link: any;
  headline: any;
  subHeadline: any;
  homePage: any;
  contentTab: any;
}

export interface Content {
  podcast: ContentItem[];
  social: ContentItem[];
  newspaper: ContentItem[];
  headlines: ContentItem[];
}

export interface StoryBriefItem {
  tag: string;
  text: string;
}

export interface DashboardData {
  settings: Settings;
  team: TeamAsset | null;
  opponent: TeamAsset | null;
  record: { wins: number; losses: number; apRank: number | null; coachesRank: number | null };
  recap: Recap;
  preview: Preview | null;
  preseasonPreview: PreseasonPreview;
  schedule: Schedule;
  rank: Rank;
  playoff: Playoff;
  playoffBracketUrl: string | null;
  conf: ConfRow[];
  teamStats: TeamStats;
  playerStats: PlayerStats;
  recruit: Recruit;
  roster: Roster;
  coach: Coach;
  awards: Awards;
  myCoach: MyCoach;
  content: Content;
  storyBrief: StoryBriefItem[];
}
