import { PRESETS } from '@/lib/gating';
import type { DashboardData } from '@/lib/types';

export interface ColorState {
  name: string;
  primary: string;
  secondary: string;
}

export default function ColorPicker({
  data,
  colors,
  onClose,
  onChange,
}: {
  data: DashboardData;
  colors: ColorState;
  onClose: () => void;
  onChange: (c: ColorState) => void;
}) {
  function resetTeamColors() {
    const team = data.team || ({} as NonNullable<DashboardData['team']>);
    onChange({ name: 'Team Colors', primary: team.PRIMARY_COLOR || PRESETS[0].primary, secondary: team.SECONDARY_COLOR || PRESETS[0].secondary });
  }
  function pickPreset(name: string) {
    const p = PRESETS.find((p) => p.name === name);
    if (p) onChange(p);
  }
  function customColorChange(which: 'primary' | 'secondary', val: string) {
    onChange({ ...colors, [which]: val, name: 'Custom' });
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>Team Colors</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <button className={`preset-btn ${colors.name === 'Team Colors' ? 'active' : ''}`} onClick={resetTeamColors}>
          <span className="swatch-pair">
            <span className="swatch" style={{ background: data.team ? data.team.PRIMARY_COLOR : '#333' }} />
            <span className="swatch" style={{ background: data.team ? data.team.SECONDARY_COLOR : '#333' }} />
          </span>
          <span style={{ flex: 1 }}>Team Colors (from Master Control)</span>
        </button>
        {PRESETS.map((p) => (
          <button key={p.name} className={`preset-btn ${colors.name === p.name ? 'active' : ''}`} onClick={() => pickPreset(p.name)}>
            <span className="swatch-pair">
              <span className="swatch" style={{ background: p.primary }} />
              <span className="swatch" style={{ background: p.secondary }} />
            </span>
            <span style={{ flex: 1 }}>{p.name}</span>
          </button>
        ))}
        <div className="small-label" style={{ marginTop: 8 }}>
          Or Enter Custom Hex
        </div>
        <div className="hex-inputs">
          <input
            key={'p-' + colors.name}
            placeholder="#Primary"
            defaultValue={colors.name === 'Custom' ? colors.primary : ''}
            onBlur={(e) => customColorChange('primary', e.target.value)}
          />
          <input
            key={'s-' + colors.name}
            placeholder="#Secondary"
            defaultValue={colors.name === 'Custom' ? colors.secondary : ''}
            onBlur={(e) => customColorChange('secondary', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
