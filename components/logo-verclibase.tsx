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
        {/* Stylized triple‑stroke emblem: center straight, side pillars with stronger inner bends */}
        <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
          <g fill="#ffffff">
            {/* Top bar with flared ends */}
            <path d="M14 18 L50 18 L46 22 L18 22 Z" />
            {/* Left pillar with pronounced concave inner edge */}
            <path d="M20 22 L28 22 C24.5 28 24.3 36 28 42 L20 42 C18.6 36 18.6 28 20 22 Z" />
            {/* Center straight pillar */}
            <rect x="30" y="22" width="4" height="20" rx="1.2" />
            {/* Right pillar with pronounced concave inner edge (mirror) */}
            <path d="M44 22 L36 22 C39.5 28 39.7 36 36 42 L44 42 C45.4 36 45.4 28 44 22 Z" />
            {/* Bottom bar with flared ends */}
            <path d="M18 42 L46 42 L50 46 L14 46 Z" />
          </g>
        </svg>
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
