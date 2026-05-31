import React from 'react'

const moodConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  calm: { emoji: '🌿', color: '#6F8F5F', bg: '#A8C686/20' },
  anxious: { emoji: '🌀', color: '#B76E79', bg: '#F8C8DC/40' },
  sad: { emoji: '🌧', color: '#7A6670', bg: '#E8A3B8/20' },
  angry: { emoji: '🌋', color: '#9B111E', bg: '#C94C63/15' },
  overwhelmed: { emoji: '🌊', color: '#B76E79', bg: '#F8C8DC/30' },
  numb: { emoji: '🌫', color: '#7A6670', bg: '#FADADD/40' },
  hopeful: { emoji: '🌸', color: '#C94C63', bg: '#F8C8DC/30' },
  happy: { emoji: '☀️', color: '#6F8F5F', bg: '#A8C686/20' },
  tired: { emoji: '🌙', color: '#7A6670', bg: '#FADADD/30' },
  proud: { emoji: '💎', color: '#9B111E', bg: '#C94C63/15' },
  okay: { emoji: '🌤', color: '#6F8F5F', bg: '#A8C686/15' },
  scared: { emoji: '🍂', color: '#B76E79', bg: '#F8C8DC/30' },
  light: { emoji: '🌼', color: '#6F8F5F', bg: '#A8C686/20' },
  manageable: { emoji: '🌿', color: '#6F8F5F', bg: '#A8C686/15' },
  heavy: { emoji: '🌧', color: '#7A6670', bg: '#E8A3B8/20' },
  overwhelming: { emoji: '🌊', color: '#B76E79', bg: '#F8C8DC/30' },
}

interface MoodPillProps {
  mood: string
  size?: 'sm' | 'md'
  showEmoji?: boolean
}

export function MoodPill({ mood, size = 'md', showEmoji = true }: MoodPillProps) {
  const config = moodConfig[mood.toLowerCase()] || {
    emoji: '✨',
    color: '#7A6670',
    bg: '#FADADD/30',
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass}`}
      style={{
        color: config.color,
        backgroundColor: `${config.color}18`,
        border: `1px solid ${config.color}30`,
      }}
    >
      {showEmoji && <span>{config.emoji}</span>}
      <span className="capitalize">{mood}</span>
    </span>
  )
}
