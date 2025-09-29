'use client'

import React, { useState } from 'react'
import UnifiedAllInOne from './unified-all-in-one'
import { AcpDemo } from './acp-demo'
import { MarketingLanding } from './marketing-landing'
import VercelSandboxTester from './vercel-sandbox-tester'

export function SimplifiedHome() {
  const [showTesting, setShowTesting] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {!showTesting ? (
        <div>
          <MarketingLanding onPrimary={() => window.scrollTo({ top: 600, behavior: 'smooth' })} />
          <UnifiedAllInOne />
          <div className="max-w-6xl mx-auto p-6">
            <AcpDemo />
          </div>
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setShowTesting(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              Test System
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowTesting(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Main
            </button>
          </div>
          <VercelSandboxTester />
        </div>
      )}
    </div>
  )
}
