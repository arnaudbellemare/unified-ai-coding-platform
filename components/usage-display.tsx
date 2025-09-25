'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useGitHubAuth } from '@/lib/hooks/use-github-auth'
import { Zap, Users, Calendar } from 'lucide-react'

interface UsageStats {
  used: number
  remaining: number
  limit: number
}

interface UserInfo {
  username: string
  usage: UsageStats
}

export function UsageDisplay() {
  const { user, isAuthenticated } = useGitHubAuth()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUserInfo(data.user)
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Get Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800 mb-3">
            Sign in with GitHub to start creating AI-powered tasks and track your usage.
          </p>
          <Button onClick={() => (window.location.href = '/api/auth/github')} className="w-full">
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-2 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userInfo) {
    return null
  }

  const usagePercentage = (userInfo.usage.used / userInfo.usage.limit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 100

  return (
    <Card
      className={`${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usage
          </span>
          <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'default'}>
            {userInfo.usage.used}/{userInfo.usage.limit}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tasks this month</span>
            <span className="font-medium">{userInfo.usage.remaining} remaining</span>
          </div>
          <Progress
            value={usagePercentage}
            className="h-2"
            aria-label={`${userInfo.usage.used} of ${userInfo.usage.limit} tasks used`}
          />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 text-sm">
          <img src={user?.avatar_url} alt={userInfo.username} className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-medium">{userInfo.username}</div>
            <div className="text-muted-foreground">Free Plan</div>
          </div>
        </div>

        {/* Status Message */}
        {isAtLimit ? (
          <div className="text-sm text-red-800 bg-red-100 p-2 rounded">
            <strong>Monthly limit reached!</strong> Upgrade to Pro for more tasks.
          </div>
        ) : isNearLimit ? (
          <div className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded">
            <strong>Almost at limit!</strong> {userInfo.usage.remaining} tasks remaining this month.
          </div>
        ) : (
          <div className="text-sm text-green-800 bg-green-100 p-2 rounded">
            <strong>Good to go!</strong> {userInfo.usage.remaining} tasks remaining this month.
          </div>
        )}

        {/* Upgrade Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // TODO: Implement upgrade flow
            alert('Upgrade feature coming soon!')
          }}
        >
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  )
}
