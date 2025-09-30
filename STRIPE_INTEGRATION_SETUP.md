# Stripe Integration Setup Guide

## Overview
Verclibase now supports both **x402 Protocol** and **Stripe Payments** from the [Vercel Marketplace](https://vercel.com/changelog/stripe-is-now-available-in-beta-on-the-vercel-marketplace), giving users the choice between traditional card payments and next-gen crypto payments.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook verification (production)

# Existing x402 Configuration (keep these)
COINBASE_CDP_CLIENT_ID=your_client_id
COINBASE_CDP_API_KEY_ID=your_api_key_id
COINBASE_CDP_API_KEY_SECRET=your_api_key_secret
COINBASE_CDP_WALLET_SECRET=your_wallet_secret
BASE_SEPOLIA_RPC_URL=your_base_sepolia_rpc
BASE_PRIVATE_KEY=your_base_private_key
```

## Getting Stripe Keys

### 1. Via Vercel Marketplace (Recommended)
1. Go to [Vercel Marketplace](https://vercel.com/marketplace)
2. Find "Stripe" and click "Add Integration"
3. Follow the setup wizard
4. Copy the generated keys to your environment variables

### 2. Direct from Stripe Dashboard
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers > API Keys
3. Copy your **Secret key** and **Publishable key**
4. Add them to your environment variables

## Payment Method Comparison

| Feature | Stripe | x402 Protocol |
|---------|--------|---------------|
| **Payment Types** | Cards, Apple Pay, Google Pay | Crypto wallets, Base network |
| **Micropayments** | Limited (minimum fees) | Excellent (gas-free) |
| **Setup Time** | 5 minutes | 10 minutes |
| **Fees** | 2.9% + $0.30 | Free gas fees |
| **Reversibility** | Yes (chargebacks) | No (irreversible) |
| **Best For** | Traditional e-commerce | AI agents, micro-payments |

## Usage

### In ACP Demo
1. Search for products
2. Click "Choose Payment Method"
3. Select either **Stripe** or **x402**
4. Complete checkout with your chosen method

### API Endpoints

#### Stripe Checkout
```bash
POST /api/stripe/checkout
{
  "items": [
    {
      "id": "product_1",
      "name": "Premium T-Shirt",
      "price": 29.99,
      "quantity": 1,
      "currency": "usd"
    }
  ],
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

#### x402 Payment (existing)
```bash
POST /api/x402/payment
{
  "amount": 29.99,
  "currency": "USD",
  "description": "Premium T-Shirt"
}
```

## Benefits

### For Users
- **Choice**: Select the payment method that works best for their use case
- **Flexibility**: Traditional cards or modern crypto payments
- **Convenience**: Both methods integrated seamlessly

### For Developers
- **Vercel Integration**: Stripe available directly from Vercel Marketplace
- **Unified API**: Both payment methods accessible through consistent interfaces
- **Production Ready**: Both systems tested and production-ready

## Production Deployment

1. **Vercel**: Stripe integration available in beta on Vercel Marketplace
2. **Environment Variables**: Add Stripe keys to Vercel project settings
3. **Webhooks**: Configure Stripe webhooks for production events
4. **Testing**: Use Stripe test mode for development

## Support

- **Stripe**: [Stripe Documentation](https://stripe.com/docs)
- **Vercel Marketplace**: [Stripe on Vercel](https://vercel.com/changelog/stripe-is-now-available-in-beta-on-the-vercel-marketplace)
- **x402**: [Coinbase x402 Documentation](https://docs.coinbase.com/x402)

---

*Both payment methods are now live and ready for production use!* 🚀
