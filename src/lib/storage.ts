// ============================================================
// Ruby's Safe Place — localStorage utilities (offline-friendly)
// ============================================================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function now(): string {
  return new Date().toISOString()
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Generic CRUD ─────────────────────────────────────────────

export function getAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAll<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    console.error('localStorage save failed for key:', key)
  }
}

export function addItem<T extends { id?: string; created_at?: string; updated_at?: string }>(
  key: string,
  item: Omit<T, 'id' | 'created_at' | 'updated_at'>
): T {
  const items = getAll<T>(key)
  const newItem = {
    ...item,
    id: generateId(),
    created_at: now(),
    updated_at: now(),
  } as T
  saveAll(key, [newItem, ...items])
  return newItem
}

export function updateItem<T extends { id: string; updated_at?: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T | null {
  const items = getAll<T>(key)
  let updated: T | null = null
  const newItems = items.map(item => {
    if (item.id === id) {
      updated = { ...item, ...updates, updated_at: now() } as T
      return updated
    }
    return item
  })
  saveAll(key, newItems)
  return updated
}

export function deleteItem<T extends { id: string }>(key: string, id: string): void {
  const items = getAll<T>(key)
  saveAll(key, items.filter(item => item.id !== id))
}

export function getRandom<T>(key: string): T | null {
  const items = getAll<T>(key)
  if (!items.length) return null
  return items[Math.floor(Math.random() * items.length)]
}

export function getValue<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error('localStorage setValue failed for key:', key)
  }
}

// ─── Storage Keys ─────────────────────────────────────────────
export const RUBY_KEYS = {
  journalEntries: 'ruby_journal_entries',
  moodEntries: 'ruby_mood_entries',
  episodeLogs: 'ruby_episode_logs',
  comfortItems: 'ruby_comfort_items',
  memories: 'ruby_memories',
  routineTemplates: 'ruby_routine_templates',
  routineCompletions: 'ruby_routine_completions',
  letters: 'ruby_letters',
  budgetEntries: 'ruby_budget_entries',
  wishlistItems: 'ruby_wishlist_items',
  safePlan: 'ruby_safe_plan',
  worryItems: 'ruby_worry_items',
  checkIns: 'ruby_check_ins',
  profile: 'ruby_profile',
  drawings: 'ruby_drawings',
}
