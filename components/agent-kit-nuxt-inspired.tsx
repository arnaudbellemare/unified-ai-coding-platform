'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Bot,
  Plus,
  Play,
  Settings,
  MessageSquare,
  Zap,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  Code,
  BarChart3,
  FileText,
  Search,
  Headphones,
} from 'lucide-react'

// Nuxt UI-inspired color scheme and design tokens
const NUXT_COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#0c4a6e',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
}

interface Agent {
  id: string
  name: string
  type: 'coding' | 'content' | 'analytics' | 'customer_service' | 'search'
  status: 'active' | 'inactive' | 'running'
  lastUsed: string
  executions: number
  successRate: number
}

interface ExecutionHistory {
  id: string
  agentId: string
  input: string
  output: string
  timestamp: string
  duration: number
  cost: number
  tokens: number
  status: 'success' | 'error'
  costOptimization?: {
    originalCost: number
    optimizedCost: number
    savings: number
    strategies: string[]
  }
}

const AGENT_TYPES = [
  { value: 'coding', label: 'Coding Agent', icon: Code, color: 'bg-blue-500' },
  { value: 'content', label: 'Content Agent', icon: FileText, color: 'bg-green-500' },
  { value: 'analytics', label: 'Analytics Agent', icon: BarChart3, color: 'bg-purple-500' },
  { value: 'customer_service', label: 'Customer Service', icon: Headphones, color: 'bg-orange-500' },
  { value: 'search', label: 'Search Agent', icon: Search, color: 'bg-indigo-500' },
]

export function AgentKitNuxtInspired() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([])
  const [activeTab, setActiveTab] = useState('create')
  const [isExecuting, setIsExecuting] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [agentInput, setAgentInput] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentType, setAgentType] = useState<string>('coding')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)

  // Load saved agents on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('agentkit-agents')
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents))
    }
  }, [])

  // Save agents when they change
  useEffect(() => {
    if (agents.length > 0) {
      localStorage.setItem('agentkit-agents', JSON.stringify(agents))
    }
  }, [agents])

  const createAgent = () => {
    if (!agentName.trim()) {
      toast.error('Please enter an agent name')
      return
    }

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: agentName.trim(),
      type: agentType as Agent['type'],
      status: 'active',
      lastUsed: new Date().toISOString(),
      executions: 0,
      successRate: 100,
    }

    setAgents([...agents, newAgent])
    setAgentName('')
    toast.success(`Agent "${newAgent.name}" created successfully!`)
  }

  const executeAgent = async (agentId: string, input: string) => {
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return

    setIsExecuting(true)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          agentType: agent.type,
          input,
          model: 'gpt-4',
          temperature,
          maxTokens,
          instructions: `You are a ${agent.type} agent. Provide helpful, accurate responses.`,
        }),
      })

      const result = await response.json()
      const duration = Date.now() - startTime

      if (result.success) {
        const execution: ExecutionHistory = {
          id: `exec-${Date.now()}`,
          agentId,
          input,
          output: result.output,
          timestamp: new Date().toISOString(),
          duration,
          cost: result.costOptimization?.totalCost || 0,
          tokens: result.costOptimization?.totalTokens || 0,
          status: 'success',
          costOptimization: result.costOptimization,
        }

        setExecutionHistory([execution, ...executionHistory.slice(0, 9)])

        // Update agent stats
        setAgents(
          agents.map((a) =>
            a.id === agentId ? { ...a, executions: a.executions + 1, lastUsed: new Date().toISOString() } : a,
          ),
        )

        toast.success('Agent executed successfully!')
      } else {
        throw new Error(result.error || 'Agent execution failed')
      }
    } catch (error) {
      const execution: ExecutionHistory = {
        id: `exec-${Date.now()}`,
        agentId,
        input,
        output: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        cost: 0,
        tokens: 0,
        status: 'error',
      }

      setExecutionHistory([execution, ...executionHistory.slice(0, 9)])
      toast.error('Agent execution failed')
    } finally {
      setIsExecuting(false)
    }
  }

  const deleteAgent = (agentId: string) => {
    setAgents(agents.filter((a) => a.id !== agentId))
    toast.success('Agent deleted successfully')
  }

  const getAgentTypeIcon = (type: string) => {
    const agentType = AGENT_TYPES.find((t) => t.value === type)
    return agentType?.icon || Bot
  }

  const getAgentTypeColor = (type: string) => {
    const agentType = AGENT_TYPES.find((t) => t.value === type)
    return agentType?.color || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AgentKit</h1>
        </div>
        <p className="text-muted-foreground">Create, manage, and execute AI agents with advanced optimization</p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI SDK v5
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Optimized
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Agents
          </TabsTrigger>
          <TabsTrigger value="execute" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Execute Agent
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Create Agent Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Agent
              </CardTitle>
              <CardDescription>Build intelligent agents tailored to your specific needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      placeholder="e.g., Code Review Assistant"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="agent-type">Agent Type</Label>
                    <Select value={agentType} onValueChange={setAgentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGENT_TYPES.map((type) => {
                          const Icon = type.icon
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="advanced-settings"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Advanced Settings
                    </Label>
                    <Switch id="advanced-settings" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <Label htmlFor="temperature" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Temperature: {temperature}
                        </Label>
                        <Input
                          id="temperature"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-tokens" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Max Tokens
                        </Label>
                        <Input
                          id="max-tokens"
                          type="number"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                          className="mt-1 border-slate-300 dark:border-slate-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={createAgent} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Agents Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Your Agents
              </CardTitle>
              <CardDescription>
                {agents.length} agent{agents.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No agents created yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first agent to get started</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Agent
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => {
                    const Icon = getAgentTypeIcon(agent.type)
                    const colorClass = getAgentTypeColor(agent.type)
                    return (
                      <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{agent.name}</h4>
                                <p className="text-xs text-muted-foreground capitalize">{agent.type} Agent</p>
                              </div>
                            </div>
                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {agent.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Executions</span>
                              <span className="font-medium">{agent.executions}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Success Rate</span>
                              <span className="font-medium text-green-600">{agent.successRate}%</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Last Used</span>
                              <span className="font-medium">{new Date(agent.lastUsed).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent.id)
                                setActiveTab('execute')
                              }}
                              className="flex-1"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Execute
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAgent(agent.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execute Agent Tab */}
        <TabsContent value="execute" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Execute Agent
              </CardTitle>
              <CardDescription>Run your agents and see real-time results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="select-agent">Select Agent</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent to execute" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => {
                      const Icon = getAgentTypeIcon(agent.type)
                      return (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {agent.name}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedAgent && (
                <>
                  <div>
                    <Label htmlFor="agent-input">Input</Label>
                    <Textarea
                      id="agent-input"
                      placeholder="Enter your request for the agent..."
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button
                    onClick={() => executeAgent(selectedAgent, agentInput)}
                    disabled={isExecuting || !agentInput.trim()}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Agent
                      </>
                    )}
                  </Button>
                </>
              )}

              {executionHistory.length > 0 && executionHistory[0] && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Latest Result</h3>
                  </div>

                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Input</Label>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 p-3 bg-white dark:bg-slate-800 rounded-lg border">
                            {executionHistory[0].input}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Output</Label>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 p-3 bg-white dark:bg-slate-800 rounded-lg border whitespace-pre-wrap">
                            {executionHistory[0].output}
                          </p>
                        </div>

                        {/* Cost Optimization Results */}
                        {executionHistory[0].costOptimization && (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <h4 className="font-medium text-green-800 dark:text-green-200">
                                Cost Optimization Active
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-green-600 dark:text-green-400 font-medium">Total Cost</div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  ${executionHistory[0].costOptimization.optimizedCost?.toFixed(6) || '0.000000'}
                                </div>
                              </div>
                              <div>
                                <div className="text-green-600 dark:text-green-400 font-medium">Tokens Used</div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {executionHistory[0].costOptimization.totalTokens || 0}
                                </div>
                              </div>
                              <div>
                                <div className="text-green-600 dark:text-green-400 font-medium">Savings</div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {executionHistory[0].costOptimization.savingsPercentage || '0%'}
                                </div>
                              </div>
                              <div>
                                <div className="text-green-600 dark:text-green-400 font-medium">Duration</div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {executionHistory[0].duration}ms
                                </div>
                              </div>
                            </div>
                            {executionHistory[0].costOptimization.strategies &&
                              executionHistory[0].costOptimization.strategies.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-green-600 dark:text-green-400 font-medium text-sm mb-2">
                                    Optimization Strategies:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {executionHistory[0].costOptimization.strategies.map((strategy, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600"
                                      >
                                        {strategy.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Execution History
              </CardTitle>
              <CardDescription>Track all agent executions and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {executionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No executions yet</h3>
                  <p className="text-muted-foreground">Execute an agent to see the history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executionHistory.map((execution) => {
                    const agent = agents.find((a) => a.id === execution.agentId)
                    const Icon = agent ? getAgentTypeIcon(agent.type) : Bot
                    return (
                      <Card
                        key={execution.id}
                        className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {agent?.name || 'Unknown Agent'}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {new Date(execution.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {execution.status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <Badge
                                variant={execution.status === 'success' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {execution.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Input</Label>
                              <p className="text-sm text-slate-900 dark:text-white mt-1 p-2 bg-slate-50 dark:bg-slate-700 rounded border">
                                {execution.input}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Output</Label>
                              <p className="text-sm text-slate-900 dark:text-white mt-1 p-2 bg-slate-50 dark:bg-slate-700 rounded border whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {execution.output}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
                              <span>Duration: {execution.duration}ms</span>
                              <span>Cost: ${execution.cost.toFixed(6)}</span>
                              <span>Tokens: {execution.tokens}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
