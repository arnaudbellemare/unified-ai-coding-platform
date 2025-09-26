'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [status, setStatus] = useState('Loading...')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const testEndpoints = async () => {
      try {
        // Test health endpoint
        const healthResponse = await fetch('/api/health')
        const healthData = await healthResponse.json()

        // Test GitHub OAuth simple endpoint
        const githubResponse = await fetch('/api/auth/github/simple')
        const githubData = await githubResponse.json()

        setData({
          health: healthData,
          github: githubData,
          timestamp: new Date().toISOString(),
        })
        setStatus('Success')
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setData({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    testEndpoints()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      <div className="mb-4">
        <strong>Data:</strong>
        <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>
      <div className="mb-4">
        <strong>Environment Variables (Client-side):</strong>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {JSON.stringify(
            {
              NODE_ENV: process.env.NODE_ENV,
              NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  )
}
