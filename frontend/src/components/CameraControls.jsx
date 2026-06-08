import { useRef, useState, useEffect, useCallback } from 'react'

// ─── Camera view dial ─────────────────────────────────────────────────────────────
// A circular control: drag the knob around the ring to orbit the camera around
// the character; tap the centre to cycle zoom presets. Writes to the shared
// cameraViewRef that FollowCamera reads each frame. [ and ] also rotate.
const PRESETS = [
  { name: '3/4',   radius: 8,   height: 4.6 },
  { name: 'FAR',   radius: 13,  height: 7.2 },
  { name: 'TOP',   radius: 2.5, height: 12  },
  { name: 'CLOSE', radius: 5,   height: 3.2 },
]

export default function CameraControls({ viewRef }) {
  const dialRef = useRef(null)
  const dragging = useRef(false)
  const [ang, setAng] = useState(-Math.PI / 2) // handle angle (top = behind)
  const [idx, setIdx] = useState(0)

  // screen angle of the pointer relative to the dial centre → camera yaw
  const update = useCallback((clientX, clientY) => {
    const el = dialRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = clientX - (r.left + r.width / 2)
    const dy = clientY - (r.top + r.height / 2)
    const a = Math.atan2(dy, dx)
    setAng(a)
    viewRef.current.yaw = -(a + Math.PI / 2)
  }, [viewRef])

  useEffect(() => {
    const move = (e) => { if (dragging.current) { update(e.clientX, e.clientY) } }
    const up = () => { dragging.current = false }
    const key = (e) => {
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.code === 'BracketLeft') { setAng((p) => p - 0.35); viewRef.current.yaw += 0.35 }
      else if (e.code === 'BracketRight') { setAng((p) => p + 0.35); viewRef.current.yaw -= 0.35 }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('keydown', key)
    }
  }, [viewRef, update])

  const cycle = () => {
    const n = (idx + 1) % PRESETS.length
    setIdx(n)
    viewRef.current.radius = PRESETS[n].radius
    viewRef.current.height = PRESETS[n].height
  }

  const kx = 50 + Math.cos(ang) * 38
  const ky = 50 + Math.sin(ang) * 38

  return (
    <div
      ref={dialRef}
      className="camdial"
      onPointerDown={(e) => { dragging.current = true; update(e.clientX, e.clientY) }}
    >
      <div className="camdial-track" />
      <div className="camdial-knob" style={{ left: `${kx}%`, top: `${ky}%` }} />
      <button
        className="camdial-center"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={cycle}
        aria-label={`Camera distance: ${PRESETS[idx].name}`}
      />
    </div>
  )
}
