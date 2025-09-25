'use client'

import { useState } from 'react'
import { TaskForm } from '@/components/task-form'
import { HomePageHeader } from '@/components/home-page-header'
import { CostOptimization } from '@/components/cost-optimization'
import { AgentHub } from '@/components/agent-hub'
import { X402Payment } from '@/components/x402-payment'
import { AdvancedOptimizationDashboard } from '@/components/advanced-optimization-dashboard'
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
              <AgentHub
                onAgentCreate={(config) => {
                  toast.success(`Agent "${config.name}" created successfully!`)
                }}
                onAgentExecute={(agentId, input) => {
                  toast.info(`Executing agent "${agentId}" with input: ${input.substring(0, 50)}...`)
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="flex justify-center items-start min-h-screen py-8">
            <div className="max-w-6xl w-full px-4">
              <X402Payment
                onPaymentComplete={(paymentData) => {
                  toast.success(`Payment completed for ${(paymentData.tier as { name: string }).name} plan!`)
                }}
                onSubscriptionChange={(tier) => {
                  toast.info(`Subscription changed to ${tier.name} plan`)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
