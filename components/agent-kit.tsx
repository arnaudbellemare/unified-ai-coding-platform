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
  Pause, 
  Square, 
  Code, 
  MessageSquare, 
  BarChart3,
  Target,
  Activity
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

interface AgentKitProps {
  onAgentCreate?: (config: AgentConfig) => void
  onAgentExecute?: (agentId: string, input: string) => void
}

export function AgentKit({ onAgentCreate, onAgentExecute }: AgentKitProps) {
  const [selectedTab, setSelectedTab] = useState('create')
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    type: 'coding',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    instructions: '',
    tools: []
  })
  const [createdAgents, setCreatedAgents] = useState<AgentConfig[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [agentInput, setAgentInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const agentTypes = [
    { value: 'coding', label: 'Coding Agent', icon: Code, description: 'Specialized in programming tasks' },
    { value: 'content', label: 'Content Agent', icon: MessageSquare, description: 'Creates and optimizes content' },
    { value: 'analytics', label: 'Analytics Agent', icon: BarChart3, description: 'Analyzes data and generates insights' },
    { value: 'customer_service', label: 'Customer Service', icon: MessageSquare, description: 'Handles customer inquiries' },
    { value: 'search', label: 'Search Agent', icon: Zap, description: 'Real-time search and research capabilities' }
  ]

  const availableModels = [
    'gpt-4',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku',
    'perplexity-sonar-small',
    'perplexity-sonar-medium',
    'perplexity-sonar-large'
  ]

  const availableTools = [
    'code_execution',
    'web_search',
    'file_operations',
    'database_query',
    'api_calls',
    'image_generation',
    'text_analysis',
    'real_time_search',
    'web_scraping',
    'data_research'
  ]

  const handleCreateAgent = () => {
    if (!agentConfig.name || !agentConfig.instructions) return

    const newAgent = { ...agentConfig }
    setCreatedAgents(prev => [...prev, newAgent])
    setSelectedAgent(newAgent.name)
    onAgentCreate?.(newAgent)

    // Reset form
    setAgentConfig({
      name: '',
      type: 'coding',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      instructions: '',
      tools: []
    })
  }

  const handleExecuteAgent = async () => {
    if (!selectedAgent || !agentInput) return

    setIsExecuting(true)
    try {
      onAgentExecute?.(selectedAgent, agentInput)
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000))
    } finally {
      setIsExecuting(false)
    }
  }

  const toggleTool = (tool: string) => {
    setAgentConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }))
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AgentKit - AI Agent Builder
        </CardTitle>
        <CardDescription>
          Create, configure, and deploy custom AI agents for specific tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select
                    value={agentConfig.type}
                    onValueChange={(value: AgentConfig['type']) => 
                      setAgentConfig(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">AI Model</Label>
                  <Select
                    value={agentConfig.model}
                    onValueChange={(value) => setAgentConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Configuration</h3>
                
                <div>
                  <Label htmlFor="temperature">Temperature: {agentConfig.temperature}</Label>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={agentConfig.temperature}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={agentConfig.maxTokens}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Available Tools</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableTools.map(tool => (
                      <div key={tool} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={tool}
                          checked={agentConfig.tools.includes(tool)}
                          onChange={() => toggleTool(tool)}
                          className="rounded"
                        />
                        <Label htmlFor={tool} className="text-sm">{tool}</Label>
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
                onChange={(e) => setAgentConfig(prev => ({ ...prev, instructions: e.target.value }))}
                rows={6}
                className="mt-2"
              />
            </div>

            <Button onClick={handleCreateAgent} className="w-full">
              <Bot className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <h3 className="text-lg font-semibold">Created Agents</h3>
            {createdAgents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No agents created yet. Create your first agent in the "Create Agent" tab.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {createdAgents.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <Badge variant="outline">{agent.type}</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        Model: {agent.model} • Temperature: {agent.temperature}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {agent.instructions.substring(0, 100)}...
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {agent.tools.map(tool => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="execute" className="space-y-4">
            <h3 className="text-lg font-semibold">Execute Agent</h3>
            
            <div>
              <Label htmlFor="select-agent">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent to execute" />
                </SelectTrigger>
                <SelectContent>
                  {createdAgents.map((agent, index) => (
                    <SelectItem key={index} value={agent.name}>
                      {agent.name} ({agent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="agent-input">Input</Label>
              <Textarea
                id="agent-input"
                placeholder="Enter the input for the agent..."
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleExecuteAgent} 
              disabled={!selectedAgent || !agentInput || isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Agent
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
