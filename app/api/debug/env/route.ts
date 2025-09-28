import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    openrouterApiKey: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET',
    openrouterApiKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
    githubClientId: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
    postgresUrl: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
    supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    timestamp: new Date().toISOString(),
  })
}
