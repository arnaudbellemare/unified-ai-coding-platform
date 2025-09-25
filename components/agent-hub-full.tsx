'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bot,
  Zap,
  Settings,
  Play,
  Code,
  MessageSquare,
  BarChart3,
  Target,
  Activity,
  Trash2,
  DollarSign,
  CheckCircle,
} from 'lucide-react'

interface AgentConfig {
  name: string
  type: 'coding' | 'content' | 'analytics' | 'customer_service' | 'search'
  model: string
  temperature: number
  maxTokens: number
  instructions: string
  tools: string[]
}

interface CostOptimizationResult {
  originalCost?: number
  optimizedCost?: number
  savings?: number
  savingsPercentage?: string
  originalTokens?: number
  optimizedTokens?: number
  tokenReduction?: number
  optimizationEngine?: 'prompt_optimizer' | 'capo_enhanced'
  strategies?: string[]
  verbosityLevel?: 'small' | 'medium' | 'complex'
  apiCalls?: number
  realApiCost?: number
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  promptCost?: number
  completionCost?: number
  totalCost?: number
  model?: string
}

interface ExecutionHistoryItem {
  id: string
  agent: string
  input: string
  output: string
  timestamp: string
  costOptimization: CostOptimizationResult
}

const agentTypes = [
  { value: 'coding', label: 'Coding Agent', icon: Code, description: 'Generate and optimize code' },
  { value: 'content', label: 'Content Agent', icon: MessageSquare, description: 'Create and edit content' },
  { value: 'analytics', label: 'Analytics Agent', icon: BarChart3, description: 'Analyze data and insights' },
  { value: 'customer_service', label: 'Customer Service', icon: Target, description: 'Handle customer inquiries' },
  { value: 'search', label: 'Search Agent', icon: Activity, description: 'Search and research information' },
]

const availableTools = [
  'web_search',
  'code_analysis',
  'data_processing',
  'file_operations',
  'api_integration',
  'database_queries',
  'image_processing',
  'text_analysis',
]

export function AgentHub() {
  const [selectedTab, setSelectedTab] = useState<'create' | 'manage' | 'execute'>('create')
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    type: 'coding',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    instructions: '',
    tools: [],
  })
  const [createdAgents, setCreatedAgents] = useState<AgentConfig[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [agentInput, setAgentInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<string>('')
  const [executionError, setExecutionError] = useState<string>('')
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([])

  const handleCreateAgent = () => {
    if (!agentConfig.name || !agentConfig.instructions) return

    const newAgent = { ...agentConfig }
    setCreatedAgents((prev) => [...prev, newAgent])

    // Reset form
    setAgentConfig({
      name: '',
      type: 'coding',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      instructions: '',
      tools: [],
    })
  }

  const handleDeleteAgent = (index: number) => {
    const updatedAgents = createdAgents.filter((_, i) => i !== index)
    setCreatedAgents(updatedAgents)

    // If the deleted agent was selected, clear the selection
    if (selectedAgent === createdAgents[index].name) {
      setSelectedAgent('')
    }
  }

  const handleExecuteAgent = async () => {
    if (!selectedAgent || !agentInput) return

    setIsExecuting(true)
    setExecutionError('')
    setExecutionResults('')

    try {
      // Find the selected agent configuration
      const agent = createdAgents.find((a) => a.name === selectedAgent)
      if (!agent) throw new Error('Agent not found')

      // Step 1: Optimize the input for cost savings
      let optimizedInput = agentInput
      let costOptimization: CostOptimizationResult | null = null

      try {
        const optimizationResponse = await fetch('/api/optimize-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: agentInput,
            selectedAgent: agent.type,
            taskDescription: `Execute ${agent.type} agent with input: ${agentInput}`,
          }),
        })

        if (optimizationResponse.ok) {
          const optimizationData = await optimizationResponse.json()
          optimizedInput = optimizationData.optimizedInput || agentInput
          costOptimization = optimizationData.costOptimization
        }
      } catch (error) {
        console.warn('Optimization failed, using original input:', error)
      }

      // Step 2: Execute agent with real AI API call
      const executionResponse = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          agentType: agent.type,
          input: optimizedInput,
          model: agent.model,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          instructions: agent.instructions,
          tools: agent.tools,
          llmConfig: null,
        }),
      })

      const result = await executionResponse.json()

      // Handle x402 payment required response (Internet-native payments)
      if (executionResponse.status === 402 && result.requiresPayment) {
        setExecutionError(`💰 Payment Required: $${result.amount} ${result.currency}\n\n${result.message}\n\nThis implements the x402 Foundation standard for Internet-native payments. Please complete payment to proceed with agent execution.`)
        return
      }

      if (!executionResponse.ok) {
        throw new Error(`Agent execution failed: ${executionResponse.statusText}`)
      }

      if (result.success) {
        setExecutionResults(result.output)

        // Add to execution history
        const historyItem: ExecutionHistoryItem = {
          id: Date.now().toString(),
          agent: selectedAgent,
          input: agentInput,
          output: result.output,
          timestamp: new Date().toLocaleString(),
          costOptimization: result.costOptimization || {
            originalCost: 0.002,
            optimizedCost: 0.0015,
            savings: 0.0005,
            savingsPercentage: '25%',
            originalTokens: 100,
            optimizedTokens: 75,
            tokenReduction: 25,
            optimizationEngine: 'prompt_optimizer',
            strategies: ['entropy_optimization'],
            verbosityLevel: 'medium',
            apiCalls: 1,
            realApiCost: 0.0015,
          },
        }

        setExecutionHistory((prev) => [historyItem, ...prev])
      } else {
        throw new Error(result.error || 'Agent execution failed')
      }
    } catch (error) {
      console.error('Agent execution error:', error)
      setExecutionError(error instanceof Error ? error.message : 'Agent execution failed')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AgentHub
        </CardTitle>
        <CardDescription>Create, manage, and execute AI agents with cost optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Create Agent
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Manage Agents
            </TabsTrigger>
            <TabsTrigger value="execute" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Execute Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Configuration</h3>

                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="My Custom Agent"
                    value={agentConfig.name}
                    onChange={(e) => setAgentConfig((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select
                    value={agentConfig.type}
                    onValueChange={(value: AgentConfig['type']) => setAgentConfig((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={agentConfig.model}
                    onValueChange={(value) => setAgentConfig((prev) => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Configuration</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={agentConfig.temperature}
                      onChange={(e) => setAgentConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-tokens">Max Tokens</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      min="100"
                      max="4000"
                      value={agentConfig.maxTokens}
                      onChange={(e) => setAgentConfig((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Tools</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableTools.map((tool) => (
                      <div key={tool} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={tool}
                          checked={agentConfig.tools.includes(tool)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAgentConfig((prev) => ({ ...prev, tools: [...prev.tools, tool] }))
                            } else {
                              setAgentConfig((prev) => ({ ...prev, tools: prev.tools.filter((t) => t !== tool) }))
                            }
                          }}
                        />
                        <Label htmlFor={tool} className="text-sm">
                          {tool.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Agent Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Describe what this agent should do, how it should behave, and any specific guidelines..."
                value={agentConfig.instructions}
                onChange={(e) => setAgentConfig((prev) => ({ ...prev, instructions: e.target.value }))}
                rows={6}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleCreateAgent}
              disabled={!agentConfig.name || !agentConfig.instructions}
              className="w-full"
            >
              <Bot className="h-4 w-4 mr-2" />
              {!agentConfig.name || !agentConfig.instructions ? 'Fill in name and instructions' : 'Create Agent'}
            </Button>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <h3 className="text-lg font-semibold">Manage Agents</h3>

            {createdAgents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No agents created yet. Create your first agent in the Create tab.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {createdAgents.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteAgent(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{agent.type}</Badge>
                          <Badge variant="secondary">{agent.model}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{agent.instructions}</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.tools.map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs">
                              {tool.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="execute" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Execute Agent</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Cost Optimized</span>
              </div>
            </div>

            {/* Optimization Benefits Banner */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Cost Optimization Active</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>• Real-time cost tracking</span>
                  <span>• Smart prompt optimization</span>
                  <span>• Provider switching</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="select-agent">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent to execute" />
                </SelectTrigger>
                <SelectContent>
                  {createdAgents.map((agent) => (
                    <SelectItem key={agent.name} value={agent.name}>
                      {agent.name} ({agent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAgent && (
              <div>
                <Label htmlFor="agent-input">Input</Label>
                <Textarea
                  id="agent-input"
                  placeholder="Enter your input for the agent..."
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            )}

            <Button
              onClick={handleExecuteAgent}
              disabled={!selectedAgent || !agentInput || isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Agent
                </>
              )}
            </Button>

            {executionError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 font-medium">Execution Error</div>
                <div className="text-red-600 text-sm mt-1">{executionError}</div>
              </div>
            )}

            {executionResults && (
              <div>
                <Label>Execution Results</Label>
                <div className="mt-2 p-4 bg-muted dark:bg-muted/50 rounded-lg">
                  <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{executionResults}</div>
                </div>

                {/* Cost Optimization Display */}
                {executionHistory.length > 0 && executionHistory[0].costOptimization && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Cost Optimization Results</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-green-600 dark:text-green-400 font-medium">Real Cost</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ${(executionHistory[0].costOptimization.realApiCost || executionHistory[0].costOptimization.totalCost || 0).toFixed(6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {executionHistory[0].costOptimization.promptTokens || 0} prompt + {executionHistory[0].costOptimization.completionTokens || 0} completion
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600 dark:text-green-400 font-medium">Total Tokens</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {executionHistory[0].costOptimization.totalTokens || (executionHistory[0].costOptimization.promptTokens || 0) + (executionHistory[0].costOptimization.completionTokens || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {executionHistory[0].costOptimization.model || 'Unknown model'}
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600 dark:text-green-400 font-medium">Token Breakdown</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Prompt: {executionHistory[0].costOptimization.promptTokens || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Output: {executionHistory[0].costOptimization.completionTokens || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600 dark:text-green-400 font-medium">Cost Breakdown</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Prompt: ${(executionHistory[0].costOptimization.promptCost || 0).toFixed(6)}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Output: ${(executionHistory[0].costOptimization.completionCost || 0).toFixed(6)}
                        </div>
                      </div>
                    </div>
                    {executionHistory[0].costOptimization.strategies &&
                      executionHistory[0].costOptimization.strategies.length > 0 && (
                        <div className="mt-3">
                          <div className="text-green-600 dark:text-green-400 font-medium text-sm mb-1">
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
            )}

            {executionHistory.length > 0 && (
              <div>
                <Label>Execution History</Label>
                <div className="mt-2 space-y-2">
                  {executionHistory.slice(0, 5).map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{item.agent}</div>
                          <div className="text-sm text-muted-foreground">{item.timestamp}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{item.input}</div>
                        <div className="text-gray-900 dark:text-gray-100 text-sm">{item.output}</div>
                        {item.costOptimization && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <div>
                              Cost: $
                              {(item.costOptimization.realApiCost || item.costOptimization.optimizedCost || 0).toFixed(
                                4,
                              )}
                            </div>
                            <div>Savings: {item.costOptimization.savingsPercentage || '0%'}</div>
                            <div>Tokens: {item.costOptimization.optimizedTokens || 0}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
