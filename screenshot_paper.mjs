import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const OUT = './paper_screenshots'
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT)

const BASE = 'http://localhost:5174'

const MOCK_USER = JSON.stringify({
  id: 'user-1',
  name: 'Thu Rein Htet',
  initials: 'TH',
  color: '#7C3AED',
  skills: ['Frontend', 'Design'],
  joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
})

const now = Date.now()
const BOARD_1_ID = 'board-001'
const BOARD_2_ID = 'board-002'

const MOCK_BOARDS = JSON.stringify([
  {
    id: BOARD_1_ID,
    name: 'KarnBoard Web App',
    createdAt: now - 1000 * 60 * 60 * 24 * 5,
    xp: 185,
    streakCount: 4,
    lastActiveDate: new Date().toISOString().split('T')[0],
    todayDate: new Date().toISOString().split('T')[0],
    todayDoneCount: 2,
    phase: 'BUILDING',
    description: 'A gamified retro-pixel Kanban web app for team project management.',
    shared: false,
    tasks: [
      { id: 't1', title: 'Design pixel UI system', description: 'Create color tokens and typography scale', priority: 'high', column: 'done', dueDate: '2026-04-20', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: now - 3600000, xpEarned: 50 },
      { id: 't2', title: 'Implement Kanban drag-and-drop', description: 'Use @dnd-kit for sortable columns', priority: 'high', column: 'done', dueDate: '2026-04-22', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: now - 7200000, xpEarned: 50 },
      { id: 't3', title: 'XP & gamification system', description: 'XP values, level formula, streak logic', priority: 'high', column: 'inprogress', dueDate: '2026-04-27', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: null, xpEarned: 0 },
      { id: 't4', title: 'Multi-project board support', description: 'Boards array, active board switching', priority: 'medium', column: 'inprogress', dueDate: '2026-04-28', assigneeId: null, completedAt: null, xpEarned: 0 },
      { id: 't5', title: 'Activity feed component', description: 'Log task completions, phase changes', priority: 'medium', column: 'todo', dueDate: '2026-04-30', assigneeId: null, completedAt: null, xpEarned: 0 },
      { id: 't6', title: 'Mobile responsive layout', description: 'Bottom tab bar for mobile screens', priority: 'low', column: 'todo', dueDate: '2026-05-02', assigneeId: null, completedAt: null, xpEarned: 0 },
      { id: 't7', title: 'Write IEEE paper', description: 'Document system design and usability results', priority: 'medium', column: 'todo', dueDate: '2026-05-05', assigneeId: null, completedAt: null, xpEarned: 0 },
    ],
    members: [
      { id: 'm1', name: 'Zaw Lin', initials: 'ZL', color: '#F97316' },
      { id: 'm2', name: 'Kyaw Thu', initials: 'KT', color: '#14B8A6' },
    ],
    pendingInvites: [],
    notes: '',
    messages: [
      { id: 'msg1', userId: 'user-1', name: 'Thu Rein Htet', initials: 'TH', color: '#7C3AED', text: "Board is live! Let's get moving 🚀", ts: now - 1000 * 60 * 80 },
      { id: 'msg2', userId: 'm1', name: 'Zaw Lin', initials: 'ZL', color: '#F97316', text: 'Added the first batch of tasks to the board.', ts: now - 1000 * 60 * 60 },
      { id: 'msg3', userId: 'm2', name: 'Kyaw Thu', initials: 'KT', color: '#14B8A6', text: 'Who is picking up the design work?', ts: now - 1000 * 60 * 40 },
      { id: 'msg4', userId: 'user-1', name: 'Thu Rein Htet', initials: 'TH', color: '#7C3AED', text: 'On it — starting today.', ts: now - 1000 * 60 * 20 },
    ],
    moodboard: [
      { id: 'mb1', text: 'Keep it pixel-perfect', color: '#F6E05E20', createdAt: now - 3600000 },
      { id: 'mb2', text: 'Ship fast, iterate', color: '#4A7C5920', createdAt: now - 1800000 },
    ],
    activity: [
      { id: 'a1', actorName: 'Thu Rein Htet', actorInitials: 'TH', actorColor: '#7C3AED', text: 'completed "Design pixel UI system"', ts: now - 3600000 },
      { id: 'a2', actorName: 'Thu Rein Htet', actorInitials: 'TH', actorColor: '#7C3AED', text: 'completed "Implement Kanban drag-and-drop"', ts: now - 7200000 },
      { id: 'a3', actorName: 'Zaw Lin', actorInitials: 'ZL', actorColor: '#F97316', text: 'joined the project', ts: now - 86400000 },
    ],
  },
  {
    id: BOARD_2_ID,
    name: 'Study Tracker',
    createdAt: now - 1000 * 60 * 60 * 24 * 2,
    xp: 60,
    streakCount: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    todayDate: new Date().toISOString().split('T')[0],
    todayDoneCount: 1,
    phase: 'PLANNING',
    description: 'Track daily study sessions and assignments.',
    shared: false,
    tasks: [
      { id: 'st1', title: 'Finish IEEE paper draft', priority: 'high', column: 'inprogress', dueDate: '2026-05-01', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: null, xpEarned: 0 },
      { id: 'st2', title: 'Review related works', priority: 'medium', column: 'done', dueDate: '2026-04-25', completedAt: now - 3600000, xpEarned: 25 },
      { id: 'st3', title: 'Prepare presentation slides', priority: 'medium', column: 'todo', dueDate: '2026-05-05', completedAt: null, xpEarned: 0 },
    ],
    members: [],
    pendingInvites: [],
    notes: '',
    messages: [],
    moodboard: [],
    activity: [
      { id: 'sa1', actorName: 'Thu Rein Htet', actorInitials: 'TH', actorColor: '#7C3AED', text: 'completed "Review related works"', ts: now - 3600000 },
    ],
  },
])

async function injectStorage(page) {
  await page.evaluate((user, boards, activeId) => {
    localStorage.setItem('karnboard_user_v1', user)
    localStorage.setItem('karnboard_boards_v1', boards)
    localStorage.setItem('karnboard_active_v1', activeId)
  }, MOCK_USER, MOCK_BOARDS, BOARD_1_ID)
}

async function shot(page, name, delay = 600) {
  await new Promise(r => setTimeout(r, delay))
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`✓ ${name}.png`)
}

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  // ── 1. Projects List ──────────────────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await injectStorage(page)
  await page.reload({ waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1500))
  await shot(page, '1_projects_list')

  // ── 2. Project Workspace (Space tab) ──────────────────────────────────
  // Click the first project card
  await page.evaluate(() => {
    const cards = document.querySelectorAll('button, div[class*="cursor-pointer"]')
    for (const c of cards) {
      if (c.textContent?.includes('KarnBoard Web App')) { c.click(); break }
    }
  })
  await new Promise(r => setTimeout(r, 800))
  await shot(page, '2_workspace_space')

  // ── 3. Board (Kanban) view ─────────────────────────────────────────────
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const b = btns.find(b => b.textContent?.trim() === 'Board' || b.textContent?.includes('BOARD'))
    b?.click()
  })
  await new Promise(r => setTimeout(r, 800))
  await shot(page, '3_kanban_board')

  // ── 4. Task card close-up (scroll into view) ───────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, '4_kanban_board_top', 400)

  // ── 5. Group Chat view ────────────────────────────────────────────────
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const b = btns.find(b => b.textContent?.includes('Chat') || b.textContent?.includes('CHAT'))
    b?.click()
  })
  await new Promise(r => setTimeout(r, 800))
  await shot(page, '5_group_chat')

  // ── 6. Explore view ────────────────────────────────────────────────────
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const b = btns.find(b => b.textContent?.trim() === 'EXPLORE')
    b?.click()
  })
  await new Promise(r => setTimeout(r, 800))
  await shot(page, '6_explore')

  // ── 7. Profile modal ──────────────────────────────────────────────────
  await page.evaluate(() => {
    // click back to PROJECT first
    const btns = Array.from(document.querySelectorAll('button'))
    const b = btns.find(b => b.textContent?.trim() === 'PROJECT')
    b?.click()
  })
  await new Promise(r => setTimeout(r, 500))
  await page.evaluate(() => {
    // click avatar (TH button)
    const btns = Array.from(document.querySelectorAll('button'))
    const b = btns.find(b => b.textContent?.trim() === 'TH')
    b?.click()
  })
  await new Promise(r => setTimeout(r, 600))
  await shot(page, '7_profile_modal')

  await browser.close()
  console.log('\nAll screenshots saved to', OUT)
})()
