# Coinbase Commerce Setup for VERCLIBASE

This guide will walk you through setting up Coinbase Commerce integration using Base OnchainKit for your VERCLIBASE application.

## 1. Create a Coinbase Commerce Account

1. **Sign up for Coinbase Commerce**: Visit [commerce.coinbase.com](https://commerce.coinbase.com) and create an account
2. **Complete verification**: Follow the required verification steps for your business
3. **Access your dashboard**: Once verified, you'll have access to the Coinbase Commerce merchant dashboard

## 2. Get Your API Keys

1. **Navigate to Settings**: In your Coinbase Commerce dashboard, go to **Settings** → **API Keys**
2. **Create a new API Key**: Click "Create an API Key"
3. **Copy your API Key**: Save this key securely - you'll need it for the backend integration

## 3. Configure Environment Variables

Add your Coinbase Commerce API key to your environment variables:

### For Local Development (`.env.local`)

```bash
# Coinbase Commerce API Key
COINBASE_COMMERCE_API_KEY=your_commerce_api_key_here
```

### For Vercel Deployment (Production)

1. Go to your Vercel Project Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `COINBASE_COMMERCE_API_KEY`
   - **Value**: Your Coinbase Commerce API Key
   - **Environment**: Production (and Preview if needed)

## 4. Test the Integration

1. **Start your development server**: `npm run dev`
2. **Navigate to the ACP Demo**: Go to the Agentic Commerce Protocol demo section
3. **Search for a product**: Try searching for "blue shirt" or any product
4. **Select Coinbase Commerce**: Choose "Coinbase Commerce" as your payment method
5. **Complete the checkout**: The OnchainKit Checkout component will handle the payment flow

## 5. Features Included

### ✅ What's Already Implemented

- **OnchainKit Integration**: Using the official Base OnchainKit Checkout component
- **Dynamic Charge Creation**: Backend API creates charges dynamically
- **Multiple Cryptocurrencies**: Supports BTC, ETH, USDC, and other supported currencies
- **Real-time Status Updates**: Payment status tracking with success/error handling
- **Responsive UI**: Mobile-friendly checkout experience
- **Error Handling**: Comprehensive error handling and user feedback

### 🎯 Key Benefits

- **Free Gas Fees**: Transactions on Base network have minimal gas costs
- **Instant Settlement**: Payments settle immediately on the blockchain
- **No Chargebacks**: Cryptocurrency payments are irreversible
- **Global Accessibility**: Accept payments from anywhere in the world
- **Transparent Records**: All transactions are recorded on the blockchain

## 6. Customization Options

### Product Configuration

You can customize the checkout experience by modifying the product data:

```typescript
const product = {
  id: 'your-product-id',
  name: 'Your Product Name',
  description: 'Detailed product description',
  price: 29.99,
  currency: 'usd'
}
```

### Styling

The OnchainKit Checkout component can be styled using Tailwind CSS classes:

```typescript
<CheckoutButton 
  className="bg-blue-600 hover:bg-blue-700"
  text="Custom Button Text"
/>
```

## 7. Production Deployment

### Vercel Deployment

1. **Push to GitHub**: Your changes are automatically deployed to Vercel
2. **Set Environment Variables**: Ensure `COINBASE_COMMERCE_API_KEY` is set in Vercel
3. **Test Production**: Visit your deployed site and test the Coinbase Commerce integration

### Monitoring

- **Coinbase Commerce Dashboard**: Monitor all transactions and analytics
- **Vercel Analytics**: Track user interactions and performance
- **Error Logs**: Monitor for any integration issues

## 8. Troubleshooting

### Common Issues

1. **API Key Not Working**: Ensure the API key is correctly set in environment variables
2. **Payment Fails**: Check that your Coinbase Commerce account is fully verified
3. **CORS Errors**: The OnchainKit component handles CORS automatically

### Support Resources

- [Coinbase Commerce Documentation](https://commerce.coinbase.com/docs)
- [Base OnchainKit Documentation](https://docs.base.org/onchainkit)
- [OnchainKit GitHub Repository](https://github.com/coinbase/onchainkit)

## 9. Next Steps

Once your Coinbase Commerce integration is working:

1. **Create Products**: Set up your product catalog in Coinbase Commerce dashboard
2. **Configure Webhooks**: Set up webhooks for real-time payment notifications
3. **Test with Real Cryptocurrency**: Make test purchases with small amounts
4. **Monitor Performance**: Track conversion rates and user experience

This integration provides a robust, production-ready cryptocurrency payment solution that positions your business at the forefront of the onchain commerce revolution!
