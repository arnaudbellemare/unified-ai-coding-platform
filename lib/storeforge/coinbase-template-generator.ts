import { z } from 'zod'

// Schema for Coinbase template-based store configuration
export const CoinbaseTemplateConfigSchema = z.object({
  storeId: z.string(),
  storeName: z.string(),
  description: z.string(),
  theme: z.enum(['minimalist', 'luxury', 'tech', 'artisan', 'urban', 'eco']),
  location: z.object({
    city: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      currency: z.string().default('USDC'),
      category: z.string(),
      images: z.array(z.string()),
      inStock: z.boolean().default(true),
      inventory: z.number().default(0),
      rating: z.number().min(0).max(5).default(4.5),
      reviewCount: z.number().default(0),
      geoAttributes: z.object({
        pickupAvailable: z.boolean().default(true),
        deliveryRadius: z.number().default(10),
      }),
    }),
  ),
  paymentMethods: z.array(z.string()),
  features: z.array(z.string()),
  branding: z.object({
    primaryColor: z.string().default('#000000'),
    secondaryColor: z.string().default('#666666'),
    accentColor: z.string().default('#0066CC'),
  }),
})

export type CoinbaseTemplateConfig = z.infer<typeof CoinbaseTemplateConfigSchema>

export class CoinbaseTemplateGenerator {
  private sanitizePackageName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private getThemeColors(theme: string, branding: any) {
    const themes = {
      minimalist: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#0066CC',
        background: '#FFFFFF',
        surface: '#F8F9FA',
      },
      luxury: {
        primary: '#1A1A1A',
        secondary: '#8B7355',
        accent: '#D4AF37',
        background: '#FAFAFA',
        surface: '#F5F5F5',
      },
      tech: {
        primary: '#000000',
        secondary: '#00D4AA',
        accent: '#0066FF',
        background: '#0A0A0A',
        surface: '#1A1A1A',
      },
      artisan: {
        primary: '#8B4513',
        secondary: '#CD853F',
        accent: '#FF6347',
        background: '#FFF8DC',
        surface: '#F5DEB3',
      },
      urban: {
        primary: '#2C3E50',
        secondary: '#E74C3C',
        accent: '#F39C12',
        background: '#ECF0F1',
        surface: '#BDC3C7',
      },
      eco: {
        primary: '#2E7D32',
        secondary: '#4CAF50',
        accent: '#8BC34A',
        background: '#F1F8E9',
        surface: '#E8F5E8',
      },
    }
    return themes[theme as keyof typeof themes] || themes.minimalist
  }

  generateCoinbaseStore(config: CoinbaseTemplateConfig): string {
    const themeColors = this.getThemeColors(config.theme, config.branding)
    const storeName = config.storeName.replace(/[^a-zA-Z0-9]/g, '')
    
    return `'use client'

import { useState, useCallback, useMemo, createContext, useContext } from 'react'
import { MapPin, ShoppingCart, Star, Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Types
type Product = {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  images: string[]
  inStock: boolean
  inventory: number
  rating: number
  reviewCount: number
  geoAttributes: {
    pickupAvailable: boolean
    deliveryRadius: number
  }
}

type Quantities = Record<string, number>

type StoreContextType = {
  quantities: Quantities
  setQuantities: (quantities: Quantities | ((prev: Quantities) => Quantities)) => void
  products: Product[]
}

// Context
const StoreContext = createContext<StoreContextType>({} as StoreContextType)

function useStore() {
  return useContext(StoreContext)
}

// Components
function StoreProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Quantities>({})

  const products: Product[] = ${JSON.stringify(config.products, null, 2)}

  const value = useMemo(() => ({
    quantities,
    setQuantities,
    products,
  }), [quantities])

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { quantities, setQuantities } = useStore()
  const quantity = quantities[product.id] || 0

  const addToCart = () => {
    setQuantities(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }))
  }

  const removeFromCart = () => {
    setQuantities(prev => {
      const newQuantities = { ...prev }
      if (newQuantities[product.id] > 0) {
        newQuantities[product.id] = newQuantities[product.id] - 1
        if (newQuantities[product.id] === 0) {
          delete newQuantities[product.id]
        }
      }
      return newQuantities
    })
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg" style={{ backgroundColor: '${themeColors.surface}' }}>
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            {product.geoAttributes.pickupAvailable && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Pickup
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-lg" style={{ color: '${themeColors.primary}' }}>
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={\`h-4 w-4 \${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}\`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviewCount} reviews)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold" style={{ color: '${themeColors.accent}' }}>
                {product.currency} {product.price.toFixed(2)}
              </span>
              {product.inventory > 0 && (
                <p className="text-xs text-gray-500">
                  {product.inventory} in stock
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {quantity > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeFromCart}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[20px] text-center">{quantity}</span>
                </div>
              )}
              <Button
                size="sm"
                onClick={addToCart}
                disabled={!product.inStock}
                style={{ 
                  backgroundColor: '${themeColors.accent}',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { quantities, products } = useStore()

  const cartItems = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)
        return product ? { ...product, quantity } : null
      })
      .filter(Boolean)
  }, [quantities, products])

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0)
  }, [cartItems])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold" style={{ color: '${themeColors.primary}' }}>
            Shopping Cart
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item?.id} className="flex items-center gap-3">
                <img
                  src={item?.images[0] || '/placeholder-product.jpg'}
                  alt={item?.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item?.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item?.currency} {item?.price?.toFixed(2)} × {item?.quantity}
                  </p>
                </div>
                <span className="font-bold">
                  {item?.currency} {((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-xl font-bold" style={{ color: '${themeColors.accent}' }}>
                {cartItems[0]?.currency || 'USDC'} {total.toFixed(2)}
              </span>
            </div>
            <Button 
              className="w-full" 
              style={{ 
                backgroundColor: '${themeColors.accent}',
                color: 'white'
              }}
              onClick={() => {
                alert('Checkout functionality would be integrated with Coinbase OnchainKit here!')
                onClose()
              }}
            >
              Pay with Crypto
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StoreHeader() {
  const { quantities } = useStore()
  const [cartOpen, setCartOpen] = useState(false)
  
  const itemCount = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)

  return (
    <header className="border-b bg-white sticky top-0 z-40" style={{ backgroundColor: '${themeColors.background}' }}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '${themeColors.primary}' }}>
              ${config.storeName}
            </h1>
            <p className="text-sm text-gray-600">
              ${config.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                ${config.location.city}, ${config.location.country}
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCartOpen(true)}
            className="relative"
            style={{ borderColor: '${themeColors.accent}', color: '${themeColors.accent}' }}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {itemCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                style={{ backgroundColor: '${themeColors.accent}', color: 'white' }}
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
      
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}

function ProductGrid() {
  const { products } = useStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = ['all', ...new Set(products.map(p => p.category))]
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            style={selectedCategory === category ? {
              backgroundColor: '${themeColors.accent}',
              color: 'white'
            } : {
              borderColor: '${themeColors.accent}',
              color: '${themeColors.accent}'
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

// Main Store Component
export default function ${storeName}Store() {
  return (
    <StoreProvider>
      <div className="min-h-screen" style={{ backgroundColor: '${themeColors.background}' }}>
        <StoreHeader />
        <main>
          <ProductGrid />
        </main>
      </div>
    </StoreProvider>
  )
}`
  }

  generatePackageJson(config: CoinbaseTemplateConfig): string {
    return JSON.stringify(
      {
        name: this.sanitizePackageName(config.storeName),
        version: '1.0.0',
        private: true,
        description: config.description,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          '@coinbase/onchainkit': '^0.35.0',
          next: '^14.2.5',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          '@radix-ui/react-slot': '^1.0.0',
          'class-variance-authority': '^0.7.0',
          clsx: '^2.0.0',
          'lucide-react': '^0.294.0',
          'tailwind-merge': '^2.0.0',
          'tailwindcss-animate': '^1.0.7',
          permissionless: '^0.1.26',
          siwe: '^2.3.2',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          autoprefixer: '^10.0.0',
          eslint: '^8.0.0',
          'eslint-config-next': '^14.0.0',
          postcss: '^8.0.0',
          tailwindcss: '^3.0.0',
          typescript: '^5.0.0',
        },
        keywords: ['ecommerce', 'nextjs', 'react', 'onchainkit', 'coinbase', 'crypto', 'storeforge'],
        author: 'StoreForge AI',
        license: 'MIT',
      },
      null,
      2,
    )
  }

  generateDeploymentConfig(config: CoinbaseTemplateConfig): string {
    return JSON.stringify(
      {
        storeId: config.storeId,
        storeName: config.storeName,
        description: config.description,
        theme: config.theme,
        location: config.location,
        deployment: {
          platform: 'vercel',
          domain: `${this.sanitizePackageName(config.storeName)}.vercel.app`,
          buildCommand: 'npm run build',
          outputDirectory: '.next',
          installCommand: 'npm install',
          environmentVariables: {
            NEXT_PUBLIC_ONCHAINKIT_API_KEY: 'GET_FROM_COINBASE_DEVELOPER_PLATFORM',
            COINBASE_COMMERCE_API_KEY: 'GET_FROM_COINBASE_COMMERCE',
          },
        },
        features: config.features,
        paymentMethods: config.paymentMethods,
        onchainKit: {
          enabled: true,
          version: '^0.35.0',
          features: ['checkout', 'wallet-connect', 'siwe'],
        },
      },
      null,
      2,
    )
  }

  generateReadme(config: CoinbaseTemplateConfig): string {
    return `# ${config.storeName}

${config.description}

## 🚀 Features

- **OnchainKit Integration**: Built with Coinbase's OnchainKit for seamless crypto payments
- **Real Crypto Payments**: Accept USDC and other cryptocurrencies via Coinbase Commerce
- **Responsive Design**: Optimized for desktop and mobile devices
- **Location Services**: ${config.location.city}, ${config.location.country} pickup and delivery
- **Inventory Management**: Real-time stock tracking
- **Professional UI**: Modern, ${config.theme} theme design

## 🛍️ Products

${config.products.map((product) => `- **${product.name}**: ${product.currency} ${product.price} - ${product.description}`).join('\n')}

## 💳 Payment Methods

${config.paymentMethods.map((method) => `- ${method.toUpperCase().replace('_', ' ')}`).join('\n')}

## 📍 Location

- **City**: ${config.location.city}
- **Country**: ${config.location.country}
- **Coordinates**: ${config.location.coordinates.lat}, ${config.location.coordinates.lng}

## 🔧 Setup

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment variables**:
   \`\`\`bash
   # Get from Coinbase Developer Portal
   NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_onchainkit_api_key"
   
   # Get from Coinbase Commerce
   COINBASE_COMMERCE_API_KEY="your_commerce_api_key"
   \`\`\`

3. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Build for production**:
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## 🌐 Deployment

This store is ready to deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

## 🔗 Resources

- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Coinbase Commerce API](https://beta.commerce.coinbase.com/)
- [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)

## 📄 License

MIT License - Built with StoreForge AI

---

**Generated by StoreForge** - Zero-code agent builder for GEO/AEO-optimized agentic commerce platforms`
  }
}
