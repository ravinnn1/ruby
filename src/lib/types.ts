// ============================================================
// Ruby's Safe Place — TypeScript Types
// ============================================================

export interface Profile {
  id: string
  display_name: string | null
  avatar_config: AvatarConfig
  preferred_theme: string
  calming_phrase: string | null
  favorite_color: string | null
  favorite_activity: string | null
  created_at: string
  updated_at: string
}

export interface AvatarConfig {
  hair_color?: string
  outfit_color?: string
  accessory?: string
  background?: string
}

export interface MoodEntry {
  id: string
  user_id: string
  mood: string
  intensity: number | null
  note: string | null
  helped_by: string[]
  made_worse: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string | null
  body: string
  prompt_category: string | null
  mood: string | null
  intensity: number | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface EpisodeLog {
  id: string
  user_id: string
  trigger: string | null
  intensity: number | null
  body_sensations: string[]
  what_helped: string[]
  aftercare_completed: string[]
  notes: string | null
  created_at: string
}

export interface ComfortItem {
  id: string
  user_id: string
  category: string
  title: string
  content: string | null
  item_type: 'text' | 'image' | 'link' | 'audio' | 'checklist' | 'quote' | 'memory'
  media_url: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  user_id: string
  title: string | null
  caption: string | null
  memory_date: string | null
  mood: string | null
  tags: string[]
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface RoutineItem {
  id: string
  label: string
  completed?: boolean
}

export interface RoutineTemplate {
  id: string
  user_id: string
  title: string
  description: string | null
  items: RoutineItem[]
  routine_type: 'morning' | 'nightly' | 'aftercare' | 'custom'
  created_at: string
}

export interface RoutineCompletion {
  id: string
  user_id: string
  routine_id: string
  completed_items: string[]
  note: string | null
  created_at: string
}

export interface Letter {
  id: string
  user_id: string
  title: string
  body: string | null
  letter_type: 'future' | 'anxious' | 'alone' | 'confidence' | 'unsent' | 'custom'
  unlock_date: string | null
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface BudgetEntry {
  id: string
  user_id: string
  category: string
  amount: number
  note: string | null
  entry_date: string
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  title: string
  price: number | null
  url: string | null
  reason: string | null
  pause_reflection: PauseReflection
  purchased: boolean
  created_at: string
  updated_at: string
}

export interface PauseReflection {
  really_want?: boolean
  want_tomorrow?: boolean
  comfort_impulse_necessity?: string
  can_wait_24h?: boolean
}

export interface SafePlan {
  id: string
  user_id: string
  warning_signs: string[]
  helpful_actions: string[]
  unhelpful_actions: string[]
  safe_people: SafePerson[]
  safe_places: string[]
  emergency_steps: string[]
  reassurance_text: string | null
  want_said: string | null
  dont_want_said: string | null
  created_at: string
  updated_at: string
}

export interface SafePerson {
  name: string
  relationship?: string
  contact?: string
}

export interface WorryItem {
  id: string
  user_id: string
  worry_text: string
  action_taken: string | null
  tiny_next_step: string | null
  released: boolean
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  heaviness: 'light' | 'manageable' | 'heavy' | 'overwhelming' | null
  emotion: string | null
  note: string | null
  created_at: string
}

// UI types
export type Theme = 'soft-ruby' | 'pink-matcha' | 'cream-garden' | 'deep-ruby-night'

export type Mood =
  | 'calm' | 'anxious' | 'sad' | 'angry' | 'overwhelmed'
  | 'numb' | 'hopeful' | 'happy' | 'tired' | 'proud'
  | 'okay' | 'scared'

export type Heaviness = 'light' | 'manageable' | 'heavy' | 'overwhelming'
