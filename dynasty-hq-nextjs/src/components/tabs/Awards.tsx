import type { DashboardData, Awards as AwardsType } from '@/lib/types';
import { isMine as isMineFn } from '@/lib/format';
import { Row } from '@/components/shared/Row';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';

export default function Awards({ d, subtab }: { d: DashboardData; subtab: string | null }) {
  const key = (subtab || 'heisman') as keyof AwardsType;
  const list = (d.awards && d.awards[key]) || [];
  const myTeamName = d.team && d.team.TEAM_NAME;
  if (!list.length) return <EmptyState>No {key} race data yet.</EmptyState>;
  const cols = '22px 26px 1fr 36px';
  return (
    <div className="table primary">
      {list.map((p, i) => (
        <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, p.team)}>
          <div className="tabular" style={{ fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
            {p.rank}
          </div>
          <Badge text={p.team} size={24} mine={isMineFn(myTeamName, p.team)} />
          <div className="truncate">
            <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}> · {p.team}</span>
          </div>
          <div className="right" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
            {p.pos}
          </div>
        </Row>
      ))}
    </div>
  );
}
