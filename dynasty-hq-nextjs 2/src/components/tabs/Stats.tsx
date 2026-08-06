import type { DashboardData } from '@/lib/types';
import { numOr, isMine as isMineFn } from '@/lib/format';
import { Row, Thead } from '@/components/shared/Row';
import Badge from '@/components/shared/Badge';
import SectionLabel from '@/components/shared/SectionLabel';
import EmptyState from '@/components/shared/EmptyState';

export function TeamStats({ d }: { d: DashboardData }) {
  const ts = d.teamStats || ({} as DashboardData['teamStats']);
  const mine = ts.mine || ({} as NonNullable<DashboardData['teamStats']['mine']>);
  const myTeamName = d.team && d.team.TEAM_NAME;
  const cards = [
    { label: 'Points/Game', value: mine.ppg },
    { label: 'Yards/Game', value: mine.ypg },
    { label: 'Pass Yds/Game', value: mine.passYpg },
    { label: 'Rush Yds/Game', value: mine.rushYpg },
  ];
  const national = ts.national || [];
  const cols = '26px 1fr 60px';

  return (
    <>
      <div>
        <SectionLabel>{(d.team && d.team.TEAM_NAME) + ' — Season Stats'}</SectionLabel>
        <div className="grid-2">
          {cards.map((c, i) => (
            <div className="card" key={i}>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{numOr(c.value)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <SectionLabel>National — Team Offense</SectionLabel>
        <div className="table primary">
          <Thead cols={cols}>
            <div style={{ textAlign: 'left' }}>Rk</div>
            <div style={{ textAlign: 'left' }}>Team</div>
            <div>Yds/G</div>
          </Thead>
          {national.length ? (
            national.map((r, i) => (
              <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, r.team)}>
                <div className="tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {r.rank}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <Badge text={r.team} size={20} mine={isMineFn(myTeamName, r.team)} />
                  <span className="truncate" style={{ fontWeight: 500 }}>
                    {r.team}
                  </span>
                </div>
                <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {numOr(r.ypg)}
                </div>
              </Row>
            ))
          ) : (
            <EmptyState>No national data yet.</EmptyState>
          )}
        </div>
      </div>
    </>
  );
}

const STAT_TYPES = [
  { id: 'passing', label: 'Passing' },
  { id: 'rushing', label: 'Rushing' },
  { id: 'receiving', label: 'Receiving' },
] as const;

export function PlayerStats({
  d,
  statType,
  onStatTypeChange,
}: {
  d: DashboardData;
  statType: string;
  onStatTypeChange: (id: string) => void;
}) {
  const key = (statType || 'passing') as keyof DashboardData['playerStats'];
  const block = (d.playerStats && d.playerStats[key]) || { national: [], leaders: [] };
  const leaders = block.leaders || [];
  const myTeamName = d.team && d.team.TEAM_NAME;
  const cols = '26px 1fr 1fr 70px';

  return (
    <>
      <div className="subtab-bar">
        {STAT_TYPES.map((s) => (
          <button key={s.id} className={`subtab-btn ${key === s.id ? 'active' : ''}`} onClick={() => onStatTypeChange(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      {leaders.length ? (
        <div className={`grid-${leaders.length > 1 ? '2' : '1'}`}>
          {leaders.map((l, i) => (
            <div className="card center" key={i}>
              <div className="stat-label">{key}</div>
              <div className="stat-name">{l.name}</div>
              <div className="stat-sub">
                {numOr(l.yards)} YDS · {numOr(l.td)} TD
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div style={{ marginTop: 16 }}>
        <SectionLabel>{'National — ' + key.charAt(0).toUpperCase() + key.slice(1)}</SectionLabel>
        <div className="table primary">
          <Thead cols={cols}>
            <div style={{ textAlign: 'left' }}>Rk</div>
            <div style={{ textAlign: 'left' }}>Player</div>
            <div style={{ textAlign: 'left' }}>Team</div>
            <div>Yds</div>
          </Thead>
          {(block.national || []).length ? (
            (block.national || []).map((r, i) => (
              <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, r.team)}>
                <div className="tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {r.rank}
                </div>
                <div className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>
                  {r.name}
                </div>
                <div className="truncate" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  {r.team}
                </div>
                <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {numOr(r.yards)}
                </div>
              </Row>
            ))
          ) : (
            <EmptyState>No leaderboard data yet.</EmptyState>
          )}
        </div>
      </div>
    </>
  );
}
