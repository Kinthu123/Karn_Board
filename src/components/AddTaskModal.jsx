import { useState, useEffect, useRef } from 'react'
import { XP_VALUES, COLUMN_ORDER, COLUMNS } from '../storage'

const PRIORITIES = ['low', 'medium', 'high']

export default function AddTaskModal({ initial, onSubmit, onClose }) {
  const [title, setTitle]       = useState(initial?.title ?? '')
  const [desc, setDesc]         = useState(initial?.description ?? '')
  const [priority, setPriority] = useState(initial?.priority ?? 'medium')
  const [column, setColumn]     = useState(initial?.column ?? 'todo')
  const [error, setError]       = useState('')
  const titleRef = useRef(null)
  const isEdit   = !!initial

  useEffect(() => {
    titleRef.current?.focus()
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) { setError('Task title is required.'); return }
    onSubmit({ title: trimmed, description: desc.trim(), priority, column })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border-2 border-border w-full max-w-md shadow-pixel animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-pixel text-[10px] text-yellow">
            {isEdit ? 'EDIT TASK' : 'NEW TASK'}
          </span>
          <button
            onClick={onClose}
            className="font-pixel text-[10px] text-muted hover:text-red transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[8px] text-muted">TASK TITLE *</label>
            <input
              ref={titleRef}
              value={title}
              onChange={e => { setTitle(e.target.value); setError('') }}
              placeholder="What needs to be done?"
              className="
                w-full bg-card border-2 border-border
                px-3 py-2.5 font-sans text-sm text-text
                placeholder:text-border
                focus:outline-none focus:border-yellow
                transition-colors
              "
            />
            {error && <p className="font-pixel text-[7px] text-red">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-pixel text-[8px] text-muted">DESCRIPTION</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              className="
                w-full bg-card border-2 border-border
                px-3 py-2.5 font-sans text-sm text-text resize-none
                placeholder:text-border
                focus:outline-none focus:border-yellow
                transition-colors
              "
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="font-pixel text-[8px] text-muted">PRIORITY</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => {
                const cfg = { low: { color: 'text-muted border-muted', active: 'border-muted bg-muted/10' }, medium: { color: 'text-yellow border-yellow', active: 'border-yellow bg-yellow/10' }, high: { color: 'text-red-light border-red', active: 'border-red bg-red/10' } }[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      flex-1 py-2 border-2 font-pixel text-[8px] transition-all
                      ${priority === p ? cfg.active + ' ' + cfg.color : 'border-border text-border hover:border-muted'}
                    `}
                  >
                    {p.toUpperCase()}
                    <span className="block text-[7px] mt-0.5 opacity-70">+{XP_VALUES[p]}XP</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column */}
          <div className="space-y-2">
            <label className="font-pixel text-[8px] text-muted">START IN</label>
            <div className="flex gap-2">
              {COLUMN_ORDER.map(colId => (
                <button
                  key={colId}
                  type="button"
                  onClick={() => setColumn(colId)}
                  className={`
                    flex-1 py-2 border-2 font-pixel text-[8px] transition-all
                    ${column === colId
                      ? 'border-yellow text-yellow bg-yellow/10'
                      : 'border-border text-border hover:border-muted'
                    }
                  `}
                >
                  {COLUMNS[colId].label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="
              w-full font-pixel text-[10px] text-base bg-yellow
              py-3 border-2 border-yellow-dark
              shadow-pixel-y
              hover:translate-y-[-1px] hover:shadow-pixel
              active:translate-y-0 active:shadow-none
              transition-all duration-75
            "
          >
            {isEdit ? 'SAVE CHANGES' : '+ ADD TASK'}
          </button>
        </form>
      </div>
    </div>
  )
}
