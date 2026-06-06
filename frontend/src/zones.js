// ─── Shared zone definitions ────────────────────────────────────────────────────
// Single source of truth for island name / title / colour / world position.
// Imported by Scene (3D), Minimap (HUD), App + DirectionControls (labels).
export const ZONES = [
  { name: 'experience', title: 'EXPERIENCE', label: 'Experience', color: '#ff5fa2', position: [0,   0, -20] },
  { name: 'projects',   title: 'PROJECTS',   label: 'Projects',   color: '#21d3a2', position: [-20, 0,   0] },
  { name: 'education',  title: 'EDUCATION',  label: 'Education',  color: '#9a72ff', position: [20,  0,   0] },
  { name: 'techstack',  title: 'TECH STACK', label: 'Tech Stack', color: '#ffab2e', position: [0,   0,  20] },
]

export const ZONE_POS    = Object.fromEntries(ZONES.map((z) => [z.name, z.position]))
export const ZONE_LABELS = Object.fromEntries(ZONES.map((z) => [z.name, z.label]))

// World scale — kept here so the minimap and scene stay in sync.
export const WORLD_RADIUS = 30 // how far the player may roam from centre
