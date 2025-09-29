'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function GitHubAuthButton() {
  const handleGitHubAuth = () => {
    // Redirect to our simplified GitHub auth endpoint
    window.location.href = '/api/github-auth'
  }

  return (
    <Button 
      onClick={handleGitHubAuth} 
      className="flex items-center gap-2 border-gray-300 text-gray-900 hover:bg-gray-100" 
      variant="outline"
    >
      <Github className="h-4 w-4 text-gray-900" />
      Connect GitHub
    </Button>
  )
}
