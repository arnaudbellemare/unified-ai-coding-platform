'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { signIn } from 'next-auth/react'

export function GitHubAuthButton() {
  const handleGitHubAuth = () => {
    // Use NextAuth for GitHub authentication
    signIn('github', { callbackUrl: '/' })
  }

  return (
    <Button
      onClick={handleGitHubAuth}
      className="group flex items-center gap-2 border-white text-white hover:bg-white hover:text-black transition-colors"
      variant="outline"
    >
      <Github className="h-4 w-4 text-white group-hover:text-black transition-colors" />
      Connect GitHub
    </Button>
  )
}
