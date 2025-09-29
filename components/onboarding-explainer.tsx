'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Wallet, Zap, DollarSign, Code, ArrowRight, Star } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  benefits: string[]
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'wallet',
    title: 'Connect Wallet or Create One',
    description: 'Connect your existing wallet or create a new one with just your email',
    icon: <Wallet className="h-6 w-6 text-blue-600" />,
    benefits: [
      'Email-based wallet creation (no crypto knowledge needed)',
      'Connect MetaMask, WalletConnect, or other wallets',
      'Automatic Base network configuration',
      'Secure private key management',
    ],
  },
  {
    id: 'pay-per-use',
    title: 'Pay Per Use - Only What You Need',
    description: 'No subscriptions, no monthly fees. Pay only for the AI processing you actually use',
    icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
    benefits: [
      'Pay only when you run AI tasks',
      'Transparent pricing with real-time cost display',
      'Automatic cost optimization saves you money',
      'x402 payment protocol for instant settlements',
    ],
  },
  {
    id: 'optimization',
    title: 'Smart Cost Optimization',
    description: 'Our AI automatically optimizes your prompts to reduce costs while maintaining quality',
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    benefits: [
      'Up to 20% cost reduction through prompt optimization',
      'Multiple optimization engines (MIT, Google, Stanford research)',
      'Real-time cost comparison and recommendations',
      'Automatic model selection for best price/performance',
    ],
  },
  {
    id: 'sandbox',
    title: 'Deploy to Vercel Sandbox',
    description: 'Test your code in a real deployment environment with one click',
    icon: <Code className="h-6 w-6 text-purple-600" />,
    benefits: [
      'One-click deployment to Vercel sandbox',
      'Real GitHub integration for code management',
      'Live testing environment with custom domains',
      'Automatic CI/CD pipeline setup',
    ],
  },
]

export function OnboardingExplainer() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isCompleted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Ready to Start Building!</CardTitle>
          <CardDescription className="text-lg">
            You're all set to use VERCLIBASE. Here's what you can do now:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" /> Connect Your Wallet
              </h3>
              <p className="text-sm text-gray-600">Click "Connect Wallet" to get started with AI processing</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-600" /> Try AI Processing
              </h3>
              <p className="text-sm text-gray-600">Enter a prompt and see real-time cost optimization in action</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-600" /> Deploy to Sandbox
              </h3>
              <p className="text-sm text-gray-600">Test your code in a real Vercel deployment environment</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Pay Only What You Use
              </h3>
              <p className="text-sm text-gray-600">No subscriptions - pay per AI task with automatic optimization</p>
            </div>
          </div>
          <div className="text-center">
            <Button onClick={() => setIsCompleted(false)} variant="outline">
              Review Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">How VERCLIBASE Works</CardTitle>
            <CardDescription className="text-lg">
              The complete AI coding platform with pay-per-use pricing and automatic optimization
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            Step {currentStep + 1} of {onboardingSteps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Step */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-blue-100 rounded-full">{currentStepData.icon}</div>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
            <p className="text-gray-600 mt-2">{currentStepData.description}</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-3">
          {currentStepData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Real Example for Pay Per Use */}
        {currentStepData.id === 'pay-per-use' && (
          <div className="bg-gray-100 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 text-gray-900">Real Example:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Original prompt cost:</span>
                <span className="font-mono text-gray-900">$0.000012</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Optimized prompt cost:</span>
                <span className="font-mono text-green-700">$0.000010</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-300 pt-2 text-gray-900">
                <span>You save:</span>
                <span className="font-mono text-green-700">20% ($0.000002)</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span className="text-gray-900">Progress</span>
            <span className="text-gray-900">{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button onClick={prevStep} variant="outline" disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={nextStep} className="flex items-center gap-2">
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Value Proposition Component
export function ValueProposition() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Main Value Prop */}
      <div className="text-center space-y-4">
        <p className="text-xl text-white max-w-3xl mx-auto">
          The only AI coding platform that pays you back through intelligent cost optimization
        </p>
      </div>

      {/* Key Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center bg-black text-white border-white/20">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white">Pay Per Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-100 mb-3">
              No subscriptions or monthly fees. Only pay for AI processing you actually use.
            </p>
            <Badge variant="secondary" className="text-xs bg-white text-black">
              Save up to 20%
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center bg-black text-white border-white/20">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white">Auto Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-100 mb-3">
              Our AI automatically optimizes your prompts using research from MIT, Stanford, and Google.
            </p>
            <Badge variant="secondary" className="text-xs bg-white text-black">
              Real-time savings
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center bg-black text-white border-white/20">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Code className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white">Deploy & Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-100 mb-3">
              One-click deployment to Vercel sandbox with GitHub integration for real testing.
            </p>
            <Badge variant="secondary" className="text-xs bg-white text-black">
              Production ready
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold">Connect Wallet</h3>
              <p className="text-xs text-gray-700">Email or existing wallet</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold">Enter Prompt</h3>
              <p className="text-xs text-gray-700">Describe what you want</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold">Auto Optimize</h3>
              <p className="text-xs text-gray-700">AI reduces costs</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold">Pay & Deploy</h3>
              <p className="text-xs text-gray-700">Only for what you use</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
