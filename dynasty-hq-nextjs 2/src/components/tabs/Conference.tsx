import type { DashboardData } from '@/lib/types';
import { numOr, isMine as isMineFn } from '@/lib/format';
import { Row, Thead } from '@/components/shared/Row';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';

export default function Conference({ d }: { d: DashboardData }) {
  const rows = d.conf || [];
  const myTeamName = d.team && d.team.TEAM_NAME;
  if (!rows.length) return <EmptyState>No conference data yet.</EmptyState>;
  const confName = rows[0].conference || '';
  const cols = '1fr 48px 48px 42px 42px';
  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Badge text={confName} size={40} mine />
        <div>
          <div className="stat-label">Conference</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{confName}</div>
        </div>
      </div>
      <div className="table primary">
        <Thead cols={cols}>
          <div style={{ textAlign: 'left' }}>Team</div>
          <div>Conf</div>
          <div>Ovr</div>
          <div>PF</div>
          <div>PA</div>
        </Thead>
        {rows.map((c, i) => (
          <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, c.team)}>
            <div className="truncate" style={{ fontWeight: 500 }}>
              {c.team}
            </div>
            <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {c.confW ?? ''}-{c.confL ?? ''}
            </div>
            <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {c.overallW ?? ''}-{c.overallL ?? ''}
            </div>
            <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {numOr(c.pf, '')}
            </div>
            <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {numOr(c.pa, '')}
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}
