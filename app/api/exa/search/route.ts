import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, type = 'web', numResults = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!process.env.EXA_API_KEY) {
      return NextResponse.json({ error: 'EXA_API_KEY environment variable is required' }, { status: 500 })
    }

    let searchParams = new URLSearchParams({
      query,
      numResults: numResults.toString(),
      type: 'search',
      useAutoprompt: 'true',
    })

    // Add domain filters based on search type
    switch (type) {
      case 'code':
        searchParams.append(
          'includeDomains',
          'github.com,stackoverflow.com,dev.to,medium.com,mdn.io,docs.python.org,reactjs.org,nodejs.org,typescriptlang.org',
        )
        break
      case 'company':
        searchParams.append('includeDomains', 'linkedin.com,crunchbase.com,bloomberg.com,reuters.com,techcrunch.com')
        break
      case 'web':
      default:
        // No specific domain filters for general web search
        break
    }

    const response = await fetch(`https://api.exa.ai/search?${searchParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.EXA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Exa API error:', response.status, errorText)
      return NextResponse.json({ error: `Exa API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      results: data.results || [],
      query,
      type,
      totalResults: data.results?.length || 0,
    })
  } catch (error) {
    console.error('Exa search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

