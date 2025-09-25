'use client'

import { useState } from 'react'
import { TaskForm } from '@/components/task-form'
import { HomePageHeader } from '@/components/home-page-header'
import { CostOptimization } from '@/components/cost-optimization'
import { AgentHub } from '@/components/agent-hub'
import { AgentKitNuxtInspired } from '@/components/agent-kit-nuxt-inspired'
import { AutonomousAgentWallet } from '@/components/autonomous-agent-wallet'
import { SmartAgentWallet } from '@/components/smart-agent-wallet'
import { X402Payment } from '@/components/x402-payment'
import { X402PaymentIntegration } from '@/components/x402-payment-integration'
import { PaymentProtocolComparison } from '@/components/payment-protocol-comparison'
import { MicroEcommercePayment } from '@/components/micro-ecommerce-payment'
import { X402ProtocolAnalysis } from '@/components/x402-protocol-analysis'
import { AdvancedOptimizationDashboard } from '@/components/advanced-optimization-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTasks } from '@/components/app-layout'

export function HomePageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')
  const router = useRouter()
  const { refreshTasks, addTaskOptimistically } = useTasks()

  const handleTaskSubmit = async (data: {
    prompt: string
    repoUrl: string
    selectedAgent: string
    selectedModel: string
  }) => {
    setIsSubmitting(true)

    // Add task optimistically to sidebar immediately
    const { id } = addTaskOptimistically(data)

    // Navigate to the new task page immediately
    router.push(`/tasks/${id}`)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, id }), // Include the pre-generated ID
      })

      if (response.ok) {
        toast.success('Task created successfully!')
        // Refresh sidebar to get the real task data from server
        await refreshTasks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create task')
        // TODO: Remove the optimistic task on error
        await refreshTasks() // For now, just refresh to remove the optimistic task
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
      // TODO: Remove the optimistic task on error
      await refreshTasks() // For now, just refresh to remove the optimistic task
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto p-3">
        <HomePageHeader />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              AI Tasks
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'optimization'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cost Optimization
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Economy Engine
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'agents'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              AgentHub
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              data-tab="payment"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payment'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              X402 Payment
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tasks' && (
          <div className="flex justify-center items-start min-h-screen pt-24 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl w-full px-4">
              <div className="space-y-6">
                <TaskForm onSubmit={handleTaskSubmit} isSubmitting={isSubmitting} />
              </div>
              <div className="space-y-6">
                <CostOptimization />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="flex justify-center items-start min-h-screen py-8">
            <div className="max-w-4xl w-full px-4">
              <CostOptimization />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="flex justify-center items-start min-h-screen py-8">
            <div className="max-w-7xl w-full px-4">
              <AdvancedOptimizationDashboard />
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="flex justify-center items-start min-h-screen py-8">
            <div className="max-w-6xl w-full px-4">
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="create">AgentKit</TabsTrigger>
                  <TabsTrigger value="wallets">Agent Wallets</TabsTrigger>
                  <TabsTrigger value="management">Manage Agents</TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-6">
                  <AgentKitNuxtInspired />
                </TabsContent>

                <TabsContent value="wallets" className="space-y-6">
                  <Tabs value="wallet-type" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic Wallets</TabsTrigger>
                      <TabsTrigger value="smart">Smart Contract Wallets</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="space-y-6">
                      <AutonomousAgentWallet />
                    </TabsContent>
                    <TabsContent value="smart" className="space-y-6">
                      <SmartAgentWallet />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="management" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Management</CardTitle>
                      <CardDescription>
                        Manage your AI agents, their configurations, and autonomous capabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Agent Management Coming Soon</h3>
                        <p className="text-muted-foreground">
                          Advanced agent management features will be available here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="flex justify-center items-start min-h-screen py-8">
            <div className="max-w-6xl w-full px-4 space-y-8">
              <Tabs defaultValue="micro-ecommerce" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="micro-ecommerce">Micro E-commerce</TabsTrigger>
                  <TabsTrigger value="protocol-analysis">Protocol Analysis</TabsTrigger>
                  <TabsTrigger value="protocols">Payment Protocols</TabsTrigger>
                  <TabsTrigger value="x402">x402 Foundation</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription Plans</TabsTrigger>
                </TabsList>

                <TabsContent value="micro-ecommerce" className="space-y-6">
                  <MicroEcommercePayment />
                </TabsContent>

                <TabsContent value="protocol-analysis" className="space-y-6">
                  <X402ProtocolAnalysis />
                </TabsContent>

                <TabsContent value="protocols" className="space-y-6">
                  <PaymentProtocolComparison
                    onProtocolSelect={(protocol) => {
                      toast.info(`Selected ${protocol} protocol for payments`)
                    }}
                  />
                </TabsContent>

                <TabsContent value="x402" className="space-y-6">
                  <X402PaymentIntegration />
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6">
                  <X402Payment
                    onPaymentComplete={(paymentData) => {
                      toast.success(`Payment completed for ${(paymentData.tier as { name: string }).name} plan!`)
                    }}
                    onSubscriptionChange={(tier) => {
                      toast.info(`Subscription changed to ${tier.name} plan`)
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
