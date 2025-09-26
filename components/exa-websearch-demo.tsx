'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Code, Globe, Building, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SearchResult {
  title: string
  url: string
  publishedDate?: string
  author?: string
  text?: string
}

export function ExaWebSearchDemo() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchType, setSearchType] = useState<'web' | 'code' | 'company'>('web')

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsSearching(true)
    setResults([])

    try {
      const response = await fetch('/api/exa/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type: searchType,
          numResults: 5,
        }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
      toast.success(`Found ${data.results?.length || 0} results`)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const getSearchIcon = () => {
    switch (searchType) {
      case 'web':
        return <Globe className="h-4 w-4" />
      case 'code':
        return <Code className="h-4 w-4" />
      case 'company':
        return <Building className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getSearchDescription = () => {
    switch (searchType) {
      case 'web':
        return 'Search the internet for latest information and documentation'
      case 'code':
        return 'Find code examples from GitHub, Stack Overflow, and documentation sites'
      case 'company':
        return 'Research companies and gather business information'
      default:
        return 'Search for information'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Exa Web Search Integration</h2>
        <p className="text-muted-foreground">
          Powered by Exa AI's search capabilities with real-time web search and code discovery
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSearchIcon()}
            Search Configuration
          </CardTitle>
          <CardDescription>
            {getSearchDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchType === 'web' ? 'default' : 'outline'}
              onClick={() => setSearchType('web')}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Web Search
            </Button>
            <Button
              variant={searchType === 'code' ? 'default' : 'outline'}
              onClick={() => setSearchType('code')}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              Code Search
            </Button>
            <Button
              variant={searchType === 'company' ? 'default' : 'outline'}
              onClick={() => setSearchType('company')}
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Company Research
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={`Enter your ${searchType} search query...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="flex items-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <Badge variant="secondary">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                        {result.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                        {result.text || result.url}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="truncate max-w-xs">{result.url}</span>
                        {result.publishedDate && (
                          <span>{new Date(result.publishedDate).toLocaleDateString()}</span>
                        )}
                        {result.author && (
                          <span>by {result.author}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Exa Integration Features</CardTitle>
          <CardDescription>
            Advanced search capabilities powered by Exa AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Web Search
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time web search</li>
                <li>• Latest information</li>
                <li>• Documentation lookup</li>
                <li>• News and articles</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code Search
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• GitHub repositories</li>
                <li>• Stack Overflow answers</li>
                <li>• Documentation sites</li>
                <li>• Code examples</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Research
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Business information</li>
                <li>• Product details</li>
                <li>• Market research</li>
                <li>• Company profiles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
