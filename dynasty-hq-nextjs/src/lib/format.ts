/**
 * ============================== UTIL ==============================
 * Port of the small formatting helpers from JavaScript.html.
 *
 * esc() is intentionally NOT ported: it existed only because the original
 * built raw HTML strings by hand. JSX escapes all text content by default,
 * so every call site that did `${esc(x)}` is just `{x}` in the React
 * version — same output, no behavior change.
 */

export function initials(name: any, n = 2): string {
  return String(name || '')
    .slice(0, n)
    .toUpperCase();
}

export function toPct(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  let n = parseFloat(String(v).replace('%', ''));
  if (isNaN(n)) return null;
  if (n <= 1) n = n * 100; // handles 0.57-style decimal fractions from % cell formatting
  return n;
}

export function favoriteLine(compare: Record<string, { mine: any; opp: any }>, key: string, myTeam: any, oppTeam: any): string {
  const row = compare[key];
  if (!row) return '—';
  const mineNum = parseFloat(row.mine);
  const oppNum = parseFloat(row.opp);
  if (!isNaN(mineNum) && mineNum < 0) return `${myTeam} ${row.mine}`;
  if (!isNaN(oppNum) && oppNum < 0) return `${oppTeam} ${row.opp}`;
  return `${myTeam} ${row.mine}`;
}

export function numOr(v: any, fallback: any = '—'): any {
  return v === null || v === undefined || v === '' ? fallback : v;
}

export function isMine(myTeamName: any, teamName: any): boolean {
  return !!myTeamName && String(teamName || '').toUpperCase() === String(myTeamName).toUpperCase();
}
