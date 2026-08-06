'use client';

import { useState } from 'react';
import type { DashboardData, Content as ContentType } from '@/lib/types';
import EmptyState from '@/components/shared/EmptyState';

const ICONS: Record<string, string> = { podcast: '🎙️', social: '📱', newspaper: '📰', headlines: '📢' };

/**
 * Port of renderContent()/toggleContent(). Never wired into the tab router
 * in JavaScript.html either — TABS has no 'content' entry, matching Master
 * Spec v3's "No standalone Content tab — its data now lives on Home."
 * Ported for parity only.
 */
export default function Content({ d, subtab }: { d: DashboardData; subtab: string | null }) {
  const key = (subtab || 'podcast') as keyof ContentType;
  const items = (d.content && d.content[key]) || [];
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (!items.length) return <EmptyState>No {key} content generated yet this week.</EmptyState>;

  return (
    <div className="stack-sm">
      {items.map((c, i) => {
        const itemKey = key + '-' + i;
        const open = openKey === itemKey;
        return (
          <div
            className="card content-item"
            key={i}
            onClick={() => setOpenKey(open ? null : itemKey)}
          >
            <div className="content-item-head">
              <span style={{ fontSize: 16 }}>{ICONS[key] || '📄'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{key}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.headline}</div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{open ? '▲' : '▼'}</span>
            </div>
            {open ? (
              <div className="content-body">
                {c.subHeadline || ''}
                {c.link ? (
                  <>
                    <br />
                    <br />
                    <a href={c.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)' }}>
                      Open full content →
                    </a>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
