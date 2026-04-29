import { useState, useMemo } from 'react'
import { COMMUNITY_PROJECTS } from '../storage'

const ALL_ROLES = [...new Set(COMMUNITY_PROJECTS.flatMap(p => p.openRoles))]

export default function ExploreView({ user }) {
  const [search, setSearch]             = useState('')
  const [filterRole, setFilterRole]     = useState(null)
  const [requested, setRequested]       = useState({})
  const [activeProject, setActiveProject] = useState(null)

  const filtered = useMemo(() => {
    let list = COMMUNITY_PROJECTS
    if (filterRole) list = list.filter(p => p.openRoles.includes(filterRole))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, filterRole])

  function handleRequest(id) {
    setRequested(prev => ({ ...prev, [id]: 'pending' }))
    setTimeout(() => setRequested(prev => ({ ...prev, [id]: 'joined' })), 3000)
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">

        {/* ── Header ── */}
        <div>
          <h2 className="font-pixel text-yellow text-[11px] leading-loose">EXPLORE PROJECTS</h2>
          <p className="font-sans text-muted text-sm mt-1">
            {COMMUNITY_PROJECTS.length} projects open in the community
          </p>
        </div>

        {/* ── Search (own row) ── */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, tag, or tech..."
          className="w-full bg-card border-2 border-border px-4 py-3 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
        />

        {/* ── Role filter (own row, horizontal scroll) ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterRole(null)}
            className={`font-pixel text-[8px] px-3 py-2 border-2 flex-shrink-0 transition-all ${
              !filterRole ? 'border-yellow text-yellow bg-yellow/10' : 'border-border text-muted hover:border-muted'
            }`}
          >
            ALL
          </button>
          {ALL_ROLES.map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(prev => prev === role ? null : role)}
              className={`font-pixel text-[8px] px-3 py-2 border-2 flex-shrink-0 transition-all ${
                filterRole === role
                  ? 'border-yellow text-yellow bg-yellow/10'
                  : 'border-border text-muted hover:border-muted'
              }`}
            >
              {role.toUpperCase()}
              {user.skills.includes(role) && <span className="text-green ml-1">●</span>}
            </button>
          ))}
        </div>

        {/* ── Result count when filtering ── */}
        {(search || filterRole) && (
          <p className="font-pixel text-[8px] text-muted">
            {filtered.length} RESULT{filtered.length !== 1 ? 'S' : ''}
          </p>
        )}

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                userSkills={user.skills}
                requestState={requested[p.id]}
                onRequest={() => handleRequest(p.id)}
                onOpen={() => setActiveProject(p)}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border p-12 text-center">
            <p className="font-pixel text-[9px] text-muted">NO PROJECTS FOUND</p>
            <p className="font-sans text-muted text-sm mt-3">Try a different search or clear the filter.</p>
          </div>
        )}
      </div>

      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          userSkills={user.skills}
          requestState={requested[activeProject.id]}
          onRequest={() => handleRequest(activeProject.id)}
          onClose={() => setActiveProject(null)}
        />
      )}
    </div>
  )
}

/* ── Project card ─────────────────────────────────────────────── */

function ProjectCard({ project, userSkills, requestState, onRequest, onOpen }) {
  const match = project.openRoles.filter(r => userSkills.includes(r))
  const pct   = Math.round((project.doneTasks / project.totalTasks) * 100)

  return (
    <div
      className="bg-card border-2 border-border hover:border-yellow/50 transition-colors cursor-pointer group flex flex-col gap-4 p-5"
      onClick={onOpen}
    >
      {/* Owner + name */}
      <div className="flex items-start gap-3">
        <Avatar m={project.owner} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-pixel text-[9px] text-yellow leading-snug group-hover:text-yellow-dark transition-colors truncate">
            {project.name}
          </p>
          <p className="font-pixel text-[8px] text-muted mt-0.5">{project.owner.name}</p>
        </div>
        {match.length > 0 && (
          <span className="font-pixel text-[7px] text-green-light border border-green px-1.5 py-0.5 flex-shrink-0 bg-green/10">
            MATCH
          </span>
        )}
      </div>

      {/* Description */}
      <p className="font-sans text-sm text-muted leading-relaxed line-clamp-2">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map(tag => (
          <span key={tag} className="font-pixel text-[7px] text-muted px-2 py-1 bg-surface border border-border">
            {tag}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-pixel text-[8px] text-muted">PROGRESS</span>
          <span className="font-pixel text-[8px] text-green">{pct}%</span>
        </div>
        <div className="h-1.5 bg-surface border border-border">
          <div className="h-full bg-green" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <MemberStack members={project.members} />
        <div className="flex gap-1 flex-wrap justify-end">
          {project.openRoles.slice(0, 2).map(role => (
            <span
              key={role}
              className={`font-pixel text-[7px] px-1.5 py-0.5 border ${
                userSkills.includes(role)
                  ? 'border-green text-green-light bg-green/10'
                  : 'border-border text-border'
              }`}
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Project detail modal ─────────────────────────────────────── */

function ProjectDetailModal({ project, userSkills, requestState, onRequest, onClose }) {
  const match = project.openRoles.filter(r => userSkills.includes(r))
  const pct   = Math.round((project.doneTasks / project.totalTasks) * 100)

  const btn = {
    undefined: { label: 'REQUEST TO JOIN',   cls: 'bg-yellow text-base border-yellow-dark shadow-pixel hover:-translate-y-px', off: false },
    pending:   { label: '⏳ REQUEST SENT…',   cls: 'bg-yellow/20 text-yellow border-yellow/40 cursor-not-allowed',              off: true  },
    joined:    { label: '✓ JOINED!',           cls: 'bg-green text-white border-green cursor-not-allowed',                       off: true  },
  }[requestState]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-lg shadow-pixel animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <span className="font-pixel text-[10px] text-yellow truncate pr-4">{project.name}</span>
          <button onClick={onClose} className="font-pixel text-[11px] text-muted hover:text-red transition-colors flex-shrink-0">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Owner */}
          <div className="flex items-center gap-3">
            <Avatar m={project.owner} size="lg" />
            <div>
              <p className="font-sans text-sm font-semibold text-text">{project.owner.name}</p>
              <p className="font-pixel text-[8px] text-muted">PROJECT OWNER</p>
            </div>
          </div>

          <p className="font-sans text-sm text-muted leading-relaxed">{project.description}</p>

          {/* Stats */}
          <div className="flex gap-6 py-4 border-y border-border">
            {[
              { n: project.members.length, l: 'MEMBERS' },
              { n: project.totalTasks,     l: 'TASKS'   },
              { n: `${pct}%`,              l: 'DONE', c: 'text-green' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className={`font-pixel text-[13px] ${s.c ?? 'text-text'}`}>{s.n}</p>
                <p className="font-pixel text-[8px] text-muted mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <p className="font-pixel text-[8px] text-muted">TECH STACK</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="font-pixel text-[8px] text-muted px-2.5 py-1.5 bg-card border border-border">{tag}</span>
              ))}
            </div>
          </div>

          {/* Open roles */}
          <div className="space-y-2">
            <p className="font-pixel text-[8px] text-muted">OPEN ROLES</p>
            <div className="flex flex-wrap gap-2">
              {project.openRoles.map(role => (
                <span key={role} className={`font-pixel text-[8px] px-2.5 py-1.5 border-2 ${
                  userSkills.includes(role)
                    ? 'border-green text-green-light bg-green/10'
                    : 'border-border text-muted'
                }`}>
                  {role}{userSkills.includes(role) ? ' ← YOUR SKILL' : ''}
                </span>
              ))}
            </div>
            {match.length > 0 && (
              <p className="font-pixel text-[8px] text-green-light">
                ✓ {match.length} of your skills match open roles
              </p>
            )}
          </div>

          {/* Members */}
          <div className="space-y-2">
            <p className="font-pixel text-[8px] text-muted">TEAM ({project.members.length})</p>
            <div className="flex flex-wrap gap-2">
              {project.members.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-card border border-border px-2 py-1">
                  <Avatar m={m} size="sm" />
                  <span className="font-pixel text-[8px] text-muted">{m.initials}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-5 border-t border-border flex-shrink-0 space-y-3">
          <button
            onClick={onRequest}
            disabled={btn.off}
            className={`w-full font-pixel text-[9px] py-4 border-2 transition-all ${btn.cls}`}
          >
            {btn.label}
          </button>
          <p className="font-pixel text-[8px] text-border text-center">THE OWNER WILL REVIEW YOUR REQUEST</p>
        </div>
      </div>
    </div>
  )
}

/* ── Shared micro-components ──────────────────────────────────── */

function Avatar({ m, size = 'md' }) {
  const sz = { sm: 'w-5 h-5 text-[6px]', md: 'w-8 h-8 text-[8px]', lg: 'w-10 h-10 text-[9px]' }[size]
  return (
    <div
      className={`${sz} flex items-center justify-center font-pixel text-base border border-border flex-shrink-0`}
      style={{ backgroundColor: m.color }}
    >
      {m.initials?.[0] ?? '?'}
    </div>
  )
}

function MemberStack({ members }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {members.slice(0, 4).map((m, i) => (
          <Avatar key={i} m={m} size="sm" />
        ))}
        {members.length > 4 && (
          <div className="w-5 h-5 flex items-center justify-center font-pixel text-[6px] text-muted bg-surface border border-card">
            +{members.length - 4}
          </div>
        )}
      </div>
      <span className="font-pixel text-[8px] text-muted">{members.length}</span>
    </div>
  )
}
