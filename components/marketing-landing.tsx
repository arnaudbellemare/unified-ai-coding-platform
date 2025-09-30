'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { LogoVerclibase } from '@/components/logo-verclibase'
import { AcpDemo } from '@/components/acp-demo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, CreditCard, Brain, Sliders, Database, BarChart, TrendingUp } from 'lucide-react'

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
  const [styleVariant, setStyleVariant] = useState<'classic' | 'ayocin' | 'mcpay'>('classic')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isInBlackSection, setIsInBlackSection] = useState(false)

  useEffect(() => {
    try {
      const v = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('style') : null
      if (v === 'ayocin') setStyleVariant('ayocin')
      if (v === 'mcpay') setStyleVariant('mcpay')
    } catch (_) {}

    // Global mouse tracking for animated background
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    // Scroll detection for black section
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      // Detect if we're in the UnifiedAllInOne section (roughly after hero section)
      setIsInBlackSection(scrollY > windowHeight * 0.5)
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
      window.addEventListener('scroll', handleScroll)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])
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
    <div className={styleVariant === 'mcpay' ? 'bg-[#0b0e14]' : 'bg-gray-50'}>
      {/* Fixed Animated Background that follows scroll */}
      {!disableAnimatedBg && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Completely Static Background - No Movement */}
          <div className="absolute inset-0 bg-gray-50" />

          {/* Halftone Pattern with Mouse-Responsive Movement */}
          <div
            className="absolute inset-0 opacity-40 transition-all duration-300 ease-out"
            style={{
              backgroundImage: isInBlackSection
                ? `
                radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 1.2px, transparent 1.2px),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.6) 0.9px, transparent 0.9px),
                radial-gradient(circle at 60% 70%, rgba(255, 255, 255, 0.9) 1.5px, transparent 1.5px),
                radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.7) 1.1px, transparent 1.1px),
                radial-gradient(circle at 70% 50%, rgba(255, 255, 255, 0.8) 1.3px, transparent 1.3px)
              `
                : `
                radial-gradient(circle at 20% 30%, rgba(120, 120, 120, 0.6) 1.2px, transparent 1.2px),
                radial-gradient(circle at 80% 20%, rgba(100, 100, 100, 0.5) 0.9px, transparent 0.9px),
                radial-gradient(circle at 60% 70%, rgba(140, 140, 140, 0.7) 1.5px, transparent 1.5px),
                radial-gradient(circle at 30% 80%, rgba(110, 110, 110, 0.55) 1.1px, transparent 1.1px),
                radial-gradient(circle at 70% 50%, rgba(130, 130, 130, 0.65) 1.3px, transparent 1.3px)
              `,
              backgroundSize: '40px 40px, 35px 35px, 45px 45px, 38px 38px, 42px 42px',
              animation: 'halftoneMove 40s linear infinite, slowRotate 120s linear infinite',
              transform:
                mousePosition.x && mousePosition.y
                  ? `translateX(${Math.max(-15, Math.min(15, (mousePosition.x - window.innerWidth * 0.5) * 0.05))}px) translateY(${Math.max(-15, Math.min(15, (mousePosition.y - window.innerHeight * 0.5) * 0.05))}px) rotate(${Math.max(-3, Math.min(3, (mousePosition.x - window.innerWidth * 0.5) * 0.01))}deg)`
                  : 'none',
            }}
          />
        </div>
      )}

      {/* Page Content with proper z-index */}
      <div className="relative z-10">
        {styleVariant === 'mcpay' && (
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0e14]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0e14]/60">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
              <LogoVerclibase />
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <a className="text-white/80 hover:text-white" href="#build">
                  Build
                </a>
                <a className="text-white/80 hover:text-white" href="#browse">
                  Browse
                </a>
                <a className="text-white/80 hover:text-white" href="#monetize">
                  Monetize
                </a>
                <Button className="bg-white text-black hover:bg-white/90">Connect</Button>
              </nav>
            </div>
          </header>
        )}
        {/* Hero with interactive monochromatic background */}
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Left: Animated headline + CTAs */}
              <div>
                {styleVariant !== 'mcpay' && (
                  <div aria-label="Verclibase" className="inline-flex items-center animate-fade-in">
                    <LogoVerclibase />
                  </div>
                )}
                <div
                  className={`${styleVariant === 'ayocin' ? 'gradient-ring rounded-[22px] p-[1px] mt-3 inline-block' : ''}`}
                >
                  <div
                    className={`${
                      styleVariant === 'ayocin'
                        ? 'rounded-[20px] glass-card shadow-[0_8px_28px_rgba(0,0,0,0.08)] px-5 py-4 md:px-6 md:py-6'
                        : 'mt-3 inline-block rounded-2xl ' +
                          (styleVariant === 'mcpay' ? 'bg-black/50' : 'bg-white/85') +
                          ' backdrop-blur-md shadow-[0_6px_30px_rgba(0,0,0,0.06)] px-5 py-4 md:px-6 md:py-5'
                    } animate-fade-in hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-500 cursor-pointer`}
                  >
                    <h1
                      className={`text-5xl md:text-7xl font-black tracking-tight leading-[0.95] animate-slide-up-1 ${styleVariant === 'mcpay' ? 'text-white' : 'text-black drop-shadow-lg'}`}
                    >
                      Rank higher in
                      <span
                        className="mx-2 inline-block bg-gradient-to-r from-indigo-900 via-blue-600 via-blue-300 to-gray-400 bg-clip-text text-transparent font-bold"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          backgroundSize: '300% 300%',
                          animation: 'gradientShift 8s ease-in-out infinite',
                        }}
                      >
                        AI search results
                      </span>
                    </h1>
                    <p
                      className={`mt-4 max-w-xl animate-slide-up-2 ${styleVariant === 'mcpay' ? 'text-gray-200' : 'text-gray-800 drop-shadow-sm'}`}
                    >
                      Optimize your product listings to rank higher when AI agents search. Structured feeds, trust
                      signals, and x402 sponsorship for maximum visibility.
                    </p>
                    <div className="mt-6 flex gap-3 animate-slide-up-3">
                      <Button
                        size="lg"
                        onClick={onPrimary}
                        className={
                          styleVariant === 'mcpay'
                            ? 'bg-[#1134ff] text-white hover:bg-[#1134ff]/90 hover:scale-105 hover:shadow-[0_8px_25px_rgba(17,52,255,0.4)] transition-all duration-300'
                            : 'bg-black text-white hover:bg-black/90 hover:scale-105 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all duration-300'
                        }
                      >
                        Start free
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className={
                          styleVariant === 'mcpay'
                            ? 'bg-white text-black hover:bg-gray-100 hover:text-gray-700 hover:scale-105 hover:shadow-[0_8px_25px_rgba(255,255,255,0.4)] transition-all duration-300'
                            : 'bg-white border-gray-300 text-black hover:bg-gray-200 hover:text-gray-700 hover:scale-105 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all duration-300'
                        }
                        onClick={() => {
                          // Scroll to the AI Search section
                          const aiSearchSection = document.querySelector('[data-geo-section]')
                          if (aiSearchSection) {
                            aiSearchSection.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      >
                        See AI search optimization
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Feature tiles (clean grid, no circles) */}
              <div className="hidden md:block">
                <div className="relative h-[420px]">
                  <div className="absolute inset-0 bg-beams opacity-30" />
                  <div
                    className={`grid grid-cols-2 gap-4 absolute inset-0 place-content-center ${styleVariant === 'ayocin' ? 'p-2' : ''}`}
                  >
                    <FeatureTile
                      icon={<Search className="h-5 w-5 text-blue-600" />}
                      title="AI Search Optimization"
                      desc="Rank higher in AI results"
                    />
                    <FeatureTile
                      icon={<Sliders className="h-5 w-5 text-indigo-600" />}
                      title="Structured Feeds"
                      desc="AI-friendly product data"
                    />
                    <FeatureTile
                      icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
                      title="x402 Sponsorship"
                      desc="Boost visibility"
                    />
                    <FeatureTile
                      icon={<Brain className="h-5 w-5 text-purple-600" />}
                      title="Trust Signals"
                      desc="Ratings & reliability"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            .gradient-ring {
              background: linear-gradient(90deg, var(--c1), var(--c2));
            }
            .glass-card {
              background: rgba(255, 255, 255, 0.88);
              backdrop-filter: saturate(120%) blur(8px);
            }
            .bg-flow {
              background: linear-gradient(
                120deg,
                color-mix(in srgb, var(--c1) 35%, transparent) 0%,
                color-mix(in srgb, var(--c2) 35%, transparent) 50%,
                color-mix(in srgb, var(--c3) 30%, transparent) 100%
              );
              background-size: 200% 200%;
              animation: flowShift 18s ease-in-out infinite alternate;
              transform: translate3d(calc(var(--mx, 0) * 4px), calc(var(--my, 0) * 4px), 0);
              transition: transform 120ms ease-out;
            }
            .bg-mesh-blobs {
              background:
                radial-gradient(28% 22% at 15% 20%, color-mix(in srgb, var(--c1) 22%, transparent), transparent 70%),
                radial-gradient(26% 20% at 85% 30%, color-mix(in srgb, var(--c2) 20%, transparent), transparent 70%),
                radial-gradient(30% 24% at 35% 80%, color-mix(in srgb, var(--c3) 18%, transparent), transparent 70%);
              animation: blobDrift 22s ease-in-out infinite;
              filter: blur(10px) saturate(115%);
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
            @keyframes flowShift {
              0% {
                background-position: 0% 50%;
              }
              100% {
                background-position: 100% 50%;
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
            @keyframes blobDrift {
              0% {
                transform: translate3d(0, 0, 0);
              }
              50% {
                transform: translate3d(-10px, 6px, 0);
              }
              100% {
                transform: translate3d(6px, -4px, 0);
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

        {/* GEO Playbook section removed per request */}

        {/* Agentic e‑Commerce Advantage (GEO) */}
        <section className="max-w-6xl mx-auto px-6 py-12 bg-gradient-to-b from-gray-50 to-gray-50" data-geo-section>
          <div className="rounded-3xl bg-gray-50 p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-3xl md:text-4xl font-black tracking-tight text-black">
                  AI Search Advantage
                  <span className="ml-3 align-middle inline-block text-sm font-bold px-3 py-1 rounded-full bg-black text-white">
                    SEO for AI
                  </span>
                </h3>
                <p className="mt-4 text-lg text-gray-700 max-w-4xl leading-relaxed">
                  Get chosen first by AI agents. We expose catalog/search endpoints and rank offers using relevance,
                  trust, price efficiency, fulfillment reliability, and x402 sponsorship budgets —
                  <span className="font-semibold text-black">Generative Engine Optimization (GEO)</span> for agentic
                  commerce.
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 shadow-lg px-8 py-3 text-lg font-semibold"
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

            {/* Top row of cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <Card className="bg-gray-50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Search className="h-5 w-5 text-black" />
                    </div>
                    <div className="font-bold text-lg text-black">Ranking Signals</div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Relevance to query
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Price & optimization score
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Reliability & delivery speed
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Trust signals (ratings, audits)
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-black" />
                    </div>
                    <div className="font-bold text-lg text-black">Boost Placement with x402</div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Allocate sponsorship budgets (per search, per click, per checkout) using x402.
                    <span className="font-semibold text-black">
                      FREE facilitator, FREE gas fees, fully transparent and auditable.
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-black" />
                    </div>
                    <div className="font-bold text-lg text-black">Merchant Advantage</div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Be first choice in agent results
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Real-time AI search analytics & ROAS
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      One feed: catalog → search → checkout
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      Instant reimbursements on Base
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="max-w-6xl mx-auto px-6 py-6 bg-gray-50">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">How AI Search Optimization Works</h2>
            <p className="text-gray-600">The complete system for ranking higher in AI results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="font-semibold text-black">AI-Optimized Product Feeds</div>
                <p className="text-sm text-gray-900 mt-1">
                  Structured data that all AI agents and LLMs understand. Clear pricing, availability, and trust
                  signals.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="font-semibold text-black">AI Ranking Signals</div>
                <p className="text-sm text-gray-900 mt-1">
                  Optimize for relevance, trust, pricing, delivery speed, and merchant reputation to rank higher.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="font-semibold text-black">x402 Sponsored Placement</div>
                <p className="text-sm text-gray-900 mt-1">
                  Boost visibility with transparent sponsorship budgets. Instant settlement on Base network.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Developer Tools - Hidden by default */}
        <details className="max-w-6xl mx-auto px-6 py-6">
          <summary className="cursor-pointer text-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            Developer Tools & Advanced Features
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-5">
                <div className="font-semibold text-gray-600">Sandbox Deployment</div>
                <p className="text-sm text-gray-500 mt-1">
                  Test your GEO optimization in isolated environments before going live.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-5">
                <div className="font-semibold text-gray-600">GitHub Integration</div>
                <p className="text-sm text-gray-500 mt-1">
                  Connect your repositories for automated deployment and version control.
                </p>
              </CardContent>
            </Card>
          </div>
        </details>
      </div>
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
