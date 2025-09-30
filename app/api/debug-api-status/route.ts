import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const databaseUrl = process.env.DATABASE_URL
    
    const hasOpenRouterKey =
      openRouterKey &&
      openRouterKey !== 'your-openrouter-api-key' &&
      openRouterKey.length > 20
    
    const hasDatabase = databaseUrl && databaseUrl !== 'your-database-url'

    return NextResponse.json({
      success: true,
      debug: {
        hasOpenRouterKey,
        hasDatabase,
        openRouterKeyLength: openRouterKey?.length || 0,
        openRouterKeyPrefix: openRouterKey?.substring(0, 10) || 'none',
        databaseUrlPrefix: databaseUrl?.substring(0, 20) || 'none',
        environment: process.env.NODE_ENV,
        allEnvVars: Object.keys(process.env).filter(key => 
          key.includes('OPENROUTER') || 
          key.includes('DATABASE') || 
          key.includes('BASE') ||
          key.includes('PRIVY')
        ).reduce((acc, key) => {
          acc[key] = process.env[key]?.substring(0, 10) + '...'
          return acc
        }, {} as Record<string, string>)
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
