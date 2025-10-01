'use client'

import React from 'react'
import { MarketingLanding } from './marketing-landing'

export function SimplifiedHome() {
  return (
    <div className="min-h-screen">
      <MarketingLanding onPrimary={() => window.scrollTo({ top: 600, behavior: 'smooth' })} />
      {/* Black overlay section - covers content to end */}
      <div className="bg-black relative z-20">
        {/* Why AI Commerce SEO Matters Section */}
        <div className="max-w-6xl mx-auto p-6 mb-8">
          <style jsx>{`
            @keyframes subtle-bounce {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-2px);
              }
            }
            .animate-subtle-bounce {
              animation: subtle-bounce 3s ease-in-out infinite;
            }
          `}</style>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-10 border border-blue-800/20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                  radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
                `,
                  backgroundSize: '60px 60px',
                }}
              ></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="mb-6">
                  <h3 className="text-3xl font-black text-white mb-2">
                    <span className="relative">
                      Why
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                    </span>
                    <span className="ml-2">AI Commerce SEO Matters</span>
                  </h3>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight tracking-tight">
                        AI Commerce SEO optimizes for AI agent shopping.
                      </p>
                      <p className="text-lg text-blue-200 mb-2 font-medium">
                        Traditional SEO optimizes for human search.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg text-blue-100 leading-relaxed font-normal">
                        The future of commerce is AI-powered. <span className="font-bold text-white">Position your business at the forefront.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="group text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center group-hover:bg-blue-500/30 transition-all duration-300 animate-subtle-bounce hover:shadow-lg">
                    <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3">AI Agents Shop Differently</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    They understand structured data, pricing, availability, and can execute payments automatically
                  </p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/20 backdrop-blur-sm border border-green-400/30 flex items-center justify-center group-hover:bg-green-500/30 transition-all duration-300 animate-pulse-glow">
                    <svg className="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3">Pay-Per-Result Model</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Only pay when AI agents actually find and engage with your products
                  </p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-300 animate-pulse-glow">
                    <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3">Early Adopter Advantage</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Get ahead of competitors who are still optimizing for traditional search
                  </p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 flex items-center justify-center group-hover:bg-orange-500/30 transition-all duration-300 animate-pulse-glow">
                    <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3">Transparent Blockchain Records</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Every x402 payment and ranking boost is recorded on Base blockchain
                  </p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 flex items-center justify-center group-hover:bg-teal-500/30 transition-all duration-300 animate-pulse-glow">
                    <svg className="w-6 h-6 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3">Real-Time Optimization</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Adjust your AI commerce strategy based on live performance data
                  </p>
                </div>

                <div className="group text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 flex items-center justify-center group-hover:bg-pink-500/30 transition-all duration-300 animate-pulse-glow">
                    <svg className="w-6 h-6 text-pink-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3">Future-Proof Investment</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    As AI shopping grows, your optimized listings will capture more market share
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
