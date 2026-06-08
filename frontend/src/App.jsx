import { useState, useCallback, useRef } from 'react'
import Scene from './components/Scene'
import DirectionControls from './components/DirectionControls'
import EnterPrompt from './components/EnterPrompt'
import Minimap from './components/Minimap'
import ContactCard from './components/ContactCard'
import ChatBox from './components/ChatBox'
import WorldMapPanel from './components/WorldMapPanel'
import CameraControls from './components/CameraControls'
import { usePlayerControls } from './hooks/useCharacterMovement'
import { ZONE_LABELS } from './zones'

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeZone, setActiveZone] = useState(null)
  const [nearZone, setNearZone]     = useState(null)
  const [chatOpen, setChatOpen]     = useState(false)
  const [mapOpen, setMapOpen]       = useState(false)

  const nearRef = useRef(null)
  const playerPosRef = useRef({ x: 0, z: 0 })
  const travelRef = useRef({ zone: null, n: 0 })
  const cameraViewRef = useRef({ yaw: 0, radius: 8, height: 4.6 })

  const handleNearChange = useCallback((zone) => {
    nearRef.current = zone
    setNearZone(zone)
  }, [])

  const enterZone = useCallback((zone) => {
    setActiveZone((prev) => prev ?? zone ?? nearRef.current ?? null)
  }, [])

  // Escape closes the chat first, otherwise leaves the current island.
  const handleExit = useCallback(() => {
    setChatOpen((open) => {
      if (open) return false
      setActiveZone(null)
      return open
    })
  }, [])

  const travelTo = useCallback((zone) => {
    if (!zone) return
    travelRef.current = { zone, n: travelRef.current.n + 1 }
    setActiveZone(zone)
  }, [])

  // Walking away from an island (any movement input while inside) leaves it.
  const leaveZone = useCallback(() => setActiveZone(null), [])

  const toggleChat = useCallback(() => setChatOpen((o) => !o), [])

  const keysRef = usePlayerControls({ onInteract: enterZone, onExit: handleExit })

  const handleAskQuestion = useCallback(async (question, onResponse) => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      onResponse(data.answer)
    } catch (err) {
      onResponse(`Sorry, I couldn't reach the brain right now (${err.message}). Make sure the backend is running on :8000.`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="app-root">
      <Scene
        keysRef={keysRef}
        activeZone={activeZone}
        onNearChange={handleNearChange}
        onSelectZone={travelTo}
        onLeaveZone={leaveZone}
        playerPosRef={playerPosRef}
        travelRef={travelRef}
        onModelClick={toggleChat}
        onOpenMap={() => setMapOpen(true)}
        cameraViewRef={cameraViewRef}
      />

      <Minimap playerPosRef={playerPosRef} activeZone={activeZone} onTravel={travelTo} />

      <EnterPrompt nearZone={nearZone} activeZone={activeZone} label={ZONE_LABELS[activeZone ?? nearZone]} />

      <DirectionControls nearZone={nearZone} activeZone={activeZone} />

      {/* camera view controls — right edge */}
      <CameraControls viewRef={cameraViewRef} />

      {/* pixel computer chat — bottom-left */}
      <div className="chat-dock">
        {chatOpen && (
          <ChatBox
            onAsk={handleAskQuestion}
            isLoading={isLoading}
            onClose={() => setChatOpen(false)}
          />
        )}
        <button
          className={`chat-fab${chatOpen ? ' is-open' : ''}`}
          onClick={toggleChat}
          aria-label="Open chat"
        >
          {chatOpen ? 'CLOSE' : 'CHAT WITH ME'}
        </button>
      </div>

      {/* floating contact — bottom-right */}
      <ContactCard />

      {/* world map fast-travel overlay */}
      {mapOpen && (
        <WorldMapPanel
          activeZone={activeZone}
          onTravel={travelTo}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  )
}
