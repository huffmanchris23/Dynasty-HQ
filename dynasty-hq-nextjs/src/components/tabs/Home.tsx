'use client';

import { useState } from 'react';
import type { DashboardData } from '@/lib/types';
import { gateInfo } from '@/lib/gating';
import { initials, toPct, favoriteLine, numOr } from '@/lib/format';
import SectionLabel from '@/components/shared/SectionLabel';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';

/* ---------------- renderTeamPreview ---------------- */

function TeamPreview({ d }: { d: DashboardData }) {
  const p = d.preseasonPreview || ({} as DashboardData['preseasonPreview']);
  return (
    <>
      <div>
        <SectionLabel>Preseason Ratings</SectionLabel>
        <div className="grid-3">
          <div className="card">
            <div className="stat-label">Overall</div>
            <div className="stat-value">{numOr(p.overall)}</div>
          </div>
          <div className="card">
            <div className="stat-label">Offense</div>
            <div className="stat-value">{numOr(p.offense)}</div>
          </div>
          <div className="card">
            <div className="stat-label">Defense</div>
            <div className="stat-value">{numOr(p.defense)}</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <SectionLabel>Preseason Honors</SectionLabel>
        <div className="grid-2">
          <div className="card">
            <div className="stat-label">All-Americans (Off / Def)</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              {numOr(p.aaOffense, 0)} / {numOr(p.aaDefense, 0)}
            </div>
          </div>
          <div className="card">
            <div className="stat-label">All-Conference (Off / Def)</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              {numOr(p.acOffense, 0)} / {numOr(p.acDefense, 0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- renderHomeContent ---------------- */

function NewsList({ title, items }: { title: string; items: { headline: any; subHeadline?: any }[] }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="stack-sm">
        {items.length ? (
          items.map((n, i) => (
            <div className="card news-card" key={i}>
              <div className="news-thumb">📰</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="news-headline">{n.headline}</div>
                {n.subHeadline ? <div className="news-snip">{n.subHeadline}</div> : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState>No stories yet this week.</EmptyState>
        )}
      </div>
    </div>
  );
}

function PodcastCard({ d }: { d: DashboardData }) {
  const podcast = (d.content && d.content.podcast) || [];
  return (
    <div>
      <SectionLabel>Podcast</SectionLabel>
      {podcast.length ? (
        podcast.map((p, i) => (
          <div className="card news-card" key={i}>
            <div className="news-thumb">🎙️</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="news-headline">{p.headline}</div>
              {p.subHeadline ? <div className="news-snip">{p.subHeadline}</div> : null}
            </div>
          </div>
        ))
      ) : (
        <EmptyState>No episode posted yet this week.</EmptyState>
      )}
    </div>
  );
}

function HomeContent({ d }: { d: DashboardData }) {
  return (
    <>
      <NewsList title="Team Storyline" items={d.content ? (d.content.newspaper || []).slice(0, 1) : []} />
      <NewsList title="National Headlines" items={d.content ? (d.content.headlines || []).slice(0, 3) : []} />
      <PodcastCard d={d} />
    </>
  );
}

/* ---------------- renderStoryBrief / copyStoryBrief ---------------- */

function fallbackCopy(text: string, cb: () => void) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {
    /* no-op, mirrors original's empty catch */
  }
  document.body.removeChild(ta);
  cb();
}

function StoryBrief({ d }: { d: DashboardData }) {
  const items = d.storyBrief || [];
  const [label, setLabel] = useState('Copy Brief for Claude');
  if (!items.length) return null;

  function copyStoryBrief() {
    const lines = [`${d.settings.currentDataSheet} — Story Brief (${d.team ? d.team.TEAM_NAME : ''})`, ''];
    items.forEach((s) => lines.push(`[${s.tag}] ${s.text}`));
    const text = lines.join('\n');
    const done = () => {
      setLabel('Copied ✓');
      setTimeout(() => setLabel('Copy Brief for Claude'), 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  return (
    <div className="card accent">
      <SectionLabel>Weekly Story Brief</SectionLabel>
      <div className="stack-sm">
        {items.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span
              style={{
                flexShrink: 0,
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 700,
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: 999,
                padding: '2px 7px',
                marginTop: 1,
              }}
            >
              {s.tag}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{s.text}</span>
          </div>
        ))}
      </div>
      <button
        onClick={copyStoryBrief}
        style={{
          marginTop: 10,
          width: '100%',
          padding: 8,
          borderRadius: 4,
          border: '1px solid var(--accent)',
          background: 'transparent',
          color: 'var(--accent)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    </div>
  );
}

/* ---------------- renderHome ---------------- */

function LeaderCard({ label, l }: { label: string; l: { name: any; yards: any; td: any } | undefined }) {
  return (
    <div className="card center">
      <div className="stat-label">{label}</div>
      <div className="stat-name">{l ? l.name : '—'}</div>
      <div className="stat-sub">{l ? `${numOr(l.yards)} YDS · ${numOr(l.td)} TD` : ''}</div>
    </div>
  );
}

export default function Home({ d }: { d: DashboardData }) {
  const g = gateInfo(d);
  const contentBlock = <HomeContent d={d} />;

  if (g.isLocked) {
    return (
      <>
        <StoryBrief d={d} />
        <TeamPreview d={d} />
        <div style={{ marginTop: 16 }}>{contentBlock}</div>
      </>
    );
  }

  const leaders = (d.recap && d.recap.leaders) || ({} as DashboardData['recap']['leaders']);
  const passing = leaders.passing;
  const rushing = (leaders.rushing || [])[0];
  const receiving = (leaders.receiving || [])[0];

  const preview = d.preview;
  let nextGameCard: React.ReactNode = null;
  let predictorCard: React.ReactNode = null;

  if (preview) {
    const myTeamAbbr = initials(preview.myTeam, 3);
    const oppAbbr = initials(preview.oppTeam, 3);
    const compare = preview.compare || {};
    const myRecW = compare.WIN ? compare.WIN.mine : '';
    const myRecL = compare.LOSS ? compare.LOSS.mine : '';
    const oppRecW = compare.WIN ? compare.WIN.opp : '';
    const oppRecL = compare.LOSS ? compare.LOSS.opp : '';
    const spread = favoriteLine(compare, 'SPREAD', preview.myTeam, preview.oppTeam);
    const total = compare.OVER_UNDER ? compare.OVER_UNDER.mine : '—';
    const ml = favoriteLine(compare, 'MONEYLINE', preview.myTeam, preview.oppTeam);
    const wpMineRaw = compare.WIN_PROBABILITY ? toPct(compare.WIN_PROBABILITY.mine) : null;
    const wpOppRaw = compare.WIN_PROBABILITY ? toPct(compare.WIN_PROBABILITY.opp) : null;
    const wpMine = wpMineRaw === null ? 50 : wpMineRaw;
    const wpOpp = wpOppRaw === null ? 50 : wpOppRaw;
    const myColor = (d.team && d.team.PRIMARY_COLOR) || 'var(--accent)';
    const oppColor = (d.opponent && d.opponent.PRIMARY_COLOR) || 'rgba(255,255,255,0.35)';

    nextGameCard = (
      <div className="card accent tight">
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          {preview.day} · {preview.date} · {preview.time} · {preview.location} · {preview.broadcast}
        </div>
        <div className="team-line">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge text={oppAbbr} size={28} />
            <span style={{ fontWeight: 600 }}>{preview.oppTeam}</span>
          </div>
          <span className="tabular" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {oppRecW}-{oppRecL}
          </span>
        </div>
        <div className="team-line">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge text={myTeamAbbr} size={28} mine />
            <span style={{ fontWeight: 600 }}>{preview.myTeam}</span>
          </div>
          <span className="tabular" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {myRecW}-{myRecL}
          </span>
        </div>
        <div className="grid-3" style={{ marginTop: 8, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Spread</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{spread}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Total</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{total}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>ML</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{ml}</div>
          </div>
        </div>
      </div>
    );

    predictorCard = (
      <div className="card primary">
        <SectionLabel>Win Probability</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge text={oppAbbr} size={22} />
            <b>{wpOpp.toFixed(1)}%</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b>{wpMine.toFixed(1)}%</b>
            <Badge text={myTeamAbbr} size={22} mine />
          </div>
        </div>
        <div className="wp-bar">
          <div style={{ width: `${Math.max(wpOpp - 1, 0)}%`, background: oppColor }} />
          <div style={{ width: '2%' }} />
          <div style={{ width: `${Math.max(wpMine - 1, 0)}%`, background: myColor }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          <span>{preview.oppTeam}</span>
          <span>{preview.myTeam}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <StoryBrief d={d} />
      <div className="grid-3">
        <LeaderCard label="Passing" l={passing || undefined} />
        <LeaderCard label="Rushing" l={rushing} />
        <LeaderCard label="Receiving" l={receiving} />
      </div>
      {nextGameCard}
      {predictorCard}
      <div style={{ marginTop: 16 }}>{contentBlock}</div>
    </>
  );
}
