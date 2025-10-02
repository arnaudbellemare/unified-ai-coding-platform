#!/usr/bin/env node

/**
 * AP2 Production Setup Script
 * Configures Vertex AI and AP2 types for production
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envContent = `# Google API Key for AP2 integration (Development)
GOOGLE_API_KEY=AIzaSyB6Ks3Ts_PRDdv0n5sET0VRq6J__JJdBRs

# Vertex AI Configuration (Production)
GOOGLE_GENAI_USE_VERTEXAI=false
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global

# Service Account Authentication (Alternative to gcloud CLI)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json

# Add your other environment variables here
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
# PERPLEXITY_API_KEY=your_perplexity_key
# BASE_RPC_URL=https://mainnet.base.org
# AGENT_WALLET_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
`

async function setupAP2Production() {
  try {
    console.log('🚀 Setting up AP2 Production Configuration...')
    
    // 1. Update environment variables
    const envPath = path.join(__dirname, '..', '.env.local')
    
    if (fs.existsSync(envPath)) {
      const existingContent = fs.readFileSync(envPath, 'utf8')
      
      if (existingContent.includes('GOOGLE_GENAI_USE_VERTEXAI')) {
        console.log('✅ Vertex AI configuration already exists')
      } else {
        fs.appendFileSync(envPath, '\n' + envContent)
        console.log('✅ Added Vertex AI configuration to .env.local')
      }
    } else {
      fs.writeFileSync(envPath, envContent)
      console.log('✅ Created .env.local with AP2 configuration')
    }
    
    // 2. Install AP2 types package
    console.log('📦 Installing AP2 types package...')
    try {
      execSync('uv pip install git+https://github.com/google-agentic-commerce/AP2.git@main', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      })
      console.log('✅ AP2 types package installed')
    } catch (error) {
      console.log('⚠️  AP2 types package installation failed (uv not available)')
      console.log('   You can install manually with: uv pip install git+https://github.com/google-agentic-commerce/AP2.git@main')
    }
    
    // 3. Create AP2 scenarios directory
    const scenariosDir = path.join(__dirname, '..', 'ap2-scenarios')
    if (!fs.existsSync(scenariosDir)) {
      fs.mkdirSync(scenariosDir, { recursive: true })
      console.log('✅ Created AP2 scenarios directory')
    }
    
    // 4. Create production configuration guide
    const guideContent = `# AP2 Production Setup Guide

## Option 1: Google API Key (Current - Development)
✅ Already configured with your API key

## Option 2: Vertex AI (Recommended for Production)

### 1. Configure Environment Variables
Add to your .env.local:
\`\`\`
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-actual-project-id
GOOGLE_CLOUD_LOCATION=global
\`\`\`

### 2. Authenticate with Google Cloud
Choose one method:

#### Method A: gcloud CLI
\`\`\`bash
gcloud auth application-default login
\`\`\`

#### Method B: Service Account
\`\`\`bash
export GOOGLE_APPLICATION_CREDENTIALS='/path/to/your/service-account-key.json'
\`\`\`

### 3. Install AP2 Types Package
\`\`\`bash
uv pip install git+https://github.com/google-agentic-commerce/AP2.git@main
\`\`\`

### 4. Run AP2 Scenarios
\`\`\`bash
cd AP2
bash samples/python/scenarios/your-scenario-name/run.sh
\`\`\`

## Current Status
- ✅ Google API Key configured
- ✅ AP2 service implemented
- ✅ Demo page available at /ap2-demo
- ⏳ Vertex AI configuration pending
- ⏳ AP2 types package installation pending
`

    fs.writeFileSync(path.join(scenariosDir, 'README.md'), guideContent)
    console.log('✅ Created AP2 production setup guide')
    
    console.log('\n🎉 AP2 Production Setup Complete!')
    console.log('📖 See ap2-scenarios/README.md for production configuration')
    console.log('🧪 Test AP2 at: http://localhost:3000/ap2-demo')
    
  } catch (error) {
    console.error('❌ Error setting up AP2 production:', error.message)
    process.exit(1)
  }
}

setupAP2Production()
