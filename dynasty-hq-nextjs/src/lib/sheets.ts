/**
 * ============================== SHEETS ACCESS ==============================
 * Direct translation of the "MASTER CONTROL" and "WEEKLY SHEET ACCESS"
 * sections of Code.gs. Every SpreadsheetApp call has a 1:1 replacement here:
 *
 *   SpreadsheetApp.getActiveSpreadsheet()      -> MASTER_SPREADSHEET_ID env var
 *   SpreadsheetApp.openByUrl(link)              -> extractSpreadsheetId(link)
 *   sh.getDataRange().getValues()                -> tabValues() (Sheets API v4)
 *
 * Apps Script's getValues() returns real JS Date objects for date/time cells;
 * the Sheets API doesn't have a Date type over the wire. We request
 * valueRenderOption: 'FORMATTED_VALUE' instead, which returns each cell as
 * the string the spreadsheet actually displays (e.g. "7:00 PM", "29 Aug") —
 * that's the same output fmtTime_/fmtDate_ produced from a Date, so those
 * helpers become simple pass-throughs in parsers.ts.
 *
 * AUTH: OAuth2 with a long-lived refresh token, not a service account —
 * org policy on this Google account blocks service-account key creation.
 * The googleapis OAuth2Client transparently exchanges the refresh token for
 * a fresh access token on demand (and again whenever it expires), so no
 * manual token refresh logic is needed here. Same read-only sheets scope
 * either way; only the credential type changed.
 */

import { google, sheets_v4 } from 'googleapis';

let cachedSheets: sheets_v4.Sheets | null = null;

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN env vars. ' +
        'See .env.example — the authorizing Google account must have Viewer access on the ' +
        'Master Control sheet and the current weekly sheet.'
    );
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (cachedSheets) return cachedSheets;
  const auth = getAuth();
  cachedSheets = google.sheets({ version: 'v4', auth });
  return cachedSheets;
}

/** Pulls the spreadsheet ID out of a full Drive/Sheets URL, or passes an ID through untouched. */
export function extractSpreadsheetId(urlOrId: string): string {
  const s = String(urlOrId || '').trim();
  const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : s;
}

/**
 * Mirrors Code.gs's tabValues_(ss, name): returns the tab's full grid, or []
 * if the tab doesn't exist (SpreadsheetApp returns a null Sheet in that case;
 * the Sheets API throws instead, so we catch-and-fall-back to match).
 */
export async function tabValues(spreadsheetId: string, tabName: string): Promise<any[][]> {
  const sheets = await getSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tabName}'`,
      valueRenderOption: 'FORMATTED_VALUE',
    });
    return (res.data.values as any[][]) || [];
  } catch (err) {
    return [];
  }
}

function getMasterSpreadsheetId_(): string {
  const id = process.env.MASTER_SPREADSHEET_ID;
  if (!id) throw new Error('Missing MASTER_SPREADSHEET_ID env var — see .env.example.');
  return id;
}

/** Direct port of readSettings_(). */
export async function readSettings(): Promise<Record<string, any>> {
  const rows = await tabValues(getMasterSpreadsheetId_(), 'SETTINGS');
  const out: Record<string, any> = {};
  rows.forEach((r) => {
    if (r[0]) out[String(r[0]).trim()] = r[1];
  });
  return out;
}

/** Direct port of readAssets_() — including its original TEAM_MASCOT-column presence check (see comment). */
export async function readAssets(): Promise<Record<string, any>[]> {
  const values = await tabValues(getMasterSpreadsheetId_(), 'ASSETS');
  if (!values.length) return [];
  const headers = values[0].map((h) => String(h).trim());
  // Original comment says "TEAM_NAME must exist" but the check is on column
  // index 2, which is TEAM_MASCOT per the ASSETS header row. Preserved as-is.
  const rows = values.slice(1).filter((r) => r[2]);
  return rows.map((r) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => (obj[h] = r[i]));
    return obj;
  });
}

/** Direct port of findTeamAsset_(). */
export function findTeamAsset(assets: Record<string, any>[], teamName: any): Record<string, any> | null {
  if (!teamName) return null;
  const norm = (s: any) => String(s || '').trim().toUpperCase();
  return assets.find((a) => norm(a.TEAM_NAME) === norm(teamName)) || null;
}

/** Direct port of getWeeklySS_() — resolves SETTINGS!CURRENT_SHEET_LINK to a spreadsheet ID instead of opening it. */
export function getWeeklySpreadsheetId(settings: Record<string, any>): string {
  const link = settings.CURRENT_SHEET_LINK;
  if (!link) throw new Error("SETTINGS!CURRENT_SHEET_LINK is empty — point it at this week's data sheet.");
  return extractSpreadsheetId(link);
}
