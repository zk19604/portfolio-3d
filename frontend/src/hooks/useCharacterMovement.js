import { useState, useEffect, useCallback } from 'react'

// ─── Zone definitions ──────────────────────────────────────────────────────────
// y: -1 keeps the character on the floor plane throughout all zones.

export const ZONES = {
  up:    { position: [0,    -1, -5],  name: 'experience', label: 'Experience'  },
  down:  { position: [0,    -1,  5],  name: 'techstack',  label: 'Tech Stack'  },
  left:  { position: [-6,   -1,  0],  name: 'projects',   label: 'Projects'    },
  right: { position: [ 6,   -1,  0],  name: 'education',  label: 'Education'   },
  home:  { position: [-2.5, -1,  0],  name: null,         label: 'HQ'          },
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCharacterMovement() {
  const [targetPosition, setTargetPosition] = useState(ZONES.home.position)
  const [targetZone, setTargetZone] = useState(null)

  const setDirection = useCallback((dir) => {
    const zone = ZONES[dir] ?? ZONES.home
    setTargetPosition(zone.position)
    setTargetZone(zone.name)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowUp':
          e.preventDefault()
          setDirection('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          setDirection('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          setDirection('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          setDirection('right')
          break
        case 'Escape':
          e.preventDefault()
          setDirection('home')
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setDirection])

  return { targetPosition, targetZone, setDirection }
}
