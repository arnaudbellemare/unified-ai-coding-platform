'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Brain, Zap, DollarSign, Clock, FileText, Minimize2 } from 'lucide-react'

interface ContextStats {
  totalMessages: number
  maxMessages: number
  compressionRatio: number
  isCompressed: boolean
  tokensSaved: number
  costSavings: number
  responseTime: number
}

export function ContextManagementDashboard() {
  const [stats, setStats] = useState<ContextStats>({
    totalMessages: 0,
    maxMessages: 20,
    compressionRatio: 1,
    isCompressed: false,
    tokensSaved: 0,
    costSavings: 0,
    responseTime: 0,
  })

  const [isActive, setIsActive] = useState(false)

  // Simulate context management stats
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setStats((prev) => {
          const newTotal = prev.totalMessages + Math.floor(Math.random() * 3) + 1
          const newMax = 20
          const newCompressionRatio = newTotal > newMax ? newMax / newTotal : 1
          const newIsCompressed = newTotal > newMax
          const newTokensSaved = newIsCompressed ? Math.floor((newTotal - newMax) * 150) : 0
          const newCostSavings = newTokensSaved * 0.0001 // $0.0001 per token
          const newResponseTime = newIsCompressed ? Math.max(200, 500 - newTokensSaved * 0.1) : 500

          return {
            totalMessages: newTotal,
            maxMessages: newMax,
            compressionRatio: newCompressionRatio,
            isCompressed: newIsCompressed,
            tokensSaved: newTokensSaved,
            costSavings: newCostSavings,
            responseTime: newResponseTime,
          }
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isActive])

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`
  const formatTime = (ms: number) => `${ms}ms`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Context Management Dashboard</h2>
          <p className="text-muted-foreground">Real-time context compaction and token optimization</p>
        </div>
        <Button
          onClick={() => setIsActive(!isActive)}
          variant={isActive ? 'destructive' : 'default'}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isActive ? 'Stop Simulation' : 'Start Simulation'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Context Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Context Messages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Max: {stats.maxMessages} messages</p>
            <div className="mt-2">
              <Progress value={Math.min((stats.totalMessages / stats.maxMessages) * 100, 100)} />
            </div>
            {stats.isCompressed && (
              <Badge variant="secondary" className="mt-2">
                <Minimize2 className="h-3 w-3 mr-1" />
                Compressed
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Token Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tokensSaved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Compression ratio: {(stats.compressionRatio * 100).toFixed(1)}%
            </p>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">
                  {stats.isCompressed ? 'Active compression' : 'No compression needed'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.costSavings)}</div>
            <p className="text-xs text-muted-foreground">Per request savings</p>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600">
                  {stats.costSavings > 0 ? 'Savings active' : 'No savings yet'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.responseTime)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.isCompressed ? 'Optimized with compression' : 'Standard processing'}
            </p>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${stats.responseTime < 300 ? 'bg-green-500' : 'bg-yellow-500'}`}
                ></div>
                <span className={`text-xs ${stats.responseTime < 300 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {stats.responseTime < 300 ? 'Fast response' : 'Standard response'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Context Management Benefits */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Context Management Benefits</CardTitle>
            <CardDescription>Real-time optimization features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Intelligent message compaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Token limit prevention</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Cost optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Faster response times</span>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Technical Implementation</CardTitle>
            <CardDescription>Context management using ctx-zip and AI SDK v5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Context Compaction</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smart message boundary detection</li>
                  <li>• System message preservation</li>
                  <li>• Tool result optimization</li>
                  <li>• Real-time compression</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Blob storage integration</li>
                  <li>• File system access tools</li>
                  <li>• Step-based execution limits</li>
                  <li>• Automatic fallback handling</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
