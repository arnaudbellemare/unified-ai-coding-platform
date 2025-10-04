'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Separator } from '@/components/ui/separator'
import { 
  Store, 
  ShoppingBag, 
  Plus, 
  Eye, 
  Download,
  ExternalLink,
  CheckCircle,
  Loader2,
  MapPin,
  CreditCard,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface StoreConfig {
  name: string
  description: string
  category: string
  location: string
  theme: string
  businessType: 'new' | 'shopify' | 'woocommerce' | 'existing'
  existingPlatform: string
  products: Array<{
    name: string
    price: number
    description: string
    image: string
  }>
}

export default function StoreForgePage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    name: '',
    description: '',
    category: '',
    location: '',
    theme: 'modern',
    businessType: 'new',
    existingPlatform: '',
    products: []
  })
  const [generatedStore, setGeneratedStore] = useState<any>(null)

  const addProduct = () => {
    setStoreConfig(prev => ({
      ...prev,
      products: [...prev.products, {
        name: '',
        price: 0,
        description: '',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      }]
    }))
  }

  const updateProduct = (index: number, field: string, value: any) => {
    setStoreConfig(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }))
  }

  const removeProduct = (index: number) => {
    setStoreConfig(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const buildStore = async () => {
    if (!storeConfig.name || !storeConfig.description) {
      toast.error('Please fill in store name and description')
      return
    }

    setLoading(true)
    try {
            const businessContext = storeConfig.businessType === 'new' 
              ? `Build a new ${storeConfig.category} store` 
              : `Optimize my existing ${storeConfig.existingPlatform || 'store'} platform`
            
            const requestData = {
              prompt: `${businessContext} called "${storeConfig.name}" in ${storeConfig.location}. ${storeConfig.description}`,
              vibe: storeConfig.theme,
              location: storeConfig.location,
              productType: storeConfig.category,
              paymentMethods: ['USDC', 'ETH'],
            }

      console.log('Sending request:', requestData)

      const response = await fetch('/api/storeforge/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('API Result:', result)
      
      if (result.success) {
        setGeneratedStore(result.data)
        setStep(4)
        toast.success('Store built successfully!')
      } else {
        throw new Error(result.error || 'Build failed')
      }
    } catch (error) {
      console.error('Build error details:', error)
      toast.error(`Failed to build store: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadStore = () => {
    if (!generatedStore) return
    
    const storeCode = generatedStore.deployment?.storeCode
    if (storeCode) {
      const blob = new Blob([storeCode], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${storeConfig.name.replace(/\s+/g, '-').toLowerCase()}-store.tsx`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">StoreForge</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build professional crypto-commerce stores in minutes. No coding required.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Business Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="businessType">What type of business are you building?</Label>
                  <Select 
                    value={storeConfig.businessType} 
                    onValueChange={(value: 'new' | 'shopify' | 'woocommerce' | 'existing') => 
                      setStoreConfig(prev => ({ ...prev, businessType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">🆕 New Store - Build from scratch</SelectItem>
                      <SelectItem value="shopify">🛍️ Shopify Store - Optimize existing</SelectItem>
                      <SelectItem value="woocommerce">🔧 WooCommerce - WordPress integration</SelectItem>
                      <SelectItem value="existing">⚙️ Other Platform - Migration/optimization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {storeConfig.businessType !== 'new' && (
                  <div>
                    <Label htmlFor="existingPlatform">Current Platform</Label>
                    <Select 
                      value={storeConfig.existingPlatform} 
                      onValueChange={(value) => 
                        setStoreConfig(prev => ({ ...prev, existingPlatform: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shopify">Shopify</SelectItem>
                        <SelectItem value="WooCommerce">WooCommerce</SelectItem>
                        <SelectItem value="WordPress">WordPress</SelectItem>
                        <SelectItem value="Magento">Magento</SelectItem>
                        <SelectItem value="BigCommerce">BigCommerce</SelectItem>
                        <SelectItem value="Squarespace">Squarespace</SelectItem>
                        <SelectItem value="Wix">Wix</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2 text-black">
                    <Zap className="h-4 w-4" />
                    What You'll Get
                  </h3>
                  <ul className="text-sm space-y-1 text-black">
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">
                        {storeConfig.businessType === 'new' 
                          ? 'Professional e-commerce website' 
                          : `GEO/AEO optimization for your ${storeConfig.existingPlatform || 'existing'} store`
                        }
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">Crypto payment processing (USDC, ETH)</span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">Mobile-responsive design</span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">
                        {storeConfig.businessType === 'new' 
                          ? 'Ready to deploy to Vercel' 
                          : 'Integration guide and code snippets'
                        }
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">GEO/AEO optimization for AI agents</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)}>
                    Continue to Store Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Store Name *</Label>
                    <Input
                      id="name"
                      value={storeConfig.name}
                      onChange={(e) => setStoreConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Awesome Store"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={storeConfig.category} onValueChange={(value) => setStoreConfig(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="food">Food & Beverages</SelectItem>
                        <SelectItem value="art">Art & Crafts</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Store Description *</Label>
                  <Textarea
                    id="description"
                    value={storeConfig.description}
                    onChange={(e) => setStoreConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your store sells and what makes it special..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={storeConfig.location}
                      onChange={(e) => setStoreConfig(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={storeConfig.theme} onValueChange={(value) => setStoreConfig(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="artisan">Artisan</SelectItem>
                        <SelectItem value="urban">Urban</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => setStep(3)} className="w-full" size="lg">
                  Next: Add Products
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Products */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Add Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {storeConfig.products.map((product, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium">Product {index + 1}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Product Name</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            placeholder="Product name"
                          />
                        </div>
                        <div>
                          <Label>Price (USDC)</Label>
                          <Input
                            type="number"
                            value={product.price}
                            onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>Description</Label>
                        <Textarea
                          value={product.description}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                          placeholder="Product description"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button onClick={addProduct} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>

                <div className="flex gap-4">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    Next: Review & Build
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Review Your Store
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Store Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {storeConfig.name}</p>
                      <p><strong>Category:</strong> {storeConfig.category}</p>
                      <p><strong>Location:</strong> {storeConfig.location}</p>
                      <p><strong>Theme:</strong> {storeConfig.theme}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-gray-600">{storeConfig.description}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6" />

                <div>
                  <h3 className="font-medium mb-4">Products ({storeConfig.products.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeConfig.products.map((product, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <p className="text-sm font-medium text-blue-600">{product.price} USDC</p>
                          </div>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2 text-black">
                    <Zap className="h-4 w-4" />
                    What You'll Get
                  </h3>
                  <ul className="text-sm space-y-1 text-black">
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">Professional e-commerce website</span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">Crypto payment processing (USDC, ETH)</span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">Mobile-responsive design</span>
                    </li>
                    <li className="flex items-center gap-2 text-black">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-black">Ready to deploy to Vercel</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                    Back to Products
                  </Button>
                  <Button onClick={buildStore} className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Building Store...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Build My Store
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Generated Store */}
          {step === 5 && generatedStore && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Store Built Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-green-800">🎉 Your store is ready!</h3>
                  <p className="text-green-700">
                    Your professional crypto-commerce store has been generated with all the features you requested.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => window.open(`/storeforge/preview/${generatedStore.storeId}`, '_blank')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Eye className="h-6 w-6" />
                    <span>Preview Store</span>
                  </Button>
                  
                  <Button
                    onClick={downloadStore}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Download className="h-6 w-6" />
                    <span>Download Code</span>
                  </Button>
                  
                  <Button
                    onClick={() => window.open('https://vercel.com/new', '_blank')}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <ExternalLink className="h-6 w-6" />
                    <span>Deploy to Vercel</span>
                  </Button>
                </div>

                <div className="border-t border-gray-200 my-6" />

                <div>
                  <h3 className="font-medium mb-4">Store Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Store ID:</strong> {generatedStore.storeId}</p>
                      <p><strong>Name:</strong> {generatedStore.storeName}</p>
                      <p><strong>Location:</strong> {generatedStore.geoData?.address}</p>
                    </div>
                    <div>
                      <p><strong>Products:</strong> {generatedStore.products?.length || 0}</p>
                      <p><strong>Payment Methods:</strong> USDC, ETH</p>
                      <p><strong>Status:</strong> <Badge variant="default">Ready</Badge></p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => {
                    setStep(1)
                    setGeneratedStore(null)
                    setStoreConfig({
                      name: '',
                      description: '',
                      category: '',
                      location: '',
                      theme: 'modern',
                      products: []
                    })
                  }} variant="outline" className="flex-1">
                    Build Another Store
                  </Button>
                  <Button
                    onClick={() => window.open(`/storeforge/preview/${generatedStore.storeId}`, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}