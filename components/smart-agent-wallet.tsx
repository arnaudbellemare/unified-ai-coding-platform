'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Wallet,
  Plus,
  Settings,
  History,
  Shield,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'

interface SmartAgentWallet {
  agentId: string
  walletAddress: string
  balance: {
    usdc: number
    eth: number
  }
  spendingRule: {
    isActive: boolean
    maxDailySpend: number
    maxSingleTransaction: number
    dailySpent: number
    lastResetDate: string
    allowedServices: string[]
  }
  security: {
    backupWallets: string[]
    requiredApprovals: number
    recoveryContacts: string[]
    recoveryDelay: number
    isPaused: boolean
  }
  transactionHistory: any[]
  createdAt: string
  lastUsed: string
}

export function SmartAgentWallet() {
  const [smartWallets, setSmartWallets] = useState<SmartAgentWallet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('wallets')

  // Create wallet form state
  const [newAgentId, setNewAgentId] = useState('')
  const [maxDailySpend, setMaxDailySpend] = useState(10)
  const [maxSingleTransaction, setMaxSingleTransaction] = useState(2)

  // Transaction form state
  const [selectedWallet, setSelectedWallet] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [transactionDescription, setTransactionDescription] = useState('')

  useEffect(() => {
    fetchSmartWallets()
  }, [])

  const fetchSmartWallets = async () => {
    try {
      console.log('🔄 Fetching smart agent wallets...')
      const response = await fetch('/api/smart-wallets/create?action=all_wallets')
      const data = await response.json()
      console.log('📦 Fetched smart wallets data:', data)
      if (data.success) {
        setSmartWallets(data.wallets || [])
        console.log(`✅ Set ${data.wallets?.length || 0} smart wallets in state`)
      } else {
        console.error('❌ Failed to fetch smart wallets:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch smart agent wallets:', error)
      toast.error('Failed to load smart agent wallets')
    }
  }

  const createSmartWallet = async () => {
    if (!newAgentId.trim()) {
      toast.error('Please enter an agent ID')
      return
    }

    setIsLoading(true)
    try {
      console.log(`🚀 Creating smart wallet for agent: ${newAgentId}`)
      const response = await fetch('/api/smart-wallets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: newAgentId,
          maxDailySpend,
          maxSingleTransaction,
          isDemo: true, // Allow creation without authentication
        }),
      })

      const data = await response.json()
      console.log('📦 Smart wallet creation response:', data)
      if (data.success) {
        toast.success(`Smart contract wallet created for agent: ${newAgentId}`)
        console.log('✅ Smart wallet created successfully, refreshing list...')
        await fetchSmartWallets()
        setNewAgentId('')
        setMaxDailySpend(10)
        setMaxSingleTransaction(2)
      } else {
        console.error('❌ Smart wallet creation failed:', data.error)
        toast.error(data.error || 'Failed to create smart wallet')
      }
    } catch (error) {
      console.error('Failed to create smart wallet:', error)
      toast.error('Failed to create smart wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const executeTransaction = async () => {
    if (!selectedWallet || !recipientAddress || !transactionAmount) {
      toast.error('Please fill in all transaction fields')
      return
    }

    setIsLoading(true)
    try {
      console.log(`🚀 Executing transaction for wallet: ${selectedWallet}`)
      const response = await fetch('/api/smart-wallets/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedWallet,
          to: recipientAddress,
          value: transactionAmount,
          description: transactionDescription,
          isDemo: true, // Allow execution without authentication
        }),
      })

      const data = await response.json()
      console.log('📦 Transaction execution response:', data)
      if (data.success) {
        toast.success(`Transaction executed: ${data.transaction.transactionHash}`)
        console.log('✅ Transaction executed successfully, refreshing wallets...')
        await fetchSmartWallets()
        setRecipientAddress('')
        setTransactionAmount(0)
        setTransactionDescription('')
      } else {
        console.error('❌ Transaction execution failed:', data.error)
        toast.error(data.error || 'Failed to execute transaction')
      }
    } catch (error) {
      console.error('Failed to execute transaction:', error)
      toast.error('Failed to execute transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const emergencyPause = async (agentId: string) => {
    try {
      const response = await fetch('/api/smart-wallets/execute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'emergency_pause',
          agentId,
          isDemo: true,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Wallet paused successfully')
        await fetchSmartWallets()
      } else {
        toast.error(data.error || 'Failed to pause wallet')
      }
    } catch (error) {
      toast.error('Failed to pause wallet')
    }
  }

  const emergencyUnpause = async (agentId: string) => {
    try {
      const response = await fetch('/api/smart-wallets/execute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'emergency_unpause',
          agentId,
          isDemo: true,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Wallet unpaused successfully')
        await fetchSmartWallets()
      } else {
        toast.error(data.error || 'Failed to unpause wallet')
      }
    } catch (error) {
      toast.error('Failed to unpause wallet')
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Smart Agent Wallets</h1>
          <p className="text-muted-foreground">
            State-of-the-art ERC-4337 smart contract wallets with programmable spending rules
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallets">Smart Wallets</TabsTrigger>
          <TabsTrigger value="create">Create Wallet</TabsTrigger>
          <TabsTrigger value="transactions">Execute Transaction</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {smartWallets.map((wallet) => (
              <Card key={wallet.agentId} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {wallet.agentId}
                    </CardTitle>
                    <div className="flex gap-2">
                      {wallet.security.isPaused ? (
                        <Button size="sm" variant="outline" onClick={() => emergencyUnpause(wallet.agentId)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => emergencyPause(wallet.agentId)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs font-mono">{wallet.walletAddress}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">USDC Balance</div>
                      <div className="font-semibold">${wallet.balance.usdc.toFixed(6)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">ETH Balance</div>
                      <div className="font-semibold">{wallet.balance.eth.toFixed(6)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Daily Limit</span>
                      <span>${wallet.spendingRule.maxDailySpend.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Single Tx Limit</span>
                      <span>${wallet.spendingRule.maxSingleTransaction.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Daily Spent</span>
                      <span>${wallet.spendingRule.dailySpent.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {wallet.spendingRule.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}

                    {wallet.security.isPaused ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Paused
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Zap className="h-3 w-3 mr-1" />
                        Running
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div>Backup Wallets: {wallet.security.backupWallets.length}</div>
                    <div>Recovery Contacts: {wallet.security.recoveryContacts.length}</div>
                    <div>Required Approvals: {wallet.security.requiredApprovals}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {smartWallets.length === 0 && (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                No smart agent wallets found. Create your first smart contract wallet to get started.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Smart Contract Wallet</CardTitle>
              <CardDescription>
                Create a new ERC-4337 smart contract wallet with programmable spending rules and security features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agentId">Agent ID</Label>
                <Input
                  id="agentId"
                  placeholder="e.g., agent-123"
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxDailySpend">Max Daily Spend (USDC)</Label>
                  <Input
                    id="maxDailySpend"
                    type="number"
                    step="0.01"
                    value={maxDailySpend}
                    onChange={(e) => setMaxDailySpend(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSingleTransaction">Max Single Transaction (USDC)</Label>
                  <Input
                    id="maxSingleTransaction"
                    type="number"
                    step="0.01"
                    value={maxSingleTransaction}
                    onChange={(e) => setMaxSingleTransaction(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Smart contract wallets include:
                  <br />• Programmable spending rules
                  <br />• Multi-signature backup wallets
                  <br />• Social recovery mechanisms
                  <br />• Emergency pause functionality
                  <br />• Gasless transactions via account abstraction
                </AlertDescription>
              </Alert>

              <Button onClick={createSmartWallet} disabled={isLoading || !newAgentId.trim()} className="w-full">
                {isLoading ? 'Creating...' : 'Create Smart Wallet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execute Smart Transaction</CardTitle>
              <CardDescription>
                Execute transactions with programmable spending rules and automatic validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="selectedWallet">Select Wallet</Label>
                <select
                  id="selectedWallet"
                  className="w-full p-2 border rounded-md"
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                >
                  <option value="">Select a wallet</option>
                  {smartWallets.map((wallet) => (
                    <option key={wallet.agentId} value={wallet.agentId}>
                      {wallet.agentId} - ${wallet.balance.usdc.toFixed(2)} USDC
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Input
                  id="recipientAddress"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="transactionAmount">Amount (USDC)</Label>
                <Input
                  id="transactionAmount"
                  type="number"
                  step="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="transactionDescription">Description</Label>
                <Input
                  id="transactionDescription"
                  placeholder="Payment for API service"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={executeTransaction}
                disabled={isLoading || !selectedWallet || !recipientAddress || !transactionAmount}
                className="w-full"
              >
                {isLoading ? 'Executing...' : 'Execute Transaction'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
