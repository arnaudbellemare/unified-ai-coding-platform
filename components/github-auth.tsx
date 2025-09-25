'use client'

import { useGitHubAuth } from '@/lib/hooks/use-github-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Github } from 'lucide-react'

export function GitHubAuth() {
  const { user, loading, login, logout, isAuthenticated } = useGitHubAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={login} variant="outline" className="gap-2">
        <Github className="h-4 w-4" />
        Connect GitHub
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar_url} alt={user?.name} />
          <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="text-gray-500">@{user?.login}</div>
        </div>
      </div>
      <Button onClick={logout} variant="ghost" size="sm">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
