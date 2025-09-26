import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Environment Debug',
    hasGitHubClientId: !!process.env.GITHUB_CLIENT_ID,
    hasGitHubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
