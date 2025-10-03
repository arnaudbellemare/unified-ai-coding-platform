'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Bot, Zap, Globe, TrendingUp, TrendingDown, Circle, Play, Pause, RotateCcw } from 'lucide-react'

interface SwarmMetrics {
  activeAgents: number
  totalBuilds: number
  successRate: number
  avgBuildTime: number
  geoScore: number
  aeoScore: number
  x402Transactions: number
  quantumEfficiency: number
}

interface AgentStatus {
  name: string
  status: 'idle' | 'active' | 'error'
  lastActivity: string
  buildsCompleted: number
  avgScore: number
}

interface RealTimeEvent {
  id: string
  timestamp: string
  type: 'build_start' | 'build_complete' | 'agent_error' | 'payment_success'
  agent: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
}

export default function StoreForgeMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SwarmMetrics>({
    activeAgents: 5,
    totalBuilds: 0,
    successRate: 0,
    avgBuildTime: 0,
    geoScore: 0,
    aeoScore: 0,
    x402Transactions: 0,
    quantumEfficiency: 0,
  })

  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([])
  const [events, setEvents] = useState<RealTimeEvent[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Simulate real-time data updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Simulate metrics updates
      setMetrics((prev) => ({
        ...prev,
        totalBuilds: prev.totalBuilds + Math.floor(Math.random() * 3),
        successRate: Math.min(100, prev.successRate + Math.random() * 2),
        geoScore: Math.min(100, prev.geoScore + Math.random() * 5),
        aeoScore: Math.min(100, prev.aeoScore + Math.random() * 3),
        x402Transactions: prev.x402Transactions + Math.floor(Math.random() * 5),
        quantumEfficiency: Math.min(95, prev.quantumEfficiency + Math.random() * 2),
      }))

      // Simulate new events
      const eventTypes = ['build_start', 'build_complete', 'agent_error', 'payment_success'] as const
      const agents = ['DiscoveryAgent', 'BuildAgent', 'OptAgent', 'PaymentAgent', 'DeployAgent']
      const severities = ['info', 'warning', 'error', 'success'] as const

      if (Math.random() > 0.7) {
        const newEvent: RealTimeEvent = {
          id: `event_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          agent: agents[Math.floor(Math.random() * agents.length)],
          message: generateEventMessage(),
          severity: severities[Math.floor(Math.random() * severities.length)],
        }

        setEvents((prev) => [newEvent, ...prev.slice(0, 19)]) // Keep last 20 events
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const generateEventMessage = (): string => {
    const messages = [
      'Store build completed successfully',
      'GEO optimization score improved to 92%',
      'x402 micropayment processed on Base',
      'Agent mandate created for autonomous payments',
      'Quantum routing optimized chain selection',
      'Multimodal assets generated for AR try-on',
      'Schema recommendations generated',
      'Agent swarm handoff completed',
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const startMonitoring = () => {
    setIsMonitoring(true)
    setEvents([])
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const resetMetrics = () => {
    setMetrics({
      activeAgents: 5,
      totalBuilds: 0,
      successRate: 0,
      avgBuildTime: 0,
      geoScore: 0,
      aeoScore: 0,
      x402Transactions: 0,
      quantumEfficiency: 0,
    })
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            StoreForge Monitoring Dashboard
          </CardTitle>
          <CardDescription className="text-gray-400">Real-time swarm analytics and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            <Button
              onClick={resetMetrics}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Metrics
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Circle className={`h-3 w-3 ${isMonitoring ? 'text-green-400' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-400">{isMonitoring ? 'Live Monitoring' : 'Monitoring Stopped'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{metrics.activeAgents}</div>
                <div className="text-sm text-gray-400">Active Agents</div>
              </div>
              <Bot className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{metrics.totalBuilds}</div>
                <div className="text-sm text-gray-400">Total Builds</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">{metrics.x402Transactions}</div>
                <div className="text-sm text-gray-400">x402 Transactions</div>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{Math.round(metrics.quantumEfficiency)}%</div>
                <div className="text-sm text-gray-400">Quantum Efficiency</div>
              </div>
              <Globe className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">GEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2">{Math.round(metrics.geoScore)}%</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.geoScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">AEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2">{Math.round(metrics.aeoScore)}%</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.aeoScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">{Math.round(metrics.successRate)}%</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Events */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No events yet. Start monitoring to see real-time activity.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <Circle
                    className={`h-2 w-2 ${
                      event.severity === 'success'
                        ? 'text-green-400'
                        : event.severity === 'warning'
                          ? 'text-yellow-400'
                          : event.severity === 'error'
                            ? 'text-red-400'
                            : 'text-blue-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-white text-sm">{event.message}</div>
                    <div className="text-gray-400 text-xs">
                      {event.agent} • {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      event.severity === 'success'
                        ? 'border-green-400 text-green-300'
                        : event.severity === 'warning'
                          ? 'border-yellow-400 text-yellow-300'
                          : event.severity === 'error'
                            ? 'border-red-400 text-red-300'
                            : 'border-blue-400 text-blue-300'
                    }
                  >
                    {event.severity}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
