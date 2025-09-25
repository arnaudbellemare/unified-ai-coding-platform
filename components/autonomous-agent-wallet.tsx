'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wallet, 
  Plus, 
  DollarSign, 
  Settings, 
  History, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Bot,
  TrendingUp,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface AgentWallet {
  agentId: string
  walletAddress: string
  balance: {
    usdc: number
    eth: number
  }
  fundingSource: 'user' | 'autonomous' | 'hybrid'
  autonomousSettings: {
    maxDailySpend: number
    maxSingleTransaction: number
    allowedServices: string[]
    autoTopUp: boolean
    topUpThreshold: number
  }
  isActive: boolean
  createdAt: Date
  lastUsed: Date
}

interface Transaction {
  id: string
  agentId: string
  type: 'payment' | 'refund' | 'fee'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  description: string
  createdAt: Date
}

export function AutonomousAgentWallet() {
  const [agentWallets, setAgentWallets] = useState<AgentWallet[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [fundingAmount, setFundingAmount] = useState('')
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([])

  useEffect(() => {
    fetchAgentWallets()
  }, [])

  const fetchAgentWallets = async () => {
    try {
      const response = await fetch('/api/agent-wallets/autonomous-payment?action=all_wallets')
      const data = await response.json()
      if (data.success) {
        setAgentWallets(data.wallets || [])
      }
    } catch (error) {
      console.error('Failed to fetch agent wallets:', error)
      toast.error('Failed to load agent wallets')
    }
  }

  const createAgentWallet = async (agentId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/agent-wallets/autonomous-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_wallet',
          agentId,
          fundingSource: 'hybrid',
          initialFunding: 5 // Start with $5 USDC
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Autonomous wallet created for agent: ${agentId}`)
        await fetchAgentWallets()
      } else {
        toast.error(data.error || 'Failed to create agent wallet')
      }
    } catch (error) {
      console.error('Failed to create agent wallet:', error)
      toast.error('Failed to create agent wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const fundAgentWallet = async (agentId: string, amount: number) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/agent-wallets/autonomous-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fund_wallet',
          agentId,
          amount
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Funded agent wallet with $${amount} USDC`)
        await fetchAgentWallets()
      } else {
        toast.error(data.error || 'Failed to fund agent wallet')
      }
    } catch (error) {
      console.error('Failed to fund agent wallet:', error)
      toast.error('Failed to fund agent wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAPICall = async (agentId: string, provider: string, cost: number) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/agent-wallets/autonomous-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_api_call',
          agentId,
          apiProvider: provider,
          apiCost: cost,
          description: `API call to ${provider}`
        })
      })

      const data = await response.json()
      if (data.success && data.paymentResponse.success) {
        toast.success(`Agent made autonomous payment: $${cost} USDC to ${provider}`)
        await fetchAgentWallets()
        await fetchTransactionHistory(agentId)
      } else {
        toast.error(data.paymentResponse?.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Failed to simulate API call:', error)
      toast.error('Failed to simulate API call')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactionHistory = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agent-wallets/autonomous-payment?action=history&agentId=${agentId}&limit=20`)
      const data = await response.json()
      if (data.success) {
        setTransactionHistory(data.history || [])
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error)
    }
  }

  const selectedWallet = agentWallets.find(w => w.agentId === selectedAgent)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-green-600" />
            Autonomous Agent Wallets
          </CardTitle>
          <CardDescription>
            Enable your AI agents to make independent payments using USDC and the A2A x402 extension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>A2A x402 Extension:</strong> Your agents can now autonomously pay for APIs, 
              data access, and services using their own USDC wallets. They operate within your 
              defined spending limits and security settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your AI Agents</CardTitle>
              <CardDescription>Select an agent to manage its wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agentWallets.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No agent wallets created yet</p>
                  <Button 
                    onClick={() => createAgentWallet('demo-agent-1')}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Demo Agent Wallet
                  </Button>
                </div>
              ) : (
                agentWallets.map((wallet) => (
                  <Button
                    key={wallet.agentId}
                    variant={selectedAgent === wallet.agentId ? "default" : "outline"}
                    className="w-full justify-start gap-3 h-auto p-4"
                    onClick={() => {
                      setSelectedAgent(wallet.agentId)
                      fetchTransactionHistory(wallet.agentId)
                    }}
                  >
                    <Wallet className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{wallet.agentId}</div>
                      <div className="text-sm text-muted-foreground">
                        ${wallet.balance.usdc.toFixed(2)} USDC
                      </div>
                    </div>
                    <Badge variant={wallet.isActive ? "default" : "secondary"}>
                      {wallet.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wallet Management */}
        <div className="lg:col-span-2">
          {selectedWallet ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
                <TabsTrigger value="test">Test Payments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Wallet Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${selectedWallet.balance.usdc.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">USDC Balance</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedWallet.balance.eth.toFixed(4)}
                        </div>
                        <div className="text-sm text-muted-foreground">ETH (Gas)</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ${selectedWallet.autonomousSettings.maxDailySpend}
                        </div>
                        <div className="text-sm text-muted-foreground">Daily Limit</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          ${selectedWallet.autonomousSettings.maxSingleTransaction}
                        </div>
                        <div className="text-sm text-muted-foreground">Max Transaction</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Wallet Address</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {selectedWallet.walletAddress.slice(0, 10)}...{selectedWallet.walletAddress.slice(-8)}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Funding Source</span>
                        <Badge variant="outline">{selectedWallet.fundingSource}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Auto Top-up</span>
                        <Switch 
                          checked={selectedWallet.autonomousSettings.autoTopUp}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fund" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Fund Agent Wallet</CardTitle>
                    <CardDescription>
                      Add USDC to your agent's wallet for autonomous payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="funding-amount">Amount (USDC)</Label>
                      <Input
                        id="funding-amount"
                        type="number"
                        placeholder="5.00"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => fundAgentWallet(selectedWallet.agentId, parseFloat(fundingAmount))}
                      disabled={!fundingAmount || isLoading}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fund Wallet with ${fundingAmount} USDC
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Autonomous Payments</CardTitle>
                    <CardDescription>
                      Simulate your agent making payments for API services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => simulateAPICall(selectedWallet.agentId, 'openai', 0.05)}
                        disabled={isLoading}
                        variant="outline"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Test OpenAI API ($0.05)
                      </Button>
                      <Button
                        onClick={() => simulateAPICall(selectedWallet.agentId, 'perplexity', 0.02)}
                        disabled={isLoading}
                        variant="outline"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Test Perplexity API ($0.02)
                      </Button>
                      <Button
                        onClick={() => simulateAPICall(selectedWallet.agentId, 'anthropic', 0.08)}
                        disabled={isLoading}
                        variant="outline"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Test Anthropic API ($0.08)
                      </Button>
                      <Button
                        onClick={() => simulateAPICall(selectedWallet.agentId, 'vercel', 0.10)}
                        disabled={isLoading}
                        variant="outline"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Test Vercel API ($0.10)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      View your agent's autonomous payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactionHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactionHistory.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-600' :
                                tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {tx.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                                 tx.status === 'failed' ? <AlertTriangle className="h-4 w-4" /> :
                                 <Clock className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="font-medium">{tx.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {tx.createdAt.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {tx.type === 'payment' ? '-' : '+'}${tx.amount.toFixed(2)}
                              </div>
                              <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Agent</h3>
                <p className="text-muted-foreground">
                  Choose an agent from the list to manage its autonomous wallet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
