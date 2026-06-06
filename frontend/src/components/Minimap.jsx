import { useEffect, useRef } from 'react'
import { ZONES } from '../zones'

// ─── Minimap HUD ─────────────────────────────────────────────────────────────────
// Player-centred radar for the infinite world: the blip stays in the middle and
// the island markers move relative to the player (clamped to the rim like a
// compass when far away). Markers are clickable → fast-travel.
const SIZE = 168
const R = SIZE / 2
const VIEW = 28              // world units from centre to rim
const RIM = R - 16           // px from centre to rim
const scale = RIM / VIEW

export default function Minimap({ activeZone, onTravel, playerPosRef }) {
  const markers = useRef([])
  const hq = useRef(null)

  useEffect(() => {
    let raf
    const place = (el, wx, wz) => {
      if (!el) return
      const p = playerPosRef.current
      let dx = (wx - p.x) * scale
      let dz = (wz - p.z) * scale
      const m = Math.hypot(dx, dz)
      if (m > RIM) { dx = (dx / m) * RIM; dz = (dz / m) * RIM } // clamp to rim
      el.style.transform = `translate(-50%,-50%) translate(${dx}px, ${dz}px)`
    }
    const tick = () => {
      ZONES.forEach((z, i) => place(markers.current[i], z.position[0], z.position[2]))
      place(hq.current, 0, 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playerPosRef])

  return (
    <div className="minimap" style={{ width: SIZE, height: SIZE }}>
      <div className="minimap-grid" />
      <div className="minimap-ring" />
      <span className="minimap-title">MAP · click to travel</span>

      <div ref={hq} className="minimap-hq" title="HQ" />

      {ZONES.map((z, i) => (
        <button
          key={z.name}
          ref={(el) => (markers.current[i] = el)}
          className={`minimap-isle${activeZone === z.name ? ' is-active' : ''}`}
          style={{ '--c': z.color }}
          onClick={() => onTravel(z.name)}
          title={z.label}
        >
          <span className="minimap-isle-label">{z.label}</span>
        </button>
      ))}

      {/* player blip — fixed centre */}
      <div className="minimap-blip" />
    </div>
  )
}
