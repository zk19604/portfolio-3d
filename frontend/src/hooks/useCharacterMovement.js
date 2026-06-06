import { useRef, useEffect } from 'react'

// Maps a keyboard code to a movement axis flag on the shared keys ref.
// f = forward (−Z, away from camera), b = back, l = left (−X), r = right (+X)
const MOVE_KEYS = {
  ArrowUp: 'f',    KeyW: 'f',
  ArrowDown: 'b',  KeyS: 'b',
  ArrowLeft: 'l',  KeyA: 'l',
  ArrowRight: 'r', KeyD: 'r',
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
// Returns a stable `keysRef` that the 3D Character reads every frame, plus wires
// up the GTA-style interaction keys:
//   E / Enter → onInteract  (enter the nearby island)
//   Escape    → onExit      (leave the current island)
export function usePlayerControls({ onInteract, onExit }) {
  const keysRef = useRef({ f: 0, b: 0, l: 0, r: 0 })

  // Keep the latest callbacks without re-subscribing the listeners each render.
  const cbRef = useRef({ onInteract, onExit })
  useEffect(() => {
    cbRef.current = { onInteract, onExit }
  }, [onInteract, onExit])

  useEffect(() => {
    // Ignore movement keys while the user is typing in a field (e.g. the chat box).
    const isTyping = () => {
      const el = document.activeElement
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
    }

    const handleDown = (e) => {
      if (isTyping()) return
      const axis = MOVE_KEYS[e.code]
      if (axis) {
        e.preventDefault()
        keysRef.current[axis] = 1
        return
      }
      if (e.repeat) return
      if (e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault()
        cbRef.current.onInteract?.()
      } else if (e.code === 'Escape') {
        e.preventDefault()
        cbRef.current.onExit?.()
      }
    }

    const handleUp = (e) => {
      const axis = MOVE_KEYS[e.code]
      if (axis) keysRef.current[axis] = 0
    }

    // Releasing focus (alt-tab etc.) would otherwise leave a key "stuck" on.
    const clear = () => { keysRef.current = { f: 0, b: 0, l: 0, r: 0 } }

    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return keysRef
}
