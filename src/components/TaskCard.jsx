import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { XP_VALUES } from '../storage'

const PRIORITY_CONFIG = {
  low:    { label: 'LOW',  dot: 'bg-muted',       text: 'text-muted',     badge: 'bg-card border-border' },
  medium: { label: 'MED',  dot: 'bg-yellow',      text: 'text-yellow',    badge: 'bg-yellow/10 border-yellow/40' },
  high:   { label: 'HIGH', dot: 'bg-red-light',   text: 'text-red-light', badge: 'bg-red/10 border-red/40' },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDue(dateStr) {
  if (!dateStr) return ''
  const [, m, d] = dateStr.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}`
}

export default function TaskCard({
  task,
  overlay = false,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style   = { transform: CSS.Transform.toString(transform), transition }
  const p       = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low
  const isDone  = task.column === 'done'
  const today   = new Date().toISOString().split('T')[0]
  const isOverdue = task.dueDate && task.dueDate < today && !isDone

  if (overlay) {
    return (
      <div className="bg-card border-2 border-yellow p-3 shadow-pixel rotate-1 opacity-95 cursor-grabbing w-full">
        <TaskContent task={task} p={p} isDone={isDone} isOverdue={isOverdue} />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-card border-2 p-3 w-full
        transition-colors duration-100
        ${isDragging ? 'opacity-30 border-yellow' : 'border-border hover:border-yellow/50'}
        ${isDone ? 'opacity-60' : ''}
      `}
    >
      {/* ── Top row: priority + xp + drag handle ── */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-pixel text-[8px] px-1.5 py-0.5 border ${p.badge} ${p.text} flex-shrink-0`}>
          {p.label}
        </span>
        <span className="font-pixel text-[8px] text-yellow/60 flex-shrink-0">
          +{XP_VALUES[task.priority] ?? 10}XP
        </span>
        <div className="flex-1" />
        {isDone && (
          <span className="font-pixel text-[8px] text-green-light flex-shrink-0">✓</span>
        )}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-[3px] cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0"
          aria-label="Drag task"
        >
          <div className="w-3 h-px bg-muted" />
          <div className="w-3 h-px bg-muted" />
          <div className="w-3 h-px bg-muted" />
        </div>
      </div>

      {/* ── Title ── */}
      <p className={`font-sans text-sm font-medium leading-snug break-words ${
        isDone ? 'line-through text-muted' : 'text-text'
      }`}>
        {task.title}
      </p>

      {/* ── Description ── */}
      {task.description && (
        <p className="font-sans text-xs text-muted mt-1.5 leading-relaxed line-clamp-2 break-words">
          {task.description}
        </p>
      )}

      {/* ── Due date + assignee ── */}
      {(task.dueDate || task.assigneeId) && (
        <div className="flex items-center gap-2 mt-2">
          {task.dueDate && (
            <span className={`font-pixel text-[7px] flex-shrink-0 ${isOverdue ? 'text-red-light' : 'text-muted'}`}>
              {isOverdue ? '⚠ ' : ''}{formatDue(task.dueDate)}
            </span>
          )}
          <div className="flex-1" />
          {task.assigneeId && (
            <div
              className="w-5 h-5 flex items-center justify-center font-pixel text-[6px] text-base border border-border flex-shrink-0"
              style={{ backgroundColor: task.assigneeColor }}
              title={task.assigneeName}
            >
              {task.assigneeInitials?.[0]}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
        {isDone ? (
          <button
            onClick={() => onUncomplete?.(task)}
            className="font-pixel text-[8px] text-muted hover:text-yellow transition-colors"
          >
            ↩ UNDO
          </button>
        ) : (
          <button
            onClick={() => onComplete?.(task)}
            className="font-pixel text-[8px] text-green-light hover:text-green transition-colors"
          >
            ✓ DONE
          </button>
        )}
        <span className="flex-1" />
        <button
          onClick={() => onEdit?.(task)}
          aria-label="Edit task"
          className="font-pixel text-[9px] text-border hover:text-text transition-colors px-1"
        >
          ✎
        </button>
        <button
          onClick={() => onDelete?.(task.id)}
          aria-label="Delete task"
          className="font-pixel text-[9px] text-border hover:text-red transition-colors px-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
