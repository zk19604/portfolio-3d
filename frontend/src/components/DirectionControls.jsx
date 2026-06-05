import { useEffect, useState } from 'react'
import { ZONES } from '../hooks/useCharacterMovement'

// Map keyboard codes to direction strings for the active-key highlight
const KEY_DIR_MAP = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  Escape:     'home',
}

// Grid cell placement for the cross shape
// Each button gets a CSS grid-area name
const BUTTONS = [
  { dir: 'up',    gridArea: 'up',     arrow: '▲', zone: ZONES.up    },
  { dir: 'left',  gridArea: 'left',   arrow: '◄', zone: ZONES.left  },
  { dir: 'home',  gridArea: 'center', arrow: '⌂', zone: null        },
  { dir: 'right', gridArea: 'right',  arrow: '►', zone: ZONES.right },
  { dir: 'down',  gridArea: 'down',   arrow: '▼', zone: ZONES.down  },
]

export default function DirectionControls({ onDirection, activeZone }) {
  const [keyPressed, setKeyPressed] = useState(null)

  // Mirror keyboard presses as visual highlights on the D-pad
  useEffect(() => {
    const onDown = (e) => {
      const dir = KEY_DIR_MAP[e.code]
      if (dir) setKeyPressed(dir)
    }
    const onUp = () => setKeyPressed(null)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  const handlePress = (dir) => {
    setKeyPressed(dir)
    onDirection(dir)
    setTimeout(() => setKeyPressed(null), 200)
  }

  // Resolve the display label for the active zone
  const zoneLabel = activeZone
    ? Object.values(ZONES).find(z => z.name === activeZone)?.label ?? activeZone
    : 'HQ — Computer'

  return (
    <div className="controls-root">

      {/* Zone HUD — top-center indicator */}
      <div className="zone-hud">
        <span className="zone-hud-bracket">[</span>
        <span className="zone-hud-name">{zoneLabel}</span>
        <span className="zone-hud-bracket">]</span>
      </div>

      {/* D-pad overlay — bottom-center */}
      <div className="dpad-wrap">
        <p className="dpad-hint">Arrow keys &nbsp;·&nbsp; tap to navigate</p>

        <div className="dpad" role="group" aria-label="Navigation controls">
          {BUTTONS.map(({ dir, gridArea, arrow, zone }) => {
            const isActive = keyPressed === dir
            return (
              <button
                key={dir}
                className={`dpad-btn dpad-btn--${gridArea}${isActive ? ' dpad-btn--active' : ''}`}
                style={{ gridArea }}
                onPointerDown={(e) => { e.preventDefault(); handlePress(dir) }}
                aria-label={zone ? `${zone.label} Zone` : 'Return to HQ'}
                aria-pressed={activeZone === (zone?.name ?? null)}
              >
                <span className="dpad-arrow">{arrow}</span>
                {zone && (
                  <span className="dpad-label">{zone.label.slice(0, 3).toUpperCase()}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
