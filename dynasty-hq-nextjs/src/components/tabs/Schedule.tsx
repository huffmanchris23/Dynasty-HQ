import type { DashboardData } from '@/lib/types';
import { numOr } from '@/lib/format';
import { Row, Thead } from '@/components/shared/Row';
import Badge from '@/components/shared/Badge';
import SectionLabel from '@/components/shared/SectionLabel';
import EmptyState from '@/components/shared/EmptyState';
import { isMine as isMineFn } from '@/lib/format';

export function ScheduleTeam({ d }: { d: DashboardData }) {
  const games = (d.schedule && d.schedule.games) || [];
  const postseason = (d.schedule && d.schedule.postseason) || [];
  const cols = '28px 1fr 56px 90px';

  return (
    <>
      <div className="table primary">
        <Thead cols={cols}>
          <div style={{ textAlign: 'left' }}>Wk</div>
          <div style={{ textAlign: 'left' }}>Opponent</div>
          <div>Opp Rec</div>
          <div>Result</div>
        </Thead>
        {games.length ? (
          games.map((g, i) => {
            if (g.bye) {
              return (
                <Row key={i} cols={cols} first={i === 0}>
                  <div className="tabular" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    {g.week}
                  </div>
                  <div style={{ gridColumn: 'span 3', fontStyle: 'italic', color: 'rgba(255,255,255,0.35)' }}>Bye</div>
                </Row>
              );
            }
            const resultColor = g.result === 'W' ? '#5FA467' : g.result === 'L' ? '#C0555A' : 'rgba(255,255,255,0.3)';
            const scoreStr = g.result ? `${g.result} ${numOr(g.teamScore)}-${numOr(g.oppScore)}` : '—';
            return (
              <Row key={i} cols={cols} first={i === 0}>
                <div className="tabular" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  {g.week}
                </div>
                <div className="truncate">
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginRight: 6 }}>{g.homeAway === 'HOME' ? 'vs' : '@'}</span>
                  <span style={{ fontWeight: 500 }}>{g.opponent}</span>
                </div>
                <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  {numOr(g.oppWins)}-{numOr(g.oppLosses)}
                </div>
                <div className="right tabular" style={{ fontSize: 12, fontWeight: 600, color: resultColor }}>
                  {scoreStr}
                </div>
              </Row>
            );
          })
        ) : (
          <EmptyState>No schedule data yet.</EmptyState>
        )}
      </div>
      {postseason.length ? (
        <div style={{ marginTop: 16 }}>
          <SectionLabel>Postseason</SectionLabel>
          <div className="table primary">
            {postseason.map((g, i) => (
              <Row key={i} cols="1fr 90px" first={i === 0}>
                <div className="truncate" style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                  {g.label}
                </div>
                <div className="right tabular" style={{ fontSize: 12 }}>
                  {g.result || '—'}
                </div>
              </Row>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ScheduleTop25({ d }: { d: DashboardData }) {
  const games = (d.schedule && d.schedule.top25) || [];
  const myTeamName = d.team && d.team.TEAM_NAME;
  if (!games.length) return <EmptyState>No ranked matchups posted yet.</EmptyState>;
  return (
    <>
      <SectionLabel>Ranked Matchups</SectionLabel>
      <div className="stack-sm">
        {games.map((g, i) => (
          <div className="card accent tight" key={i}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 72px', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Badge text={g.away} size={20} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 20 }}>{g.awayRank && g.awayRank !== 'N/A' ? '#' + g.awayRank : ''}</span>
                  <span className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>
                    {g.away}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge text={g.home} size={20} mine={isMineFn(myTeamName, g.home)} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 20 }}>{g.homeRank && g.homeRank !== 'N/A' ? '#' + g.homeRank : ''}</span>
                  <span className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>
                    {g.home}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{g.time}</div>
                <div style={{ fontSize: 8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginTop: 2 }}>{g.broadcast}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {g.spreadFavorite} {g.spreadNumber || ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
