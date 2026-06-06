import { useState, useRef, useEffect } from 'react'

// ─── Floating chat box ───────────────────────────────────────────────────────────
// Rendered above the character's head (via drei <Html>) and/or toggled by the
// bottom chat button. Talks to the same onAsk(question, onResponse) pipeline.
export default function ChatBox({ onAsk, isLoading, onClose }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const scroller = useRef(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [history, isLoading])

  const submit = (e) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || isLoading) return
    setHistory((h) => [...h, { role: 'user', text: q }])
    setInput('')
    onAsk(q, (response) => setHistory((h) => [...h, { role: 'ai', text: response }]))
  }

  return (
    <div className="chatbox" onPointerDown={(e) => e.stopPropagation()}>
      <div className="chatbox-beak" />
      <div className="chatbox-head">
        <span className="chatbox-avatar">🌸</span>
        <span className="chatbox-title">Ask Zainab</span>
        {onClose && <button className="chatbox-x" onClick={onClose} aria-label="Close chat">✕</button>}
      </div>

      <div className="chatbox-body" ref={scroller}>
        {history.length === 0 && (
          <p className="chatbox-hello">Hi! Ask me anything about my projects, skills, or experience ♡</p>
        )}
        {history.map((m, i) => (
          <div key={i} className={`chatbox-msg chatbox-msg--${m.role}`}>{m.text}</div>
        ))}
        {isLoading && <div className="chatbox-msg chatbox-msg--ai chatbox-typing">typing…</div>}
      </div>

      <form className="chatbox-form" onSubmit={submit}>
        <input
          className="chatbox-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question…"
          autoFocus
        />
        <button className="chatbox-send" type="submit" disabled={isLoading}>➤</button>
      </form>
    </div>
  )
}
