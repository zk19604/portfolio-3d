import { AnimatePresence, motion } from 'framer-motion'

// GTA-style centre prompt. Shows "Press E to enter X" when standing on an
// island. Once you've entered, no prompt is shown — you just walk away to leave.
export default function EnterPrompt({ nearZone, activeZone, label }) {
  const show = !activeZone && nearZone

  return (
    <div className="enter-prompt-shell">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={'enter' + (label ?? '')}
            className="enter-prompt"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <kbd className="enter-key">E</kbd>
            <span>
              Enter <strong>{label}</strong>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
