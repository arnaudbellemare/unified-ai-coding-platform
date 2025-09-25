'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ExternalLink, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface DeployToVercelProps {
  taskId: string
  repoUrl: string
  branchName: string
  sandboxUrl?: string
}

interface DeploymentStatus {
  status: 'idle' | 'deploying' | 'success' | 'error'
  deploymentUrl?: string
  error?: string
  progress?: number
}

export function DeployToVercel({ taskId, repoUrl, branchName, sandboxUrl }: DeployToVercelProps) {
  const [deployment, setDeployment] = useState<DeploymentStatus>({ status: 'idle' })
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeployment({ status: 'deploying', progress: 0 })

    try {
      // Simulate deployment progress
      const progressInterval = setInterval(() => {
        setDeployment((prev) => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + Math.random() * 20, 90),
        }))
      }, 500)

      const response = await fetch('/api/deploy-to-vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          repoUrl,
          branchName,
          sandboxUrl,
        }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Deployment failed')
      }

      const result = await response.json()

      setDeployment({
        status: 'success',
        deploymentUrl: result.deploymentUrl,
        progress: 100,
      })
    } catch (error) {
      setDeployment({
        status: 'error',
        error: error instanceof Error ? error.message : 'Deployment failed',
        progress: 0,
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const getStatusIcon = () => {
    switch (deployment.status) {
      case 'deploying':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (deployment.status) {
      case 'deploying':
        return 'Deploying to Vercel...'
      case 'success':
        return 'Deployed successfully!'
      case 'error':
        return 'Deployment failed'
      default:
        return 'Deploy to Vercel'
    }
  }

  const getStatusColor = () => {
    switch (deployment.status) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'deploying':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Deploy to Vercel
          {deployment.status === 'success' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Live
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Deploy your modified project to Vercel to see the results instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deployment.status === 'deploying' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deployment Progress</span>
              <span>{Math.round(deployment.progress || 0)}%</span>
            </div>
            <Progress value={deployment.progress} className="w-full" />
          </div>
        )}

        {deployment.status === 'success' && deployment.deploymentUrl && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Ready to deploy!</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(deployment.deploymentUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Deploy to Vercel
            </Button>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">Deployment Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Deploy to Vercel" above</li>
                <li>Sign in to Vercel if prompted</li>
                <li>Click "Deploy" on the Vercel page</li>
                <li>This deploys from your forked repository with AI changes</li>
                <li>Your fork contains all the modifications made by the AI</li>
              </ol>
            </div>
          </div>
        )}

        {deployment.status === 'error' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Deployment failed</span>
            </div>
            <p className="text-sm text-red-600">{deployment.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Repository:</span>
            <p className="text-gray-600 truncate">{repoUrl}</p>
          </div>
          <div>
            <span className="font-medium">Branch:</span>
            <p className="text-gray-600">{branchName}</p>
          </div>
        </div>

        {deployment.status === 'idle' && (
          <Button onClick={handleDeploy} disabled={isDeploying} className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            {getStatusText()}
          </Button>
        )}

        {deployment.status === 'deploying' && (
          <Button disabled className="w-full" size="lg">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {getStatusText()}
          </Button>
        )}

        {deployment.status === 'success' && (
          <Button onClick={handleDeploy} variant="outline" className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            Redeploy
          </Button>
        )}

        {deployment.status === 'error' && (
          <Button onClick={handleDeploy} className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
