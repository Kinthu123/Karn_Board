import puppeteer from 'puppeteer'
import fs from 'fs'

const BASE = 'http://localhost:5174'
const OUT = './paper_screenshots'

const MOCK_USER = JSON.stringify({
  id: 'user-1', name: 'Thu Rein Htet', initials: 'TH', color: '#7C3AED',
  skills: ['Frontend', 'Design'], joinedAt: Date.now() - 864000000,
})

const now = Date.now()
const BOARD_1_ID = 'board-001'

const MOCK_BOARDS = JSON.stringify([{
  id: BOARD_1_ID, name: 'KarnBoard Web App', createdAt: now - 432000000,
  xp: 185, streakCount: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayDate: new Date().toISOString().split('T')[0], todayDoneCount: 2,
  phase: 'BUILDING', description: 'A gamified retro-pixel Kanban web app.', shared: false,
  tasks: [
    { id: 't1', title: 'Design pixel UI system', description: 'Color tokens and typography scale', priority: 'high', column: 'done', dueDate: '2026-04-20', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: now - 3600000, xpEarned: 50 },
    { id: 't2', title: 'Kanban drag-and-drop', description: 'Use @dnd-kit for sortable columns', priority: 'high', column: 'done', dueDate: '2026-04-22', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: now - 7200000, xpEarned: 50 },
    { id: 't3', title: 'XP & gamification system', description: 'XP values, levels, streak logic', priority: 'high', column: 'inprogress', dueDate: '2026-04-27', assigneeId: 'user-1', assigneeName: 'Thu Rein Htet', assigneeInitials: 'TH', assigneeColor: '#7C3AED', completedAt: null, xpEarned: 0 },
    { id: 't4', title: 'Multi-project board support', description: 'Boards array, active board switching', priority: 'medium', column: 'inprogress', dueDate: '2026-04-28', assigneeId: null, completedAt: null, xpEarned: 0 },
    { id: 't5', title: 'Activity feed component', priority: 'medium', column: 'todo', dueDate: '2026-04-30', assigneeId: null, completedAt: null, xpEarned: 0 },
    { id: 't6', title: 'Mobile responsive layout', priority: 'low', column: 'todo', dueDate: '2026-05-02', assigneeId: null, completedAt: null, xpEarned: 0 },
    { id: 't7', title: 'Write IEEE paper', priority: 'medium', column: 'todo', dueDate: '2026-05-05', assigneeId: null, completedAt: null, xpEarned: 0 },
  ],
  members: [
    { id: 'm1', name: 'Zaw Lin', initials: 'ZL', color: '#F97316' },
    { id: 'm2', name: 'Kyaw Thu', initials: 'KT', color: '#14B8A6' },
  ],
  pendingInvites: [], notes: '', messages: [], moodboard: [], activity: [],
}])

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate((u, b, id) => {
    localStorage.setItem('karnboard_user_v1', u)
    localStorage.setItem('karnboard_boards_v1', b)
    localStorage.setItem('karnboard_active_v1', id)
  }, MOCK_USER, MOCK_BOARDS, BOARD_1_ID)
  await page.reload({ waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1500))

  // Click first project card to enter workspace
  const clicked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'))
    for (const el of all) {
      if (el.children.length === 0 && el.textContent?.includes('KarnBoard Web App')) {
        el.closest('button, [role="button"], div[class*="cursor"]')?.click()
        return true
      }
    }
    // fallback: click anything with that text
    for (const el of all) {
      if (el.tagName === 'BUTTON' || el.style?.cursor === 'pointer') {
        if (el.textContent?.includes('KarnBoard Web App')) { el.click(); return true }
      }
    }
    return false
  })
  console.log('Clicked project:', clicked)
  await new Promise(r => setTimeout(r, 1000))

  // Now click the Board tab — find button whose trimmed text is exactly "Board"
  const boardClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    for (const b of btns) {
      const t = b.textContent?.trim()
      if (t === 'Board' || t === 'BOARD' || t.includes('Board')) {
        b.click()
        return b.textContent
      }
    }
    // log all button texts for debug
    return 'FAIL: ' + btns.map(b => JSON.stringify(b.textContent?.trim())).join(', ')
  })
  console.log('Board click result:', boardClicked)
  await new Promise(r => setTimeout(r, 1200))

  await page.screenshot({ path: `${OUT}/3_kanban_board.png` })
  console.log('✓ 3_kanban_board.png')

  await browser.close()
})()
