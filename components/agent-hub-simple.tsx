'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Settings, Play } from 'lucide-react'

export function AgentHub() {
  const [selectedTab, setSelectedTab] = useState<'create' | 'manage' | 'execute'>('create')
  const [agentName, setAgentName] = useState('')
  const [agentInstructions, setAgentInstructions] = useState('')
  const [executionResults, setExecutionResults] = useState('')

  const handleCreateAgent = () => {
    console.log('Creating agent:', { agentName, agentInstructions })
    // Add agent creation logic here
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create New Agent</h3>

              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="My Custom Agent"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Agent Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Describe what this agent should do..."
                  value={agentInstructions}
                  onChange={(e) => setAgentInstructions(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>

              <Button onClick={handleCreateAgent} disabled={!agentName || !agentInstructions} className="w-full">
                <Bot className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <h3 className="text-lg font-semibold">Manage Agents</h3>
            <div className="text-center text-muted-foreground py-8">
              No agents created yet. Create your first agent in the Create tab.
            </div>
          </TabsContent>

          <TabsContent value="execute" className="space-y-4">
            <h3 className="text-lg font-semibold">Execute Agent</h3>
            <div className="text-center text-muted-foreground py-8">Create agents first to execute them.</div>

            {executionResults && (
              <div className="mt-4">
                <Label>Execution Results</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <div className="text-black">{executionResults}</div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
