import { AnimatePresence, motion } from 'framer-motion'
import ComputerScreen from './ComputerScreen'
import { EXPERIENCE, PROJECTS, EDUCATION, SKILL_GROUPS } from '../portfolioData'

// ─── Panel components ─────────────────────────────────────────────────────────

function HomePanel({ onAsk, isLoading }) {
  return (
    <div className="zp-home">
      <div className="zp-home-header">
        <span className="zp-tag" style={{ color: '#ff7fb0', borderColor: '#ff7fb0' }}>HQ — CHAT</span>
        <p className="zp-home-hint">Ask me anything about my work ♡</p>
      </div>
      <div className="zp-terminal-wrap">
        <ComputerScreen onAsk={onAsk} isLoading={isLoading} />
      </div>
    </div>
  )
}

function ExperiencePanel() {
  return (
    <div className="zp-content">
      <h2 className="zp-title" style={{ color: '#ff7fb0' }}>Experience</h2>
      <div className="zp-list">
        {EXPERIENCE.map((job, i) => (
          <div key={i} className="zp-card" style={{ borderColor: 'rgba(255,127,176,0.4)' }}>
            <div className="zp-card-header">
              <span className="zp-card-title" style={{ color: '#ff7fb0' }}>{job.role}</span>
              <span className="zp-card-meta">{job.company} · {job.duration}</span>
            </div>
            <ul className="zp-bullets">
              {job.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsPanel() {
  return (
    <div className="zp-content">
      <h2 className="zp-title" style={{ color: '#2bb386' }}>Projects</h2>
      <div className="zp-list">
        {PROJECTS.map((proj, i) => (
          <div key={i} className="zp-card" style={{ borderColor: 'rgba(63,199,154,0.4)' }}>
            <div className="zp-card-header">
              <span className="zp-card-title" style={{ color: '#2bb386' }}>{proj.title}</span>
              <span className="zp-card-meta">{proj.metrics}</span>
            </div>
            <p className="zp-card-desc">{proj.description}</p>
            <div className="zp-tags">
              {proj.tags.map((t) => (
                <span key={t} className="zp-chip" style={{ borderColor: 'rgba(63,199,154,0.5)', color: '#2bb386' }}>{t}</span>
              ))}
            </div>
            {(proj.github || proj.demo) && (
              <div className="zp-links">
                {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="zp-link" style={{ color: '#2bb386' }}>GitHub ↗</a>}
                {proj.demo   && <a href={proj.demo}   target="_blank" rel="noreferrer" className="zp-link" style={{ color: '#2bb386' }}>Demo ↗</a>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EducationPanel() {
  return (
    <div className="zp-content">
      <h2 className="zp-title" style={{ color: '#8b73e0' }}>Education</h2>
      <div className="zp-list">
        {EDUCATION.map((edu, i) => (
          <div key={i} className="zp-card" style={{ borderColor: 'rgba(154,134,232,0.4)' }}>
            <div className="zp-card-header">
              <span className="zp-card-title" style={{ color: '#8b73e0' }}>{edu.degree}</span>
              <span className="zp-card-meta">{edu.institution} · {edu.year}</span>
            </div>
            {edu.gpa && <p className="zp-card-gpa">GPA: <strong>{edu.gpa}</strong></p>}
            <ul className="zp-bullets">
              {edu.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function TechStackPanel() {
  return (
    <div className="zp-content">
      <h2 className="zp-title" style={{ color: '#e0921c' }}>Tech Stack</h2>
      <div className="zp-skill-grid">
        {SKILL_GROUPS.map((group) => (
          <div key={group.label} className="zp-skill-group" style={{ borderColor: 'rgba(224,146,28,0.35)' }}>
            <span className="zp-skill-label" style={{ color: '#e0921c' }}>{group.label}</span>
            <div className="zp-skill-items">
              {group.items.map((item) => (
                <span key={item} className="zp-chip" style={{ borderColor: 'rgba(224,146,28,0.5)', color: '#e0921c' }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Zone → component map
const PANEL_MAP = {
  null:        HomePanel,
  experience:  ExperiencePanel,
  projects:    ProjectsPanel,
  education:   EducationPanel,
  techstack:   TechStackPanel,
}

// ─── ZonePanel ────────────────────────────────────────────────────────────────
export default function ZonePanel({ activeZone, onAsk, isLoading }) {
  const key   = activeZone ?? 'null'
  const Panel = PANEL_MAP[key] ?? HomePanel

  return (
    <div className="zone-panel-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          className="zone-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Panel onAsk={onAsk} isLoading={isLoading} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
