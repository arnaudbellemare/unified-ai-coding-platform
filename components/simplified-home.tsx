'use client'

import React, { useState } from 'react'
import UnifiedAllInOne from './unified-all-in-one'
import VercelSandboxTester from './vercel-sandbox-tester'

export function SimplifiedHome() {
  const [showTesting, setShowTesting] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {!showTesting ? (
        <div>
          <UnifiedAllInOne />
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
