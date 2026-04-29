import { useState, useEffect, useRef } from 'react'
import KanbanBoard from './KanbanBoard'
import {
  seedMessages, timeAgo, XP_VALUES,
  PHASES, PHASE_CONFIG, MOOD_COLORS,
  AVATAR_COLORS, SKILLS, initials as makeInitials,
} from '../storage'

const XP_CAP = 1000

const PRIORITY_BADGE = {
  low:    'bg-green/30 text-green-light border-green/40',
  medium: 'bg-yellow/30 text-yellow border-yellow/40',
  high:   'bg-red/30 text-red-light border-red/40',
}

/* ══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */
export default function ProjectView({ board, boards, activeBoardId, user, onUpdate, onSelectBoard, onCreateBoard, onCompleteTask, onUncompleteTask }) {
  const [view, setView]               = useState('list')
  const [subTab, setSubTab]           = useState('ProjectSpace')
  const [lastSeenMsgCount, setLastSeenMsgCount] = useState(board.messages?.length ?? 0)

  useEffect(() => {
    if (!board.messages || board.messages.length === 0) {
      onUpdate(prev => ({ ...prev, messages: seedMessages(prev, user) }))
    }
  }, [board.id]) // eslint-disable-line

  const unread = Math.max(0, (board.messages?.length ?? 0) - lastSeenMsgCount)

  function switchTab(t) {
    setSubTab(t)
    if (t === 'GroupChat') setLastSeenMsgCount(board.messages?.length ?? 0)
  }

  function handleSelectBoard(id) {
    onSelectBoard(id)
    setSubTab('ProjectSpace')
    setView('workspace')
  }

  function handleCreateBoard(name) {
    onCreateBoard(name)
    setSubTab('ProjectSpace')
    setView('workspace')
  }

  if (view === 'list') {
    return (
      <ProjectsList
        boards={boards}
        activeBoardId={activeBoardId}
        onSelect={handleSelectBoard}
        onCreate={handleCreateBoard}
      />
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <nav className="flex items-center gap-0 border-b-2 border-border bg-surface flex-shrink-0 overflow-x-auto">
        {/* Back to projects list */}
        <button
          onClick={() => setView('list')}
          className="font-pixel text-[8px] text-muted px-4 py-3 border-r border-border hover:text-yellow transition-colors flex-shrink-0 whitespace-nowrap"
        >
          ◀ PROJECTS
        </button>
        {[
          { id: 'ProjectSpace', label: '◈ Space'  },
          { id: 'Board',        label: '▦ Board'  },
          { id: 'GroupChat',    label: '◉ Chat'   },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`relative font-pixel text-[8px] px-5 py-3 border-r border-border transition-colors flex-shrink-0 ${
              subTab === t.id ? 'text-yellow bg-yellow/10' : 'text-muted hover:text-text'
            }`}
          >
            {t.label}
            {t.id === 'GroupChat' && unread > 0 && subTab !== 'GroupChat' && (
              <span className="absolute top-2 right-2 font-pixel text-[6px] text-base bg-red px-1 min-w-[14px] text-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === 'ProjectSpace' && (
          <ProjectSpaceView board={board} user={user} onUpdate={onUpdate}
            onCompleteTask={onCompleteTask} onUncompleteTask={onUncompleteTask} />
        )}
        {subTab === 'Board' && (
          <BoardView board={board} user={user} onUpdate={onUpdate}
            onCompleteTask={onCompleteTask} onUncompleteTask={onUncompleteTask} />
        )}
        {subTab === 'GroupChat' && (
          <GroupChatView board={board} user={user} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PROJECTS LIST
═══════════════════════════════════════════════════════════════════ */
function ProjectsList({ boards, activeBoardId, onSelect, onCreate }) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="h-full overflow-auto p-6 animate-fade-in">
      <h2 className="font-pixel text-white text-base mb-6 leading-relaxed">Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map(board => {
          const xpPct    = Math.min(Math.round((board.xp / XP_CAP) * 100), 100)
          const isActive = board.id === activeBoardId
          return (
            <button
              key={board.id}
              onClick={() => onSelect(board.id)}
              className={`text-left bg-card border-2 transition-all p-5 group shadow-pixel-sm hover:shadow-pixel hover:-translate-y-0.5 ${
                isActive ? 'border-yellow/60' : 'border-border hover:border-yellow/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="font-pixel text-[11px] text-text group-hover:text-yellow transition-colors leading-snug">
                  {board.name || 'My Project'}
                </p>
                {isActive && (
                  <span className="font-pixel text-[6px] text-yellow border border-yellow/40 bg-yellow/10 px-1.5 py-0.5 flex-shrink-0">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-yellow text-xs">🏆</span>
                <span className="font-pixel text-[8px] text-muted">XP</span>
                <span className="font-pixel text-[8px] text-yellow">{board.xp}/{XP_CAP}</span>
              </div>
              <div className="h-1.5 bg-surface border border-border mb-3">
                <div className="h-full bg-yellow transition-all duration-500" style={{ width: `${xpPct}%` }} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-pixel text-[7px] text-muted">
                  {board.tasks.filter(t => t.column === 'done').length}/{board.tasks.length} tasks
                </span>
                <span className={`font-pixel text-[7px] px-2 py-0.5 border ${PHASE_CONFIG[board.phase ?? 'PLANNING'].text} ${PHASE_CONFIG[board.phase ?? 'PLANNING'].bg} ${PHASE_CONFIG[board.phase ?? 'PLANNING'].border}`}>
                  {board.phase ?? 'PLANNING'}
                </span>
                {board.shared && (
                  <span className="font-pixel text-[7px] px-2 py-0.5 border border-green/40 text-green-light bg-green/10">PUBLIC</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Floating + button */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 z-40 font-pixel text-[18px] text-base bg-yellow w-14 h-14 flex items-center justify-center border-2 border-yellow-dark shadow-pixel hover:-translate-y-0.5 hover:shadow-[4px_6px_0px_#0E1117] active:translate-y-0 active:shadow-pixel transition-all"
        aria-label="Create new project"
      >
        +
      </button>

      {showCreate && (
        <CreateProjectModal
          onSubmit={name => { setShowCreate(false); onCreate(name) }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

function CreateProjectModal({ onSubmit, onClose }) {
  const [name, setName] = useState('')

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-sm shadow-pixel animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-pixel text-[10px] text-yellow">NEW PROJECT</span>
          <button onClick={onClose} className="font-pixel text-[11px] text-muted hover:text-red transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="Project name..."
            className="w-full bg-card border-2 border-border px-3 py-2.5 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full font-pixel text-[10px] text-base bg-yellow py-3 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all disabled:opacity-40"
          >
            CREATE PROJECT
          </button>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PROJECT SPACE
═══════════════════════════════════════════════════════════════════ */
function ProjectSpaceView({ board, user, onUpdate, onCompleteTask, onUncompleteTask }) {
  const [showInvite, setShowInvite]     = useState(false)
  const [editingDesc, setEditingDesc]   = useState(false)
  const [descDraft, setDescDraft]       = useState(board.description ?? '')
  const descRef                         = useRef(null)
  const phase      = board.phase ?? 'PLANNING'
  const members    = board.members ?? []
  const inProgress = board.tasks.filter(t => t.column === 'inprogress')

  useEffect(() => { if (editingDesc) descRef.current?.focus() }, [editingDesc])

  function saveDesc() {
    onUpdate(prev => ({ ...prev, description: descDraft.trim() }))
    setEditingDesc(false)
  }

  function setPhase(p) {
    const entry = {
      id: crypto.randomUUID(),
      actorName: user.name, actorInitials: user.initials, actorColor: user.color,
      text: `moved project to ${p}`,
      ts: Date.now(),
    }
    onUpdate(prev => ({ ...prev, phase: p, activity: [...(prev.activity ?? []), entry] }))
  }

  return (
    <div className="h-full overflow-auto p-4 md:p-6 animate-fade-in space-y-4">

      {/* ── Project Status Card ── */}
      <div className="bg-card border-2 border-border p-4 space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-pixel text-[8px] text-muted tracking-widest">PROJECT STATUS</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowInvite(true)}
              className="font-pixel text-[8px] text-base bg-yellow border-2 border-yellow-dark px-3 py-1.5 shadow-pixel-sm hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all"
            >
              + INVITE
            </button>
            {board.shared ? (
              <span className="font-pixel text-[8px] text-green-light border-2 border-green/40 bg-green/10 px-3 py-1.5">
                ✓ PUBLIC
              </span>
            ) : (
              <button
                onClick={() => setShowInvite(true)}
                className="font-pixel text-[8px] text-muted border-2 border-border px-3 py-1.5 hover:border-yellow hover:text-yellow transition-colors"
              >
                SHARE
              </button>
            )}
          </div>
        </div>

        {/* Project name */}
        <h3 className="font-pixel text-white text-sm leading-snug">{board.name || 'My Project'}</h3>

        {/* Description — inline editable */}
        {editingDesc ? (
          <textarea
            ref={descRef}
            value={descDraft}
            onChange={e => setDescDraft(e.target.value)}
            onBlur={saveDesc}
            onKeyDown={e => {
              if (e.key === 'Escape') { setDescDraft(board.description ?? ''); setEditingDesc(false) }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveDesc() }
            }}
            rows={2}
            placeholder="Describe your project..."
            className="w-full bg-base border border-border px-2 py-1.5 font-sans text-sm text-text placeholder:text-border resize-none focus:outline-none focus:border-yellow transition-colors"
          />
        ) : (
          <button
            onClick={() => { setDescDraft(board.description ?? ''); setEditingDesc(true) }}
            className="text-left w-full font-sans text-sm leading-relaxed group flex items-start gap-1"
          >
            {board.description
              ? <span className="text-muted">{board.description}</span>
              : <span className="text-border italic">Add a project description…</span>
            }
            <span className="font-pixel text-[8px] text-border opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0 mt-0.5">✎</span>
          </button>
        )}

        {/* Member avatars */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-7 h-7 flex items-center justify-center font-pixel text-[7px] text-base border-2 border-yellow/50 flex-shrink-0"
            style={{ backgroundColor: user.color }}
            title={`${user.name} (you)`}
          >
            {user.initials}
          </div>
          {members.slice(0, 6).map(m => (
            <div
              key={m.id}
              className="w-7 h-7 flex items-center justify-center font-pixel text-[7px] text-base border border-border flex-shrink-0"
              style={{ backgroundColor: m.color }}
              title={m.name}
            >
              {m.initials?.[0]}
            </div>
          ))}
          {members.length > 6 && (
            <span className="font-pixel text-[7px] text-muted">+{members.length - 6}</span>
          )}
          <span className="font-pixel text-[7px] text-muted ml-1">
            {members.length + 1} member{members.length !== 0 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowInvite(true)}
            className="w-7 h-7 flex items-center justify-center font-pixel text-[10px] text-muted border border-dashed border-border hover:border-yellow hover:text-yellow transition-colors flex-shrink-0"
            title="Add member"
          >
            +
          </button>
        </div>

        {/* Phase selector */}
        <div>
          <p className="font-pixel text-[8px] text-muted mb-2">Current Phase</p>
          <div className="flex gap-2 flex-wrap">
            {PHASES.map(p => {
              const c = PHASE_CONFIG[p]
              return (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  className={`
                    font-pixel text-[8px] px-4 py-2 border-2 transition-all flex-shrink-0
                    ${phase === p ? `${c.bg} ${c.text} ${c.border}` : 'border-border text-border hover:border-muted hover:text-muted'}
                  `}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── MoodBoard + IN PROGRESS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoodBoard board={board} onUpdate={onUpdate} />
        <InProgressPanel
          tasks={inProgress}
          onComplete={onCompleteTask}
          onUncomplete={onUncompleteTask}
        />
      </div>

      {/* ── Activity feed ── */}
      <ActivityFeed activity={board.activity ?? []} />

      {showInvite && (
        <InviteShareModal
          board={board}
          user={user}
          onUpdate={onUpdate}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  )
}

/* ── MoodBoard ─────────────────────────────────────────────────── */
function MoodBoard({ board, onUpdate }) {
  const [adding, setAdding] = useState(false)
  const [text, setText]     = useState('')
  const inputRef            = useRef(null)
  const items               = board.moodboard ?? []

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  function handleAdd(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    const color = MOOD_COLORS[items.length % MOOD_COLORS.length]
    onUpdate(prev => ({
      ...prev,
      moodboard: [...(prev.moodboard ?? []), {
        id: crypto.randomUUID(), text: t, color, createdAt: Date.now(),
      }],
    }))
    setText('')
    setAdding(false)
  }

  function handleRemove(id) {
    onUpdate(prev => ({ ...prev, moodboard: (prev.moodboard ?? []).filter(i => i.id !== id) }))
  }

  return (
    <div className="bg-card border-2 border-border flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-pixel text-[10px] text-white">MoodBoard</span>
        <button
          onClick={() => setAdding(a => !a)}
          className="w-6 h-6 flex items-center justify-center bg-surface border border-border font-pixel text-[12px] text-muted hover:text-yellow hover:border-yellow transition-colors"
        >
          +
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex gap-2 px-3 py-2 border-b border-border">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setAdding(false)}
            placeholder="Add inspiration, link, or idea..."
            className="flex-1 min-w-0 bg-base border border-border px-2 py-1.5 font-sans text-xs text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
          />
          <button type="submit" className="font-pixel text-[7px] text-base bg-yellow border border-yellow-dark px-2 py-1.5 flex-shrink-0">OK</button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="font-sans text-sm text-border text-center">No inspiration added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative p-3 border border-border/50 text-sm font-sans leading-relaxed break-words"
                style={{ backgroundColor: item.color }}
              >
                <p className="text-text pr-4">{item.text}</p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-1.5 right-1.5 font-pixel text-[9px] text-border hover:text-red transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── IN PROGRESS panel ────────────────────────────────────────── */
function InProgressPanel({ tasks, onComplete }) {
  return (
    <div className="bg-card border-2 border-border flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-pixel text-[10px] text-yellow">IN PROGRESS</span>
        <span className="font-pixel text-[9px] text-muted bg-surface border border-border px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center py-8">
            <p className="font-sans text-sm text-border text-center">No tasks in progress.<br/>Drag tasks here from the Board.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-surface border border-border p-3 space-y-2">
              <p className="font-sans text-sm text-text leading-snug">{task.title}</p>
              <div className="flex items-center gap-2">
                <span className={`font-pixel text-[7px] px-2 py-0.5 border ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.low}`}>
                  {task.priority?.toUpperCase()}
                </span>
                <span className="font-pixel text-[7px] text-yellow/60 ml-auto">+{XP_VALUES[task.priority] ?? 10}XP</span>
                <button
                  onClick={() => onComplete(task)}
                  className="font-pixel text-[7px] text-green-light hover:text-green transition-colors"
                >
                  ✓
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   BOARD VIEW
═══════════════════════════════════════════════════════════════════ */
function BoardView({ board, user, onUpdate, onCompleteTask, onUncompleteTask }) {
  const [editTask, setEditTask]       = useState(null)
  const [showAdd, setShowAdd]         = useState(false)
  const [filterPriority, setFilterPriority] = useState(null)

  function handleDeleteTask(taskId) {
    onUpdate(prev => {
      const task   = prev.tasks.find(t => t.id === taskId)
      const xpLoss = task?.column === 'done' ? (task.xpEarned ?? 0) : 0
      return { ...prev, xp: Math.max(0, prev.xp - xpLoss), tasks: prev.tasks.filter(t => t.id !== taskId) }
    })
  }

  function handleTaskSubmit(data) {
    if (editTask) {
      onUpdate(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === editTask.id ? { ...t, ...data } : t) }))
    } else {
      const newTask = { id: crypto.randomUUID(), ...data, createdAt: Date.now(), completedAt: null, xpEarned: 0 }
      const entry = {
        id: crypto.randomUUID(),
        actorName: user.name, actorInitials: user.initials, actorColor: user.color,
        text: `added "${data.title}"`,
        ts: Date.now(),
      }
      onUpdate(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
        activity: [...(prev.activity ?? []), entry],
      }))
    }
    setEditTask(null)
    setShowAdd(false)
  }

  const visibleTasks = filterPriority
    ? board.tasks.filter(t => t.priority === filterPriority)
    : board.tasks

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface flex-shrink-0 flex-wrap">
        <span className="font-pixel text-[8px] text-muted">{board.tasks.length} tasks</span>
        {/* Priority filter */}
        <div className="flex gap-1 flex-1">
          {[null, 'low', 'medium', 'high'].map(p => (
            <button
              key={p ?? 'all'}
              onClick={() => setFilterPriority(p)}
              className={`font-pixel text-[7px] px-2 py-1 border transition-all ${
                filterPriority === p
                  ? p === 'high' ? 'border-red/60 text-red-light bg-red/10'
                    : p === 'medium' ? 'border-yellow/60 text-yellow bg-yellow/10'
                    : p === 'low' ? 'border-green/60 text-green-light bg-green/10'
                    : 'border-yellow text-yellow bg-yellow/10'
                  : 'border-border text-border hover:border-muted hover:text-muted'
              }`}
            >
              {p ? p.toUpperCase() : 'ALL'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="font-pixel text-[8px] text-base bg-yellow border-2 border-yellow-dark px-3 py-1.5 shadow-pixel-sm hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all flex-shrink-0"
        >
          + ADD TASK
        </button>
      </div>

      {board.tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
          <p className="font-pixel text-[9px] text-muted leading-relaxed">NO TASKS YET</p>
          <p className="font-sans text-sm text-border">Add your first task to get started.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="font-pixel text-[9px] text-base bg-yellow border-2 border-yellow-dark px-5 py-3 shadow-pixel hover:-translate-y-px hover:shadow-pixel transition-all"
          >
            + ADD FIRST TASK
          </button>
        </div>
      )}

      {board.tasks.length > 0 && (
        <div className="flex-1 min-h-0 overflow-auto p-4">
          <KanbanBoard
            tasks={visibleTasks}
            onUpdate={onUpdate}
            onCompleteTask={onCompleteTask}
            onUncompleteTask={onUncompleteTask}
            onEditTask={task => setEditTask(task)}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      )}

      {(editTask || showAdd) && (
        <QuickTaskModal
          initial={editTask}
          user={user}
          members={board.members ?? []}
          onSubmit={handleTaskSubmit}
          onClose={() => { setEditTask(null); setShowAdd(false) }}
        />
      )}
    </div>
  )
}

function QuickTaskModal({ initial, onSubmit, onClose, user, members = [] }) {
  const [title, setTitle]         = useState(initial?.title ?? '')
  const [desc, setDesc]           = useState(initial?.description ?? '')
  const [priority, setPriority]   = useState(initial?.priority ?? 'medium')
  const [column, setColumn]       = useState(initial?.column ?? 'todo')
  const [dueDate, setDueDate]     = useState(initial?.dueDate ?? '')
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? '')

  const allPeople = user
    ? [{ id: user.id, name: user.name, initials: user.initials, color: user.color }, ...members]
    : members

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const assignee = allPeople.find(p => p.id === assigneeId) ?? null
    onSubmit({
      title: title.trim(),
      description: desc.trim(),
      priority,
      column,
      dueDate: dueDate || null,
      assigneeId:       assignee?.id       ?? null,
      assigneeName:     assignee?.name     ?? null,
      assigneeInitials: assignee?.initials ?? null,
      assigneeColor:    assignee?.color    ?? null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-sm shadow-pixel animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <span className="font-pixel text-[9px] text-yellow">{initial ? 'EDIT TASK' : 'NEW TASK'}</span>
          <button onClick={onClose} className="font-pixel text-[10px] text-muted hover:text-red">✕</button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4 overflow-y-auto">
          {/* Title */}
          <input
            autoFocus value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-card border-2 border-border px-3 py-2.5 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
          />

          {/* Description */}
          <textarea
            value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full bg-card border-2 border-border px-3 py-2 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors resize-none"
          />

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[7px] text-muted">PRIORITY</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`flex-1 font-pixel text-[7px] py-2 border-2 transition-all ${
                    priority === p ? PRIORITY_BADGE[p] : 'border-border text-border hover:border-muted'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Column */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[7px] text-muted">COLUMN</label>
            <div className="flex gap-2">
              {['todo', 'inprogress', 'done'].map(c => (
                <button key={c} type="button" onClick={() => setColumn(c)}
                  className={`flex-1 font-pixel text-[7px] py-2 border-2 transition-all ${
                    column === c ? 'border-yellow text-yellow bg-yellow/10' : 'border-border text-border hover:border-muted'
                  }`}
                >
                  {c === 'todo' ? 'TO DO' : c === 'inprogress' ? 'IN PROG' : 'DONE'}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[7px] text-muted">DUE DATE</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-card border-2 border-border px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-yellow transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Assignee */}
          {allPeople.length > 0 && (
            <div className="space-y-1.5">
              <label className="font-pixel text-[7px] text-muted">ASSIGNEE</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setAssigneeId('')}
                  className={`font-pixel text-[7px] px-2.5 py-1.5 border-2 transition-all ${
                    !assigneeId ? 'border-yellow text-yellow bg-yellow/10' : 'border-border text-border hover:border-muted'
                  }`}
                >
                  NONE
                </button>
                {allPeople.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAssigneeId(p.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 border-2 transition-all ${
                      assigneeId === p.id ? 'border-yellow bg-yellow/10' : 'border-border hover:border-muted'
                    }`}
                  >
                    <div
                      className="w-4 h-4 flex items-center justify-center font-pixel text-[6px] text-base border border-border flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.initials?.[0]}
                    </div>
                    <span className="font-pixel text-[7px] text-muted">{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit"
            className="w-full font-pixel text-[9px] text-base bg-yellow py-3 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-px transition-all"
          >
            {initial ? 'SAVE' : 'ADD TASK'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   INVITE / SHARE MODAL
═══════════════════════════════════════════════════════════════════ */
function InviteShareModal({ board, user, onUpdate, onClose }) {
  const [tab, setTab]       = useState('invite')
  const [copied, setCopied] = useState(false)
  const [name, setName]     = useState('')
  const [color, setColor]   = useState(AVATAR_COLORS[1])
  const [skills, setSkills] = useState([])
  const [role, setRole]     = useState('MEMBER')
  const [error, setError]   = useState('')

  const inviteCode = `KARN-${board.id.slice(0, 8).toUpperCase()}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleSkill(s) {
    setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  }

  function handleAddMember(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) { setError('Name is required.'); return }
    const newMember = {
      id: crypto.randomUUID(),
      name: n, initials: makeInitials(n), color, skills, role, joinedAt: Date.now(),
    }
    const entry = {
      id: crypto.randomUUID(),
      actorName: newMember.name, actorInitials: newMember.initials, actorColor: newMember.color,
      text: 'joined the project',
      ts: Date.now(),
    }
    onUpdate(prev => ({
      ...prev,
      members: [...(prev.members ?? []), newMember],
      activity: [...(prev.activity ?? []), entry],
    }))
    onClose()
  }

  function handlePublish() {
    onUpdate(prev => ({ ...prev, shared: true }))
    onClose()
  }

  function handleUnpublish() {
    onUpdate(prev => ({ ...prev, shared: false }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-md shadow-pixel animate-slide-up max-h-[90vh] flex flex-col">

        {/* Modal header with tabs */}
        <div className="flex items-center justify-between border-b border-border flex-shrink-0 pr-4">
          <div className="flex">
            {[
              { id: 'invite', label: 'INVITE CODE' },
              { id: 'add',    label: 'ADD MEMBER'  },
              { id: 'share',  label: 'SHARE'       },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`font-pixel text-[8px] px-4 py-4 border-b-2 transition-colors ${
                  tab === t.id ? 'text-yellow border-yellow' : 'text-muted border-transparent hover:text-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="font-pixel text-[11px] text-muted hover:text-red transition-colors flex-shrink-0">✕</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">

          {/* ── INVITE CODE ── */}
          {tab === 'invite' && (
            <>
              <p className="font-sans text-sm text-muted leading-relaxed">
                Share this code with anyone you want to collaborate with.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-card border-2 border-border px-4 py-3 font-pixel text-[10px] text-yellow tracking-widest overflow-hidden text-ellipsis">
                  {inviteCode}
                </div>
                <button
                  onClick={handleCopy}
                  className={`font-pixel text-[8px] px-4 py-3 border-2 flex-shrink-0 transition-all ${
                    copied
                      ? 'border-green text-green bg-green/10'
                      : 'border-border text-muted hover:border-yellow hover:text-yellow'
                  }`}
                >
                  {copied ? '✓ COPIED' : 'COPY'}
                </button>
              </div>
              <p className="font-pixel text-[8px] text-border">UNIQUE TO THIS BOARD — SHARE CAREFULLY</p>
            </>
          )}

          {/* ── ADD MEMBER ── */}
          {tab === 'add' && (
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-pixel text-[8px] text-muted">NAME</label>
                <input
                  autoFocus value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="Teammate's name"
                  className="w-full bg-base border-2 border-border px-3 py-2.5 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
                />
                {error && <p className="font-pixel text-[8px] text-red">{error}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-pixel text-[8px] text-muted">AVATAR COLOR</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-7 h-7 border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-pixel text-[8px] text-muted">ROLE</label>
                <div className="flex gap-2">
                  {['MEMBER', 'LEAD', 'REVIEWER'].map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`flex-1 font-pixel text-[8px] py-2 border-2 transition-all ${
                        role === r ? 'border-yellow text-yellow bg-yellow/10' : 'border-border text-muted hover:border-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-pixel text-[8px] text-muted">SKILLS (OPTIONAL)</label>
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
                ADD TO TEAM
              </button>
            </form>
          )}

          {/* ── SHARE ── */}
          {tab === 'share' && (
            <div className="space-y-4">
              <p className="font-sans text-sm text-muted leading-relaxed">
                Publishing your project makes it visible to the community in Explore. Others can discover it and request to join.
              </p>

              {board.shared ? (
                <div className="space-y-3">
                  <div className="bg-green/10 border-2 border-green/40 p-4 space-y-1">
                    <p className="font-pixel text-[9px] text-green-light">✓ PROJECT IS PUBLIC</p>
                    <p className="font-sans text-sm text-muted mt-1">Your project is listed in the community Explore tab.</p>
                  </div>
                  <button
                    onClick={handleUnpublish}
                    className="w-full font-pixel text-[8px] text-muted border-2 border-border px-4 py-2.5 hover:border-red hover:text-red transition-colors"
                  >
                    UNPUBLISH
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePublish}
                  className="w-full font-pixel text-[10px] text-base bg-yellow py-3 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all"
                >
                  PUBLISH TO COMMUNITY
                </button>
              )}

              <div className="border-t border-border pt-4 space-y-2">
                <p className="font-pixel text-[8px] text-muted mb-3">WHAT GETS SHARED</p>
                {['Project name & description', 'Phase and progress', 'Open roles from your team', 'Member count'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="font-pixel text-[8px] text-green-light flex-shrink-0">✓</span>
                    <span className="font-sans text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

/* ── Activity feed ────────────────────────────────────────────── */
function ActivityFeed({ activity }) {
  const sorted = [...activity].reverse()

  return (
    <div className="bg-card border-2 border-border">
      <div className="px-4 py-3 border-b border-border">
        <span className="font-pixel text-[10px] text-white">Activity</span>
      </div>
      {sorted.length === 0 ? (
        <p className="font-sans text-sm text-border text-center py-6">
          No activity yet. Complete tasks to see them here.
        </p>
      ) : (
        <div className="divide-y divide-border max-h-56 overflow-y-auto">
          {sorted.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
              <div
                className="w-6 h-6 flex items-center justify-center font-pixel text-[7px] text-base border border-border flex-shrink-0"
                style={{ backgroundColor: a.actorColor }}
              >
                {a.actorInitials?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-sans text-xs font-semibold text-text">{a.actorName} </span>
                <span className="font-sans text-xs text-muted">{a.text}</span>
              </div>
              <span className="font-pixel text-[6px] text-border flex-shrink-0 whitespace-nowrap">
                {timeAgo(a.ts)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   GROUP CHAT
═══════════════════════════════════════════════════════════════════ */
function GroupChatView({ board, user, onUpdate }) {
  const [input, setInput]               = useState('')
  const [mobileShowOnline, setMobileShowOnline] = useState(false)
  const bottomRef                       = useRef(null)
  const messages                        = board.messages ?? []
  const members                         = board.members ?? []
  const allParticipants = [
    { id: user.id, name: user.name, initials: user.initials, color: user.color },
    ...members,
  ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    onUpdate(prev => ({
      ...prev,
      messages: [...(prev.messages ?? []), {
        id: crypto.randomUUID(),
        userId: user.id, name: user.name,
        initials: user.initials, color: user.color,
        text, ts: Date.now(),
      }],
    }))
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 animate-fade-in">

      {/* Messages area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="flex-shrink-0 flex justify-center py-3 border-b border-border bg-surface">
          <span className="font-sans text-xs text-muted bg-card border border-border px-4 py-1.5">
            Welcome to your project GroupChat!
          </span>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3">
          {messages.map((msg, i) => {
            const prev    = messages[i - 1]
            const grouped = prev?.userId === msg.userId
            return (
              <div key={msg.id} className={`flex gap-3 ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                <div className="flex-shrink-0 w-8">
                  {!grouped && (
                    <div
                      className="w-8 h-8 flex items-center justify-center font-pixel text-[8px] text-base border border-border"
                      style={{ backgroundColor: msg.color }}
                    >
                      {msg.initials?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {!grouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-pixel text-[9px] text-white">{msg.name}</span>
                      <span className="font-pixel text-[7px] text-border">{timeAgo(msg.ts)}</span>
                    </div>
                  )}
                  <p className="font-sans text-sm text-muted leading-relaxed break-words">{msg.text}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex-shrink-0 border-t border-border">
          <form onSubmit={handleSend} className="flex gap-2 p-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e) }}
              placeholder="Type your message..."
              className="flex-1 min-w-0 bg-card border-2 border-border px-4 py-2.5 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-card border-2 border-border hover:border-yellow text-muted hover:text-yellow transition-colors disabled:opacity-30 flex-shrink-0"
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
          <p className="font-pixel text-[7px] text-border px-3 pb-2">Press Enter to send</p>
        </div>
      </div>

      {/* Online sidebar — desktop */}
      <div className="hidden md:flex flex-col w-44 flex-shrink-0 border-l border-border">
        <div className="px-3 py-3 border-b border-border">
          <span className="font-pixel text-[8px] text-muted">ONLINE ({allParticipants.length})</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allParticipants.map((p, i) => (
            <div key={p.id ?? i} className="flex items-center gap-2 px-1 py-1.5">
              <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: p.color }} />
              <div className="min-w-0">
                <p className="font-pixel text-[7px] text-text truncate">{p.name}</p>
                <p className="font-pixel text-[6px] text-green-light">Active</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile online toggle */}
      <button
        className="md:hidden fixed bottom-20 right-4 z-30 font-pixel text-[7px] text-base bg-surface border border-border px-3 py-2"
        onClick={() => setMobileShowOnline(v => !v)}
      >
        👤 {allParticipants.length}
      </button>

      {mobileShowOnline && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-base/80 flex justify-end animate-fade-in"
          onClick={() => setMobileShowOnline(false)}
        >
          <div className="bg-surface border-l-2 border-border w-48 h-full p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <p className="font-pixel text-[8px] text-muted">ONLINE ({allParticipants.length})</p>
            {allParticipants.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center gap-2">
                <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: p.color }} />
                <div>
                  <p className="font-pixel text-[8px] text-text">{p.name}</p>
                  <p className="font-pixel text-[7px] text-green-light">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
