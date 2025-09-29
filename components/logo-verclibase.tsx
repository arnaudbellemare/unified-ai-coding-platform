'use client'

import React from 'react'

export function LogoVerclibase({ color = '#0000FF' }: { color?: string }) {
  const shadow = '0 10px 30px rgba(0, 0, 255, 0.35)'
  const darker = '#0000cc'
  return (
    <div className="flex items-center gap-4 select-none" aria-label="Verclibase logo">
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`,
          boxShadow: shadow,
        }}
      >
        <span className="text-white text-3xl font-extrabold" style={{ letterSpacing: '-0.04em' }}>
          V
        </span>
      </div>
      <span
        className="font-black tracking-tight text-6xl leading-none"
        style={{ color, textShadow: '0 2px 12px rgba(0, 0, 255, 0.4)', letterSpacing: '-0.05em' }}
      >
        Verclibase
      </span>
    </div>
  )
}
