import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONTACT_LINKS } from '../portfolioData'

// ─── Contact me ──────────────────────────────────────────────────────────────────
// Floating button, bottom-right. Click → contact details pop up.
export default function ContactCard() {
  const [open, setOpen] = useState(false)

  return (
    <div className="contact-root">
      <AnimatePresence>
        {open && (
          <motion.div
            className="contact-pop"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="contact-pop-head">
              <span>LET'S CONNECT</span>
              <button className="contact-x" onClick={() => setOpen(false)} aria-label="Close">X</button>
            </div>
            <div className="contact-links">
              {CONTACT_LINKS.map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="contact-link">
                  <span className="contact-ico">{c.icon}</span>
                  <span className="contact-meta">
                    <strong>{c.label}</strong>
                    <small>{c.value}</small>
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className={`contact-btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Contact me"
      >
        {open ? 'CLOSE' : 'CONTACT ME'}
      </button>
    </div>
  )
}
