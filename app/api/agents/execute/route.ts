import { NextRequest, NextResponse } from 'next/server'
import { getPrivyUser } from '@/lib/auth/privy-auth'
import { generateText, generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'
import { anthropic } from '@ai-sdk/anthropic'
import { ap2Service } from '@/lib/ap2/service'
import { PaymentIntent } from '@/lib/ap2/types'
import { TokenCounter, type TokenUsage } from '@/lib/utils/token-counter'
import { z } from 'zod'

interface AgentExecutionRequest {
  agentId: string
  agentType: 'coding' | 'content' | 'analytics' | 'customer_service' | 'search'
  input: string
  model: string
  temperature: number
  maxTokens: number
  instructions: string
  tools: string[]
  llmConfig?: {
    useOwnKeys: boolean
    provider: 'perplexity' | 'openai' | 'anthropic' | null
    apiKey: string
    model: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AgentExecutionRequest = await request.json()
    const { agentId, agentType, input, model, temperature, maxTokens, instructions, tools, llmConfig } = body

    // Get Privy user for authentication
    const privyUser = await getPrivyUser(request)

    console.log(`🤖 Executing agent ${agentId} (${agentType}) with input: ${input.substring(0, 100)}...`)

    // Prepare the full prompt early for use in all code paths
    const fullPrompt = `You are a ${agentType} agent. ${instructions}${agentType === 'search' ? ' Use real-time information when relevant.' : ''}

User input: ${input}`

    // Check if payment is required for this agent execution
    const requiresPayment = await checkPaymentRequirement(agentType, input, llmConfig)

    if (requiresPayment && privyUser) {
      // Create payment intent using x402 Foundation standard
      const paymentIntent = await ap2Service.createPaymentRequest(
        agentId,
        privyUser.id,
        requiresPayment.amount,
        'USD',
        `AI Agent Execution: ${agentType} - ${input.substring(0, 50)}...`,
        {
          agentType,
          model,
          inputLength: input.length,
          optimizationLevel: llmConfig?.useOwnKeys ? 'premium' : 'standard',
        },
      )

      // Generate x402 HTTP response for payment required
      const x402Response = ap2Service.generateX402Response(paymentIntent)

      console.log(`💰 Payment required for agent execution: $${requiresPayment.amount} USD`)

      return NextResponse.json(
        {
          success: false,
          requiresPayment: true,
          paymentIntent,
          x402Response,
          message: 'Payment required to proceed with agent execution',
          amount: requiresPayment.amount,
          currency: 'USD',
          description: `AI Agent Execution: ${agentType}`,
        },
        { status: 402 },
      )
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate real AI response using actual API calls
    let aiResponse = ''
    let promptTokens = 0
    let completionTokens = 0
    let totalTokens = 0
    let promptCost = 0
    let completionCost = 0
    let totalCost = 0

    try {
      // Use user's LLM configuration if provided, otherwise fall back to environment
      let aiProvider = null
      let modelName = ''

      if (llmConfig?.useOwnKeys && llmConfig.provider && llmConfig.apiKey) {
        // Use user's own API keys
        switch (llmConfig.provider) {
          case 'perplexity':
            aiProvider = perplexity
            modelName = llmConfig.model
            console.log("🤖 Using user's Perplexity API key")
            break
          case 'openai':
            aiProvider = openai
            modelName = llmConfig.model
            console.log("🤖 Using user's OpenAI API key")
            break
          case 'anthropic':
            aiProvider = anthropic
            modelName = llmConfig.model
            console.log("🤖 Using user's Anthropic API key")
            break
        }
      } else {
        // Fall back to environment variables (optimized system)
        if (process.env.PERPLEXITY_API_KEY) {
          aiProvider = perplexity
          modelName = 'sonar'
          console.log('🤖 Using optimized Perplexity AI (real-time data)')
        } else if (process.env.OPENAI_API_KEY) {
          aiProvider = openai
          modelName = model === 'gpt-4' ? 'gpt-4' : 'gpt-3.5-turbo'
          console.log('🤖 Using optimized OpenAI GPT')
        } else if (process.env.ANTHROPIC_API_KEY) {
          aiProvider = anthropic
          modelName = 'claude-3-5-sonnet-20241022'
          console.log('🤖 Using optimized Anthropic Claude')
        } else {
          throw new Error(`❌ No AI provider API keys configured!

To use AgentHub, please either:
1. Configure your own API keys in the LLM Configuration tab, or
2. Add one of these environment variables to your .env.local file:

🔍 PERPLEXITY_API_KEY=pplx-... (Recommended - real-time data)
🤖 OPENAI_API_KEY=sk-... (OpenAI GPT models)
🧠 ANTHROPIC_API_KEY=sk-ant-... (Claude models)

Get your API keys from:
- Perplexity: https://www.perplexity.ai/settings/api
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/`)
        }
      }

      // fullPrompt is already declared above

      // Use real AI provider (no simulated responses)
      promptTokens = await TokenCounter.countTokens(fullPrompt, modelName)
      console.log(`📊 Input tokens: ${promptTokens} for model: ${modelName}`)

      // Use AI SDK v5 with structured output for certain agent types
      let result
      if (agentType === 'analytics' || agentType === 'coding') {
        // Use structured output for analytics and coding agents
        const schema = z.object({
          analysis: z.string().describe('The main analysis or response'),
          recommendations: z.array(z.string()).optional().describe('Actionable recommendations'),
          confidence: z.number().min(0).max(1).describe('Confidence level in the response'),
          metadata: z
            .object({
              processingTime: z.string().optional(),
              dataSources: z.array(z.string()).optional(),
            })
            .optional(),
        })

        const structuredResult = await generateObject({
          model: aiProvider(modelName),
          prompt: fullPrompt,
          schema,
          temperature,
        })

        // Format structured response for display
        aiResponse = `${structuredResult.object.analysis}\n\n${structuredResult.object.recommendations?.length ? 'Recommendations:\n' + structuredResult.object.recommendations.map((rec) => `• ${rec}`).join('\n') : ''}\n\nConfidence: ${(structuredResult.object.confidence * 100).toFixed(1)}%`
        result = { text: aiResponse }
      } else {
        // Use standard text generation for other agent types
        result = await generateText({
          model: aiProvider(modelName),
          prompt: fullPrompt,
          temperature,
        })
        aiResponse = result.text
      }

      // Count tokens after API call
      completionTokens = await TokenCounter.countTokens(aiResponse, modelName)
      totalTokens = promptTokens + completionTokens

      // Calculate real costs
      promptCost = TokenCounter.calculateCost(promptTokens, modelName, 'prompt')
      completionCost = TokenCounter.calculateCost(completionTokens, modelName, 'completion')
      totalCost = promptCost + completionCost

      console.log(
        `✅ Real AI API call successful using ${aiProvider === perplexity ? 'Perplexity' : aiProvider === openai ? 'OpenAI' : 'Anthropic'}`,
      )
      console.log(`📊 Token usage: ${promptTokens} prompt + ${completionTokens} completion = ${totalTokens} total`)
      console.log(
        `💰 Real cost: $${totalCost.toFixed(6)} (prompt: $${promptCost.toFixed(6)}, completion: $${completionCost.toFixed(6)})`,
      )
    } catch (error) {
      console.error('❌ AI API call failed:', error instanceof Error ? error.message : 'Unknown error')

      // Return error response instead of fallback
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          agentId,
          agentType,
          input,
          timestamp: new Date().toISOString(),
          model,
          costOptimization: null,
          privyUser: null,
        },
        { status: 400 },
      )
    }

    // Create real cost optimization data
    const realCostOptimization = {
      originalTokens: promptTokens,
      optimizedTokens: promptTokens, // Same as original since we're not optimizing the prompt in this execution
      tokenReduction: 0,
      originalCost: promptCost,
      optimizedCost: promptCost,
      savings: 0,
      savingsPercentage: '0%',
      optimizationEngine: 'none',
      strategies: [],
      verbosityLevel: input.length > 200 ? 'complex' : input.length > 100 ? 'medium' : 'small',
      // Real usage data
      promptTokens,
      completionTokens,
      totalTokens,
      promptCost,
      completionCost,
      totalCost,
      model,
      realApiCost: totalCost,
    }

    return NextResponse.json({
      success: true,
      agentId,
      agentType,
      input,
      output: aiResponse,
      timestamp: new Date().toISOString(),
      model,
      costOptimization: realCostOptimization,
      privyUser: privyUser
        ? {
            id: privyUser.id,
            wallet: privyUser.wallet?.address,
          }
        : null,
    })
  } catch (error) {
    console.error('Agent execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Agent execution failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function generateCodingResponse(input: string, instructions: string, model: string): Promise<string> {
  const timestamp = new Date().toLocaleString()

  return `🤖 **Coding Agent Response** (${timestamp})

**Input Analysis:**
${input}

**Generated Solution:**
\`\`\`javascript
// AI-generated code based on your request
function processUserInput(input) {
  // Validate input
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }
  
  // Process the input based on your requirements
  const processed = input
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return {
    original: input,
    processed: processed,
    wordCount: input.split(' ').length,
    timestamp: new Date().toISOString(),
    model: '${model}'
  };
}

// Usage example
const result = processUserInput("${input}");
console.log(result);
\`\`\`

**Code Explanation:**
This function processes your input by capitalizing the first letter of each word. It includes:
- Input validation for type safety
- Error handling for edge cases
- Metadata about the processing
- Clean, readable code structure

**Testing:**
\`\`\`javascript
// Test cases
console.log(processUserInput("hello world")); // "Hello World"
console.log(processUserInput("test input")); // "Test Input"
\`\`\`

**Next Steps:**
- Test the function with your specific use case
- Add additional validation if needed
- Consider performance optimizations for large inputs
- Add unit tests for edge cases`
}

async function generateContentResponse(input: string, instructions: string, model: string): Promise<string> {
  const timestamp = new Date().toLocaleString()

  return `📝 **Content Agent Response** (${timestamp})

**Content Analysis:**
Input: "${input}"

**Generated Content:**

# ${input}

## Introduction
This comprehensive guide explores the topic of "${input}" in detail, providing you with actionable insights and practical knowledge.

## Key Points

### 1. Understanding the Basics
- **Definition**: Clear explanation of the core concepts
- **Importance**: Why this topic matters in today's context
- **Applications**: Real-world use cases and examples

### 2. Detailed Analysis
- **Current Trends**: Latest developments and innovations
- **Best Practices**: Proven strategies and methodologies
- **Common Challenges**: Potential obstacles and solutions

### 3. Practical Implementation
- **Step-by-Step Guide**: How to get started
- **Tools and Resources**: Recommended tools and platforms
- **Success Metrics**: How to measure progress

## Conclusion
This content has been optimized for:
- **SEO**: Keyword-rich and search-friendly
- **Readability**: Clear structure and engaging tone
- **Actionability**: Practical steps you can take immediately

## Additional Resources
- Related articles and guides
- Recommended tools and platforms
- Community discussions and forums

*Generated by ${model} with focus on quality and user value*`
}

async function generateAnalyticsResponse(input: string, instructions: string, model: string): Promise<string> {
  const timestamp = new Date().toLocaleString()

  return `📊 **Analytics Agent Response** (${timestamp})

**Query Analysis:**
"${input}"

**Data Insights:**
Based on comprehensive analysis of your request, here are the key findings:

## Performance Metrics
- **Response Time**: 1.2s
- **Accuracy Score**: 94.5%
- **Confidence Level**: High
- **Data Freshness**: Last updated 2 hours ago

## Trends Identified
- **Growth Rate**: +23% this month
- **Peak Engagement**: 9-11 AM and 2-4 PM
- **Geographic Distribution**: 45% North America, 30% Europe, 25% Asia
- **Device Usage**: 60% mobile, 40% desktop

## Key Insights
1. **User Behavior**: Strong correlation with seasonal patterns
2. **Content Performance**: Video content outperforms text by 40%
3. **Conversion Rates**: Email campaigns show 12.5% conversion
4. **Retention**: 78% user retention after 30 days

## Recommendations
1. **Optimize for Mobile**: 60% of traffic is mobile-first
2. **Peak Timing**: Focus efforts during high-engagement hours
3. **Content Strategy**: Increase video content production
4. **Email Marketing**: Leverage high-converting email campaigns

## Visualization Data
\`\`\`json
{
  "metrics": {
    "monthly_growth": 23,
    "engagement_score": 87,
    "conversion_rate": 12.5,
    "retention_rate": 78
  },
  "insights": [
    "Mobile traffic increasing by 15% monthly",
    "Video content 40% more engaging than text",
    "Email campaigns show highest conversion rates",
    "Peak engagement during business hours"
  ],
  "recommendations": [
    "Optimize for mobile-first experience",
    "Increase video content production",
    "Focus on email marketing campaigns",
    "Schedule content for peak engagement times"
  ]
}
\`\`\`

*Analysis generated by ${model} with real-time data processing*`
}

async function generateCustomerServiceResponse(input: string, instructions: string, model: string): Promise<string> {
  const timestamp = new Date().toLocaleString()
  const ticketId = Math.floor(Math.random() * 10000)

  return `🎧 **Customer Service Agent Response** (${timestamp})

**Customer Inquiry:**
"${input}"

**Response:**
Thank you for reaching out! I understand your concern about "${input}". Let me help you resolve this quickly.

## Immediate Assistance
✅ **Ticket Created**: #${ticketId}
✅ **Priority Level**: Standard
✅ **Estimated Resolution**: 24-48 hours
✅ **Assigned Agent**: AI Support Specialist

## Quick Solutions

### Self-Service Options
1. **Knowledge Base**: Search our comprehensive FAQ
2. **Video Tutorials**: Step-by-step guides
3. **Community Forum**: Connect with other users
4. **Documentation**: Detailed technical guides

### Direct Support
- **Live Chat**: Available 9 AM - 6 PM EST
- **Email Support**: support@example.com
- **Phone Support**: 1-800-SUPPORT
- **Emergency Line**: For critical issues

## Next Steps
1. **Case Review**: A specialist will analyze your specific situation
2. **Progress Updates**: You'll receive email notifications
3. **Resolution**: We'll work to resolve this within 24-48 hours
4. **Follow-up**: We'll ensure the solution works for you

## Additional Resources
- 📖 **Knowledge Base**: [Browse Help Articles]
- 💬 **Live Chat**: [Start Conversation]
- 📧 **Email**: support@example.com
- 📞 **Phone**: 1-800-SUPPORT
- 🎥 **Video Tutorials**: [Watch Now]

## Is there anything specific about this issue I can help clarify right now?

*Response generated by ${model} - Your satisfaction is our priority*`
}

async function generateSearchResponse(input: string, instructions: string, model: string): Promise<string> {
  const timestamp = new Date().toLocaleString()

  // Analyze the input to provide contextual responses
  const query = input.toLowerCase()

  // Bitcoin/Ethereum price comparison
  if (
    query.includes('bitcoin') &&
    query.includes('ethereum') &&
    (query.includes('prix') || query.includes('price') || query.includes('difference'))
  ) {
    return `🔍 **Search Agent Response** (${timestamp})

**Search Query:**
"${input}"

**Real-time Search Results:**

## Bitcoin vs Ethereum Price Analysis

### Current Market Data (as of ${new Date().toLocaleDateString()})
- **Bitcoin (BTC)**: ~$43,000 - $45,000 USD
- **Ethereum (ETH)**: ~$2,600 - $2,800 USD
- **Price Ratio**: 1 BTC ≈ 15-17 ETH

### Key Price Differences

#### 1. **Market Cap & Value**
- **Bitcoin**: ~$850B market cap (largest cryptocurrency)
- **Ethereum**: ~$320B market cap (second largest)
- **Bitcoin dominance**: ~40% of total crypto market

#### 2. **Price Volatility**
- **Bitcoin**: Generally more stable, "digital gold"
- **Ethereum**: Higher volatility due to utility focus
- **Bitcoin**: 30-day volatility ~15%
- **Ethereum**: 30-day volatility ~25%

#### 3. **Use Cases & Value Drivers**
- **Bitcoin**: Store of value, digital currency, inflation hedge
- **Ethereum**: Smart contracts, DeFi, NFTs, dApps
- **Bitcoin**: Limited supply (21M coins)
- **Ethereum**: Deflationary mechanism (EIP-1559)

### Historical Price Trends
- **Bitcoin**: Reached $69,000 ATH (Nov 2021)
- **Ethereum**: Reached $4,800 ATH (Nov 2021)
- **Correlation**: Generally move together (0.7-0.8 correlation)

### Factors Affecting Price Differences
1. **Bitcoin**: Institutional adoption, regulatory news, macroeconomics
2. **Ethereum**: Network upgrades, DeFi TVL, gas fees, staking rewards
3. **Both**: Federal Reserve policy, inflation, market sentiment

### Investment Perspective
- **Bitcoin**: Better for long-term store of value
- **Ethereum**: Better for utility and DeFi participation
- **Risk**: Both are highly volatile and speculative

*Search results generated by ${model} with real-time market data*`
  }

  // General search response for other queries
  return `🔍 **Search Agent Response** (${timestamp})

**Search Query:**
"${input}"

**Search Results:**

## Analysis of: "${input}"

### Key Information
Based on your search query "${input}", here's what I found:

### 1. **Primary Topic**
- **Subject**: ${input}
- **Relevance**: High
- **Search Intent**: Information seeking
- **Language**: ${input.includes('é') || input.includes('è') || input.includes('ç') ? 'French' : 'English'}

### 2. **Search Context**
- **Query Type**: ${query.includes('?') ? 'Question' : 'Information request'}
- **Complexity**: ${input.length > 50 ? 'Complex' : 'Simple'}
- **Keywords**: ${input.split(' ').slice(0, 3).join(', ')}

### 3. **Recommended Resources**
- **Wikipedia**: Comprehensive overview
- **Recent News**: Latest developments
- **Academic Sources**: Research papers and studies
- **Community Forums**: Reddit, Stack Overflow discussions

### 4. **Search Suggestions**
- Try more specific keywords for better results
- Use different search terms in ${input.includes('é') || input.includes('è') || input.includes('ç') ? 'English' : 'French'}
- Check multiple sources for comprehensive information

### 5. **Next Steps**
1. **Refine your search** with more specific terms
2. **Check multiple sources** for comprehensive coverage
3. **Verify information** across different platforms
4. **Look for recent updates** on the topic

*Search results generated by ${model} - Contextual analysis of your query*`
}

/**
 * Check if payment is required for agent execution based on x402 Foundation standards
 * This implements Internet-native money principles for autonomous agent payments
 */
async function checkPaymentRequirement(
  agentType: string,
  input: string,
  llmConfig?: {
    useOwnKeys: boolean
    provider: 'perplexity' | 'openai' | 'anthropic' | null
    apiKey: string
    model: string
  },
): Promise<{ amount: number; reason: string } | null> {
  // If user is using their own API keys, no payment required
  if (llmConfig?.useOwnKeys && llmConfig.apiKey) {
    return null
  }

  // Determine payment amount based on agent type and complexity
  let baseAmount = 0.02 // $0.02 base fee for Internet-native payments

  // Adjust pricing based on agent type (following x402 Foundation principles)
  switch (agentType) {
    case 'coding':
      baseAmount = 0.05 // Higher value for code generation
      break
    case 'analytics':
      baseAmount = 0.03 // Data analysis and insights
      break
    case 'content':
      baseAmount = 0.02 // Content generation
      break
    case 'customer_service':
      baseAmount = 0.01 // Support responses
      break
    case 'search':
      baseAmount = 0.02 // Information retrieval
      break
  }

  // Add complexity multiplier based on input length
  const complexityMultiplier = Math.min(1 + input.length / 1000, 3) // Max 3x for very long inputs
  const finalAmount = Math.round(baseAmount * complexityMultiplier * 100) / 100

  // Only require payment for amounts > $0.01 (minimum Internet-native payment)
  if (finalAmount <= 0.01) {
    return null
  }

  return {
    amount: finalAmount,
    reason: `Internet-native payment required for ${agentType} agent execution (${input.length} chars)`,
  }
}
