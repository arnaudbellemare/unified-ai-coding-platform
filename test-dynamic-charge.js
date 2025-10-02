#!/usr/bin/env node

/**
 * Dynamic Charge Testing Script
 * Tests various scenarios for the dynamic charge API
 */

const BASE_URL = 'http://localhost:3001'

// Test scenarios
const testScenarios = [
  {
    name: 'Basic USDC Payment',
    payload: {
      amount: 25.99,
      currency: 'USDC',
      metadata: {
        product: 'Basic AI Tool',
        ai_agent_optimized: true
      }
    }
  },
  {
    name: 'Enterprise Subscription',
    payload: {
      amount: 299.99,
      currency: 'USDC',
      metadata: {
        product: 'Enterprise AI Platform',
        ai_agent_optimized: true,
        geo_tracked: true,
        subscription_type: 'annual',
        seats: 50
      }
    }
  },
  {
    name: 'Dynamic Pricing with Discount',
    payload: {
      amount: 79.99,
      currency: 'USDC',
      metadata: {
        product: 'Premium Analytics',
        ai_agent_optimized: true,
        geo_tracked: true,
        original_price: 99.99,
        discount_percentage: 20,
        discount_code: 'SAVE20'
      }
    }
  },
  {
    name: 'AI Agent Optimized Purchase',
    payload: {
      amount: 149.99,
      currency: 'USDC',
      metadata: {
        product: 'AI-Powered E-commerce Suite',
        ai_agent_optimized: true,
        geo_tracked: true,
        agent_source: 'chatgpt',
        session_id: 'ai_session_123',
        user_intent: 'ecommerce_optimization'
      }
    }
  }
]

async function testDynamicCharge() {
  console.log('🧪 Testing Dynamic Charge API\n')
  console.log('=' * 50)
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`)
    console.log('-'.repeat(30))
    
    try {
      // Test charge creation
      const createResponse = await fetch(`${BASE_URL}/api/create-dynamic-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario.payload)
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP ${createResponse.status}: ${createResponse.statusText}`)
      }
      
      const charge = await createResponse.json()
      console.log('✅ Charge Created Successfully')
      console.log(`   ID: ${charge.id}`)
      console.log(`   Amount: ${charge.local_price.amount} ${charge.local_price.currency}`)
      console.log(`   Status: ${charge.status}`)
      console.log(`   URL: ${charge.hosted_url}`)
      console.log(`   AI Optimized: ${charge.metadata.ai_agent_optimized}`)
      console.log(`   GEO Tracked: ${charge.metadata.geo_tracked}`)
      
      // Test charge retrieval
      const retrieveResponse = await fetch(`${BASE_URL}/api/create-dynamic-charge?charge_id=${charge.id}`)
      
      if (retrieveResponse.ok) {
        const retrievedCharge = await retrieveResponse.json()
        console.log('✅ Charge Retrieved Successfully')
        console.log(`   Status: ${retrievedCharge.status}`)
        console.log(`   Payments: ${retrievedCharge.payments?.length || 0}`)
      } else {
        console.log('⚠️  Charge retrieval failed')
      }
      
    } catch (error) {
      console.log(`❌ Test Failed: ${error.message}`)
    }
  }
  
  console.log('\n🎯 Testing Error Scenarios')
  console.log('-'.repeat(30))
  
  // Test error scenarios
  const errorScenarios = [
    {
      name: 'Missing Amount',
      payload: { currency: 'USDC' }
    },
    {
      name: 'Invalid Amount',
      payload: { amount: 'invalid', currency: 'USDC' }
    },
    {
      name: 'Missing Currency',
      payload: { amount: 50 }
    }
  ]
  
  for (const scenario of errorScenarios) {
    console.log(`\n📋 Testing Error: ${scenario.name}`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/create-dynamic-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario.payload)
      })
      
      if (response.ok) {
        console.log('⚠️  Expected error but got success')
      } else {
        const error = await response.json()
        console.log(`✅ Error handled correctly: ${error.error}`)
      }
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.message}`)
    }
  }
  
  console.log('\n🎉 Dynamic Charge Testing Complete!')
}

// Test AI Agent Interaction Tracking
async function testAIAgentTracking() {
  console.log('\n🤖 Testing AI Agent Interaction Tracking\n')
  console.log('=' * 50)
  
  const trackingScenarios = [
    {
      name: 'ChatGPT Agent Visit',
      payload: {
        event: 'page_load',
        timestamp: new Date().toISOString(),
        sessionId: 'chatgpt_session_001',
        agentSource: 'chatgpt',
        checkoutData: {
          product: 'AI Analytics Tool',
          amount: '99.99'
        },
        geoOptimized: true,
        url: `${BASE_URL}/store/demo-checkout`
      }
    },
    {
      name: 'Payment Attempt',
      payload: {
        event: 'payment_attempt',
        timestamp: new Date().toISOString(),
        sessionId: 'chatgpt_session_001',
        agentSource: 'chatgpt',
        checkoutData: {
          product: 'AI Analytics Tool',
          amount: '99.99',
          walletType: 'metamask'
        },
        geoOptimized: true,
        url: `${BASE_URL}/store/demo-checkout`
      }
    },
    {
      name: 'Payment Success',
      payload: {
        event: 'payment_success',
        timestamp: new Date().toISOString(),
        sessionId: 'chatgpt_session_001',
        agentSource: 'chatgpt',
        checkoutData: {
          product: 'AI Analytics Tool',
          amount: '99.99',
          transactionId: 'txn_123456'
        },
        geoOptimized: true,
        url: `${BASE_URL}/store/demo-checkout`
      }
    }
  ]
  
  for (const scenario of trackingScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/track-ai-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario.payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Tracking Success')
        console.log(`   Event: ${scenario.payload.event}`)
        console.log(`   Agent: ${scenario.payload.agentSource}`)
        console.log(`   Session: ${result.sessionId}`)
      } else {
        console.log('❌ Tracking Failed')
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
  }
}

// Main test execution
async function runAllTests() {
  try {
    await testDynamicCharge()
    await testAIAgentTracking()
  } catch (error) {
    console.error('Test execution failed:', error)
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}

export {
  testDynamicCharge,
  testAIAgentTracking,
  runAllTests
}
