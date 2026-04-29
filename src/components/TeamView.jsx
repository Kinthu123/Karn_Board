import { useState } from 'react'
import { AVATAR_COLORS, SKILLS, initials } from '../storage'

export default function TeamView({ board, user, onUpdate }) {
  const [showInvite, setShowInvite] = useState(false)
  const [showAdd, setShowAdd]       = useState(false)
  const [copied, setCopied]         = useState(false)

  const members    = board.members ?? []
  const inviteCode = `KARN-${board.id.slice(0, 8).toUpperCase()}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleAddMember(m) {
    onUpdate(prev => ({ ...prev, members: [...(prev.members ?? []), { ...m, joinedAt: Date.now() }] }))
    setShowAdd(false)
  }

  function handleRemove(id) {
    onUpdate(prev => ({ ...prev, members: (prev.members ?? []).filter(m => m.id !== id) }))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-pixel text-yellow text-[11px] leading-loose">YOUR TEAM</h2>
          <p className="font-sans text-muted text-sm mt-1">
            {members.length + 1} member{members.length !== 0 ? 's' : ''} on this board
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowInvite(true)}
            className="font-pixel text-[8px] text-base bg-yellow border-2 border-yellow-dark px-3 py-2 shadow-pixel-sm hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all"
          >
            INVITE
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="font-pixel text-[8px] text-text border-2 border-border px-3 py-2 hover:border-yellow hover:text-yellow transition-colors"
          >
            + ADD
          </button>
        </div>
      </div>

      {/* Owner card */}
      <MemberCard
        member={{ id: user.id, name: user.name, initials: user.initials, color: user.color, skills: user.skills }}
        role="OWNER"
        isYou
      />

      {/* Collaborator cards */}
      {members.map(m => (
        <MemberCard
          key={m.id}
          member={m}
          role={m.role ?? 'MEMBER'}
          onRemove={() => handleRemove(m.id)}
        />
      ))}

      {/* Empty state */}
      {members.length === 0 && (
        <div className="border-2 border-dashed border-border p-8 text-center space-y-3">
          <p className="font-pixel text-[9px] text-muted">NO TEAMMATES YET</p>
          <p className="font-sans text-muted text-sm leading-relaxed">
            Invite collaborators with a code or browse Explore to find people.
          </p>
        </div>
      )}

      {showInvite && (
        <Modal onClose={() => setShowInvite(false)} title="INVITE TEAMMATES">
          <div className="space-y-5">
            <p className="font-sans text-muted text-sm leading-relaxed">
              Share this code with anyone you want to collaborate with.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-card border-2 border-border px-4 py-3 font-pixel text-[10px] text-yellow tracking-widest overflow-hidden text-ellipsis">
                {inviteCode}
              </div>
              <button
                onClick={handleCopy}
                className={`font-pixel text-[8px] px-4 py-3 border-2 flex-shrink-0 transition-all ${
                  copied ? 'border-green text-green bg-green/10' : 'border-border text-muted hover:border-yellow hover:text-yellow'
                }`}
              >
                {copied ? '✓' : 'COPY'}
              </button>
            </div>
            <p className="font-pixel text-[8px] text-border leading-relaxed">
              UNIQUE TO THIS BOARD — SHARE CAREFULLY
            </p>
          </div>
        </Modal>
      )}

      {showAdd && (
        <AddMemberModal onAdd={handleAddMember} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}

function MemberCard({ member, role, isYou, onRemove }) {
  return (
    <div className="bg-card border-2 border-border p-4 group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 flex items-center justify-center font-pixel text-[9px] text-base border border-border flex-shrink-0"
          style={{ backgroundColor: member.color }}
        >
          {member.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans text-sm font-semibold text-text truncate">{member.name}</span>
            <span className="font-pixel text-[8px] text-yellow">{role}</span>
            {isYou && <span className="font-pixel text-[7px] text-muted border border-border px-1.5 py-0.5">YOU</span>}
          </div>
          {/* Skills */}
          {member.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {member.skills.slice(0, 4).map(s => (
                <span key={s} className="font-pixel text-[7px] text-muted px-1.5 py-0.5 bg-surface border border-border">
                  {s}
                </span>
              ))}
              {member.skills.length > 4 && (
                <span className="font-pixel text-[7px] text-border">+{member.skills.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Remove */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="font-pixel text-[10px] text-border hover:text-red transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1"
            aria-label="Remove member"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

function AddMemberModal({ onAdd, onClose }) {
  const [name, setName]     = useState('')
  const [color, setColor]   = useState(AVATAR_COLORS[1])
  const [skills, setSkills] = useState([])
  const [role, setRole]     = useState('MEMBER')
  const [error, setError]   = useState('')

  const toggleSkill = s => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  function handleSubmit(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) { setError('Name is required.'); return }
    onAdd({ id: crypto.randomUUID(), name: n, initials: initials(n), color, skills, role })
  }

  return (
    <Modal onClose={onClose} title="ADD COLLABORATOR">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="NAME" error={error}>
          <input
            autoFocus value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Teammate's name"
            className="w-full bg-base border-2 border-border px-3 py-2.5 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
          />
        </Field>

        <Field label="AVATAR COLOR">
          <div className="flex gap-2 flex-wrap">
            {AVATAR_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-7 h-7 border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>

        <Field label="ROLE">
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
        </Field>

        <Field label="SKILLS (OPTIONAL)">
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
        </Field>

        <button type="submit"
          className="w-full font-pixel text-[10px] text-base bg-yellow py-3 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-px hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all"
        >
          ADD TO TEAM
        </button>
      </form>
    </Modal>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-pixel text-[8px] text-muted">{label}</label>
      {children}
      {error && <p className="font-pixel text-[8px] text-red">{error}</p>}
    </div>
  )
}

function Modal({ onClose, title, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-md shadow-pixel animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <span className="font-pixel text-[10px] text-yellow">{title}</span>
          <button onClick={onClose} className="font-pixel text-[11px] text-muted hover:text-red transition-colors">✕</button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
