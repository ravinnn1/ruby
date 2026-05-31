import React from 'react'

interface RubyCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'gem' | 'soft' | 'matcha' | 'ruby'
  hoverable?: boolean
}

export function RubyCard({ children, className = '', onClick, variant = 'default', hoverable = false }: RubyCardProps) {
  const base = 'rounded-3xl p-5 transition-all duration-300'

  const variants = {
    default: 'card-glass gem-border soft-shadow',
    gem: 'card-glass gem-border ruby-glow',
    soft: 'bg-[#FFF7EF] border border-[#F8C8DC]/50 soft-shadow',
    matcha: 'bg-gradient-to-br from-[#A8C686]/20 to-[#6F8F5F]/10 border border-[#A8C686]/30 soft-shadow',
    ruby: 'bg-gradient-to-br from-[#9B111E]/5 to-[#C94C63]/10 border border-[#C94C63]/20 soft-shadow',
  }

  const hoverClass = hoverable ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : ''

  return (
    <div
      className={`${base} ${variants[variant]} ${hoverClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}
