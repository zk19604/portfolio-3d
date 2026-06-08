import { ZONES } from '../zones'

// ─── World map fast-travel overlay ────────────────────────────────────────────────
// Opens when the central 3D WORLD MAP is clicked. Pick a zone to warp to.
export default function WorldMapPanel({ activeZone, onTravel, onClose }) {
  const go = (name) => { onTravel(name); onClose() }

  return (
    <div className="wmap-overlay" onClick={onClose}>
      <div className="wmap" onClick={(e) => e.stopPropagation()}>
        <div className="wmap-bar">
          <span className="wmap-title">WORLD MAP</span>
          <button className="wmap-x" onClick={onClose} aria-label="Close map">X</button>
        </div>

        <p className="wmap-sub">&gt; SELECT A DESTINATION_</p>

        <div className="wmap-grid">
          {/* central HQ */}
          <button className="wmap-hq" style={{ gridColumn: 2, gridRow: 2 }} onClick={onClose}>HQ</button>

          {ZONES.map((z) => {
            // place each zone on the cross around HQ using its world direction
            const dirX = Math.sign(z.position[0])
            const dirZ = Math.sign(z.position[2])
            const col = 2 + dirX // 1..3
            const row = 2 + dirZ // 1..3
            return (
              <button
                key={z.name}
                className={`wmap-zone${activeZone === z.name ? ' is-active' : ''}`}
                style={{ '--c': z.color, gridColumn: col, gridRow: row }}
                onClick={() => go(z.name)}
              >
                {z.title}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
