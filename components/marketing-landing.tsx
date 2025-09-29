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
            {/* Conic spotlight (circular, not a rectangle) */}
            <div className="absolute inset-0 bg-conic-spot opacity-35" />
            {/* Soft moving orbs for depth */}
            <div className="absolute -top-10 -left-6 w-[420px] h-[420px] bg-orb orb-1" />
            <div className="absolute bottom-[-40px] right-[-20px] w-[380px] h-[380px] bg-orb orb-2" />
            {/* Subtle texture */}
            <div className="absolute inset-0 bg-blobs opacity-45" />
          </div>
        )}
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Animated headline + CTAs */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm animate-fade-in"
                style={{ background: 'linear-gradient(90deg, var(--c1), var(--c2))' }}
              >
                verclibase <span className="opacity-80">on base</span>
              </div>
              <div className="mt-3 inline-block rounded-2xl bg-white/85 backdrop-blur-md shadow-[0_6px_30px_rgba(0,0,0,0.06)] px-5 py-4 md:px-6 md:py-5 animate-fade-in">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] animate-slide-up-1 text-black">
                  Build
                  <span
                    className="mx-2 inline-block bg-gradient-to-r from-[var(--c1)] via-[var(--c2)] to-[var(--c3)] bg-clip-text text-transparent animate-gradient-text"
                    style={{ textShadow: '0 1px 1px rgba(0,0,0,0.18)' }}
                  >
                    agentic commerce
                  </span>
                  that pays you back
                </h1>
                <p className="mt-4 text-gray-900 max-w-xl animate-slide-up-2">
                  Real-time prompt optimization, ACP search/checkout, and x402 reimbursements. Production-ready flows on
                  Base with observability and ROI.
                </p>
                <div className="mt-6 flex gap-3 animate-slide-up-3">
                  <Button size="lg" onClick={onPrimary} className="bg-black text-white hover:bg-black/90">
                    Start free
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-100">
                    View demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Orbiting mini cards */}
            <div className="hidden md:block">
              <div className="relative h-[420px]">
                {/* Twin ellipse rings for structure */}
                <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <ellipse cx="50" cy="50" rx="42" ry="28" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="0.8" />
                  <ellipse cx="50" cy="50" rx="34" ry="22" fill="none" stroke="rgba(34,197,94,0.35)" strokeWidth="0.6" />
                </svg>
                <div className="absolute -inset-6 rounded-full opacity-25 bg-conic-spot" />

                <div className="absolute left-1/2 top-[8%] -translate-x-1/2 animate-float-1">
                  <MiniCard
                    className="bg-white/95 backdrop-blur-md border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    icon={<Search className="h-4 w-4 text-blue-600" />}
                    title="ACP Search"
                    desc="Query & rank"
                  />
                </div>
                <div className="absolute left-[6%] top-[58%] animate-float-2">
                  <MiniCard
                    className="bg-white/95 backdrop-blur-md border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                    title="x402"
                    desc="Checkout"
                  />
                </div>
                <div className="absolute right-[6%] top-[46%] animate-float-3">
                  <MiniCard
                    className="bg-white/95 backdrop-blur-md border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    icon={<Sliders className="h-4 w-4 text-indigo-600" />}
                    title="Optimizers"
                    desc="Reduce tokens"
                  />
                </div>
                <div className="absolute left-[36%] bottom-[4%] animate-float-2">
                  <MiniCard
                    className="bg-white/95 backdrop-blur-md border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    icon={<Brain className="h-4 w-4 text-purple-600" />}
                    title="AI"
                    desc="OpenRouter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .bg-conic-spot {
            background: conic-gradient(from 0deg at 60% 40%, var(--c1), var(--c2), var(--c3), var(--c1));
            animation: vrcl-rotate 36s linear infinite;
            transform-origin: 60% 40%;
            -webkit-clip-path: circle(48% at 60% 40%);
            clip-path: circle(48% at 60% 40%);
          }
          .bg-blobs {
            background:
              radial-gradient(40% 25% at 70% -10%, color-mix(in srgb, var(--c1) 25%, transparent), transparent 60%),
              radial-gradient(30% 20% at 20% 10%, color-mix(in srgb, var(--c2) 25%, transparent), transparent 60%),
              radial-gradient(40% 30% at 90% 60%, color-mix(in srgb, var(--c3) 22%, transparent), transparent 60%);
            filter: blur(2px) saturate(120%);
            animation: vrcl-float 14s ease-in-out infinite alternate;
          }
          .bg-orb { border-radius: 9999px; filter: blur(28px) saturate(120%); mix-blend: multiply; }
          .orb-1 { background: radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--c1) 65%, transparent), transparent 60%); animation: vrcl-orb-1 18s ease-in-out infinite; opacity: 0.5; }
          .orb-2 { background: radial-gradient(circle at 60% 60%, color-mix(in srgb, var(--c2) 60%, transparent), transparent 60%); animation: vrcl-orb-2 22s ease-in-out infinite; opacity: 0.45; }
          .animate-gradient-text { background-size: 200% 200%; animation: gradientShift 8s ease infinite; }
          .animate-fade-in { animation: fadeIn 600ms ease 100ms both; }
          .animate-slide-up-1 { animation: slideUp 700ms cubic-bezier(.2,.8,.2,1) 50ms both; }
          .animate-slide-up-2 { animation: slideUp 750ms cubic-bezier(.2,.8,.2,1) 180ms both; }
          .animate-slide-up-3 { animation: slideUp 800ms cubic-bezier(.2,.8,.2,1) 260ms both; }
          .animate-float-1 { animation: float 6s ease-in-out infinite; }
          .animate-float-2 { animation: float 7.5s ease-in-out infinite alternate; }
          .animate-float-3 { animation: float 5.5s ease-in-out infinite reverse; }
          @keyframes vrcl-rotate {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes vrcl-float {
            0% {
              transform: translate3d(0, -6px, 0) scale(1.02);
            }
            100% {
              transform: translate3d(8px, 6px, 0) scale(1.04);
            }
          }
          @keyframes vrcl-orb-1 { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(30px, -18px, 0) } 100% { transform: translate3d(0,0,0) } }
          @keyframes vrcl-orb-2 { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(-26px, 16px, 0) } 100% { transform: translate3d(0,0,0) } }
          @keyframes gradientShift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes float { 0% { transform: translateY(-6px) } 100% { transform: translateY(6px) } }
        `}</style>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">Cost-optimized AI</div>
              <p className="text-sm text-gray-900 mt-1">
                Research-backed optimizers and Cloudflare-inspired techniques reduce tokens and improve throughput.
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">Agentic commerce (ACP)</div>
              <p className="text-sm text-gray-900 mt-1">
                Expose catalog/search/checkout that any compatible agent can rank and transact against.
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">x402 on Base</div>
              <p className="text-sm text-gray-900 mt-1">
                Instant, internet-native payments and reimbursements with clear labeling and audit trails.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">1. Configure</div>
              <p className="text-gray-900 mt-1">Set env vars, provider keys, and Base network.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">2. Optimize</div>
              <p className="text-gray-900 mt-1">Run prompts through unified optimizers.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">3. Rank & Search</div>
              <p className="text-gray-900 mt-1">Publish ACP catalog and search endpoints.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="font-semibold text-black">4. Transact</div>
              <p className="text-gray-900 mt-1">Checkout via x402; label Sponsored placements.</p>
            </CardContent>
          </Card>
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

function MiniCard({ icon, title, desc, className = '' }: { icon: React.ReactNode; title: string; desc: string; className?: string }) {
  return (
    <div className={`rounded-xl border px-3 py-2 w-[184px] ${className}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-black leading-tight truncate">{title}</div>
          <div className="text-[11px] text-gray-700 leading-snug truncate">{desc}</div>
        </div>
      </div>
    </div>
  )
}
