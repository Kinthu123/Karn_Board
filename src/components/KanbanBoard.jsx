import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { COLUMN_ORDER, COLUMNS } from '../storage'

const HEADER_COLOR = {
  todo:       'text-muted border-border',
  inprogress: 'text-yellow border-yellow',
  done:       'text-green-light border-green',
}

export default function KanbanBoard({
  tasks, onUpdate, onCompleteTask, onUncompleteTask, onEditTask, onDeleteTask,
}) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const getColTasks   = col => tasks.filter(t => t.column === col)
  const findTaskCol   = id  => tasks.find(t => t.id === id)?.column ?? null

  function handleDragStart({ active }) {
    setActiveTask(tasks.find(t => t.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over) return

    const fromCol = findTaskCol(active.id)
    const toCol   = COLUMN_ORDER.includes(over.id) ? over.id : findTaskCol(over.id)
    if (!fromCol || !toCol) return

    const task = tasks.find(t => t.id === active.id)

    if (fromCol === toCol) {
      const col      = getColTasks(fromCol)
      const oldIndex = col.findIndex(t => t.id === active.id)
      const newIndex = col.findIndex(t => t.id === over.id)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
      const reordered = arrayMove(col, oldIndex, newIndex)
      onUpdate(prev => ({
        ...prev,
        tasks: [...prev.tasks.filter(t => t.column !== fromCol), ...reordered],
      }))
    } else if (toCol === 'done') {
      onCompleteTask(task)
    } else if (fromCol === 'done') {
      onUncompleteTask(task)
    } else {
      onUpdate(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === active.id ? { ...t, column: toCol } : t),
      }))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Outer wrapper: horizontal scroll on overflow */}
      <div className="flex gap-4 h-full min-w-0" style={{ minHeight: 0 }}>
        {COLUMN_ORDER.map(colId => (
          <KanbanColumn
            key={colId}
            column={COLUMNS[colId]}
            tasks={getColTasks(colId)}
            onComplete={onCompleteTask}
            onUncomplete={onUncompleteTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask && <TaskCard task={activeTask} overlay />}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({ column, tasks, onComplete, onUncomplete, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col flex-1 min-w-[240px] max-w-sm min-h-0">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${HEADER_COLOR[column.id]}`}>
        <span className={`font-pixel text-[9px] ${HEADER_COLOR[column.id].split(' ')[0]}`}>
          {column.label}
        </span>
        <span className="font-pixel text-[8px] text-muted bg-card border border-border px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 flex flex-col gap-2 overflow-y-auto p-1
          border-2 border-dashed transition-colors duration-150
          ${isOver ? 'border-yellow/60 bg-yellow/5' : 'border-transparent'}
        `}
        style={{ minHeight: 120 }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="font-pixel text-[8px] text-border text-center leading-loose">
              DROP<br />HERE
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
