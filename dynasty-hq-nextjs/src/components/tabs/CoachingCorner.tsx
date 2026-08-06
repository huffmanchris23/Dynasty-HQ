import type { DashboardData } from '@/lib/types';
import { numOr, isMine as isMineFn } from '@/lib/format';
import { Row, Thead } from '@/components/shared/Row';
import SectionLabel from '@/components/shared/SectionLabel';
import EmptyState from '@/components/shared/EmptyState';
import { initials } from '@/lib/format';

function BioRow({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

export function MyCoach({ d }: { d: DashboardData }) {
  const c = d.myCoach || ({} as DashboardData['myCoach']);
  const history = c.history || [];
  const myTeamName = d.team && d.team.TEAM_NAME;
  const cols = '52px 1fr 56px 70px';

  return (
    <>
      <div>
        <SectionLabel>Bio</SectionLabel>
        <div className="card" style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 8,
              flexShrink: 0,
              background: 'color-mix(in srgb, var(--primary) 30%, transparent)',
              border: '1px solid color-mix(in srgb, var(--primary) 60%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--accent)',
              overflow: 'hidden',
            }}
          >
            {c.photoLink ? (
              <a href={c.photoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Photo
              </a>
            ) : (
              initials(c.name, 2)
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{c.name || 'Coach'}</div>
            <BioRow label="Alma Mater" value={c.almaMater} />
            <BioRow label="Pipeline" value={c.pipeline} />
            <BioRow label="Offense Playbook" value={c.offensePlaybook} />
            <BioRow label="Defense Playbook" value={c.defensePlaybook} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <SectionLabel>Record Book</SectionLabel>
        <div className="grid-3">
          <div className="card">
            <div className="stat-label">Overall</div>
            <div className="stat-value">
              {numOr(c.overallW)}-{numOr(c.overallL)}
            </div>
          </div>
          <div className="card">
            <div className="stat-label">Conf. Titles</div>
            <div className="stat-value">{numOr(c.confTitles)}</div>
          </div>
          <div className="card">
            <div className="stat-label">Bowl Wins</div>
            <div className="stat-value">{numOr(c.bowlWins)}</div>
          </div>
          <div className="card">
            <div className="stat-label">Playoff Apps</div>
            <div className="stat-value">{numOr(c.playoffApps)}</div>
          </div>
          <div className="card">
            <div className="stat-label">National Titles</div>
            <div className="stat-value">{numOr(c.natTitles)}</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <SectionLabel>Career History</SectionLabel>
        <div className="table primary">
          <Thead cols={cols}>
            <div style={{ textAlign: 'left' }}>Season</div>
            <div style={{ textAlign: 'left' }}>Team</div>
            <div>Pos</div>
            <div>Record</div>
          </Thead>
          {history.length ? (
            history.map((h, i) => (
              <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, h.team)}>
                <div className="tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  {h.season}
                </div>
                <div className="truncate" style={{ fontWeight: 500 }}>
                  {h.team}
                </div>
                <div className="center" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  {h.position}
                </div>
                <div className="right tabular" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {numOr(h.wins)}-{numOr(h.losses)}
                </div>
              </Row>
            ))
          ) : (
            <EmptyState>No career history yet.</EmptyState>
          )}
        </div>
      </div>
    </>
  );
}

export function HotSeats({ d }: { d: DashboardData }) {
  const list = (d.coach && d.coach.hotSeats) || [];
  const myTeamName = d.team && d.team.TEAM_NAME;
  if (!list.length) return <EmptyState>No hot seat data yet — populated starting Week 2.</EmptyState>;
  const cols = '1fr 1fr 60px';
  return (
    <div className="table primary">
      <Thead cols={cols}>
        <div style={{ textAlign: 'left' }}>Team</div>
        <div style={{ textAlign: 'left' }}>Coach</div>
        <div>Security</div>
      </Thead>
      {list.map((c, i) => {
        const color = c.security >= 70 ? '#5FA467' : c.security >= 35 ? 'var(--accent)' : '#C0555A';
        return (
          <Row key={i} cols={cols} first={i === 0} mine={isMineFn(myTeamName, c.team)}>
            <div className="truncate" style={{ fontWeight: 500 }}>
              {c.team}
            </div>
            <div className="truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {c.coach}
            </div>
            <div className="right tabular" style={{ fontSize: 12, fontWeight: 600, color }}>
              {numOr(c.security)}%
            </div>
          </Row>
        );
      })}
    </div>
  );
}

/**
 * Port of renderCoachMoves(). Not wired into the tab router in the original
 * either (Coaching Corner only ever showed "My Coach" / "Hot Seats" —
 * Master Spec v3 confirms "Moves" was cut). Kept for parity, unused.
 */
export function CoachMoves({ d }: { d: DashboardData }) {
  const list = (d.coach && d.coach.moves) || [];
  if (!list.length) return <EmptyState>No coaching moves yet.</EmptyState>;
  const cols = '1fr 1fr 1fr';
  return (
    <div className="table primary">
      <Thead cols={cols}>
        <div style={{ textAlign: 'left' }}>Coach</div>
        <div>Old School</div>
        <div>New School</div>
      </Thead>
      {list.map((m, i) => (
        <Row key={i} cols={cols} first={i === 0}>
          <div className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>
            {m.coach}
          </div>
          <div className="center truncate" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {m.oldTeam}
          </div>
          <div className="center truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
            {m.newTeam}
          </div>
        </Row>
      ))}
    </div>
  );
}
