'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Step = 'model' | 'optimize' | 'generate' | 'checkout' | 'deploy'

export function AgenticWorkflowDemo() {
  const [step, setStep] = useState<Step>('model')
  const [prompt, setPrompt] = useState('Write a simple hello world function in JavaScript')
  const [model, setModel] = useState('x-ai/grok-4-fast:free')
  const [optimized, setOptimized] = useState('')
  const [ai, setAi] = useState('')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])

  function add(msg: string) {
    setLog((l) => [...l, msg])
  }

  async function doOptimize() {
    setLoading(true)
    add('Optimizing prompt...')
    try {
      const res = await fetch('/api/process-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      })
      const text = await res.text()
      const json = text ? JSON.parse(text) : {}
      const best = json?.optimization?.optimizedPrompt || json?.summary?.optimizedPrompt || prompt
      setOptimized(best)
      add('Optimization complete.')
      setStep('generate')
    } catch (e: any) {
      add('Optimization failed, using original prompt.')
      setOptimized(prompt)
      setStep('generate')
    } finally {
      setLoading(false)
    }
  }

  async function doGenerate() {
    setLoading(true)
    add('Generating with OpenRouter...')
    try {
      const res = await fetch('/api/openrouter/real-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: optimized || prompt, model }),
      })
      const text = await res.text()
      const json = text ? JSON.parse(text) : {}
      const content = json?.choices?.[0]?.message?.content || json?.aiResponse?.content || 'No content.'
      setAi(content)
      add('AI response received.')
      setStep('checkout')
    } catch (e: any) {
      add('Generation failed. Check API key.')
    } finally {
      setLoading(false)
    }
  }

  async function doCheckout() {
    setLoading(true)
    add('Processing x402 checkout...')
    try {
      const res = await fetch('/api/acp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: 'demo', qty: 1, price: 0.01 }] }),
      })
      const text = await res.text()
      const json = text ? JSON.parse(text) : {}
      if (res.ok && json?.success) {
        add('Checkout success (simulated if keys missing).')
        setStep('deploy')
      } else {
        add('Checkout failed; continuing demo path.')
        setStep('deploy')
      }
    } catch (e: any) {
      add('Checkout error; continuing demo path.')
      setStep('deploy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="workflow" className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-4">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-black">Agentic workflow demo</h3>
        <p className="text-gray-900">Model → Optimize → Generate → Checkout → Deploy</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="font-semibold text-black">1. Choose model</div>
            <input
              className="w-full border rounded px-3 py-2 text-black"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <div className="font-semibold text-black">Prompt</div>
            <textarea
              className="w-full border rounded px-3 py-2 h-24 text-black"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button className="bg-black text-white" disabled={loading} onClick={doOptimize}>
              Optimize
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="font-semibold text-black">2. Optimize & generate</div>
            <div className="text-sm text-gray-900">Optimized:</div>
            <pre className="text-xs bg-gray-50 rounded p-2 text-gray-900 whitespace-pre-wrap min-h-[56px]">
              {optimized}
            </pre>
            <div className="flex gap-2">
              <Button variant="outline" className="text-black" disabled={loading || !optimized} onClick={doGenerate}>
                Generate
              </Button>
              <Button variant="outline" className="text-black" disabled={loading || !ai} onClick={doCheckout}>
                Checkout
              </Button>
            </div>
            <div className="text-sm text-gray-900">AI response:</div>
            <pre className="text-xs bg-gray-50 rounded p-2 text-gray-900 whitespace-pre-wrap min-h-[80px]">{ai}</pre>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="font-semibold text-black">3. Activity</div>
            <div className="text-sm text-gray-900">Step: {step}</div>
            <pre className="text-xs bg-gray-50 rounded p-2 text-gray-900 whitespace-pre-wrap min-h-[120px]">
              {log.join('\n')}
            </pre>
            {step === 'deploy' && (
              <div className="text-sm text-gray-900">Ready to deploy to Vercel Sandbox or push to GitHub.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
