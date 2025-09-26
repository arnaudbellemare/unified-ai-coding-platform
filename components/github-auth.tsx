'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function GitHubAuth() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <span className="text-sm text-gray-600">{session.user?.name}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => signOut()}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={() => signIn('github')}
      className="bg-gray-900 hover:bg-gray-800 text-white"
    >
      Connect GitHub
    </Button>
  )
}