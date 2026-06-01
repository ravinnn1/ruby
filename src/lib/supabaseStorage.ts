// ============================================================
// Ruby's Safe Place — Supabase Storage helpers
// Bucket: ruby-vault  (private, per-user folders)
// Path convention:
//   {user_id}/memories/{uuid}.{ext}
//   {user_id}/comfort/{uuid}.{ext}
//   {user_id}/avatar/{uuid}.{ext}
// ============================================================

import { supabase, supabaseConfigured } from './supabaseClient'

export const BUCKET = 'ruby-vault'

// ── helpers ──────────────────────────────────────────────────

function ext(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg'
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

// ── Upload ────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success, or null on failure.
 *
 * @param file     The File object to upload
 * @param userId   The authenticated user's ID (used as folder prefix)
 * @param folder   Sub-folder: 'memories' | 'comfort' | 'avatar'
 */
export async function uploadImage(
  file: File,
  userId: string,
  folder: 'memories' | 'comfort' | 'avatar' = 'memories'
): Promise<string | null> {
  if (!supabaseConfigured) {
    console.warn('[Ruby Storage] Supabase not configured — skipping upload.')
    return null
  }

  const path = `${userId}/${folder}/${uid()}.${ext(file)}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })

  if (error) {
    console.error('[Ruby Storage] Upload error:', error.message)
    return null
  }

  return getPublicUrl(path)
}

// ── Get public URL ────────────────────────────────────────────

/**
 * Get the public URL for a stored file path.
 * Works even for private buckets when using signed URLs,
 * but for simplicity we use the public URL (bucket must allow public reads
 * OR you can swap this for createSignedUrl).
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// 