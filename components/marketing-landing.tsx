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
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          const mx = (x - 0.5) * 2
          const my = (y - 0.5) * 2
          e.currentTarget.style.setProperty('--mx', mx.toFixed(3))
          e.currentTarget.style.setProperty('--my', my.toFixed(3))
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.setProperty('--mx', '0')
          e.currentTarget.style.setProperty('--my', '0')
        }}
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
            {/* Rayburst backdrop (parallax) */}
            <div className="absolute inset-0 bg-rayburst opacity-60" />
            {/* Slow rotating rays for motion */}
            <div className="absolute -inset-[8%] bg-rayburst-rotating opacity-35" />
            {/* Ambient spotlight */}
            <div className="absolute inset-0 bg-conic-spot opacity-35" />
            {/* Interactive cursor spotlight */}
            <div className="absolute inset-0 bg-cursor-spot" />
            {/* Soft moving orbs for depth */}
            <div className="absolute -top-10 -left-6 w-[420px] h-[420px] bg-orb orb-1" />
            <div className="absolute bottom-[-40px] right-[-20px] w-[380px] h-[380px] bg-orb orb-2" />
            {/* Subtle texture */}
            <div className="absolute inset-0 bg-blobs opacity-45" />
            {/* Bottom fade to white */}
            <div className="absolute inset-0 bg-fade-bottom" />
          </div>
        )}
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Animated headline + CTAs */}
            <div>
              <div
                aria-label="verclibase on base"
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold leading-none tracking-tight text-white backdrop-blur-sm ring-1 ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),_0_8px_20px_rgba(0,0,0,0.12)] animate-fade-in transition-[background,box-shadow,transform] duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),_0_12px_28px_rgba(0,0,0,0.16)] hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 60%), linear-gradient(90deg, var(--c1), var(--c2))',
                }}
              >
                verclibase <span className="opacity-90">on base</span>
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
                  <Button size="lg" variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-200">
                    View demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Feature tiles (clean grid, no circles) */}
            <div className="hidden md:block">
              <div className="relative h-[420px]">
                <div className="absolute inset-0 bg-beams opacity-30" />
                <div className="grid grid-cols-2 gap-4 absolute inset-0 place-content-center">
                  <FeatureTile
                    icon={<Search className="h-5 w-5 text-blue-600" />}
                    title="Agentic e-Commerce"
                    desc="Query & rank priority"
                  />
                  <FeatureTile
                    icon={<Sliders className="h-5 w-5 text-indigo-600" />}
                    title="Optimizers"
                    desc="Reduce tokens cost for agents"
                  />
                  <FeatureTile
                    icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
                    title="x402"
                    desc="Checkout"
                  />
                  <FeatureTile icon={<Brain className="h-5 w-5 text-purple-600" />} title="AI" desc="OpenRouter" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .bg-rayburst {
            background:
              radial-gradient(closest-side, rgba(255, 255, 255, 0.9), transparent 60%),
              repeating-conic-gradient(
                from 0deg,
                color-mix(in srgb, var(--c1) 8%, transparent) 0 8deg,
                transparent 8deg 14deg
              );
            mask-image: radial-gradient(70% 50% at 50% 40%, rgba(0, 0, 0, 0.9), transparent 70%);
            transform: translate3d(calc(var(--mx, 0) * 6px), calc(var(--my, 0) * 6px), 0);
            transition: transform 120ms ease-out;
          }
          .bg-rayburst-rotating {
            background: repeating-conic-gradient(
              from 0deg,
              color-mix(in srgb, var(--c2) 10%, transparent) 0 10deg,
              transparent 10deg 16deg
            );
            mask-image: radial-gradient(70% 50% at 50% 40%, rgba(0, 0, 0, 0.8), transparent 70%);
            animation: raysRotate 32s linear infinite;
          }
          .bg-conic-spot {
            background:
              radial-gradient(54% 38% at 60% 40%, color-mix(in srgb, var(--c1) 18%, transparent), transparent 60%),
              radial-gradient(50% 36% at 60% 40%, color-mix(in srgb, var(--c2) 18%, transparent), transparent 60%),
              radial-gradient(48% 34% at 60% 40%, color-mix(in srgb, var(--c3) 16%, transparent), transparent 60%);
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
          .bg-beams {
            background:
              repeating-linear-gradient(
                120deg,
                color-mix(in srgb, var(--c1) 20%, transparent) 0 2px,
                transparent 2px 18px
              ),
              radial-gradient(60% 40% at 65% 35%, color-mix(in srgb, var(--c2) 12%, transparent), transparent 60%),
              radial-gradient(50% 30% at 35% 70%, color-mix(in srgb, var(--c3) 10%, transparent), transparent 60%);
            filter: blur(6px) saturate(115%);
            mask-image: radial-gradient(70% 50% at 50% 40%, rgba(0, 0, 0, 0.9), transparent 70%);
          }
          .bg-cursor-spot {
            background: radial-gradient(
              220px 160px at calc(50% + var(--mx, 0) * 60px) calc(40% + var(--my, 0) * 60px),
              rgba(255, 255, 255, 0.45),
              transparent 70%
            );
            transition: background-position 120ms ease-out;
          }
          .bg-fade-bottom {
            background: linear-gradient(to bottom, transparent 55%, rgba(255, 255, 255, 0.75) 82%, #ffffff 100%);
          }
          .bg-orb {
            border-radius: 9999px;
            filter: blur(28px) saturate(120%);
            mix-blend: multiply;
          }
          .orb-1 {
            background: radial-gradient(
              circle at 40% 40%,
              color-mix(in srgb, var(--c1) 65%, transparent),
              transparent 60%
            );
            animation: vrcl-orb-1 18s ease-in-out infinite;
            opacity: 0.5;
          }
          .orb-2 {
            background: radial-gradient(
              circle at 60% 60%,
              color-mix(in srgb, var(--c2) 60%, transparent),
              transparent 60%
            );
            animation: vrcl-orb-2 22s ease-in-out infinite;
            opacity: 0.45;
          }
          /* Parallax utility: use mouse offsets */
          .parallax {
            transform: translate3d(
              calc(var(--mx, 0) * var(--depth, 1) * 6px),
              calc(var(--my, 0) * var(--depth, 1) * 6px),
              0
            );
            transition: transform 120ms ease-out;
          }
          .parallax[data-depth='1'] {
            --depth: 1;
          }
          .parallax[data-depth='2'] {
            --depth: 2;
          }
          .parallax[data-depth='2.6'] {
            --depth: 2.6;
          }
          .parallax[data-depth='3'] {
            --depth: 3;
          }
          .parallax[data-depth='3.2'] {
            --depth: 3.2;
          }
          .animate-gradient-text {
            background-size: 200% 200%;
            animation: gradientShift 8s ease infinite;
          }
          .animate-fade-in {
            animation: fadeIn 600ms ease 100ms both;
          }
          .animate-slide-up-1 {
            animation: slideUp 700ms cubic-bezier(0.2, 0.8, 0.2, 1) 50ms both;
          }
          .animate-slide-up-2 {
            animation: slideUp 750ms cubic-bezier(0.2, 0.8, 0.2, 1) 180ms both;
          }
          .animate-slide-up-3 {
            animation: slideUp 800ms cubic-bezier(0.2, 0.8, 0.2, 1) 260ms both;
          }
          .animate-sway-1 {
            animation: sway 6s ease-in-out infinite;
          }
          .animate-sway-2 {
            animation: sway 7.5s ease-in-out infinite alternate;
          }
          .animate-sway-3 {
            animation: sway 5.5s ease-in-out infinite reverse;
          }
          .tilt {
            transform-style: preserve-3d;
          }
          .tilt:hover {
            transform: perspective(800px) rotateX(calc(var(--my, 0) * -4deg)) rotateY(calc(var(--mx, 0) * 6deg));
            transition: transform 160ms ease;
          }
          @keyframes vrcl-rotate {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes raysRotate {
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
          @keyframes vrcl-orb-1 {
            0% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(30px, -18px, 0);
            }
            100% {
              transform: translate3d(0, 0, 0);
            }
          }
          @keyframes vrcl-orb-2 {
            0% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(-26px, 16px, 0);
            }
            100% {
              transform: translate3d(0, 0, 0);
            }
          }
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes sway {
            0% {
              transform: translateY(-6px) translateX(0px);
            }
            100% {
              transform: translateY(6px) translateX(6px);
            }
          }
        `}</style>
      </section>

      {/* Agentic e‑Commerce Advantage (GEO) */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md p-6 md:p-8 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-black">
                Agentic e‑Commerce Advantage
                <span className="ml-2 align-middle inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-black text-white">
                  GEO
                </span>
              </h3>
              <p className="mt-2 text-gray-900 max-w-3xl">
                Get chosen first by AI agents. We expose catalog/search endpoints and rank offers using relevance,
                trust, price efficiency, fulfillment reliability, and x402 sponsorship budgets — Generative Engine
                Optimization (GEO) for agentic commerce.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="outline"
                className="bg-white border-gray-300 text-black hover:bg-gray-200"
                onClick={async () => {
                  try {
                    const example = {
                      id: 'verclibase-demo-merchant',
                      name: 'Verclibase Demo Merchant',
                      description: 'High-trust, Base-native merchant for agentic commerce',
                      url: 'https://verclibase.vercel.app',
                      trust: { rating: 4.8, onTimeRate: 0.99, returnRate: 0.03 },
                      sponsoredBudgetUSD: 250,
                    }
                    const res = await fetch('/api/acp/merchant', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(example),
                    })
                    const data = await res.json().catch(() => ({}))
                    const ok = res.ok && data?.success
                    const msg = ok
                      ? 'Your merchant is now featured for agentic GEO ranking.'
                      : `Request failed: ${data?.error || res.statusText}`
                    alert(msg)
                  } catch (e) {
                    alert('Network error while featuring merchant')
                  }
                }}
              >
                Get featured
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-5">
                <div className="font-semibold text-black">Ranking signals</div>
                <ul className="mt-2 text-sm text-gray-900 space-y-1">
                  <li>• Relevance to query</li>
                  <li>• Price & optimization score</li>
                  <li>• Reliability & delivery speed</li>
                  <li>• Trust signals (ratings, audits)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardContent className="p-5">
                <div className="font-semibold text-black">Boost placement with x402</div>
                <p className="mt-2 text-sm text-gray-900">
                  Allocate sponsorship budgets (per search, per click, per checkout) using x402. Fully transparent,
                  pay-per-use, and auditable.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardContent className="p-5">
                <div className="font-semibold text-black">Merchant advantage</div>
                <ul className="mt-2 text-sm text-gray-900 space-y-1">
                  <li>• Be first choice in agent results</li>
                  <li>• Real-time GEO analytics & ROAS</li>
                  <li>• One feed: catalog → search → checkout</li>
                  <li>• Instant reimbursements on Base</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
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

function FeatureTile({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)] transition-shadow tilt">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="font-semibold text-black leading-tight">{title}</div>
          <div className="text-sm text-gray-800 leading-snug">{desc}</div>
        </div>
      </div>
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

function MiniCard({
  icon,
  title,
  desc,
  className = '',
}: {
  icon: React.ReactNode
  title: string
  desc: string
  className?: string
}) {
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
