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
import { Bot, Zap, Settings, Play, Pause, Square, Code, MessageSquare, BarChart3, Target, Activity, Trash2 } from 'lucide-react'

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
    }>
  >([])

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
    if (!agentConfig.name || !agentConfig.instructions) return

    const newAgent = { ...agentConfig }
    setCreatedAgents((prev) => [...prev, newAgent])
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
  }

  const handleDeleteAgent = (index: number) => {
    setCreatedAgents((prev) => prev.filter((_, i) => i !== index))
    
    // If the deleted agent was selected, clear the selection
    const deletedAgent = createdAgents[index]
    if (selectedAgent === deletedAgent?.name) {
      setSelectedAgent('')
    }
  }

  const handleExecuteAgent = async () => {
    if (!selectedAgent || !agentInput) return

    setIsExecuting(true)
    setExecutionError('')
    setExecutionResults('')

    try {
      // Call the parent callback if provided
      onAgentExecute?.(selectedAgent, agentInput)

      // Simulate agent execution with realistic results
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a realistic response based on agent type
      const agent = createdAgents.find((a) => a.name === selectedAgent)
      const simulatedResult = generateSimulatedResult(agent?.type || 'coding', agentInput)

      setExecutionResults(simulatedResult)

      // Add to execution history
      const newExecution = {
        id: Date.now().toString(),
        agent: selectedAgent,
        input: agentInput,
        output: simulatedResult,
        timestamp: new Date(),
        status: 'success' as const,
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

            <Button onClick={handleCreateAgent} className="w-full">
              <Bot className="h-4 w-4 mr-2" />
              Create Agent
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
