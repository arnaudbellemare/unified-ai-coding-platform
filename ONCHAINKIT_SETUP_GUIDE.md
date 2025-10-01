# OnchainKit Integration Setup Guide

This guide will help you set up the Coinbase OnchainKit integration for VERCLIBASE, based on the [Coinbase Onchain Commerce Template](https://github.com/coinbase/onchain-commerce-template).

## Prerequisites

1. **Coinbase Developer Account**: Create an account at [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. **Coinbase Commerce Account**: Create an account at [Coinbase Commerce](https://beta.commerce.coinbase.com/)

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# OnchainKit API Key (from Coinbase Developer Portal)
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_onchainkit_api_key"

# Coinbase Commerce API Key (from Coinbase Commerce Dashboard)
COINBASE_COMMERCE_API_KEY="your_coinbase_commerce_api_key"

# App URL (for redirect URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or your production URL
```

## Getting Your API Keys

### 1. OnchainKit API Key

1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Navigate to **Products** → **OnchainKit**
3. Create a new project or select an existing one
4. Copy your API key from the dashboard
5. Add it to your `.env.local` file as `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

### 2. Coinbase Commerce API Key

1. Go to [Coinbase Commerce Dashboard](https://beta.commerce.coinbase.com/)
2. Sign in or create an account
3. Go to **Settings** → **API Keys**
4. Create a new API key
5. Copy the key and add it to your `.env.local` file as `COINBASE_COMMERCE_API_KEY`

## Features Implemented

### ✅ OnchainKit Checkout Component
- Full checkout flow with Coinbase Commerce integration
- Secure payment processing
- Real-time payment status updates
- Automatic cart management

### ✅ Product Catalog
- Base-themed merchandise (caps, hoodies, stickers, etc.)
- Product search and filtering
- Category-based organization
- Rating and review system

### ✅ Shopping Cart
- Add/remove items
- Quantity management
- Real-time total calculation
- Persistent cart state

### ✅ Payment Processing
- OnchainKit Checkout component
- Coinbase Commerce charge creation
- Success/cancel redirect handling
- Transaction confirmation

## File Structure

```
components/
├── onchain-store-template.tsx    # Main store component
└── ...

app/
├── api/
│   └── coinbase-commerce/
│       └── create-charge/
│           └── route.ts          # API route for charge creation
├── store/
│   ├── page.tsx                  # Store page
│   ├── success/
│   │   └── page.tsx             # Payment success page
│   └── cancel/
│       └── page.tsx             # Payment cancel page
└── ...
```

## Testing the Integration

### 1. Local Development
```bash
# Start the development server
npm run dev

# Navigate to http://localhost:3000/store
```

### 2. Test Checkout Flow
1. Add items to cart
2. Click "Pay" button
3. Complete payment in Coinbase Commerce interface
4. Verify redirect to success page

### 3. Production Deployment
1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Ensure API keys are set in your deployment environment
3. Test the complete flow in production

## Customization

### Adding Products
Edit the `products` array in `components/onchain-store-template.tsx`:

```typescript
const products: Product[] = [
  {
    id: 'your-product-id',
    name: 'Your Product Name',
    description: 'Product description',
    price: 29.99,
    currency: 'USD',
    image: '/products/your-image.jpg',
    category: 'Your Category',
    inStock: true,
    rating: 4.8,
    reviewCount: 150
  },
  // ... more products
]
```

### Styling
The component uses Tailwind CSS classes. You can customize:
- Colors and themes
- Layout and spacing
- Component styling
- Responsive breakpoints

### Payment Options
The current implementation uses Coinbase Commerce. You can extend it to support:
- Stripe integration
- x402 payments
- Other payment providers

## Troubleshooting

### Common Issues

1. **"Commerce API key not configured"**
   - Ensure `COINBASE_COMMERCE_API_KEY` is set in your environment
   - Check that the key is valid and has proper permissions

2. **"Failed to create charge"**
   - Verify your Coinbase Commerce account is active
   - Check API key permissions
   - Ensure redirect URLs are properly configured

3. **OnchainKit components not rendering**
   - Verify `NEXT_PUBLIC_ONCHAINKIT_API_KEY` is set
   - Check browser console for errors
   - Ensure you're using the latest version of OnchainKit

### Debug Mode
Enable debug logging by adding to your `.env.local`:
```bash
DEBUG_ONCHAINKIT=true
```

## Resources

- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Coinbase Commerce API](https://commerce.coinbase.com/docs/api/)
- [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
- [Original Template Repository](https://github.com/coinbase/onchain-commerce-template)

## Support

For issues related to:
- **OnchainKit**: Check the [OnchainKit documentation](https://onchainkit.xyz/)
- **Coinbase Commerce**: Contact [Coinbase Commerce support](https://commerce.coinbase.com/support)
- **VERCLIBASE Integration**: Check the project documentation or create an issue
