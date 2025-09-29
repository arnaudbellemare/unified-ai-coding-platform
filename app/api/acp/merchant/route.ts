import { NextRequest, NextResponse } from 'next/server'
import { merchantService, MerchantConfigInput } from '@/lib/acp/merchant-service'

export async function GET() {
  const merchants = merchantService.list()
  return NextResponse.json({ success: true, merchants })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = body as MerchantConfigInput
    if (!input?.id || !input?.name) {
      return NextResponse.json({ error: 'id and name are required' }, { status: 400 })
    }
    const saved = merchantService.upsert(input)
    return NextResponse.json({ success: true, merchant: saved })
  } catch (e) {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
}
