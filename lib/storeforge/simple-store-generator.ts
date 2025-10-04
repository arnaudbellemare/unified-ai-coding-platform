import { z } from 'zod'

export const SimpleStoreConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  theme: z.enum(['modern', 'minimalist', 'luxury', 'tech', 'artisan', 'urban']),
  products: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      description: z.string(),
      image: z.string(),
    })
  ),
})

export type SimpleStoreConfig = z.infer<typeof SimpleStoreConfigSchema>

export class SimpleStoreGenerator {
  private getThemeColors(theme: string) {
    const themes = {
      modern: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
      },
      minimalist: {
        primary: '#000000',
        secondary: '#6B7280',
        accent: '#EF4444',
        background: '#FFFFFF',
        surface: '#F9FAFB',
      },
      luxury: {
        primary: '#1F2937',
        secondary: '#9CA3AF',
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
    }
    return themes[theme as keyof typeof themes] || themes.modern
  }

  generateStore(config: SimpleStoreConfig): string {
    const themeColors = this.getThemeColors(config.theme)
    const storeName = config.name.replace(/[^a-zA-Z0-9]/g, '')
    const productsJson = JSON.stringify(config.products)
    
    return `'use client'

import { useState, useMemo } from 'react'
import { ShoppingCart, Plus, Minus, MapPin, Star, Heart, Share2 } from 'lucide-react'

export default function ${storeName}Store() {
  const [cart, setCart] = useState<{[key: string]: number}>({})
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({})

  const products = ${productsJson}

  const addToCart = (productName: string) => {
    setCart(prev => ({
      ...prev,
      [productName]: (prev[productName] || 0) + 1
    }))
  }

  const removeFromCart = (productName: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productName] > 1) {
        newCart[productName] = newCart[productName] - 1
      } else {
        delete newCart[productName]
      }
      return newCart
    })
  }

  const toggleFavorite = (productName: string) => {
    setFavorites(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }))
  }

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [name, quantity]) => {
      const product = products.find(p => p.name === name)
      return total + (product ? product.price * quantity : 0)
    }, 0)
  }, [cart])

  const cartItemCount = useMemo(() => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }, [cart])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '${themeColors.background}' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '${themeColors.primary}' }}>
                ${config.name}
              </h1>
              <p className="text-gray-600">${config.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">${config.location}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '${themeColors.primary}', color: '${themeColors.primary}' }}>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '${themeColors.primary}' }}>
            ${config.category.charAt(0).toUpperCase() + config.category.slice(1)} Collection
          </h2>
          <p className="text-gray-600">Discover our curated selection of premium products</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(product.name)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart className={\`h-4 w-4 \${favorites[product.name] ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`} />
                </button>
                <button className="absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2" style={{ color: '${themeColors.primary}' }}>
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold" style={{ color: '${themeColors.accent}' }}>
                    {product.price} USDC
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {cart[product.name] > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(product.name)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium min-w-[20px] text-center">{cart[product.name]}</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.name)}
                      className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '${themeColors.primary}' }}
                    >
                      <Plus className="h-4 w-4 mr-1 inline" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-medium">{cartItemCount} item(s) in cart</p>
              <p className="text-lg font-bold" style={{ color: '${themeColors.accent}' }}>
                Total: {cartTotal.toFixed(2)} USDC
              </p>
            </div>
            <button
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '${themeColors.primary}' }}
              onClick={() => {
                alert('Checkout functionality would be integrated with crypto payment providers here!')
              }}
            >
              Checkout with Crypto
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '${themeColors.primary}' }}>
              ${config.name}
            </h3>
            <p className="text-gray-600 mb-4">${config.description}</p>
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>${config.location}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Built with StoreForge • Accepting USDC & ETH payments
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}`
  }

  generatePackageJson(config: SimpleStoreConfig): string {
    return JSON.stringify({
      name: config.name.toLowerCase().replace(/\s+/g, '-'),
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
        next: '^14.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        'lucide-react': '^0.294.0',
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
      keywords: ['ecommerce', 'nextjs', 'react', 'crypto', 'storeforge'],
      author: 'StoreForge AI',
      license: 'MIT',
    }, null, 2)
  }

  generateReadme(config: SimpleStoreConfig): string {
    return `# ${config.name}

${config.description}

## 🚀 Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛍️ Products

${config.products.map((product, index) => `${index + 1}. **${product.name}** - $${product.price} USDC`).join('\n')}

## 📍 Location

- **Store Location**: ${config.location}
- **Category**: ${config.category}
- **Theme**: ${config.theme}

## 💳 Payment Methods

- USDC (USD Coin)
- ETH (Ethereum)

## 🎨 Features

- ✅ Responsive design
- ✅ Shopping cart functionality
- ✅ Favorites system
- ✅ Product ratings
- ✅ Crypto payment ready
- ✅ Modern ${config.theme} theme

## 🌐 Deployment

This store is ready to deploy to any platform:

1. **Vercel** (Recommended):
   - Connect your GitHub repository
   - Deploy automatically

2. **Netlify**:
   - Drag and drop your build folder

3. **Traditional hosting**:
   - Run \`npm run build\`
   - Upload the \`.next\` folder

## 📄 License

MIT License - Built with StoreForge AI

---

**Generated by StoreForge** - Zero-code store builder for crypto-commerce`
  }
}