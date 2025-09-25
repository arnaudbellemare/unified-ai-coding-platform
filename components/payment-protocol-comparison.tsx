'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Zap, 
  DollarSign, 
  Clock, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  TrendingUp,
  Building,
  Coins,
  CreditCard
} from 'lucide-react'

interface ProtocolComparisonProps {
  onProtocolSelect?: (protocol: string) => void
}

export function PaymentProtocolComparison({ onProtocolSelect }: ProtocolComparisonProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('x402')
  const [comparison, setComparison] = useState<any[]>([])

  useEffect(() => {
    // Simulate fetching protocol comparison data
    const mockComparison = [
      {
        protocol: 'x402',
        name: 'x402 Foundation',
        decentralization: 'Semi-Decentralized',
        automation: 'Excellent',
        cost: 'Low',
        speed: 'Instant',
        reversibility: 'No',
        micropayments: 'Excellent',
        advantages: [
          'Perfect for AI agent payments',
          'True micropayments support',
          'Developer-friendly APIs',
          'Global accessibility',
          'Programmable payments'
        ],
        disadvantages: [
          'Centralized around Coinbase infrastructure',
          'Irreversible transactions',
          'Smart contract risks',
          'Limited consumer protection'
        ],
        icon: Coins,
        color: 'blue',
        centralizationConcern: 'Medium'
      },
      {
        protocol: 'l402',
        name: 'Lightning Network (L402)',
        decentralization: 'Decentralized',
        automation: 'Excellent',
        cost: 'Very Low',
        speed: 'Instant',
        reversibility: 'No',
        micropayments: 'Excellent',
        advantages: [
          'Truly decentralized',
          'Lowest transaction costs',
          'Bitcoin security',
          'Censorship resistance',
          'No single point of failure'
        ],
        disadvantages: [
          'High technical complexity',
          'Channel management overhead',
          'Routing failures possible',
          'Bitcoin volatility'
        ],
        icon: Zap,
        color: 'orange',
        centralizationConcern: 'Low'
      },
      {
        protocol: 'sepa',
        name: 'SEPA (Traditional)',
        decentralization: 'Centralized',
        automation: 'Limited',
        cost: 'Low',
        speed: 'Slow',
        reversibility: 'Yes (8 weeks)',
        micropayments: 'Limited',
        advantages: [
          'Strong consumer protection',
          'Regulatory compliance',
          'Familiar to European users',
          'Banking-grade security',
          'Reversible transactions'
        ],
        disadvantages: [
          'Limited automation capabilities',
          'Slow settlement times',
          'High minimum amounts',
          'Complex regulatory requirements',
          'EU-only reach'
        ],
        icon: Building,
        color: 'green',
        centralizationConcern: 'High'
      },
      {
        protocol: 'stripe',
        name: 'Stripe Payments',
        decentralization: 'Centralized',
        automation: 'Good',
        cost: 'Medium',
        speed: 'Fast',
        reversibility: 'Yes (120 days)',
        micropayments: 'Limited',
        advantages: [
          'Easy integration',
          'Strong fraud protection',
          'Multiple payment methods',
          'Global reach',
          'Chargeback protection'
        ],
        disadvantages: [
          'Higher fees for small transactions',
          'Limited micropayment support',
          'Centralized control',
          'Processing delays'
        ],
        icon: CreditCard,
        color: 'purple',
        centralizationConcern: 'High'
      }
    ]
    setComparison(mockComparison)
  }, [])

  const getDecentralizationIcon = (level: string) => {
    switch (level) {
      case 'Decentralized': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Semi-Decentralized': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'Centralized': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getCentralizationBadge = (concern: string) => {
    switch (concern) {
      case 'Low': return <Badge variant="outline" className="text-green-600 border-green-200">Low Risk</Badge>
      case 'Medium': return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium Risk</Badge>
      case 'High': return <Badge variant="outline" className="text-red-600 border-red-200">High Risk</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const selectedProtocolData = comparison.find(p => p.protocol === selectedProtocol)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-600" />
            Payment Protocol Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive comparison of payment protocols for AI agent systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Decentralization Trade-offs:</strong> Each protocol balances decentralization, 
              automation, and user protection differently. Choose based on your specific requirements.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Protocols</CardTitle>
              <CardDescription>Select a protocol to view detailed analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {comparison.map((protocol) => {
                const IconComponent = protocol.icon
                return (
                  <Button
                    key={protocol.protocol}
                    variant={selectedProtocol === protocol.protocol ? "default" : "outline"}
                    className={`w-full justify-start gap-3 h-auto p-4 ${
                      selectedProtocol === protocol.protocol ? `bg-${protocol.color}-100 border-${protocol.color}-300` : ''
                    }`}
                    onClick={() => setSelectedProtocol(protocol.protocol)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{protocol.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {protocol.decentralization} • {protocol.cost} cost
                      </div>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2">
          {selectedProtocolData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <selectedProtocolData.icon className="h-6 w-6" />
                    <div>
                      <CardTitle>{selectedProtocolData.name}</CardTitle>
                      <CardDescription>
                        {selectedProtocolData.protocol.toUpperCase()} Protocol Analysis
                      </CardDescription>
                    </div>
                  </div>
                  {getCentralizationBadge(selectedProtocolData.centralizationConcern)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getDecentralizationIcon(selectedProtocolData.decentralization)}
                      <span className="text-sm font-medium">Decentralization</span>
                    </div>
                    <div className="text-lg font-bold">{selectedProtocolData.decentralization}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Automation</span>
                    </div>
                    <div className="text-lg font-bold">{selectedProtocolData.automation}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Cost</span>
                    </div>
                    <div className="text-lg font-bold">{selectedProtocolData.cost}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Speed</span>
                    </div>
                    <div className="text-lg font-bold">{selectedProtocolData.speed}</div>
                  </div>
                </div>

                {/* Advantages and Disadvantages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Advantages
                    </h4>
                    <ul className="space-y-2">
                      {selectedProtocolData.advantages.map((advantage: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Disadvantages
                    </h4>
                    <ul className="space-y-2">
                      {selectedProtocolData.disadvantages.map((disadvantage: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          {disadvantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Centralization Analysis */}
                {selectedProtocolData.centralizationConcern === 'Medium' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Centralization Concern:</strong> This protocol has moderate centralization risks. 
                      Consider implementing fallback mechanisms and monitoring infrastructure dependencies.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedProtocolData.centralizationConcern === 'High' && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>High Centralization Risk:</strong> This protocol relies heavily on centralized 
                      infrastructure. Ensure you have contingency plans and consider more decentralized alternatives.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => onProtocolSelect?.(selectedProtocol)}
                    className="w-full"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Use {selectedProtocolData.name} for Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations for AI Agent Systems</CardTitle>
          <CardDescription>
            Best practices for payment protocol selection based on your use case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">For Micropayments</h4>
              <p className="text-sm text-blue-700">
                Use <strong>x402</strong> or <strong>L402</strong> for sub-cent transactions. 
                Traditional payment systems have high minimum fees.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">For Consumer Protection</h4>
              <p className="text-sm text-green-700">
                Use <strong>SEPA</strong> or <strong>Stripe</strong> when reversibility 
                and fraud protection are critical.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">For Decentralization</h4>
              <p className="text-sm text-purple-700">
                Use <strong>L402</strong> for maximum decentralization, 
                though with higher technical complexity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
