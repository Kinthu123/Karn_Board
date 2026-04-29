import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { fetchProfile, upsertProfile, fetchBoards, createBoardInDB, syncBoard } from './lib/db'
import LoadingScreen from './components/LoadingScreen'
import AuthScreen from './components/AuthScreen'
import ProfileSetupScreen from './components/ProfileSetupScreen'
import CreateBoardScreen from './components/CreateBoardScreen'
import Dashboard from './components/Dashboard'
import { createBoard, createUser, todayStr, XP_VALUES } from './storage'

export default function App() {
  const [screen, setScreen]               = useState('loading')
  const [boards, setBoards]               = useState([])
  const [activeBoardId, setActiveBoardId] = useState(null)
  const [user, setUser]                   = useState(null)
  const activeBoardIdRef                  = useRef(null)
  const authUserRef                       = useRef(null)
  const syncTimerRef                      = useRef(null)

  const activeBoard = boards.find(b => b.id === activeBoardId) ?? null

  // ── Auth listener (keeps authUserRef current) ─────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authUserRef.current = session?.user ?? null
      // If session is lost (sign out), reset to auth screen
      if (!session && screen !== 'loading') {
        setBoards([])
        setActiveBoardId(null)
        activeBoardIdRef.current = null
        setUser(null)
        setScreen('auth')
      }
    })
    return () => subscription.unsubscribe()
  }, [screen])

  // ── Boot ──────────────────────────────────────────────────────────
  async function handleLoadComplete() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setScreen('auth'); return }

      authUserRef.current = session.user

      const profile = await fetchProfile(session.user.id)
      if (!profile) { setScreen('profile'); return }
      setUser(profile)

      const saved = await fetchBoards(session.user.id)
      if (!saved || saved.length === 0) { setScreen('create'); return }

      const refreshed = saved.map(b => {
        const next = refreshStreak(b)
        if (next !== b) syncBoard(next, session.user.id).catch(console.error)
        return next
      })
      setBoards(refreshed)
      setActiveBoardId(refreshed[0].id)
      activeBoardIdRef.current = refreshed[0].id
      setScreen('dashboard')
    } catch (err) {
      console.error('Boot error:', err)
      setScreen('auth')
    }
  }

  // ── Auth screen callback ──────────────────────────────────────────
  async function handleAuth(authUser) {
    authUserRef.current = authUser
    try {
      const profile = await fetchProfile(authUser.id)
      if (!profile) { setScreen('profile'); return }
      setUser(profile)

      const saved = await fetchBoards(authUser.id)
      if (!saved || saved.length === 0) { setScreen('create'); return }

      const refreshed = saved.map(b => refreshStreak(b))
      setBoards(refreshed)
      setActiveBoardId(refreshed[0].id)
      activeBoardIdRef.current = refreshed[0].id
      setScreen('dashboard')
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  // ── Profile setup ─────────────────────────────────────────────────
  async function handleCreateProfile(data) {
    const authUser = authUserRef.current
    if (!authUser) return

    const newUser = createUser({ ...data, id: authUser.id })
    await upsertProfile(newUser).catch(console.error)
    setUser(newUser)

    const saved = await fetchBoards(authUser.id).catch(() => [])
    if (!saved || saved.length === 0) {
      setScreen('create')
    } else {
      const refreshed = saved.map(b => refreshStreak(b))
      setBoards(refreshed)
      setActiveBoardId(refreshed[0].id)
      activeBoardIdRef.current = refreshed[0].id
      setScreen('dashboard')
    }
  }

  function handleUpdateUser(updater) {
    setUser(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      upsertProfile(next).catch(console.error)
      return next
    })
  }

  // ── Board creation ────────────────────────────────────────────────
  async function handleCreateBoard(name = 'My Project') {
    const authUser = authUserRef.current
    if (!authUser) return

    const fresh = createBoard(name)
    await createBoardInDB(fresh, authUser.id).catch(console.error)

    setBoards(prev => [...prev, fresh])
    setActiveBoardId(fresh.id)
    activeBoardIdRef.current = fresh.id
    setScreen('dashboard')
  }

  function handleSelectBoard(id) {
    setActiveBoardId(id)
    activeBoardIdRef.current = id
  }

  // ── Sign out ──────────────────────────────────────────────────────
  async function handleSignOut() {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
    }
    await supabase.auth.signOut()
    // onAuthStateChange listener handles state reset
  }

  // ── Streak ────────────────────────────────────────────────────────
  function refreshStreak(board) {
    const today = todayStr()
    if (board.todayDate === today) return board
    const last = board.lastActiveDate
    if (!last) return { ...board, todayDate: today, todayDoneCount: 0 }
    const msPerDay = 1000 * 60 * 60 * 24
    const diff     = Math.round((new Date(today) - new Date(last)) / msPerDay)
    const streak   = diff === 1 ? board.streakCount : 0
    return { ...board, todayDate: today, todayDoneCount: 0, streakCount: streak }
  }

  // ── Debounced Supabase sync ───────────────────────────────────────
  function scheduleSync(board) {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      const authUser = authUserRef.current
      if (!authUser) return
      syncBoard(board, authUser.id).catch(err => console.error('Sync error:', err))
    }, 800)
  }

  // ── Board updates ─────────────────────────────────────────────────
  const handleUpdateBoard = useCallback((updater) => {
    setBoards(prev => {
      const id   = activeBoardIdRef.current
      const next = prev.map(b => {
        if (b.id !== id) return b
        return typeof updater === 'function' ? updater(b) : updater
      })
      const updated = next.find(b => b.id === id)
      if (updated) scheduleSync(updated)
      return next
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCompleteTask(task) {
    handleUpdateBoard(prev => {
      const xpGain     = XP_VALUES[task.priority] ?? 10
      const today      = todayStr()
      const firstToday = prev.todayDoneCount === 0
      const streak     = firstToday ? prev.streakCount + 1 : prev.streakCount
      const entry      = {
        id: crypto.randomUUID(),
        actorName: user.name, actorInitials: user.initials, actorColor: user.color,
        text: `completed "${task.title}"`,
        ts: Date.now(),
      }
      return {
        ...prev,
        xp:             prev.xp + xpGain,
        streakCount:    streak,
        lastActiveDate: today,
        todayDoneCount: prev.todayDoneCount + 1,
        activity:       [...(prev.activity ?? []), entry],
        tasks: prev.tasks.map(t =>
          t.id === task.id
            ? { ...t, column: 'done', completedAt: Date.now(), xpEarned: xpGain }
            : t
        ),
      }
    })
  }

  function handleUncompleteTask(task) {
    handleUpdateBoard(prev => {
      const xpLoss = task.xpEarned ?? XP_VALUES[task.priority] ?? 10
      return {
        ...prev,
        xp:    Math.max(0, prev.xp - xpLoss),
        tasks: prev.tasks.map(t =>
          t.id === task.id
            ? { ...t, column: 'todo', completedAt: null, xpEarned: 0 }
            : t
        ),
      }
    })
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="h-full min-h-screen bg-base">
      {screen === 'loading'   && <LoadingScreen onComplete={handleLoadComplete} />}
      {screen === 'auth'      && <AuthScreen onAuth={handleAuth} />}
      {screen === 'profile'   && <ProfileSetupScreen onCreate={handleCreateProfile} />}
      {screen === 'create'    && <CreateBoardScreen onCreate={handleCreateBoard} />}
      {screen === 'dashboard' && activeBoard && user && (
        <Dashboard
          board={activeBoard}
          boards={boards}
          activeBoardId={activeBoardId}
          user={user}
          onUpdate={handleUpdateBoard}
          onUpdateUser={handleUpdateUser}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onCompleteTask={handleCompleteTask}
          onUncompleteTask={handleUncompleteTask}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  )
}
