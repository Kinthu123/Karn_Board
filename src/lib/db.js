import { supabase } from './supabase'

// ── Profiles ──────────────────────────────────────────────────────

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? mapProfileFromDB(data) : null
}

export async function upsertProfile(profile) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id:       profile.id,
      name:     profile.name,
      initials: profile.initials,
      color:    profile.color,
      skills:   profile.skills ?? [],
    })
  if (error) throw error
}

function mapProfileFromDB(row) {
  return {
    id:       row.id,
    name:     row.name,
    initials: row.initials,
    color:    row.color,
    skills:   row.skills ?? [],
    joinedAt: row.joined_at ? new Date(row.joined_at).getTime() : Date.now(),
  }
}

// ── Boards ────────────────────────────────────────────────────────

export async function fetchBoards(userId) {
  const { data: boardRows, error: boardErr } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })

  if (boardErr) throw boardErr
  if (!boardRows || boardRows.length === 0) return []

  const boardIds = boardRows.map(b => b.id)

  const [tasksRes, membersRes, messagesRes, activityRes, moodRes] = await Promise.all([
    supabase.from('tasks').select('*').in('board_id', boardIds),
    supabase.from('board_members').select('*').in('board_id', boardIds),
    supabase.from('messages').select('*').in('board_id', boardIds).order('ts', { ascending: true }),
    supabase.from('activity_log').select('*').in('board_id', boardIds).order('ts', { ascending: true }),
    supabase.from('moodboard_items').select('*').in('board_id', boardIds),
  ])

  return boardRows.map(row => {
    const bid = row.id
    return {
      ...mapBoardFromDB(row),
      tasks:    (tasksRes.data   ?? []).filter(t => t.board_id === bid).map(mapTaskFromDB),
      members:  (membersRes.data ?? []).filter(m => m.board_id === bid).map(mapMemberFromDB),
      messages: (messagesRes.data ?? []).filter(m => m.board_id === bid).map(mapMessageFromDB),
      activity: (activityRes.data ?? []).filter(a => a.board_id === bid).map(mapActivityFromDB),
      moodboard: (moodRes.data   ?? []).filter(m => m.board_id === bid).map(mapMoodItemFromDB),
      pendingInvites: row.pending_invites ?? [],
    }
  })
}

function mapBoardFromDB(row) {
  return {
    id:             row.id,
    name:           row.name,
    createdAt:      row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    xp:             row.xp ?? 0,
    streakCount:    row.streak_count ?? 0,
    lastActiveDate: row.last_active_date ?? null,
    todayDate:      row.today_date ?? null,
    todayDoneCount: row.today_done_count ?? 0,
    notes:          row.notes ?? '',
    description:    row.description ?? '',
    phase:          row.phase ?? 'PLANNING',
    shared:         row.shared ?? false,
  }
}

function mapTaskFromDB(row) {
  return {
    id:               row.id,
    title:            row.title,
    description:      row.description ?? '',
    priority:         row.priority ?? 'medium',
    column:           row.task_column ?? 'todo',
    createdAt:        row.created_at ?? Date.now(),
    completedAt:      row.completed_at ?? null,
    xpEarned:         row.xp_earned ?? 0,
    dueDate:          row.due_date ?? null,
    assigneeId:       row.assignee_id ?? null,
    assigneeName:     row.assignee_name ?? null,
    assigneeInitials: row.assignee_initials ?? null,
    assigneeColor:    row.assignee_color ?? null,
  }
}

function mapMemberFromDB(row) {
  return {
    id:       row.id,
    name:     row.name,
    initials: row.initials,
    color:    row.color,
    skills:   row.skills ?? [],
    role:     row.role ?? 'MEMBER',
    joinedAt: row.joined_at ?? Date.now(),
  }
}

function mapMessageFromDB(row) {
  return {
    id:       row.id,
    userId:   row.user_id,
    name:     row.name,
    initials: row.initials,
    color:    row.color,
    text:     row.text,
    ts:       row.ts ?? Date.now(),
  }
}

function mapActivityFromDB(row) {
  return {
    id:             row.id,
    actorName:      row.actor_name,
    actorInitials:  row.actor_initials,
    actorColor:     row.actor_color,
    text:           row.text,
    ts:             row.ts ?? Date.now(),
  }
}

function mapMoodItemFromDB(row) {
  return {
    id:        row.id,
    text:      row.text ?? '',
    color:     row.color,
    createdAt: row.created_at ?? Date.now(),
  }
}

// ── Create board (initial insert) ─────────────────────────────────

export async function createBoardInDB(board, ownerId) {
  const { error } = await supabase.from('boards').insert({
    id:             board.id,
    owner_id:       ownerId,
    name:           board.name,
    xp:             board.xp ?? 0,
    streak_count:   board.streakCount ?? 0,
    today_date:     board.todayDate ?? null,
    today_done_count: board.todayDoneCount ?? 0,
    notes:          board.notes ?? '',
    description:    board.description ?? '',
    phase:          board.phase ?? 'PLANNING',
    shared:         board.shared ?? false,
    pending_invites: [],
  })
  if (error) throw error
}

// ── Sync full board state to Supabase ─────────────────────────────
// Called debounced after every board mutation.

export async function syncBoard(board, ownerId) {
  // 1. Upsert board scalar fields
  const { error: boardErr } = await supabase.from('boards').upsert({
    id:               board.id,
    owner_id:         ownerId,
    name:             board.name,
    xp:               board.xp,
    streak_count:     board.streakCount,
    last_active_date: board.lastActiveDate,
    today_date:       board.todayDate,
    today_done_count: board.todayDoneCount,
    notes:            board.notes ?? '',
    description:      board.description ?? '',
    phase:            board.phase ?? 'PLANNING',
    shared:           board.shared ?? false,
    pending_invites:  board.pendingInvites ?? [],
  })
  if (boardErr) throw boardErr

  // 2. Replace tasks (delete all → reinsert current)
  await supabase.from('tasks').delete().eq('board_id', board.id)
  if (board.tasks?.length > 0) {
    const { error } = await supabase.from('tasks').insert(
      board.tasks.map(t => ({
        id:               t.id,
        board_id:         board.id,
        title:            t.title,
        description:      t.description ?? '',
        priority:         t.priority ?? 'medium',
        task_column:      t.column ?? 'todo',
        created_at:       t.createdAt ?? Date.now(),
        completed_at:     t.completedAt ?? null,
        xp_earned:        t.xpEarned ?? 0,
        due_date:         t.dueDate ?? null,
        assignee_id:      t.assigneeId ?? null,
        assignee_name:    t.assigneeName ?? null,
        assignee_initials: t.assigneeInitials ?? null,
        assignee_color:   t.assigneeColor ?? null,
      }))
    )
    if (error) throw error
  }

  // 3. Replace members
  await supabase.from('board_members').delete().eq('board_id', board.id)
  if (board.members?.length > 0) {
    const { error } = await supabase.from('board_members').insert(
      board.members.map(m => ({
        id:       m.id,
        board_id: board.id,
        name:     m.name,
        initials: m.initials,
        color:    m.color,
        skills:   m.skills ?? [],
        role:     m.role ?? 'MEMBER',
        joined_at: m.joinedAt ?? Date.now(),
      }))
    )
    if (error) throw error
  }

  // 4. Replace moodboard items
  await supabase.from('moodboard_items').delete().eq('board_id', board.id)
  if (board.moodboard?.length > 0) {
    const { error } = await supabase.from('moodboard_items').insert(
      board.moodboard.map(i => ({
        id:         i.id,
        board_id:   board.id,
        text:       i.text ?? '',
        color:      i.color,
        created_at: i.createdAt ?? Date.now(),
      }))
    )
    if (error) throw error
  }

  // 5. Upsert messages — append-only, never delete
  if (board.messages?.length > 0) {
    await supabase.from('messages').upsert(
      board.messages.map(m => ({
        id:       m.id,
        board_id: board.id,
        user_id:  m.userId ?? null,
        name:     m.name,
        initials: m.initials,
        color:    m.color,
        text:     m.text,
        ts:       m.ts ?? Date.now(),
      })),
      { ignoreDuplicates: true }
    )
  }

  // 6. Upsert activity — append-only, never delete
  if (board.activity?.length > 0) {
    await supabase.from('activity_log').upsert(
      board.activity.map(a => ({
        id:             a.id,
        board_id:       board.id,
        actor_name:     a.actorName,
        actor_initials: a.actorInitials,
        actor_color:    a.actorColor,
        text:           a.text,
        ts:             a.ts ?? Date.now(),
      })),
      { ignoreDuplicates: true }
    )
  }
}
