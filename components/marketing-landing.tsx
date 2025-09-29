'use client'

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, CreditCard, Brain, Sliders, Database, BarChart } from 'lucide-react'

type LandingTheme = 'home' | 'finance' | 'travel' | 'academic' | 'sports' | 'library'

export function MarketingLanding({
  onPrimary,
  disableAnimatedBg = false,
  theme = 'finance',
}: {
  onPrimary?: () => void
  disableAnimatedBg?: boolean
  theme?: LandingTheme
}) {
  const [c1, c2, c3] = useMemo(() => {
    const palette: Record<LandingTheme, [string, string, string]> = {
      home: ['#0ea5e9', '#60a5fa', '#22d3ee'],
      finance: ['#0ea5e9', '#22c55e', '#1d4ed8'],
      travel: ['#38bdf8', '#f97316', '#10b981'],
      academic: ['#6366f1', '#06b6d4', '#eab308'],
      sports: ['#ef4444', '#22c55e', '#0ea5e9'],
      library: ['#3b82f6', '#8b5cf6', '#06b6d4'],
    }
    return palette[theme]
  }, [theme])

  return (
    <div className="bg-white">
      {/* Hero with subtle radial/conic background */}
      <section
        className="relative overflow-hidden"
        style={{ '--c1': c1, '--c2': c2, '--c3': c3 } as React.CSSProperties}
      >
        {disableAnimatedBg ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(1200px 600px at 60% -10%, rgba(0,0,0,0.06), transparent 60%), conic-gradient(from 80deg at 65% -20%, rgba(0,0,0,0.04), transparent 70%)',
            }}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -inset-[10%] bg-conic-rotate opacity-25" />
            <div className="absolute inset-0 bg-blobs opacity-55" />
          </div>
        )}
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-black leading-[0.95]">A global stack for agentic commerce</h1>
            <p className="mt-5 text-gray-800 max-w-xl">
              Verclibase helps teams ship AI workflows with real-time optimization, agentic commerce (ACP), and x402-powered
              payments on Base. Rank, transact, and optimize — production ready.
            </p>
            <div className="mt-7 flex gap-3">
              <Button size="lg" onClick={onPrimary} className="bg-black text-white hover:bg-black/90">Start free</Button>
              <Button size="lg" variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-100">View demo</Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-base font-semibold text-black">Production signal flow</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Row 1 */}
                <FlowCard icon={<Search className="h-5 w-5 text-blue-600" />} title="ACP Search" desc="Agent queries and ranking" />
                <FlowCard icon={<CreditCard className="h-5 w-5 text-emerald-600" />} title="x402 Checkout" desc="Instant agentic payments" />
                {/* Row 2 */}
                <FlowCard icon={<Brain className="h-5 w-5 text-purple-600" />} title="OpenRouter AI" desc="Model execution" />
                <FlowCard icon={<Sliders className="h-5 w-5 text-indigo-600" />} title="Optimizers" desc="Token & cost reduction" />
                {/* Row 3 */}
                <FlowCard icon={<Database className="h-5 w-5 text-orange-600" />} title="Supabase" desc="State & persistence" />
                <FlowCard icon={<BarChart className="h-5 w-5 text-pink-600" />} title="Analytics" desc="Observability & ROI" />
              </div>
            </div>
          </div>
        </div>
        </div>
        <style jsx>{`
          .bg-conic-rotate {
            background: conic-gradient(from 0deg at 50% 50%, var(--c1), var(--c2), var(--c3), var(--c1));
            animation: vrcl-rotate 36s linear infinite;
            transform-origin: 50% 50%;
          }
          .bg-blobs {
            background:
              radial-gradient(40% 25% at 70% -10%, color-mix(in srgb, var(--c1) 25%, transparent), transparent 60%),
              radial-gradient(30% 20% at 20% 10%, color-mix(in srgb, var(--c2) 25%, transparent), transparent 60%),
              radial-gradient(40% 30% at 90% 60%, color-mix(in srgb, var(--c3) 22%, transparent), transparent 60%);
            filter: blur(2px) saturate(120%);
            animation: vrcl-float 14s ease-in-out infinite alternate;
          }
          @keyframes vrcl-rotate { to { transform: rotate(360deg); } }
          @keyframes vrcl-float {
            0% { transform: translate3d(0, -6px, 0) scale(1.02); }
            100% { transform: translate3d(8px, 6px, 0) scale(1.04); }
          }
        `}</style>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">Cost-optimized AI</div>
              <p className="text-sm text-gray-900 mt-1">Research-backed optimizers and Cloudflare-inspired techniques reduce tokens and improve throughput.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">Agentic commerce (ACP)</div>
              <p className="text-sm text-gray-900 mt-1">Expose catalog/search/checkout that any compatible agent can rank and transact against.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">x402 on Base</div>
              <p className="text-sm text-gray-900 mt-1">Instant, internet-native payments and reimbursements with clear labeling and audit trails.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <Card className="border-gray-200 bg-white"><CardContent className="p-5"><div className="font-semibold text-black">1. Configure</div><p className="text-gray-900 mt-1">Set env vars, provider keys, and Base network.</p></CardContent></Card>
          <Card className="border-gray-200 bg-white"><CardContent className="p-5"><div className="font-semibold text-black">2. Optimize</div><p className="text-gray-900 mt-1">Run prompts through unified optimizers.</p></CardContent></Card>
          <Card className="border-gray-200 bg-white"><CardContent className="p-5"><div className="font-semibold text-black">3. Rank & Search</div><p className="text-gray-900 mt-1">Publish ACP catalog and search endpoints.</p></CardContent></Card>
          <Card className="border-gray-200 bg-white"><CardContent className="p-5"><div className="font-semibold text-black">4. Transact</div><p className="text-gray-900 mt-1">Checkout via x402; label Sponsored placements.</p></CardContent></Card>
        </div>
      </section>
    </div>
  )
}

function FlowCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="mt-1">{icon}</div>
          <div>
            <div className="font-semibold text-black leading-tight">{title}</div>
            <div className="text-sm text-gray-800 leading-snug">{desc}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


