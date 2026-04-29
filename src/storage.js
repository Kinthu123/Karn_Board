// ─── Board factory ────────────────────────────────────────────────

export function createBoard(name = 'My Project') {
  return {
    id:             crypto.randomUUID(),
    name,
    createdAt:      Date.now(),
    xp:             0,
    streakCount:    0,
    lastActiveDate: null,
    todayDate:      todayStr(),
    todayDoneCount: 0,
    tasks:          [],
    members:        [],
    pendingInvites: [],
    notes:          '',
    messages:       [],
    description:    '',
    activity:       [],
    phase:          'PLANNING',
    moodboard:      [],
    shared:         false,
  }
}

export const PHASES = ['PLANNING', 'BUILDING', 'REVIEW', 'SHIPPED']

export const PHASE_CONFIG = {
  PLANNING: { bg: 'bg-[#3B5BDB]/20', text: 'text-[#7B9CFF]',    border: 'border-[#3B5BDB]/40' },
  BUILDING: { bg: 'bg-yellow/20',    text: 'text-yellow',        border: 'border-yellow/40'    },
  REVIEW:   { bg: 'bg-purple/20',    text: 'text-purple-light',  border: 'border-purple/40'    },
  SHIPPED:  { bg: 'bg-green/20',     text: 'text-green-light',   border: 'border-green/40'     },
}

export const MOOD_COLORS = ['#F6E05E20', '#4A7C5920', '#7C3AED20', '#E05E5E20', '#3B82F620']

// ─── User factory ─────────────────────────────────────────────────

export function createUser({ id, name, color, skills }) {
  return {
    id:       id ?? crypto.randomUUID(),
    name,
    initials: initials(name),
    color,
    skills,
    joinedAt: Date.now(),
  }
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

// ─── Chat seed messages ───────────────────────────────────────────

const SEED_TEXTS = [
  "Board is live! Let's get moving 🚀",
  'Added the first batch of tasks to the board.',
  'Who is picking up the design work?',
  'On it — starting today.',
  'Should we set a weekly sync?',
]

export function seedMessages(board, user) {
  const all = [
    { id: user.id, name: user.name, initials: user.initials, color: user.color },
    ...(board.members ?? []),
  ]
  const now = Date.now()
  return SEED_TEXTS.map((text, i) => ({
    id:       crypto.randomUUID(),
    userId:   all[i % all.length].id,
    name:     all[i % all.length].name,
    initials: all[i % all.length].initials,
    color:    all[i % all.length].color,
    text,
    ts: now - (SEED_TEXTS.length - i) * 1000 * 60 * 40,
  }))
}

// ─── Helpers ──────────────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  const m    = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const XP_VALUES = { low: 10, medium: 25, high: 50 }

export const AVATAR_COLORS = [
  '#7C3AED', '#F6E05E', '#4A7C59', '#E05E5E',
  '#3B82F6', '#F97316', '#EC4899', '#14B8A6',
]

export const SKILLS = [
  'Frontend', 'Backend', 'Design', 'Product', 'Mobile',
  'DevOps', 'Data', 'AI/ML', 'Marketing', 'Writing',
]

export const COLUMNS = {
  todo:       { id: 'todo',       label: 'TO DO',       color: 'border-border'  },
  inprogress: { id: 'inprogress', label: 'IN PROGRESS', color: 'border-yellow'  },
  done:       { id: 'done',       label: 'DONE',        color: 'border-green'   },
}

export const COLUMN_ORDER = ['todo', 'inprogress', 'done']

// ─── Community mock data ──────────────────────────────────────────

export const COMMUNITY_PROJECTS = [
  {
    id: 'c1',
    name: 'PixelCraft UI Kit',
    description: 'Open-source retro pixel component library for React. We need designers and frontend devs.',
    tags: ['React', 'Design', 'Open Source'],
    openRoles: ['Frontend', 'Design'],
    members: [
      { initials: 'ZM', color: '#7C3AED' },
      { initials: 'AJ', color: '#F97316' },
      { initials: 'LK', color: '#14B8A6' },
      { initials: 'RS', color: '#EC4899' },
    ],
    progress: 62, totalTasks: 34, doneTasks: 21,
    owner: { name: 'Zara M.', initials: 'ZM', color: '#7C3AED' },
  },
  {
    id: 'c2',
    name: 'EcoTrack',
    description: 'Carbon footprint tracker with gamification. Looking for mobile devs and data scientists.',
    tags: ['Mobile', 'Data', 'Climate'],
    openRoles: ['Mobile', 'Data'],
    members: [
      { initials: 'KP', color: '#4A7C59' },
      { initials: 'TN', color: '#3B82F6' },
    ],
    progress: 28, totalTasks: 50, doneTasks: 14,
    owner: { name: 'Keiko P.', initials: 'KP', color: '#4A7C59' },
  },
  {
    id: 'c3',
    name: 'Collab Docs',
    description: 'Real-time collaborative markdown editor. Backend and DevOps help needed.',
    tags: ['Backend', 'DevOps', 'WebSockets'],
    openRoles: ['Backend', 'DevOps'],
    members: [
      { initials: 'MR', color: '#F6E05E' },
      { initials: 'SB', color: '#E05E5E' },
      { initials: 'CW', color: '#7C3AED' },
      { initials: 'DL', color: '#F97316' },
      { initials: 'YT', color: '#14B8A6' },
    ],
    progress: 81, totalTasks: 27, doneTasks: 22,
    owner: { name: 'Marco R.', initials: 'MR', color: '#F6E05E' },
  },
  {
    id: 'c4',
    name: 'LearnForge',
    description: 'Peer-to-peer skill exchange platform. Product, frontend, and UX designers welcome.',
    tags: ['Product', 'Frontend', 'EdTech'],
    openRoles: ['Product', 'Design', 'Frontend'],
    members: [
      { initials: 'NA', color: '#EC4899' },
      { initials: 'PO', color: '#3B82F6' },
      { initials: 'GH', color: '#14B8A6' },
    ],
    progress: 45, totalTasks: 40, doneTasks: 18,
    owner: { name: 'Nina A.', initials: 'NA', color: '#EC4899' },
  },
  {
    id: 'c5',
    name: 'ShipFast CLI',
    description: 'CLI tool to scaffold and deploy full-stack apps in one command. TypeScript + Go.',
    tags: ['DevOps', 'Backend', 'CLI'],
    openRoles: ['Backend', 'DevOps'],
    members: [
      { initials: 'JL', color: '#F97316' },
      { initials: 'OB', color: '#4A7C59' },
    ],
    progress: 55, totalTasks: 22, doneTasks: 12,
    owner: { name: 'James L.', initials: 'JL', color: '#F97316' },
  },
  {
    id: 'c6',
    name: 'StoryWeave',
    description: 'AI-assisted collaborative fiction writing platform.',
    tags: ['AI/ML', 'Writing', 'Design'],
    openRoles: ['Writing', 'Design', 'AI/ML'],
    members: [
      { initials: 'EM', color: '#7C3AED' },
      { initials: 'CH', color: '#EC4899' },
      { initials: 'FW', color: '#3B82F6' },
      { initials: 'IG', color: '#14B8A6' },
    ],
    progress: 38, totalTasks: 48, doneTasks: 18,
    owner: { name: 'Eva M.', initials: 'EM', color: '#7C3AED' },
  },
  {
    id: 'c7',
    name: 'BudgetBuddy',
    description: 'Personal finance tracker with social savings challenges.',
    tags: ['Mobile', 'Backend', 'FinTech'],
    openRoles: ['Mobile', 'Backend'],
    members: [
      { initials: 'RP', color: '#E05E5E' },
      { initials: 'HK', color: '#F6E05E' },
      { initials: 'VN', color: '#F97316' },
    ],
    progress: 70, totalTasks: 30, doneTasks: 21,
    owner: { name: 'Raj P.', initials: 'RP', color: '#E05E5E' },
  },
  {
    id: 'c8',
    name: 'OpenResume',
    description: 'Free, privacy-first resume builder. Frontend and design help needed for v2.',
    tags: ['Frontend', 'Design', 'Open Source'],
    openRoles: ['Frontend', 'Design'],
    members: [
      { initials: 'BI', color: '#14B8A6' },
      { initials: 'AD', color: '#4A7C59' },
      { initials: 'WF', color: '#7C3AED' },
      { initials: 'LY', color: '#3B82F6' },
      { initials: 'MK', color: '#EC4899' },
      { initials: 'TO', color: '#F97316' },
    ],
    progress: 90, totalTasks: 45, doneTasks: 41,
    owner: { name: 'Binta I.', initials: 'BI', color: '#14B8A6' },
  },
]
