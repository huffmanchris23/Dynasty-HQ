import type { DashboardData } from '@/lib/types';
import { isMine as isMineFn } from '@/lib/format';
import { Row, Thead } from '@/components/shared/Row';
import EmptyState from '@/components/shared/EmptyState';

export default function Rankings({ d, subtab }: { d: DashboardData; subtab: string | null }) {
  const list = subtab === 'coaches' ? d.rank.coaches : d.rank.ap;
  const myTeamName = d.team && d.team.TEAM_NAME;
  if (!list.length) return <EmptyState>No poll data yet.</EmptyState>;
  const cols = '30px 1fr 60px';
  return (
    <div className="table primary">
      <Thead cols={cols}>
        <div style={{ textAlign: 'left' }}>Rk</div>
        <div style={{ textAlign: 'left' }}>Team</div>
        <div>W-L</div>
      </Thead>
      {list.map((r, i) => (
        <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, r.team)}>
          <div className="tabular" style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            {r.rank}
          </div>
          <div className="truncate" style={{ fontWeight: 500 }}>
            {r.team}
          </div>
          <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {r.wins}-{r.losses}
          </div>
        </Row>
      ))}
    </div>
  );
}
