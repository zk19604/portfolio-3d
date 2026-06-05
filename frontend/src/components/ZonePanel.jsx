import { AnimatePresence, motion } from 'framer-motion'
import ComputerScreen from './ComputerScreen'

// ─── Portfolio data (mirrored from root data.tsx) ─────────────────────────────

const EXPERIENCE = [
  {
    role: 'Software Engineer Intern',
    company: 'AICE XPERT',
    duration: 'Jan 2026 – Apr 2026',
    bullets: [
      'Scaled a live B2B SaaS platform to 10K+ professionals — full-stack features using Next.js, Express, and Supabase.',
      'Built a real-time phone preview system with dynamic QR rendering supporting 20+ styles, gradients, and custom logos.',
      'Developed a cross-platform analytics pipeline tracking user interactions (taps, geo, devices) to support growth and upsell.',
      'Engineered 10+ RESTful APIs enabling seamless frontend-backend integration in an Agile team.',
    ],
  },
  {
    role: 'Database Teaching Assistant',
    company: 'FAST – NUCES Lahore',
    duration: 'Jan 2026 – May 2026',
    bullets: [
      'Supported a database course for 50+ students with academic and technical guidance.',
      'Evaluated assignments and quizzes while providing constructive feedback.',
      'Taught core concepts: SQL, normalization, ER diagrams, relational design.',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'Infotech',
    duration: 'Jul 2025 – Aug 2025',
    bullets: [
      'Architected and developed 5+ microservices using Spring Boot following SOLID principles.',
      'Implemented service discovery with Netflix Eureka for dynamic routing and fault tolerance.',
      'Designed an API Gateway centralizing 10+ endpoints, improving security and observability.',
    ],
  },
]

const PROJECTS = [
  {
    title: 'ResuFlow: AI-Powered CV-to-Portfolio Pipeline',
    description: 'End-to-end AI pipeline transforming unstructured CVs into deployed portfolio websites. Gemini API for data extraction, Vercel API for one-click hosting, Level H QR codes.',
    tags: ['React', 'Node.js', 'MongoDB', 'Gemini API', 'Vercel API'],
    metrics: 'Full-Stack · 2026',
    github: 'https://github.com/zk19604/resuflow',
    demo: 'https://resuflow-three.vercel.app',
  },
  {
    title: 'Android Housing Service App',
    description: 'Solo Android app in Java with Firebase Auth & Realtime Database. Cloudinary for image storage, Gemini API for intelligent property search and recommendations.',
    tags: ['Java', 'Android', 'Firebase', 'Cloudinary', 'Gemini API'],
    metrics: 'Solo · Dec 2025',
    github: '',
  },
  {
    title: 'Mood Based Music Library System',
    description: 'Web app recommending and auto-adding songs to playlists based on mood. Built with Node.js and SQL Server, Spotify API and Gemini GPT for recommendations.',
    tags: ['Node.js', 'SQL Server', 'Spotify API', 'Gemini GPT'],
    metrics: 'Team · Apr 2025',
    github: 'https://github.com/zk19604/dropthedb',
  },
  {
    title: 'Sudoku Game (Assembly Language)',
    description: 'Functional Sudoku in x86 8088 assembly. Modular screen rendering and direct video memory manipulation for efficient console gameplay.',
    tags: ['Assembly', 'x86 8088', 'Low-Level'],
    metrics: 'Systems · Nov 2024',
    github: 'https://github.com/zk19604/sudoku-game',
  },
]

const EDUCATION = [
  {
    degree: "Bachelor's in Computer Science",
    institution: 'FAST – NUCES, Lahore',
    year: '2023 – 2027',
    gpa: '3.74',
    highlights: ["Dean's List 2023–2025"],
  },
  {
    degree: 'A-Levels — Science',
    institution: 'SLC',
    year: '2021 – 2023',
    gpa: '4.0',
    highlights: [
      '4 A* grades (Maths, Physics, Biology, Chemistry)',
      '3rd in Punjab — Best Across 3 A-Level Subjects',
      'Top in Pakistan for Biology (O-Levels)',
    ],
  },
]

const SKILL_GROUPS = [
  { label: 'Languages',   items: ['Python', 'SQL', 'C++', 'JavaScript', 'Java', 'Assembly'] },
  { label: 'Frameworks',  items: ['React', 'Next.js', 'Spring Boot', 'Android Java', 'Node.js'] },
  { label: 'Database',    items: ['MySQL', 'PostgreSQL', 'Firebase'] },
  { label: 'Tools',       items: ['Git', 'Postman', 'Vercel'] },
  { label: 'AI / APIs',   items: ['Gemini AI', 'Spotify API', 'REST APIs'] },
]

// ─── Panel components ─────────────────────────────────────────────────────────

function HomePanel({ onAsk, isLoading }) {
  return (
    <div className="zp-home">
      <div className="zp-home-header">
        <span className="zp-tag" style={{ color: '#39ff14', borderColor: '#39ff14' }}>HQ — TERMINAL</span>
        <p className="zp-home-hint">Ask me anything about my work</p>
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
      <h2 className="zp-title" style={{ color: '#00f3ff' }}>Experience</h2>
      <div className="zp-list">
        {EXPERIENCE.map((job, i) => (
          <div key={i} className="zp-card" style={{ borderColor: 'rgba(0,243,255,0.25)' }}>
            <div className="zp-card-header">
              <span className="zp-card-title" style={{ color: '#00f3ff' }}>{job.role}</span>
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
      <h2 className="zp-title" style={{ color: '#00ff88' }}>Projects</h2>
      <div className="zp-list">
        {PROJECTS.map((proj, i) => (
          <div key={i} className="zp-card" style={{ borderColor: 'rgba(0,255,136,0.25)' }}>
            <div className="zp-card-header">
              <span className="zp-card-title" style={{ color: '#00ff88' }}>{proj.title}</span>
              <span className="zp-card-meta">{proj.metrics}</span>
            </div>
            <p className="zp-card-desc">{proj.description}</p>
            <div className="zp-tags">
              {proj.tags.map((t) => (
                <span key={t} className="zp-chip" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00ff88' }}>{t}</span>
              ))}
            </div>
            {(proj.github || proj.demo) && (
              <div className="zp-links">
                {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="zp-link" style={{ color: '#00ff88' }}>GitHub ↗</a>}
                {proj.demo   && <a href={proj.demo}   target="_blank" rel="noreferrer" className="zp-link" style={{ color: '#00ff88' }}>Demo ↗</a>}
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
      <h2 className="zp-title" style={{ color: '#aa44ff' }}>Education</h2>
      <div className="zp-list">
        {EDUCATION.map((edu, i) => (
          <div key={i} className="zp-card" style={{ borderColor: 'rgba(170,68,255,0.25)' }}>
            <div className="zp-card-header">
              <span className="zp-card-title" style={{ color: '#aa44ff' }}>{edu.degree}</span>
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
      <h2 className="zp-title" style={{ color: '#ff8800' }}>Tech Stack</h2>
      <div className="zp-skill-grid">
        {SKILL_GROUPS.map((group) => (
          <div key={group.label} className="zp-skill-group" style={{ borderColor: 'rgba(255,136,0,0.2)' }}>
            <span className="zp-skill-label" style={{ color: '#ff8800' }}>{group.label}</span>
            <div className="zp-skill-items">
              {group.items.map((item) => (
                <span key={item} className="zp-chip" style={{ borderColor: 'rgba(255,136,0,0.4)', color: '#ff8800' }}>{item}</span>
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
