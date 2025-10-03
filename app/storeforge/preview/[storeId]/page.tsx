'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, ExternalLink, Code, Package, Settings, FileText } from 'lucide-react'
import Link from 'next/link'

interface StorePreviewData {
  storeId: string
  storeName: string
  description: string
  storeCode: string
  packageJson: string
  deploymentConfig: string
  readme?: string
  products: Array<{
    id: string
    name: string
    description: string
    price: number
    currency: string
    category: string
    images: string[]
    inStock: boolean
    rating: number
    reviewCount: number
    geoAttributes: {
      pickupAvailable: boolean
      deliveryRadius: number
    }
  }>
  geoData: {
    latitude: number
    longitude: number
    address: string
    radius: number
  }
  paymentConfig: {
    ap2: boolean
    acp: boolean
    x402: boolean
    chains: string[]
  }
}

export default function StorePreviewPage() {
  const params = useParams()
  const storeId = params?.storeId as string
  const [storeData, setStoreData] = useState<StorePreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'config' | 'readme'>('preview')

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await fetch(`/api/storeforge/stores/${storeId}`)
        const result = await response.json()

        if (result.success) {
          setStoreData(result.data)
        } else {
          setError(result.error || 'Store not found')
        }
      } catch (err) {
        setError('Failed to load store data')
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [storeId])

  const downloadStoreCode = () => {
    if (!storeData) return

    const blob = new Blob([storeData.storeCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeData.storeId}-store.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPackageJson = () => {
    if (!storeData) return

    const blob = new Blob([storeData.packageJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeData.storeId}-package.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadDeploymentConfig = () => {
    if (!storeData) return
    
    const blob = new Blob([storeData.deploymentConfig], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeData.storeId}-vercel.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadReadme = () => {
    if (!storeData || !storeData.readme) return
    
    const blob = new Blob([storeData.readme], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeData.storeId}-README.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading store preview...</p>
        </div>
      </div>
    )
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Store Not Found</h2>
            <p className="text-gray-400 mb-6">The store you're looking for doesn't exist or has been removed.</p>
            <Link href="/storeforge">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to StoreForge
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/storeforge">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to StoreForge
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{storeData.storeName}</h1>
                <p className="text-gray-400">Store ID: {storeData.storeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-400 text-green-300">
                Preview Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'preview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('preview')}
            className="text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={activeTab === 'code' ? 'default' : 'outline'}
            onClick={() => setActiveTab('code')}
            className="text-white"
          >
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
          <Button
            variant={activeTab === 'config' ? 'default' : 'outline'}
            onClick={() => setActiveTab('config')}
            className="text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Config
          </Button>
          {storeData?.readme && (
            <Button
              variant={activeTab === 'readme' ? 'default' : 'outline'}
              onClick={() => setActiveTab('readme')}
              className="text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              README
            </Button>
          )}
        </div>

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Store Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-8 min-h-[600px]">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{storeData.storeName}</h2>
                  <p className="text-xl text-gray-600">{storeData.description}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="secondary">Location: {storeData.geoData.address}</Badge>
                    <Badge variant="secondary">Lat: {storeData.geoData.latitude}</Badge>
                    <Badge variant="secondary">Lng: {storeData.geoData.longitude}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeData.products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 shadow-md">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-blue-600">
                          {product.currency} {product.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>
                      </div>
                      <Button className="w-full" disabled={!product.inStock}>
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Payment Methods</h4>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(storeData.paymentConfig).map(([key, value]) => (
                      <Badge key={key} variant={value ? 'default' : 'outline'}>
                        {key.toUpperCase()}: {value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Generated Code</CardTitle>
                <Button onClick={downloadStoreCode} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Store Component
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm">
                  <code>{storeData.storeCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Package.json</CardTitle>
                  <Button onClick={downloadPackageJson} variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                  <pre className="text-blue-400 text-sm">
                    <code>{JSON.stringify(JSON.parse(storeData.packageJson), null, 2)}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Deployment Config</CardTitle>
                  <Button onClick={downloadDeploymentConfig} variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                  <pre className="text-purple-400 text-sm">
                    <code>{storeData.deploymentConfig}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* README Tab */}
        {activeTab === 'readme' && storeData?.readme && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">README Documentation</CardTitle>
                <Button onClick={downloadReadme} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download README
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm whitespace-pre-wrap">
                  <code>{storeData.readme}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
