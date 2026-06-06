import { ZONE_LABELS } from '../zones'

// Top-center status indicator. (The on-screen D-pad was removed — movement is
// keyboard WASD/arrows, and islands are clickable / fast-travel via the minimap.)
export default function DirectionControls({ nearZone, activeZone }) {
  const hudLabel = activeZone
    ? `Inside · ${ZONE_LABELS[activeZone]}`
    : nearZone
      ? `At · ${ZONE_LABELS[nearZone]}`
      : 'Roaming'

  return (
    <div className="controls-root">
      <div className="zone-hud">
        <span className="zone-hud-bracket">[</span>
        <span className="zone-hud-name">{hudLabel}</span>
        <span className="zone-hud-bracket">]</span>
      </div>
    </div>
  )
}
