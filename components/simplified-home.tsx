'use client'

import React from 'react'
import UnifiedAllInOne from './unified-all-in-one'
import { AcpDemo } from './acp-demo'
import { MarketingLanding } from './marketing-landing'

export function SimplifiedHome() {
  return (
    <div className="min-h-screen">
      <MarketingLanding onPrimary={() => window.scrollTo({ top: 600, behavior: 'smooth' })} />
      {/* Black overlay section - covers from UnifiedAllInOne to end */}
      <div className="bg-black relative z-20">
        <UnifiedAllInOne />
        <div className="max-w-6xl mx-auto p-6">
          <AcpDemo />
        </div>
      </div>
    </div>
  )
}
