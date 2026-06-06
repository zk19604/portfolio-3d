import { useState, useCallback, useRef } from 'react'
import Scene from './components/Scene'
import DirectionControls from './components/DirectionControls'
import EnterPrompt from './components/EnterPrompt'
import Minimap from './components/Minimap'
import ContactCard from './components/ContactCard'
import { usePlayerControls } from './hooks/useCharacterMovement'
import { ZONE_LABELS } from './zones'

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeZone, setActiveZone] = useState(null)
  const [nearZone, setNearZone]     = useState(null)
  const [chatOpen, setChatOpen]     = useState(false)

  const nearRef = useRef(null)
  const playerPosRef = useRef({ x: 0, z: 0 })
  const travelRef = useRef({ zone: null, n: 0 })

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

  const handleAskQuestion = useCallback((question, onResponse) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onResponse(
        `Query: "${question}". ` +
        `In production this comes from the Gemini RAG pipeline at /api/ask. ` +
        `Connect the backend and swap this setTimeout for a real fetch call.`
      )
    }, 2000)
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
        chatOpen={chatOpen}
        onAsk={handleAskQuestion}
        isLoading={isLoading}
        onCloseChat={() => setChatOpen(false)}
      />

      <Minimap playerPosRef={playerPosRef} activeZone={activeZone} onTravel={travelTo} />

      <EnterPrompt nearZone={nearZone} activeZone={activeZone} label={ZONE_LABELS[activeZone ?? nearZone]} />

      <DirectionControls nearZone={nearZone} activeZone={activeZone} />

      {/* floating chat toggle — bottom-left */}
      <button
        className={`chat-fab${chatOpen ? ' is-open' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <span className="chat-fab-ico">💬</span>
        <span className="chat-fab-text">{chatOpen ? 'Close chat' : 'Chat with me'}</span>
      </button>

      {/* floating contact — bottom-right */}
      <ContactCard />
    </div>
  )
}
