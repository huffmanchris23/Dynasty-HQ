import type { CSSProperties, ReactNode } from 'react';

/** Port of the `<div class="row ${i===0?'first':''} ${isMine?'mine':''}" style="grid-template-columns:...">` pattern. */
export function Row({ cols, first = false, mine = false, children }: { cols: string; first?: boolean; mine?: boolean; children: ReactNode }) {
  const className = ['row', first ? 'first' : '', mine ? 'mine' : ''].filter(Boolean).join(' ');
  const style: CSSProperties = { gridTemplateColumns: cols };
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

/** Port of the `<div class="thead primary" style="grid-template-columns:...">` header row. */
export function Thead({ cols, children }: { cols: string; children: ReactNode }) {
  const style: CSSProperties = { gridTemplateColumns: cols };
  return (
    <div className="thead primary" style={style}>
      {children}
    </div>
  );
}
