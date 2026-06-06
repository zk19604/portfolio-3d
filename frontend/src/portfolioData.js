// ─── Portfolio data (mirrored from root data.tsx) ─────────────────────────────
// Single source for both the right-side ZonePanel and the in-world 3D boards.

export const EXPERIENCE = [
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

export const PROJECTS = [
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

export const EDUCATION = [
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

export const CONTACT_LINKS = [
  { label: 'Email',    value: 'zainab19604khalil@gmail.com', href: 'mailto:zainab19604khalil@gmail.com', icon: '✉' },
  { label: 'GitHub',   value: 'github.com/zk19604',          href: 'https://github.com/zk19604',          icon: '⌥' },
  { label: 'LinkedIn', value: 'linkedin.com/in/zainabkhalil', href: 'https://www.linkedin.com/in/zainab-khalil-332b1831b/', icon: 'in' },
]

export const SKILL_GROUPS = [
  { label: 'Languages',   items: ['Python', 'SQL', 'C++', 'JavaScript', 'Java', 'Assembly'] },
  { label: 'Frameworks',  items: ['React', 'Next.js', 'Spring Boot', 'Android Java', 'Node.js'] },
  { label: 'Database',    items: ['MySQL', 'PostgreSQL', 'Firebase'] },
  { label: 'Tools',       items: ['Git', 'Postman', 'Vercel'] },
  { label: 'AI / APIs',   items: ['Gemini AI', 'Spotify API', 'REST APIs'] },
]
