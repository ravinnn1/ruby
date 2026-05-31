import React from 'react'

interface EmptyStateProps {
  icon?: string
  title?: string
  message: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '✨', title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4 animate-float">{icon}</div>
      {title && (
        <h3 className="font-display text-xl text-[#3A2A2F] mb-2">{title}</h3>
      )}
      <p className="text-[#7A6670] text-sm leading-relaxed max-w-xs">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
