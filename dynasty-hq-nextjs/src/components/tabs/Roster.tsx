import type { DashboardData } from '@/lib/types';
import { numOr, isMine as isMineFn } from '@/lib/format';
import { Row, Thead } from '@/components/shared/Row';
import SectionLabel from '@/components/shared/SectionLabel';
import EmptyState from '@/components/shared/EmptyState';

function LinkBlock({ label, link }: { label: string; link: string | null }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {link ? (
        <div className="card">
          <a href={link} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '24px 0', color: 'var(--accent)', fontWeight: 600 }}>
            📎 Open Screenshot in Drive
          </a>
        </div>
      ) : (
        <EmptyState>No screenshot linked yet.</EmptyState>
      )}
    </div>
  );
}

export function DepthCharts({ d }: { d: DashboardData }) {
  const r = d.roster || ({} as DashboardData['roster']);
  return (
    <>
      <LinkBlock label="Offensive Depth Chart" link={r.depthChartLinkOffense} />
      <div style={{ marginTop: 16 }}>
        <LinkBlock label="Defensive Depth Chart" link={r.depthChartLinkDefense} />
      </div>
    </>
  );
}

function RecruitBoard({ d }: { d: DashboardData }) {
  const board = (d.recruit && d.recruit.board) || [];
  if (!board.length) return <EmptyState>No recruits on the board yet.</EmptyState>;
  const cols = '1fr 46px 60px 90px';
  return (
    <div className="table primary">
      <Thead cols={cols}>
        <div style={{ textAlign: 'left' }}>Recruit</div>
        <div>Pos</div>
        <div>Stars</div>
        <div>Status</div>
      </Thead>
      {board.map((r, i) => (
        <Row key={i} cols={cols} first={i === 0}>
          <div className="truncate" style={{ fontWeight: 500 }}>
            {r.name}
          </div>
          <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {r.position}
          </div>
          <div className="right" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
            {'★'.repeat(r.stars || 0)}
          </div>
          <div className="right truncate" style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            {r.status}
          </div>
        </Row>
      ))}
    </div>
  );
}

function ClassRank({ d }: { d: DashboardData }) {
  const rc = d.recruit || ({} as DashboardData['recruit']);
  const my = rc.myClass;
  const myTeamName = d.team && d.team.TEAM_NAME;
  const cols = '26px 1fr 60px 60px';
  return (
    <>
      {my ? (
        <div>
          <SectionLabel>{(d.team && d.team.TEAM_NAME) + ' — Recruiting Class'}</SectionLabel>
          <div className="grid-3">
            <div className="card">
              <div className="stat-label">Avg Stars</div>
              <div className="stat-value">{numOr(my.avgStars)}</div>
            </div>
            <div className="card">
              <div className="stat-label">Commits</div>
              <div className="stat-value">{numOr(my.commits)}</div>
            </div>
            <div className="card">
              <div className="stat-label">Team</div>
              <div className="stat-value" style={{ fontSize: 14 }}>
                {my.team || ''}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div style={{ marginTop: 16 }}>
        <SectionLabel>National — Top 10</SectionLabel>
        <div className="table primary">
          <Thead cols={cols}>
            <div style={{ textAlign: 'left' }}>Rk</div>
            <div style={{ textAlign: 'left' }}>Team</div>
            <div>Avg ★</div>
            <div>Commits</div>
          </Thead>
          {(rc.classRankings || []).length ? (
            (rc.classRankings || []).map((c, i) => (
              <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, c.team)}>
                <div className="tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {c.rank}
                </div>
                <div className="truncate" style={{ fontWeight: 500 }}>
                  {c.team}
                </div>
                <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {numOr(c.avgStars)}
                </div>
                <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {numOr(c.commits)}
                </div>
              </Row>
            ))
          ) : (
            <EmptyState>No class ranking data yet.</EmptyState>
          )}
        </div>
      </div>
    </>
  );
}

export function Recruiting({ d }: { d: DashboardData }) {
  return (
    <>
      <div>
        <SectionLabel>Team Board</SectionLabel>
        <RecruitBoard d={d} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ClassRank d={d} />
      </div>
    </>
  );
}
