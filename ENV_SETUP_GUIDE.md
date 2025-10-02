# Environment Variables Setup Guide

## Current Status
✅ Vertex AI API Key is already configured in your `.env.local` file

## Manual Setup (if needed)

### 1. Create/Edit `.env.local` file
```bash
# Create the file if it doesn't exist
touch .env.local
```

### 2. Add these environment variables:
```env
# Google API Key for AP2 integration (Development)
GOOGLE_API_KEY=AIzaSyB6Ks3Ts_PRDdv0n5sET0VRq6J__JJdBRs

# Vertex AI Configuration (Production)
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
VERTEX_AI_API_KEY=AQ.Ab8RN6KSpJLoDBjAX0DNGOFag6OA5FYb2sHhcHniNDUmvGtLxw

# Add your other environment variables here
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
# PERPLEXITY_API_KEY=your_perplexity_key
# BASE_RPC_URL=https://mainnet.base.org
# AGENT_WALLET_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
```

### 3. Update Project ID
Your Google Cloud Project ID has been set to: `index-472923`
```env
GOOGLE_CLOUD_PROJECT=index-472923
```

## Verification

### Check if variables are loaded:
```bash
# Check environment variables
node -e "console.log('Vertex AI Key:', process.env.VERTEX_AI_API_KEY ? '✅ Set' : '❌ Not set')"
```

### Test AP2 Configuration:
1. Visit: http://localhost:3000/ap2-config
2. Check status indicators
3. Verify Vertex AI is connected

### Test AP2 Payments:
1. Visit: http://localhost:3000/ap2-demo
2. Create a test payment
3. Verify Vertex AI authentication

## Troubleshooting

### If variables aren't loading:
1. **Restart development server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Check file location:**
   ```bash
   # Make sure .env.local is in project root
   ls -la .env.local
   ```

3. **Verify file format:**
   ```bash
   # Check file contents
   cat .env.local
   ```

### If AP2 isn't working:
1. Check `/ap2-config` page for status
2. Verify all environment variables are set
3. Check browser console for errors
4. Restart development server

## Production Deployment

### For Vercel deployment:
1. Add environment variables in Vercel dashboard
2. Set `GOOGLE_GENAI_USE_VERTEXAI=true`
3. Set `VERTEX_AI_API_KEY=your-key`
4. Set `GOOGLE_CLOUD_PROJECT=your-project-id`

### For other platforms:
- Add the same environment variables to your deployment platform
- Ensure Vertex AI API key has proper permissions
- Test in production environment
