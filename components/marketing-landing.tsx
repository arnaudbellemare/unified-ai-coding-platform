'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { LogoVerclibase } from '@/components/logo-verclibase'
import { OnchainStoreTemplate } from '@/components/onchain-store-template'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, CreditCard, Brain, Sliders, Database, BarChart, TrendingUp } from 'lucide-react'

type LandingTheme = 'home' | 'finance' | 'travel' | 'academic' | 'sports' | 'library'

// Cycling Text Component
function CyclingText() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const textVariations = [
    'You Sell More',
    'You Win More Customers',
    'You Grow Faster',
    'You Dominate Search',
    'You Outperform Competitors',
    'You Scale Effortlessly',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % textVariations.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const currentText = textVariations[currentIndex]
  const isLongText = currentText === 'You Outperform Competitors'

  return (
    <span className="relative inline-block">
      <span
        key={currentIndex}
        className={`inline-block transition-all duration-500 ease-in-out ${isLongText ? 'text-4xl md:text-5xl' : ''}`}
        style={{
          animation: 'fadeInUp 0.5s ease-out',
        }}
      >
        {currentText}
      </span>
      <div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
        style={{
          backgroundSize: '200% 100%',
          animation: 'fadeInFromLeft 4s ease-in-out infinite',
        }}
      ></div>
    </span>
  )
}

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
      {/* Demo Link Banner */}
      <div className="bg-black text-white py-4 relative z-30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xl font-bold mb-2 font-mono">Experience the Future of AI Commerce</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/complete-demo"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Complete Demo →
            </a>
            <a
              href="/ap2-demo"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              AP2 Demo →
            </a>
          </div>
        </div>
      </div>
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
                      icon={<Brain className="h-5 w-5 text-purple-600" />}
                      title="Trust Signals"
                      desc="Ratings & reliability"
                    />
                    <FeatureTile
                      icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                      title="Smart AI Advertising"
                      desc="Pay per result only"
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
                <h3 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
                  When AI Shops for Your Customers,
                  <br />
                  <CyclingText />
                </h3>
                <div className="mb-8">
                  <p className="text-xl text-gray-600 leading-relaxed mb-4">
                    When customers ask AI assistants{' '}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                      "Find me a blue shirt under $50"
                    </span>
                  </p>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900">Your products appear first</span> in the AI's
                    recommendations. More visibility = more sales. Simple as that.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Think of it like SEO, but for AI shopping:</strong> Just like Google ranks websites, AI
                      assistants rank products when helping customers shop.
                    </p>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    window.location.href = '/complete-demo'
                  }}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Get Featured Now
                </Button>
              </div>
            </div>

            {/* Top row of cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
                    <div className="font-bold text-lg text-black">Pay Only When AI Finds You</div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    When customers ask AI "Find me a blue shirt under $50" and AI finds your product, you pay a small
                    fee to appear higher in future searches.
                  </p>
                  <p className="text-gray-700 leading-relaxed font-semibold text-black">
                    No upfront costs - only pay when AI actually finds your products relevant.
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
            <h2 className="text-2xl font-bold text-black mb-2">How It Helps You Sell More</h2>
            <p className="text-gray-600">Simple steps to get more customers from AI searches</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <path d="m21 21-4.34-4.34" />
                      <circle cx="11" cy="11" r="8" />
                    </svg>
                  </div>
                  <div className="font-semibold text-black">Your Products Show Up First</div>
                </div>
                <p className="text-sm text-gray-900">
                  When customers ask AI to find products, yours appear at the top. No complex setup needed.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600"
                    >
                      <path d="M16 7h6v6" />
                      <path d="m22 7-8.5 8.5-5-5L2 17" />
                    </svg>
                  </div>
                  <div className="font-semibold text-black">More Sales = More Money</div>
                </div>
                <p className="text-sm text-gray-900">
                  Higher rankings mean more customers see your products first. More visibility = more sales.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-purple-600"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div className="font-semibold text-black">Pay Only When It Works</div>
                </div>
                <p className="text-sm text-gray-900">
                  Only pay when customers actually click or buy. No upfront costs, no wasted money.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI Commerce SEO - How We Help You Rank First */}
        <section className="max-w-6xl mx-auto px-6 py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-4">SEO for AI Commerce</h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              As AI shopping grows,{' '}
              <span className="font-semibold text-black">position your products to be discovered first</span> by AI
              agents. We optimize your listings with structured data, cost-efficient processing, and x402 payments for
              the future of commerce.
            </p>
          </div>

          {/* How AI Commerce Ranking Works */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-12">
            <h3 className="text-2xl font-bold text-black mb-6 text-center">
              How We Get Your Products Found by AI Shoppers
            </h3>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-base text-gray-700 mb-3">
                  <strong>What is AI Shopping?</strong> When customers ask AI assistants like ChatGPT or Claude
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 mx-1">
                    "Find me a blue shirt under $50"
                  </span>
                  AI searches the internet for products and recommends the best matches.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Our system makes sure your products get found and recommended by AI shoppers.</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl font-bold">1</span>
                </div>
                <h4 className="font-bold text-lg text-black mb-3">Make Products AI-Friendly</h4>
                <p className="text-gray-600 text-sm">
                  Structure your products so AI shoppers can easily find and understand them. Clear descriptions,
                  pricing, and availability help AI recommend your products to customers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl font-bold">2</span>
                </div>
                <h4 className="font-bold text-lg text-black mb-3">Pay Only When AI Finds You</h4>
                <p className="text-gray-600 text-sm">
                  When AI finds your product relevant to a customer's search, you pay a small fee to boost your ranking
                  in future searches. No upfront costs - only pay when AI actually finds you.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl font-bold">3</span>
                </div>
                <h4 className="font-bold text-lg text-black mb-3">Track Performance & ROI</h4>
                <p className="text-gray-600 text-sm">
                  Monitor how often AI shoppers find your products, which searches drive sales, and ROI on your
                  advertising spend. See exactly why your products rank where they do.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Implementation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"></div>

          {/* Base Store Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <OnchainStoreTemplate />
          </div>

          {/* Protocol Demos Section */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-4">Complete Agentic Commerce Protocol Stack</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                The only platform implementing both OpenAI's ACP and Google's AP2 protocols, plus Base blockchain
                payments for complete agentic commerce coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ACP Demo */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">ACP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">OpenAI ACP</h4>
                    <p className="text-sm text-gray-600">Human-to-Business Payments</p>
                  </div>
                </div>
                <p className="text-gray-700 text-base mb-6 leading-relaxed">
                  When customers ask AI "Find me a blue shirt under $50" and AI finds your product, you pay a small fee
                  to appear higher in future searches.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      // Detect mobile devices
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                        navigator.userAgent,
                      )

                      if (isMobile) {
                        // On mobile, directly navigate to store page instead of trying to open popup
                        window.location.href = '/store'
                        return
                      }

                      // Try to open store page with popup blocking protection (desktop)
                      const popup = window.open(
                        '/store',
                        '_blank',
                        'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes',
                      )

                      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                        // Popup was blocked, show fallback message
                        alert(
                          'Popup blocked! Please allow popups for this site and try again, or manually navigate to the store page.',
                        )

                        // Alternative: redirect in same window
                        const userConfirm = confirm(
                          'Would you like to navigate to the store page in this window instead?',
                        )
                        if (userConfirm) {
                          window.location.href = '/store'
                        }
                      }
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 font-medium"
                  >
                    Try ACP Demo →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://www.agenticcommerce.dev/', '_blank')}
                    className="px-6 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* AP2 Demo */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">AP2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">Google AP2</h4>
                    <p className="text-sm text-gray-600">Agent-to-Agent Payments</p>
                  </div>
                </div>
                <p className="text-gray-700 text-base mb-6 leading-relaxed">
                  AI agents can pay each other directly using Google's Agent Payments Protocol. Enable autonomous agent
                  commerce with secure, instant payments.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      // Detect mobile devices
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                        navigator.userAgent,
                      )

                      if (isMobile) {
                        // On mobile, directly navigate to AP2 demo page instead of trying to open popup
                        window.location.href = '/ap2-demo'
                        return
                      }

                      // Try to open AP2 demo page with popup blocking protection (desktop)
                      const popup = window.open(
                        '/ap2-demo',
                        '_blank',
                        'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes',
                      )

                      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                        // Popup was blocked, show fallback message
                        alert(
                          'Popup blocked! Please allow popups for this site and try again, or manually navigate to the AP2 demo page.',
                        )

                        // Alternative: redirect in same window
                        const userConfirm = confirm(
                          'Would you like to navigate to the AP2 demo page in this window instead?',
                        )
                        if (userConfirm) {
                          window.location.href = '/ap2-demo'
                        }
                      }
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 font-medium"
                  >
                    Try AP2 Demo →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://github.com/google-agentic-commerce/AP2', '_blank')}
                    className="px-6 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Protocol Comparison */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-lg text-black mb-4 text-center">Protocol Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">ACP</span>
                  </div>
                  <h5 className="font-semibold text-black mb-2">OpenAI ACP</h5>
                  <p className="text-sm text-gray-600">Human customers buying from businesses via AI assistants</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">AP2</span>
                  </div>
                  <h5 className="font-semibold text-black mb-2">Google AP2</h5>
                  <p className="text-sm text-gray-600">AI agents paying each other for services and recommendations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">x402</span>
                  </div>
                  <h5 className="font-semibold text-black mb-2">Base x402</h5>
                  <p className="text-sm text-gray-600">
                    Blockchain payments on Base network for transparent transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function FeatureTile({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  // Check if this is the Smart AI Advertising card
  const isSmartAI = title === 'Smart AI Advertising'

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)] transition-shadow tilt ${isSmartAI ? 'animate-subtle-glow' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${isSmartAI ? 'relative' : ''}`}>
          {isSmartAI && <div className="absolute -inset-2 rounded-lg bg-emerald-600/18 animate-pulse"></div>}
          {icon}
        </div>
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
