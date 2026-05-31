import React from 'react'

interface LoadingStateProps {
  message?: string
  variant?: 'spinner' | 'skeleton' | 'dots'
}

export function LoadingState({ message = 'Just a moment…', variant = 'spinner' }: LoadingStateProps) {
  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#C94C63]"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p className="text-[#7A6670] text-sm">{message}</p>
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl p-5 space-y-3">
            <div className="skeleton h-4 w-3/4 rounded-full" />
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#F8C8DC]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#C94C63] border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-[#C94C63]/10 flex items-center justify-center">
          <span className="text-sm">💎</span>
        </div>
      </div>
      <p className="text-[#7A6670] text-sm">{message}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl p-5 card-glass gem-border soft-shadow space-y-3">
      <div className="skeleton h-4 w-1/2 rounded-full" />
      <div className="skeleton h-3 w-full rounded-full" />
      <div className="skeleton h-3 w-3/4 rounded-full" />
    </div>
  )
}
