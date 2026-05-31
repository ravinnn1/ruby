import React from 'react'

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ruby' | 'blush' | 'matcha' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function SoftButton({
  variant = 'ruby',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: SoftButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94C63] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    ruby: 'bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white hover:from-[#8A0F1A] hover:to-[#B8405A] shadow-md hover:shadow-lg active:scale-95',
    blush: 'bg-gradient-to-r from-[#F8C8DC] to-[#FADADD] text-[#3A2A2F] hover:from-[#F0B8CC] hover:to-[#F5CBCE] shadow-sm hover:shadow-md active:scale-95',
    matcha: 'bg-gradient-to-r from-[#A8C686] to-[#6F8F5F] text-white hover:from-[#98B676] hover:to-[#5F7F4F] shadow-md hover:shadow-lg active:scale-95',
    ghost: 'bg-transparent text-[#7A6670] hover:bg-[#F8C8DC]/30 hover:text-[#3A2A2F] active:scale-95',
    outline: 'bg-transparent border-2 border-[#C94C63] text-[#C94C63] hover:bg-[#C94C63]/10 active:scale-95',
    danger: 'bg-gradient-to-r from-[#9B111E] to-[#C94C63] text-white hover:opacity-90 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Just a moment…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
