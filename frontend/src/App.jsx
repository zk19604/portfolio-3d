import { useState, useCallback } from 'react'
import Scene from './components/Scene'
import DirectionControls from './components/DirectionControls'
import ZonePanel from './components/ZonePanel'
import { useCharacterMovement } from './hooks/useCharacterMovement'

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeZone, setActiveZone] = useState(null)

  const { targetPosition, targetZone, setDirection } = useCharacterMovement()

  const handleArrive = useCallback((zoneName) => {
    setActiveZone(zoneName)
  }, [])

  // AI question pipeline — swap setTimeout for real /api/ask fetch
  const handleAskQuestion = useCallback((question, onResponse) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onResponse(
        `Query: "${question}". ` +
        `In production this comes from the Gemini RAG pipeline at /api/ask. ` +
        `Connect the backend and swap this setTimeout for a real fetch call.`
      )
    }, 2500)
  }, [])

  return (
    <div className="app-root">
      {/* 3D canvas — full-bleed background */}
      <Scene
        targetPosition={targetPosition}
        targetZone={targetZone}
        onArrive={handleArrive}
      />

      {/* Zone content panel — right-side overlay */}
      <ZonePanel
        activeZone={activeZone}
        onAsk={handleAskQuestion}
        isLoading={isLoading}
      />

      {/* D-pad + zone HUD — above everything */}
      <DirectionControls onDirection={setDirection} activeZone={activeZone} />
    </div>
  )
}
