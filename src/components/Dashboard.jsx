import { useState, useEffect, useRef } from 'react'
import ExploreView from './ExploreView'
import ProjectView from './ProjectView'
import { AVATAR_COLORS, SKILLS, initials as makeInitials } from '../storage'

const TABS = [
  { id: 'PROJECT', label: 'PROJECT', icon: '◈' },
  { id: 'EXPLORE', label: 'EXPLORE', icon: '◎' },
]

function getLevel(xp) { return Math.floor(xp / 200) + 1 }

export default function Dashboard({ board, boards, activeBoardId, user, onUpdate, onUpdateUser, onSelectBoard, onCreateBoard, onCompleteTask, onUncompleteTask, onSignOut }) {
  const [tab, setTab]                 = useState('PROJECT')
  const [showProfile, setShowProfile] = useState(false)
  const [xpToast, setXpToast]         = useState(null)
  const prevXpRef                     = useRef(board.xp)

  // XP gain toast
  useEffect(() => {
    const delta = board.xp - prevXpRef.current
    prevXpRef.current = board.xp
    if (delta <= 0) return
    setXpToast(`+${delta} XP`)
    const t = setTimeout(() => setXpToast(null), 2000)
    return () => clearTimeout(t)
  }, [board.xp])

  const level = getLevel(board.xp)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base">

      {/* ── Navbar ── */}
      <header className="flex items-center h-14 px-4 bg-surface border-b-2 border-border flex-shrink-0 gap-3">

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-pixel text-yellow text-[10px]">KARN</span>
          <span className="font-pixel text-text text-[10px]">BOARD</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                font-pixel text-[8px] px-3 py-1.5 border-2 transition-all whitespace-nowrap
                ${tab === t.id
                  ? 'border-yellow text-yellow bg-yellow/10'
                  : 'border-transparent text-muted hover:text-text hover:border-border'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-card border border-border px-2 py-1">
            <span className="font-pixel text-[8px] text-purple-light">LV.{level}</span>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border px-2 py-1">
            <span className="text-sm leading-none">⚡</span>
            <span className="font-pixel text-[9px] text-yellow">{board.xp}</span>
            <span className="font-pixel text-[8px] text-muted hidden sm:block">XP</span>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border px-2 py-1">
            <span className="text-sm leading-none">🔥</span>
            <span className="font-pixel text-[9px] text-red">{board.streakCount}</span>
          </div>
          {/* Avatar — click to edit profile */}
          <button
            onClick={() => setShowProfile(true)}
            className="w-8 h-8 flex items-center justify-center font-pixel text-[8px] text-base border-2 border-border hover:border-yellow flex-shrink-0 transition-colors"
            style={{ backgroundColor: user.color }}
            title="Edit profile"
          >
            {user.initials}
          </button>
        </div>
      </header>

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden flex border-b border-border bg-surface flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 border-b-2 transition-colors ${
              tab === t.id ? 'border-yellow text-yellow' : 'border-transparent text-muted'
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            <span className="font-pixel text-[6px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'PROJECT' && (
          <ProjectView
            board={board}
            boards={boards}
            activeBoardId={activeBoardId}
            user={user}
            onUpdate={onUpdate}
            onSelectBoard={onSelectBoard}
            onCreateBoard={onCreateBoard}
            onCompleteTask={onCompleteTask}
            onUncompleteTask={onUncompleteTask}
          />
        )}
        {tab === 'EXPLORE' && (
          <div className="h-full overflow-auto">
            <ExploreView user={user} />
          </div>
        )}
      </div>

      {/* XP toast */}
      {xpToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 font-pixel text-[11px] text-base bg-yellow border-2 border-yellow-dark px-5 py-2 shadow-pixel animate-slide-up pointer-events-none whitespace-nowrap">
          {xpToast}
        </div>
      )}

      {showProfile && (
        <ProfileEditModal
          user={user}
          onSave={onUpdateUser}
          onSignOut={onSignOut}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}

/* ── Profile edit modal ─────────────────────────────────────────── */
function ProfileEditModal({ user, onSave, onSignOut, onClose }) {
  const [name, setName]     = useState(user.name)
  const [color, setColor]   = useState(user.color)
  const [skills, setSkills] = useState(user.skills ?? [])
  const [error, setError]   = useState('')

  const toggleSkill = s => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  function handleSubmit(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) { setError('Name is required.'); return }
    onSave(prev => ({ ...prev, name: n, initials: makeInitials(n), color, skills }))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-md shadow-pixel animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <span className="font-pixel text-[10px] text-yellow">EDIT PROFILE</span>
          <button onClick={onClose} className="font-pixel text-[11px] text-muted hover:text-red transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 flex items-center justify-center font-pixel text-[12px] text-base border-2 border-border"
              style={{ backgroundColor: color }}
            >
              {makeInitials(name || user.name)}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[8px] text-muted">NAME</label>
            <input
              autoFocus value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Your name"
              className="w-full bg-base border-2 border-border px-3 py-2.5 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
            />
            {error && <p className="font-pixel text-[8px] text-red">{error}</p>}
          </div>

          {/* Avatar color */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[8px] text-muted">AVATAR COLOR</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent hover:border-border'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[8px] text-muted">SKILLS</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`font-pixel text-[8px] px-2.5 py-1.5 border-2 transition-all ${
                    skills.includes(s) ? 'border-yellow text-yellow bg-yellow/10' : 'border-border text-muted hover:border-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full font-pixel text-[10px] text-base bg-yellow py-3 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all"
          >
            SAVE CHANGES
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full font-pixel text-[9px] text-muted border-2 border-border py-2.5 hover:border-red hover:text-red transition-colors"
          >
            SIGN OUT
          </button>
        </form>
      </div>
    </div>
  )
}
