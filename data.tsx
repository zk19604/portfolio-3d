
export interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
  gpa?: string;
  highlights: string[];
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  metrics?: string;
  github?: string;
  demo?: string;
  featured?: boolean;
}

export interface SkillGroup {
  label: string;
  items: string[];
  span?: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  type: string;
  duration: string;
  location: string;
  bullets: string[];
  current?: boolean;
}

export interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: string;
}

// ==========================================
// DATA ARRAYS
// ==========================================

export const EDUCATION: Education[] = [
  {
    degree: 'Bachelors',
    field: 'Computer Science',
    institution: 'FAST - NUCES, Lahore',
    year: '2023 – 2027',
    gpa: '3.74',
    highlights: [
      "Dean’s List 2023-2025"
    ],
  },
  {
    degree: 'Alevels',
    field: 'Science',
    institution: 'SLC',
    year: '2021 – 2023',
    gpa: '4.0',
    highlights: [
      "Grades : 4 A*",
      "Subjects : Maths, Physics, Biology, Chemistry",
      "3rd Position in Punjab for Best Across 3 A-Level Subjects",
      "Top in Pakistan for Biology (OLevels)"
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    title: "ResuFlow: AI-Powered CV-to-Portfolio Pipeline",
    description: "Designed and developed an end-to-end AI-powered pipeline to transform unstructured CV data into fully deployed portfolio websites. Built a structured data extraction engine using Gemini API to convert free-form text into validated JSON schemas, automated deployment workflows via Vercel APIs for one-click hosting, and integrated high-reliability QR code generation (Level H) for seamless sharing and accessibility.",
    tags: [
      "React",
      "Node.js",
      "MongoDB",
      "Gemini API",
      "Vercel API",
      "AI",
      "Automation",
      "Full Stack"
    ],
    metrics: "Full-Stack AI Project · 2026",
    featured: true,
    github: "https://github.com/zk19604/resuflow",
    demo: "https://resuflow-three.vercel.app"
  },
  {
    title: "Android Housing Service App",
    description: "Developed a solo Android housing application in Java using Firebase Authentication and Realtime Database for secure user accounts and property listing management. Integrated Cloudinary for image storage and Gemini API for enhanced property search and recommendations with a clean, user-friendly interface.",
    tags: [
      "Java",
      "Android",
      "Firebase",
      "Realtime Database",
      "Cloudinary",
      "Gemini API",
    ],
    metrics: "Solo Project · Dec 2025",
    featured: true,
    github: "",
    demo: ""
  },
  {
    title: "Mood Based Music Library System",
    description: "Web application that recommends and auto-adds songs to playlists based on user mood. Built in a 3-person team using Node.js and SQL Server with Spotify API integration and Gemini GPT for intelligent music recommendations.",
    tags: ["Node.js", "SQL Server", "Spotify API", "Gemini GPT", "JavaScript"],
    metrics: "Team Project · Apr 2025",
    github: "https://github.com/zk19604/dropthedb",
  },
  {
    title: "Sudoku Game (Assembly Language)",
    description: "Created a functional Sudoku game using x86 8088 assembly language. Implemented modular screen rendering and direct video memory manipulation for efficient console-based gameplay.",
    tags: ["Assembly", "x86 8088", "Low-Level Programming"],
    metrics: "Low-Level Systems Project · Nov 2024",
    github: "https://github.com/zk19604/sudoku-game",
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  { label: 'Languages', items: ['Python', 'SQL', 'C++', 'JavaScript', 'Java', 'Assembly Language'], span: '' },
  { label: 'Database', items: ['MySQL', 'PostgreSQL', 'Firebase'], span: '' },
  { label: 'Deployment', items: ['Vercel'], span: '' },
  { label: 'Frameworks', items: ['React', 'Next.js', 'Spring Boot', 'Android Java', 'Node.js'], span: '' },
  { label: 'Tools', items: ['Git', 'Postman'], span: '' },
  { label: 'Other', items: ['Rest APIs', 'Gemini AI integration', 'Spotify API'], span: '' },
];

export const EXPERIENCE: WorkExperience[] = [
  {
    role: 'Software Engineer Intern',
    company: 'AICE XPERT',
    type: 'Internship',
    duration: 'Jan 2026 - Apr 2026',
    location: 'Pakistan',
    current: false,
    bullets: [
      'Scaled a live B2B SaaS platform to 10K+ professionals by contributing full-stack features using Next.js, Express, and Supabase.',
      'Built a real-time phone preview system with dynamic QR rendering supporting 20+ styles, gradients, and custom logos.',
      'Developed a cross-platform analytics pipeline tracking user interactions (taps, geo-location, devices, clicks) to support product growth and upsell strategies.',
      'Engineered 10+ RESTful APIs enabling seamless integration between frontend components and backend services in an Agile team.'
    ]
  },
  {
    role: 'Database Teaching Assistant',
    company: 'FAST - NUCES Lahore',
    type: 'Part-time',
    duration: 'Jan 2026 - May 2026',
    location: 'Pakistan',
    current: false,
    bullets: [
      'Supported the delivery of a database course for 50+ students by assisting with academic and technical guidance.',
      'Evaluated assignments, quizzes, and coursework while providing constructive feedback to improve student performance.',
      'Helped students understand core database concepts including SQL, normalization, ER diagrams, and relational database design.',
      'Collaborated with the course instructor to maintain grading standards and ensure smooth course operations.'
    ]
  },
  {
    role: 'Software Engineer Intern',
    company: 'Infotech',
    type: 'Internship',
    duration: 'Jul 2025 - Aug 2025',
    location: 'Lahore, Pakistan',
    current: false,
    bullets: [
      'Architected and developed 5+ microservices using Spring Boot following SOLID principles and clean architecture.',
      'Implemented service discovery with Netflix Eureka for dynamic routing and fault-tolerant communication.',
      'Designed and integrated an API Gateway to centralize 10+ endpoints, improving system security, observability, and scalability.'
    ]
  }
];

export const CONTACT_LINKS: ContactLink[] = [
  { label: 'Email', value: 'zainab19604khalil@gmail.com', href: 'mailto:zainab19604khalil@gmail.com', icon: 'EnvelopeIcon' },
  { label: 'GitHub', value: 'github.com/zk19604', href: 'https://github.com/zk19604', icon: 'CodeBracketIcon' },
  { label: 'LinkedIn', value: 'linkedin.com/in/zainabkhalil', href: 'https://www.linkedin.com/in/zainab-khalil-332b1831b/', icon: 'UserIcon' },
];