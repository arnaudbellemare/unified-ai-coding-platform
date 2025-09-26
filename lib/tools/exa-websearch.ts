// Exa web search tools for AI SDK v5
export const exaWebSearchTool = {
  description:
    'Run a search query to search the internet for results. Use this to look up latest information or find documentation.',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query to execute',
    },
    numResults: {
      type: 'number',
      description: 'Number of results to return (default: 5)',
    },
  },
  execute: async ({ query, numResults = 5 }: { query: string; numResults?: number }) => {
    try {
      if (!process.env.EXA_API_KEY) {
        throw new Error('EXA_API_KEY environment variable is required')
      }

      const searchParams = new URLSearchParams({
        query,
        numResults: numResults.toString(),
        type: 'search',
        useAutoprompt: 'true',
      })

      // Add domain filters if provided (optional)
      // searchParams.append('includeDomains', 'example.com')
      // searchParams.append('excludeDomains', 'spam.com')

      const response = await fetch(`https://api.exa.ai/search?${searchParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.EXA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Exa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        results: data.results || [],
        query,
        totalResults: data.results?.length || 0,
      }
    } catch (error) {
      console.error('Exa web search error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
        results: [],
      }
    }
  }
}

export const exaCodeSearchTool = {
  description:
    'Search for code examples, documentation, and implementation patterns from open source repositories and documentation sites.',
  parameters: {
    query: {
      type: 'string',
      description: 'The code search query (e.g., "React hooks useEffect", "Python async await")',
    },
    numResults: {
      type: 'number',
      description: 'Number of results to return (default: 5)',
    },
  },
  execute: async ({ query, numResults = 5 }: { query: string; numResults?: number }) => {
    try {
      if (!process.env.EXA_API_KEY) {
        throw new Error('EXA_API_KEY environment variable is required')
      }

      const searchParams = new URLSearchParams({
        query,
        numResults: numResults.toString(),
        type: 'search',
        useAutoprompt: 'true',
        includeDomains: 'github.com,stackoverflow.com,dev.to,medium.com,mdn.io,docs.python.org,reactjs.org,nodejs.org',
      })

      // Language filter can be added if needed
      // if (language) {
      //   searchParams.append('query', `${query} ${language}`)
      // }

      const response = await fetch(`https://api.exa.ai/search?${searchParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.EXA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Exa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        results: data.results || [],
        query,
        totalResults: data.results?.length || 0,
      }
    } catch (error) {
      console.error('Exa code search error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
        results: [],
      }
    }
  }
}

export const exaCompanyResearchTool = {
  description:
    'Research companies and gather comprehensive information about businesses, their products, and market position.',
  parameters: {
    company: {
      type: 'string',
      description: 'Company name or domain to research',
    },
    numResults: {
      type: 'number',
      description: 'Number of results to return (default: 10)',
    },
  },
  execute: async ({ company, numResults = 10 }: { company: string; numResults?: number }) => {
    try {
      if (!process.env.EXA_API_KEY) {
        throw new Error('EXA_API_KEY environment variable is required')
      }

      const searchParams = new URLSearchParams({
        query: `company research ${company} business information products services`,
        numResults: numResults.toString(),
        type: 'search',
        useAutoprompt: 'true',
      })

      const response = await fetch(`https://api.exa.ai/search?${searchParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.EXA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Exa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        results: data.results || [],
        company,
        totalResults: data.results?.length || 0,
      }
    } catch (error) {
      console.error('Exa company research error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        company,
        results: [],
      }
    }
  }
}

export const exaCrawlingTool = {
  description:
    'Extract content from specific URLs, useful for reading articles, documentation, or any web page when you have the exact URL.',
  parameters: {
    url: {
      type: 'string',
      description: 'The URL to crawl and extract content from',
    },
    maxLength: {
      type: 'number',
      description: 'Maximum length of content to extract (default: 10000)',
    },
  },
  execute: async ({ url, maxLength = 10000 }: { url: string; maxLength?: number }) => {
    try {
      if (!process.env.EXA_API_KEY) {
        throw new Error('EXA_API_KEY environment variable is required')
      }

      const response = await fetch('https://api.exa.ai/crawl', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          maxLength,
        }),
      })

      if (!response.ok) {
        throw new Error(`Exa API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        content: data.content || '',
        url,
        title: data.title || '',
        length: data.content?.length || 0,
      }
    } catch (error) {
      console.error('Exa crawling error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
        content: '',
      }
    }
  }
}
