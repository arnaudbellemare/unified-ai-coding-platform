import { useState, useEffect } from 'react'

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
}

export function useGitHubAuth() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/github/user')
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (err) {
      setError('Failed to check authentication status')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    window.location.href = '/api/auth/github'
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/github/logout', { method: 'POST' })
      setUser(null)
    } catch (err) {
      setError('Failed to logout')
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
