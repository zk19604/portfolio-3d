import { useState, useEffect, useRef } from 'react'

export default function ComputerScreen({ onAsk, isLoading }) {
  const [input, setInput] = useState('')
  const [dotCount, setDotCount] = useState(1)
  const [history, setHistory] = useState([])
  const inputRef = useRef(null)
  const responseRef = useRef(null)

  // Animate the thinking dots — only active while isLoading
  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 1 : prev + 1))
    }, 420)
    return () => clearInterval(timer)
  }, [isLoading])

  // Auto-scroll response area on new content
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [history, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setHistory((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')

    // onAsk accepts (question, onResponse) — App resolves the response via callback
    onAsk(trimmed, (response) => {
      setHistory((prev) => [...prev, { role: 'ai', text: response }])
    })
  }

  const thinkingStr = 'Thinking' + '.'.repeat(dotCount)

  return (
    <div className="terminal-container">
      {/* Scanlines overlay — rendered as a child div so z-index stacking is clean */}
      <div className="terminal-scanlines" aria-hidden="true" />
      <div className="terminal-vignette" aria-hidden="true" />

      <div className="terminal-inner">

        {/* Status bar */}
        <div className="terminal-statusbar">
          <span className="terminal-dot terminal-dot--red" />
          <span className="terminal-dot terminal-dot--yellow" />
          <span className="terminal-dot terminal-dot--green" />
          <span className="terminal-statusbar-title">
            ZAINAB.AI TERMINAL &nbsp;v1.0.0 &nbsp;[CONNECTED]
          </span>
        </div>

        {/* Boot greeting */}
        <div className="terminal-greeting">
          <span className="terminal-prompt-symbol">&gt;</span>
          &nbsp;Hello! I&rsquo;m Zainab&rsquo;s Portfolio AI
        </div>
        <div className="terminal-subgreeting">
          <span className="terminal-prompt-symbol">&gt;</span>
          &nbsp;Ask about her skills, projects, or experience.
        </div>

        <div className="terminal-divider" />

        {/* Scrollable response history */}
        <div className="terminal-history" ref={responseRef}>
          {history.map((entry, i) => (
            <div
              key={i}
              className={
                entry.role === 'user'
                  ? 'terminal-history-user'
                  : 'terminal-history-ai'
              }
            >
              {entry.role === 'user' ? (
                <>
                  <span className="terminal-prompt-symbol">&gt;&gt;</span>
                  &nbsp;{entry.text}
                </>
              ) : (
                <>
                  <span className="terminal-ai-tag">[AI]</span>
                  &nbsp;{entry.text}
                </>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="terminal-thinking">
              <span className="terminal-prompt-symbol">&gt;</span>
              &nbsp;{thinkingStr}
            </div>
          )}
        </div>

        {/* Input row */}
        <form className="terminal-input-row" onSubmit={handleSubmit}>
          <span className="terminal-prompt-label">
            guest@zainab-portfolio:~$
          </span>
          <input
            ref={inputRef}
            className="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type your question…"
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            className="terminal-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            Execute
          </button>
        </form>

        {/* Blinking cursor line */}
        <div className="terminal-cursor-row">
          <span className="terminal-cursor-block" />
        </div>

      </div>
    </div>
  )
}
