'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OpenRouterModelSelector } from '@/components/openrouter-model-selector'
import { Brain, Code, Bot, Zap, DollarSign, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface OpenRouterModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: number
    completion: number
  }
  context_length: number
  architecture: {
    modality: string
    tokenizer: string
    instruct_type?: string
  }
}

interface OpenRouterIntegrationProps {
  isAuthenticated: boolean
  userCredits: number
  onModelSelect: (model: OpenRouterModel) => void
  selectedModel?: OpenRouterModel
}

export function OpenRouterIntegration({ 
  isAuthenticated, 
  userCredits, 
  onModelSelect, 
  selectedModel 
}: OpenRouterIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('models')

  const handleVibeCode = async (prompt: string) => {
    if (!selectedModel) {
      toast.error('Please select a model first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/openrouter/vibe-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel.id,
          prompt,
          useSandbox: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Generation failed')
      }

      const result = await response.json()
      setGenerationResult(result)
      toast.success('Code generated successfully!')
    } catch (error) {
      console.error('Vibe code error:', error)
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAgentKitBot = async (instruction: string) => {
    if (!selectedModel) {
      toast.error('Please select a model first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/openrouter/agent-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel.id,
          instruction,
          connectToOtherBots: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Bot creation failed')
      }

      const result = await response.json()
      setGenerationResult(result)
      toast.success('Agent bot created successfully!')
    } catch (error) {
      console.error('Agent bot error:', error)
      toast.error(error instanceof Error ? error.message : 'Bot creation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">OpenRouter AI Integration</h2>
        <p className="text-muted-foreground">
          Choose your LLM, pay per use, and create AI agents that connect to each other
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Model Selection</TabsTrigger>
          <TabsTrigger value="vibe-code">Vibe Code</TabsTrigger>
          <TabsTrigger value="agent-bots">Agent Bots</TabsTrigger>
          <TabsTrigger value="connections">Bot Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <OpenRouterModelSelector
            onModelSelect={onModelSelect}
            selectedModel={selectedModel}
            isAuthenticated={isAuthenticated}
            userCredits={userCredits}
          />
        </TabsContent>

        <TabsContent value="vibe-code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Vibe Code with Sandbox
              </CardTitle>
              <CardDescription>
                Generate code using your selected model and run it in a secure sandbox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedModel ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Selected: {selectedModel.name}</span>
                    <Badge variant="secondary">
                      ${selectedModel.pricing.prompt.toFixed(2)}/1M tokens
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Prompt</label>
                    <textarea
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={4}
                      placeholder="Describe the code you want to generate..."
                      id="vibe-code-prompt"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const prompt = (document.getElementById('vibe-code-prompt') as HTMLTextAreaElement)?.value
                      if (prompt) handleVibeCode(prompt)
                    }}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <Code className="h-4 w-4 mr-2" />
                        Generate & Run Code
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Please select a model first to generate code
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {generationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Generation Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Model:</span> {generationResult.model}
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span> ${generationResult.cost?.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium">Tokens:</span> {generationResult.usage?.total_tokens}
                    </div>
                    <div>
                      <span className="font-medium">Sandbox:</span> {generationResult.sandboxResult ? 'Executed' : 'Not executed'}
                    </div>
                  </div>
                  
                  {generationResult.content && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Generated Code:</h4>
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {generationResult.content}
                      </pre>
                    </div>
                  )}
                  
                  {generationResult.sandboxResult && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Sandbox Output:</h4>
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {generationResult.sandboxResult.output}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agent-bots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Create Agent Bots
              </CardTitle>
              <CardDescription>
                Create AI agents that can connect and communicate with each other
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedModel ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Selected: {selectedModel.name}</span>
                    <Badge variant="secondary">
                      ${selectedModel.pricing.prompt.toFixed(2)}/1M tokens
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Agent Instructions</label>
                    <textarea
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={4}
                      placeholder="Describe what this agent should do and how it should interact with other agents..."
                      id="agent-instructions"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const instruction = (document.getElementById('agent-instructions') as HTMLTextAreaElement)?.value
                      if (instruction) handleAgentKitBot(instruction)
                    }}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Create Agent Bot
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Please select a model first to create agent bots
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {generationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Bot Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Agent ID:</span> {generationResult.agentId}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {generationResult.status}
                    </div>
                    <div>
                      <span className="font-medium">Connections:</span> {generationResult.connections?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span> ${generationResult.cost?.toFixed(4)}
                    </div>
                  </div>
                  
                  {generationResult.agentResponse && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Agent Response:</h4>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        {generationResult.agentResponse}
                      </div>
                    </div>
                  )}
                  
                  {generationResult.connections && generationResult.connections.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Connected Agents:</h4>
                      <div className="space-y-2">
                        {generationResult.connections.map((connection: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{connection.agentId}</span>
                            <Badge variant="outline">{connection.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bot Network Connections
              </CardTitle>
              <CardDescription>
                Manage connections between your AI agents for collaborative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Agent A</h3>
                    <p className="text-sm text-muted-foreground">Data Processing</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold">Agent B</h3>
                    <p className="text-sm text-muted-foreground">Analysis</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold">Agent C</h3>
                    <p className="text-sm text-muted-foreground">Reporting</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Agents can communicate and share data</p>
                  <p>• Each agent uses your selected OpenRouter model</p>
                  <p>• Pay only for the tokens used by each agent</p>
                  <p>• Real-time collaboration and task distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
