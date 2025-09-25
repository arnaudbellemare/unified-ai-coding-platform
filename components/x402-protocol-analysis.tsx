'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Zap,
  Clock,
  DollarSign,
  Network,
  Bot,
  CreditCard,
  Coins,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
  ArrowRight,
  Users,
} from 'lucide-react'

interface ProtocolOverhead {
  scenario: string
  traditionalFees: number
  x402Fees: number
  dataTransfers: number
  settlementTime: string
  description: string
}

interface UseCaseAnalysis {
  useCase: string
  traditionalApproach: string
  x402Approach: string
  benefits: string[]
  drawbacks: string[]
  realWorldExample: string
  viability: 'high' | 'medium' | 'low'
}

export function X402ProtocolAnalysis() {
  const [selectedScenario, setSelectedScenario] = useState<string>('api_call')

  const overheadScenarios: ProtocolOverhead[] = [
    {
      scenario: 'Single API Call',
      traditionalFees: 0.3,
      x402Fees: 0.01,
      dataTransfers: 2,
      settlementTime: '5 minutes',
      description: 'One-time API request with x402 payment',
    },
    {
      scenario: 'Batched API Calls',
      traditionalFees: 3.0,
      x402Fees: 0.1,
      dataTransfers: 3,
      settlementTime: '5 minutes',
      description: '10 API calls batched with single x402 payment',
    },
    {
      scenario: 'Cached Payment',
      traditionalFees: 0.0,
      x402Fees: 0.0,
      dataTransfers: 1,
      settlementTime: 'Instant',
      description: 'Subsequent calls with cached payment authorization',
    },
    {
      scenario: 'Credit Prepayment',
      traditionalFees: 0.87,
      x402Fees: 0.0,
      dataTransfers: 1,
      settlementTime: 'Instant',
      description: 'Pre-pay $30, then unlimited calls with zero fees',
    },
  ]

  const useCaseAnalyses: UseCaseAnalysis[] = [
    {
      useCase: 'AI Agents Paying for APIs',
      traditionalApproach: 'Pre-integrate with each vendor, maintain accounts, handle billing',
      x402Approach: 'Dynamic API selection with on-demand payment',
      benefits: [
        'Dynamic vendor selection based on price/performance',
        'No pre-integration required',
        'Autonomous agent decision making',
        'Real-time market pricing',
      ],
      drawbacks: [
        'Additional network overhead per request',
        'Crypto wallet management complexity',
        'Price volatility exposure',
      ],
      realWorldExample: 'Agent researches cheapest image generation API, pays $0.05 for image, gets result instantly',
      viability: 'high',
    },
    {
      useCase: 'Paywalls for Digital Content',
      traditionalApproach: 'Stripe integration, user accounts, subscription management',
      x402Approach: 'One-time micropayments for content access',
      benefits: [
        'No user accounts required',
        'True micropayments ($0.01)',
        'No subscription management',
        'Global accessibility',
      ],
      drawbacks: ['Crypto adoption barrier', 'Content creators need crypto infrastructure', 'User education required'],
      realWorldExample: 'Pay $0.02 to read premium article, no signup required',
      viability: 'medium',
    },
    {
      useCase: 'Proxy Services & API Aggregation',
      traditionalApproach: 'Complex billing systems, user credit management',
      x402Approach: 'Pass-through payments with automatic routing',
      benefits: [
        'Simplified billing for aggregators',
        'Dynamic provider selection',
        'Reduced payment friction',
        'Transparent pricing',
      ],
      drawbacks: ['Technical complexity', 'Provider integration requirements', 'Fee structure complexity'],
      realWorldExample: 'Proxy service charges $0.01 + routes to cheapest provider automatically',
      viability: 'high',
    },
    {
      useCase: 'Microservices Monetization',
      traditionalApproach: 'SaaS pricing, usage tracking, billing systems',
      x402Approach: 'Per-function-call micropayments',
      benefits: [
        'True pay-per-use pricing',
        'No minimum commitments',
        'Automatic scaling costs',
        'Developer-friendly pricing',
      ],
      drawbacks: ['Payment overhead per call', 'Complex cost prediction', 'Developer wallet management'],
      realWorldExample: 'Call image resizing function, pay $0.001 per resize operation',
      viability: 'medium',
    },
  ]

  const selectedScenarioData = overheadScenarios.find((s) => s.scenario === selectedScenario)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Network className="h-6 w-6 text-purple-600" />
            x402 Protocol Analysis
          </CardTitle>
          <CardDescription>
            Addressing HN concerns about payment overhead, use cases, and real-world viability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Key Insight:</strong> x402 isn't just "HTTP middleware that throws 402 and returns crypto
              address." It's a protocol for autonomous, dynamic, pay-per-use services that traditional payment systems
              can't handle efficiently.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Overhead Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Overhead Analysis</CardTitle>
            <CardDescription>Addressing "extra data transfers" concern</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {overheadScenarios.map((scenario) => (
                <div
                  key={scenario.scenario}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedScenario === scenario.scenario ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScenario(scenario.scenario)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{scenario.scenario}</h4>
                    <Badge variant={scenario.x402Fees < scenario.traditionalFees ? 'default' : 'secondary'}>
                      {scenario.x402Fees < scenario.traditionalFees ? 'Better' : 'Similar'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Traditional:</span>
                      <div className="font-medium">${scenario.traditionalFees.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">x402:</span>
                      <div className="font-medium">${scenario.x402Fees.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {scenario.dataTransfers} data transfers • {scenario.settlementTime}
                  </div>
                </div>
              ))}
            </div>

            {selectedScenarioData && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedScenarioData.scenario}:</strong> {selectedScenarioData.description}
                  <br />
                  <strong>Savings:</strong> $
                  {(selectedScenarioData.traditionalFees - selectedScenarioData.x402Fees).toFixed(2)} per transaction
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Use Case Viability */}
        <Card>
          <CardHeader>
            <CardTitle>Use Case Viability Analysis</CardTitle>
            <CardDescription>Real-world applications and limitations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ai-agents" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-agents">AI Agents</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-agents" className="space-y-4">
                <div className="space-y-4">
                  {useCaseAnalyses.slice(0, 2).map((useCase, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">{useCase.useCase}</h4>
                        <Badge
                          variant={
                            useCase.viability === 'high'
                              ? 'default'
                              : useCase.viability === 'medium'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {useCase.viability} viability
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Traditional:</span>
                          <div className="text-xs">{useCase.traditionalApproach}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">x402:</span>
                          <div className="text-xs">{useCase.x402Approach}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Example:</span>
                          <div className="text-xs text-green-600">{useCase.realWorldExample}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-4">
                  {useCaseAnalyses.slice(2).map((useCase, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">{useCase.useCase}</h4>
                        <Badge
                          variant={
                            useCase.viability === 'high'
                              ? 'default'
                              : useCase.viability === 'medium'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {useCase.viability} viability
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Traditional:</span>
                          <div className="text-xs">{useCase.traditionalApproach}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">x402:</span>
                          <div className="text-xs">{useCase.x402Approach}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Example:</span>
                          <div className="text-xs text-green-600">{useCase.realWorldExample}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* HN Discussion Points */}
      <Card>
        <CardHeader>
          <CardTitle>Addressing HN Discussion Points</CardTitle>
          <CardDescription>Direct responses to community concerns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium mb-2">"Each API request involves extra data transfers"</h4>
              <p className="text-sm text-muted-foreground">
                <strong>True for first request, but:</strong> Subsequent requests can use cached payment authorization.
                For high-frequency usage, credit prepayment eliminates this entirely. The overhead is minimal compared
                to traditional payment processing complexity.
              </p>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-medium mb-2">"Why not prepay credits instead?"</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Both approaches are valid:</strong> Prepayment works for predictable usage patterns. x402 excels
                for dynamic, autonomous scenarios where agents need to choose from multiple providers in real-time based
                on price, performance, or availability.
              </p>
            </div>

            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h4 className="font-medium mb-2">"Crypto overlap with digital content is small"</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Agreed:</strong> Fiat bridges are essential for mainstream adoption. The value isn't in forcing
                crypto on users, but in enabling new payment models (micropayments, autonomous payments) that
                traditional systems can't handle efficiently.
              </p>
            </div>

            <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
              <h4 className="font-medium mb-2">"It's just HTTP middleware with crypto address"</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Oversimplification:</strong> While technically true at the protocol level, the real value is in
                the ecosystem of autonomous services, dynamic pricing, and pay-per-use models it enables. Similar to how
                HTTP is "just" a protocol, but enables the entire web.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-World Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Real-World Implementation Strategy</CardTitle>
          <CardDescription>How to actually make x402 work in practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Fiat Bridge</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Seamless credit card → crypto conversion for mainstream users
              </p>
              <Badge variant="outline">Essential for adoption</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Autonomous Agents</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                AI agents with their own wallets making dynamic decisions
              </p>
              <Badge variant="outline">High value use case</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Micropayments</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                True micropayments ($0.01) impossible with traditional systems
              </p>
              <Badge variant="outline">Unique advantage</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
