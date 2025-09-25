'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task } from '@/lib/db/schema'

export function useTask(taskId: string) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const fetchTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data.task)
        setError(null)
        setIsLoading(false)
        setIsInitialLoad(false)
      } else if (response.status === 404) {
        // For the initial load, if we get 404, keep loading for a bit longer
        // This prevents the "Task Not Found" flash during task creation
        if (isInitialLoad) {
          // Wait 3 seconds before showing error on initial load
          setTimeout(() => {
            if (!task) { // Only show error if task still doesn't exist
              setError('Task not found')
              setIsLoading(false)
            }
          }, 3000)
        } else {
          // For subsequent loads (polling), show error immediately
          setError('Task not found')
          setTask(null)
          setIsLoading(false)
        }
      } else {
        setError('Failed to fetch task')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error fetching task:', err)
      setError('Failed to fetch task')
      setIsLoading(false)
    }
  }, [taskId, isInitialLoad, task])

  // Initial fetch
  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTask()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchTask])

  return { task, isLoading, error, refetch: fetchTask }
}
