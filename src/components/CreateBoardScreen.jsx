import { useState } from 'react'

export default function CreateBoardScreen({ onCreate }) {
  const [name, setName]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  function handleCreate(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Give your board a name first.'); return }
    setSubmitting(true)
    setTimeout(() => onCreate(trimmed), 300)
  }

  return (
    <div className="scanline dot-grid fixed inset-0 bg-base flex flex-col items-center justify-center gap-10 px-6 animate-fade-in">

      {/* Live kanban preview */}
      <KanbanIllustration boardName={name.trim()} />

      {/* Headline */}
      <div className="text-center space-y-3">
        <h1 className="font-pixel text-yellow leading-loose glow-yellow" style={{ fontSize: '13px' }}>
          CREATE YOUR<br />FIRST BOARD
        </h1>
        <p className="font-sans text-muted text-sm leading-relaxed max-w-xs mx-auto">
          Name your project, then start tracking tasks, earning XP, and building momentum.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCreate} className="w-full max-w-sm flex flex-col gap-4">
        <div className="relative bg-card border-2 border-border p-6 shadow-pixel">
          <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-yellow/50" />
          <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-yellow/50" />
          <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-yellow/50" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-yellow/50" />

          <div className="space-y-2">
            <label className="font-pixel text-[7px] text-yellow/70 flex items-center gap-1.5">
              <span>▸</span> BOARD NAME
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. My Startup, Portfolio v2…"
              maxLength={48}
              className="w-full bg-base border-2 border-border px-4 py-3 font-sans text-sm text-text placeholder:text-border focus:outline-none focus:border-yellow transition-colors"
            />
            {error && (
              <p className="font-pixel text-[7px] text-red flex items-center gap-1.5">
                <span>⚠</span>{error}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full font-pixel text-[10px] text-base bg-yellow py-4 border-2 border-yellow-dark shadow-pixel-y hover:-translate-y-0.5 hover:shadow-pixel active:translate-y-0 active:shadow-none transition-all duration-75 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? '▌ ▌ ▌' : '+ CREATE BOARD →'}
        </button>
      </form>

    </div>
  )
}

function KanbanIllustration({ boardName }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-4 flex items-center">
        {boardName
          ? <span className="font-pixel text-[7px] text-yellow glow-yellow tracking-widest">{boardName}</span>
          : <span className="font-pixel text-[7px] text-border animate-blink">_</span>
        }
      </div>
      <div className="flex gap-2.5">
        {/* TO DO */}
        <div className="w-[72px] flex flex-col gap-1.5 p-2 border border-border">
          <div className="h-1 w-8 bg-border mb-0.5" />
          <div className="h-6 bg-surface border border-border/60 w-full" />
          <div className="h-6 bg-surface border border-border/60 w-4/5" />
          <div className="h-6 bg-surface border border-border/60 w-full" />
        </div>
        {/* IN PROGRESS */}
        <div className="w-[72px] flex flex-col gap-1.5 p-2 border border-yellow/40">
          <div className="h-1 w-8 bg-yellow/60 mb-0.5" />
          <div className="h-6 bg-yellow/10 border border-yellow/30 w-full" />
        </div>
        {/* DONE */}
        <div className="w-[72px] flex flex-col gap-1.5 p-2 border border-green/40">
          <div className="h-1 w-8 bg-green/70 mb-0.5" />
          <div className="h-6 bg-green/10 border border-green/30 w-full" />
          <div className="h-6 bg-green/10 border border-green/30 w-3/4" />
        </div>
      </div>
    </div>
  )
}
