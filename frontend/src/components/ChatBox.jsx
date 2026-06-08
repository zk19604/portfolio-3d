import { useState, useRef, useEffect } from 'react'

// ─── Pixel computer chat ─────────────────────────────────────────────────────────
// A cute retro CRT computer that pops up bottom-left. Talks to the same
// onAsk(question, onResponse) pipeline.
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
    <div className="pc" onPointerDown={(e) => e.stopPropagation()}>
      <div className="pc-monitor">
        <div className="pc-bar">
          <span className="pc-bar-title">ASK-ZAINAB.EXE</span>
          {onClose && <button className="pc-bar-x" onClick={onClose} aria-label="Close chat">X</button>}
        </div>

        <div className="pc-screen" ref={scroller}>
          {history.length === 0 && (
            <p className="pc-hello">&gt; HI! ASK ME ANYTHING ABOUT MY PROJECTS, SKILLS OR EXPERIENCE_</p>
          )}
          {history.map((m, i) => (
            <div key={i} className={`pc-msg pc-msg--${m.role}`}>
              <span className="pc-msg-tag">{m.role === 'user' ? 'YOU' : 'ZK'}</span>
              {m.text}
            </div>
          ))}
          {isLoading && <div className="pc-msg pc-msg--ai pc-typing">ZK: thinking...</div>}
        </div>

        <form className="pc-form" onSubmit={submit}>
          <span className="pc-prompt">&gt;</span>
          <input
            className="pc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE HERE"
            autoFocus
          />
          <button className="pc-send" type="submit" disabled={isLoading}>SEND</button>
        </form>
      </div>

      {/* computer base / stand */}
      <div className="pc-neck" />
      <div className="pc-stand" />
    </div>
  )
}
