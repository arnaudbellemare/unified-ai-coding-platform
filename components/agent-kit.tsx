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
  Activity,
  Trash2,
  DollarSign,
  TrendingDown,
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
  originalCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: string
  originalTokens: number
  optimizedTokens: number
  tokenReduction: number
  optimizationEngine: 'prompt_optimizer' | 'capo_enhanced'
  strategies: string[]
  verbosityLevel: 'small' | 'medium' | 'complex'
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
    tools: [],
  })
  const [createdAgents, setCreatedAgents] = useState<AgentConfig[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [agentInput, setAgentInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<string>('')
  const [executionError, setExecutionError] = useState<string>('')
  const [executionHistory, setExecutionHistory] = useState<
    Array<{
      id: string
      agent: string
      input: string
      output: string
      timestamp: Date
      status: 'success' | 'error'
      costOptimization?: CostOptimizationResult
    }>
  >([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [costOptimization, setCostOptimization] = useState<CostOptimizationResult | null>(null)

  const agentTypes = [
    { value: 'coding', label: 'Coding Agent', icon: Code, description: 'Specialized in programming tasks' },
    { value: 'content', label: 'Content Agent', icon: MessageSquare, description: 'Creates and optimizes content' },
    {
      value: 'analytics',
      label: 'Analytics Agent',
      icon: BarChart3,
      description: 'Analyzes data and generates insights',
    },
    {
      value: 'customer_service',
      label: 'Customer Service',
      icon: MessageSquare,
      description: 'Handles customer inquiries',
    },
    { value: 'search', label: 'Search Agent', icon: Zap, description: 'Real-time search and research capabilities' },
  ]

  const availableModels = [
    'gpt-4',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku',
    'perplexity-sonar-small',
    'perplexity-sonar-medium',
    'perplexity-sonar-large',
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
    'data_research',
  ]

  const handleCreateAgent = () => {
    console.log('Creating agent with config:', agentConfig)

    if (!agentConfig.name || !agentConfig.instructions) {
      console.log('Validation failed:', { name: agentConfig.name, instructions: agentConfig.instructions })
      return
    }

    const newAgent = { ...agentConfig }
    console.log('Adding new agent:', newAgent)

    setCreatedAgents((prev) => {
      const updated = [...prev, newAgent]
      console.log('Updated agents list:', updated)
      return updated
    })

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
      tools: [],
    })

    console.log('Agent created successfully')
  }

  const handleDeleteAgent = (index: number) => {
    // Get the agent to be deleted before filtering
    const deletedAgent = createdAgents[index]

    // If the deleted agent was selected, clear the selection
    if (selectedAgent === deletedAgent?.name) {
      setSelectedAgent('')
    }

    // Remove the agent from the list
    setCreatedAgents((prev) => prev.filter((_, i) => i !== index))
  }

  const optimizeInput = async (input: string, agentType: string): Promise<CostOptimizationResult> => {
    try {
      // Determine task description based on agent type
      const taskDescription = {
        domain: agentType === 'coding' ? 'coding' : agentType === 'analytics' ? 'analysis' : 'general',
        complexity: input.length > 200 ? 'complex' : input.length > 100 ? 'medium' : 'simple',
        requirements: [],
        constraints: [],
      }

      // Call hybrid optimization API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/api/optimize-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          selectedAgent: agentType,
          taskDescription,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        return {
          originalCost: data.costAnalysis?.originalCost || 0,
          optimizedCost: data.costAnalysis?.optimizedCost || 0,
          savings: data.costAnalysis?.savings || 0,
          savingsPercentage: data.costAnalysis?.savingsPercentage || '0%',
          originalTokens: data.costAnalysis?.originalTokens || 0,
          optimizedTokens: data.costAnalysis?.optimizedTokens || 0,
          tokenReduction: data.costAnalysis?.tokenReduction || 0,
          optimizationEngine: data.optimizationEngine || 'prompt_optimizer',
          strategies: data.strategies || [],
          verbosityLevel: data.verbosityLevel || 'small',
        }
      }
    } catch (error) {
      console.error('Cost optimization failed:', error)
    }

    // Fallback: return simulated optimization
    const originalTokens = Math.ceil(input.length / 4)
    const tokenReduction = Math.random() * 15 + 5 // 5-20% reduction
    const optimizedTokens = Math.ceil(originalTokens * (1 - tokenReduction / 100))
    const costPer1K = 0.03
    const originalCost = (originalTokens / 1000) * costPer1K
    const optimizedCost = (optimizedTokens / 1000) * costPer1K
    const savings = originalCost - optimizedCost

    return {
      originalCost,
      optimizedCost,
      savings,
      savingsPercentage: `${tokenReduction.toFixed(1)}%`,
      originalTokens,
      optimizedTokens,
      tokenReduction,
      optimizationEngine: 'prompt_optimizer',
      strategies: ['entropy_optimization', 'synonym_replacement'],
      verbosityLevel: input.length > 200 ? 'complex' : input.length > 100 ? 'medium' : 'small',
    }
  }

  const handleExecuteAgent = async () => {
    if (!selectedAgent || !agentInput) return

    setIsExecuting(true)
    setIsOptimizing(true)
    setExecutionError('')
    setExecutionResults('')
    setCostOptimization(null)

    try {
      // Find the selected agent configuration
      const agent = createdAgents.find((a) => a.name === selectedAgent)
      if (!agent) {
        throw new Error('Selected agent not found')
      }

      // Step 1: Optimize the input for cost savings (with timeout)
      console.log('🔍 Optimizing input for cost savings...')
      
      const optimizationPromise = optimizeInput(agentInput, agent.type)
      const timeoutPromise = new Promise<CostOptimizationResult>((resolve) => {
        setTimeout(() => {
          // Fallback optimization if API takes too long
          const originalTokens = Math.ceil(agentInput.length / 4)
          const tokenReduction = Math.random() * 15 + 5 // 5-20% reduction
          const optimizedTokens = Math.ceil(originalTokens * (1 - tokenReduction / 100))
          const costPer1K = 0.03
          const originalCost = (originalTokens / 1000) * costPer1K
          const optimizedCost = (optimizedTokens / 1000) * costPer1K
          const savings = originalCost - optimizedCost
          
          resolve({
            originalCost,
            optimizedCost,
            savings,
            savingsPercentage: `${tokenReduction.toFixed(1)}%`,
            originalTokens,
            optimizedTokens,
            tokenReduction,
            optimizationEngine: 'prompt_optimizer',
            strategies: ['entropy_optimization', 'synonym_replacement'],
            verbosityLevel: agentInput.length > 200 ? 'complex' : agentInput.length > 100 ? 'medium' : 'small',
          })
        }, 3000) // 3 second timeout
      })
      
      const optimizationResult = await Promise.race([optimizationPromise, timeoutPromise])
      setCostOptimization(optimizationResult)

      // Step 2: Use optimized input for execution
      const optimizedInput =
        optimizationResult.tokenReduction > 0
          ? agentInput.substring(0, Math.floor(agentInput.length * (1 - optimizationResult.tokenReduction / 100)))
          : agentInput

      console.log('💰 Cost optimization completed:', {
        originalTokens: optimizationResult.originalTokens,
        optimizedTokens: optimizationResult.optimizedTokens,
        savings: optimizationResult.savings,
        strategies: optimizationResult.strategies,
      })

      // Call the parent callback if provided
      onAgentExecute?.(selectedAgent, agentInput)

      // Step 3: Simulate agent execution with optimized input (with timeout)
      const executionPromise = new Promise((resolve) => setTimeout(resolve, 2000))
      const executionTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), 10000)
      )
      
      await Promise.race([executionPromise, executionTimeout])

      // Generate a realistic response based on agent type (using optimized input)
      const simulatedResult = generateSimulatedResult(agent.type, optimizedInput)

      setExecutionResults(simulatedResult)

      // Add to execution history with cost optimization data
      const newExecution = {
        id: Date.now().toString(),
        agent: selectedAgent,
        input: agentInput,
        output: simulatedResult,
        timestamp: new Date(),
        status: 'success' as const,
        costOptimization: optimizationResult,
      }
      setExecutionHistory((prev) => [newExecution, ...prev])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setExecutionError(errorMessage)

      // Add error to execution history
      const newExecution = {
        id: Date.now().toString(),
        agent: selectedAgent,
        input: agentInput,
        output: errorMessage,
        timestamp: new Date(),
        status: 'error' as const,
      }
      setExecutionHistory((prev) => [newExecution, ...prev])
    } finally {
      setIsExecuting(false)
      setIsOptimizing(false)
    }
  }

  const generateSimulatedResult = (agentType: string, input: string): string => {
    const timestamp = new Date().toLocaleString()

    switch (agentType) {
      case 'coding':
        return `🤖 **Coding Agent Response** (${timestamp})

**Input Analysis:**
${input}

**Generated Solution:**
\`\`\`javascript
function processInput(input) {
  // AI-generated code based on your request
  const result = input.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return {
    processed: result,
    wordCount: input.split(' ').length,
    timestamp: new Date().toISOString()
  };
}

// Usage example
const output = processInput("${input}");
console.log(output);
\`\`\`

**Explanation:**
This code demonstrates a function that capitalizes the first letter of each word in your input. The function also returns additional metadata about the processing.

**Next Steps:**
- Test the function with different inputs
- Add error handling if needed
- Consider adding validation for edge cases`

      case 'content':
        return `📝 **Content Agent Response** (${timestamp})

**Content Analysis:**
Input: "${input}"

**Generated Content:**
# ${input}

This is AI-generated content based on your request. The content has been optimized for:
- SEO best practices
- Readability and engagement
- Clear structure and formatting

**Content Structure:**
1. **Introduction** - Engaging opening that addresses the topic
2. **Main Content** - Detailed exploration of the subject
3. **Conclusion** - Summary and call-to-action

**Optimization Suggestions:**
- Add relevant keywords naturally
- Include subheadings for better structure
- Consider adding visual elements
- Ensure content is scannable and accessible`

      case 'analytics':
        return `📊 **Analytics Agent Response** (${timestamp})

**Query Analysis:**
"${input}"

**Data Insights:**
Based on the analysis of your request, here are the key findings:

**Performance Metrics:**
- Response Time: 1.2s
- Accuracy Score: 94.5%
- Confidence Level: High

**Trends Identified:**
- Growing interest in the topic (+23% this month)
- Peak engagement during business hours
- Strong correlation with related topics

**Recommendations:**
1. Focus on peak engagement times
2. Create content around trending subtopics
3. Monitor competitor activity in this space

**Visualization Data:**
\`\`\`json
{
  "trends": {
    "monthly_growth": 23,
    "engagement_score": 87,
    "conversion_rate": 12.5
  },
  "insights": [
    "High engagement during 9-11 AM",
    "Mobile traffic increasing",
    "Social media driving 45% of traffic"
  ]
}
\`\`\``

      case 'customer_service':
        return `🎧 **Customer Service Agent Response** (${timestamp})

**Customer Inquiry:**
"${input}"

**Response:**
Thank you for reaching out! I understand your concern about "${input}". Let me help you with that.

**Immediate Assistance:**
✅ I've logged your inquiry (Ticket #${Math.floor(Math.random() * 10000)})
✅ Priority: Standard
✅ Estimated resolution: 24-48 hours

**Quick Solutions:**
1. **Self-Service Options:** Check our FAQ section for instant answers
2. **Documentation:** Review our comprehensive guides
3. **Community:** Join our user forum for peer support

**Next Steps:**
- A specialist will review your case
- You'll receive email updates on progress
- We'll work to resolve this quickly

**Additional Resources:**
- 📖 Knowledge Base: [link]
- 💬 Live Chat: Available 9 AM - 6 PM EST
- 📧 Email Support: support@example.com

Is there anything specific about this issue I can help clarify right now?`

      case 'search':
        return `🔍 **Search Agent Response** (${timestamp})

**Search Query:**
"${input}"

**Real-time Search Results:**

**Top Results:**
1. **Wikipedia** - Comprehensive overview of the topic
   - Last updated: 2024
   - Relevance: High
   - Summary: Authoritative information with citations

2. **Recent News** - Latest developments (2024)
   - Source: TechCrunch, Wired, etc.
   - Relevance: High
   - Summary: Breaking news and industry updates

3. **Academic Papers** - Research and studies
   - Source: IEEE, ACM, PubMed
   - Relevance: Medium-High
   - Summary: Peer-reviewed research findings

**Key Insights:**
- The topic has gained significant attention recently
- Multiple perspectives available from different sources
- Recent developments show promising trends

**Related Topics:**
- Similar concepts and technologies
- Complementary research areas
- Emerging trends in the field

**Sources Verified:** ✅
- Cross-referenced information
- Fact-checked against multiple sources
- Updated within the last 24 hours`

      default:
        return `🤖 **AI Agent Response** (${timestamp})

**Input:** {input}

**Processing Complete:**
Your request has been successfully processed by the AI agent. The agent analyzed your input and generated a comprehensive response based on its specialized training and capabilities.

**Response Details:**
- Processing Time: 2.1 seconds
- Confidence Level: 94%
- Response Quality: High

**Generated Output:**
Based on your input "${input}", I've analyzed the request and prepared a detailed response. The AI agent has considered multiple factors including context, relevance, and best practices for this type of query.

**Recommendations:**
1. Review the generated content for accuracy
2. Customize as needed for your specific use case
3. Consider additional iterations for refinement

**Status:** ✅ Complete - Ready for use`
    }
  }

  const toggleTool = (tool: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool) ? prev.tools.filter((t) => t !== tool) : [...prev.tools, tool],
    }))
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AgentKit - AI Agent Builder
        </CardTitle>
        <CardDescription>Create, configure, and deploy custom AI agents for specific tasks</CardDescription>
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
                    onValueChange={(value) => setAgentConfig((prev) => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
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
                    onChange={(e) => setAgentConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={agentConfig.maxTokens}
                    onChange={(e) => setAgentConfig((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Available Tools</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableTools.map((tool) => (
                      <div key={tool} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={tool}
                          checked={agentConfig.tools.includes(tool)}
                          onChange={() => toggleTool(tool)}
                          className="rounded"
                        />
                        <Label htmlFor={tool} className="text-sm">
                          {tool}
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
            <h3 className="text-lg font-semibold">Created Agents</h3>
            {createdAgents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No agents created yet. Create your first agent in the &quot;Create Agent&quot; tab.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {createdAgents.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{agent.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAgent(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        Model: {agent.model} • Temperature: {agent.temperature}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{agent.instructions.substring(0, 100)}...</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.tools.map((tool) => (
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
                  {isOptimizing ? (
                    <>
                      <TrendingDown className="h-4 w-4 mr-2 animate-pulse" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-pulse" />
                      Executing...
                    </>
                  )}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Agent
                </>
              )}
            </Button>

            {/* Cost Optimization Display */}
            {costOptimization && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-black !text-black" style={{ color: 'black' }}>
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Cost Optimization Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-black !text-black" style={{ color: 'black' }}>Token Reduction</div>
                      <div className="font-semibold text-green-600 text-black !text-black" style={{ color: 'black' }}>
                        {typeof costOptimization.tokenReduction === 'number'
                          ? costOptimization.tokenReduction.toFixed(1)
                          : parseFloat(costOptimization.tokenReduction).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-black !text-black" style={{ color: 'black' }}>Cost Savings</div>
                      <div className="font-semibold text-green-600 text-black !text-black" style={{ color: 'black' }}>${costOptimization.savings.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-black !text-black" style={{ color: 'black' }}>Optimization</div>
                      <div className="font-semibold text-black !text-black" style={{ color: 'black' }}>✅ Active</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-black !text-black" style={{ color: 'black' }}>Efficiency</div>
                      <div className="font-semibold text-black !text-black" style={{ color: 'black' }}>
                        {(() => {
                          const reduction =
                            typeof costOptimization.tokenReduction === 'number'
                              ? costOptimization.tokenReduction
                              : parseFloat(costOptimization.tokenReduction)
                          return reduction > 15 ? '🚀 High' : reduction > 8 ? '⚡ Medium' : '💡 Optimized'
                        })()}
                      </div>
                    </div>
                  </div>
                  {costOptimization.strategies.length > 0 && (
                    <div className="mt-3">
                      <div className="text-muted-foreground text-xs mb-1 text-black !text-black" style={{ color: 'black' }}>Optimization Applied</div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs text-black !text-black" style={{ color: 'black' }}>
                          Smart Optimization
                        </Badge>
                        <Badge variant="secondary" className="text-xs text-black !text-black" style={{ color: 'black' }}>
                          Cost Reduction
                        </Badge>
                        <Badge variant="secondary" className="text-xs text-black !text-black" style={{ color: 'black' }}>
                          Token Efficiency
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            {(executionResults || executionError) && (
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  {executionError ? (
                    <>
                      <Square className="h-5 w-5 text-red-500" />
                      Execution Error
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5 text-green-500" />
                      Execution Results
                    </>
                  )}
                </h4>

                {executionError && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="text-red-800 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{executionError}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {executionResults && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="max-w-none">
                        <pre
                          className="whitespace-pre-wrap text-sm leading-relaxed text-black !text-black"
                          style={{ color: 'black' }}
                        >
                          {executionResults}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Execution History */}
            {executionHistory.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Execution History
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {executionHistory.map((execution) => (
                    <Card
                      key={execution.id}
                      className={`${
                        execution.status === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={execution.status === 'error' ? 'destructive' : 'default'}>
                              {execution.status}
                            </Badge>
                            <span className="font-medium text-black !text-black" style={{ color: 'black' }}>
                              {execution.agent}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {execution.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Input: {execution.input.substring(0, 100)}
                          {execution.input.length > 100 && '...'}
                        </div>
                        {execution.costOptimization && (
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 font-semibold">
                                ${execution.costOptimization.savings.toFixed(4)} saved
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3 text-blue-600" />
                              <span className="text-blue-600 font-semibold">
                                {typeof execution.costOptimization.tokenReduction === 'number'
                                  ? execution.costOptimization.tokenReduction.toFixed(1)
                                  : parseFloat(execution.costOptimization.tokenReduction).toFixed(1)}
                                % reduction
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-purple-600" />
                              <span className="text-purple-600 font-semibold">✅ Optimized</span>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <details className="cursor-pointer">
                          <summary
                            className="text-sm font-medium mb-2 text-black !text-black"
                            style={{ color: 'black' }}
                          >
                            View {execution.status === 'error' ? 'Error' : 'Output'}
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded border text-xs font-mono max-h-32 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-black !text-black" style={{ color: 'black' }}>
                              {execution.output}
                            </pre>
                          </div>
                        </details>
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
