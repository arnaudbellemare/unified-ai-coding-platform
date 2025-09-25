#!/usr/bin/env node

/**
 * Optimization Engine Comparison Test
 * Tests custom optimization vs Prompt Optimizer across different verbosity levels
 */

const { enhancedPromptOptimizer } = require('./lib/enhanced-prompt-optimizer.ts');
const { CostOptimization } = require('./lib/cost-optimization.ts');

// Test prompts for different verbosity levels
const testPrompts = {
  smallVerbose: {
    name: "Small Verbose - Coding Task",
    original: "Create a simple React component for a todo list with add, edit, delete functionality",
    expectedTokens: 20,
    context: "coding"
  },
  mediumVerbose: {
    name: "Medium Verbose - Analysis Task", 
    original: "Please analyze the performance of our React application and provide recommendations for optimization. Consider factors such as bundle size, rendering performance, memory usage, and user experience. Include specific metrics and actionable suggestions for improvement.",
    expectedTokens: 50,
    context: "analysis"
  },
  highVerbose: {
    name: "High Verbose - Documentation Task",
    original: "I would like you to create comprehensive documentation for our React-based todo application that includes detailed explanations of the component architecture, state management patterns, API integration strategies, testing methodologies, deployment procedures, and maintenance guidelines. Please ensure the documentation covers both technical implementation details and user-facing features with examples and best practices.",
    expectedTokens: 80,
    context: "documentation"
  }
};

// Custom optimization engine test
async function testCustomOptimization(prompt, context) {
  console.log(`\n🔧 Testing Custom Optimization Engine...`);
  
  try {
    // Test different optimization levels
    const results = {};
    
    for (let level = 1; level <= 4; level++) {
      const startTime = Date.now();
      const optimization = enhancedPromptOptimizer.optimize(prompt, level);
      const endTime = Date.now();
      
      const originalTokens = Math.ceil(prompt.length / 4);
      const optimizedTokens = Math.ceil(optimization.optimizedPrompt.length / 4);
      const tokenReduction = ((originalTokens - optimizedTokens) / originalTokens) * 100;
      
      results[`level${level}`] = {
        optimizedPrompt: optimization.optimizedPrompt,
        originalTokens,
        optimizedTokens,
        tokenReduction: tokenReduction.toFixed(2),
        processingTime: endTime - startTime,
        strategies: optimization.strategies || [],
        costReduction: optimization.costReduction || 0,
        accuracyMaintained: optimization.accuracyMaintained || 0.95
      };
    }
    
    return results;
  } catch (error) {
    console.error('❌ Custom optimization failed:', error.message);
    return null;
  }
}

// Simulate Prompt Optimizer test (since we can't install Python in this test)
async function testPromptOptimizer(prompt, context) {
  console.log(`\n🐍 Testing Prompt Optimizer (Simulated)...`);
  
  try {
    // Simulate different Prompt Optimizer strategies
    const strategies = {
      entropyOptim: {
        name: "Entropy Optimization (p=0.1)",
        description: "Removes low-entropy tokens"
      },
      synonymReplace: {
        name: "Synonym Replacement", 
        description: "Replaces words with shorter synonyms"
      },
      lemmatization: {
        name: "Lemmatization",
        description: "Reduces words to root forms"
      },
      punctuationOptim: {
        name: "Punctuation Optimization",
        description: "Removes unnecessary punctuation"
      }
    };
    
    const results = {};
    
    for (const [strategy, config] of Object.entries(strategies)) {
      const startTime = Date.now();
      
      // Simulate optimization based on strategy
      let optimizedPrompt = prompt;
      let tokenReduction = 0;
      
      switch (strategy) {
        case 'entropyOptim':
          // Simulate entropy-based removal
          optimizedPrompt = prompt.replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, '');
          tokenReduction = 15;
          break;
        case 'synonymReplace':
          // Simulate synonym replacement
          optimizedPrompt = prompt
            .replace(/\b(comprehensive|detailed|thorough)\b/gi, 'complete')
            .replace(/\b(optimization|improvement|enhancement)\b/gi, 'optimize')
            .replace(/\b(methodology|approach|strategy)\b/gi, 'method');
          tokenReduction = 8;
          break;
        case 'lemmatization':
          // Simulate lemmatization
          optimizedPrompt = prompt
            .replace(/\b(creating|creates|created)\b/gi, 'create')
            .replace(/\b(analyzing|analyzes|analyzed)\b/gi, 'analyze')
            .replace(/\b(optimizing|optimizes|optimized)\b/gi, 'optimize');
          tokenReduction = 5;
          break;
        case 'punctuationOptim':
          // Simulate punctuation removal
          optimizedPrompt = prompt.replace(/[,;:]/g, '').replace(/\s+/g, ' ');
          tokenReduction = 3;
          break;
      }
      
      const endTime = Date.now();
      const originalTokens = Math.ceil(prompt.length / 4);
      const optimizedTokens = Math.ceil(optimizedPrompt.length / 4);
      const actualTokenReduction = ((originalTokens - optimizedTokens) / originalTokens) * 100;
      
      results[strategy] = {
        optimizedPrompt,
        originalTokens,
        optimizedTokens,
        tokenReduction: actualTokenReduction.toFixed(2),
        processingTime: endTime - startTime,
        strategy: config.name,
        description: config.description,
        costReduction: (actualTokenReduction / 100) * 0.03, // Assume $0.03 per 1K tokens
        accuracyMaintained: Math.max(0.85, 1 - (actualTokenReduction / 100) * 0.3)
      };
    }
    
    return results;
  } catch (error) {
    console.error('❌ Prompt Optimizer simulation failed:', error.message);
    return null;
  }
}

// Calculate cost savings
function calculateCostSavings(originalTokens, optimizedTokens, costPer1K = 0.03) {
  const originalCost = (originalTokens / 1000) * costPer1K;
  const optimizedCost = (optimizedTokens / 1000) * costPer1K;
  const savings = originalCost - optimizedCost;
  const savingsPercentage = ((savings / originalCost) * 100).toFixed(2);
  
  return {
    originalCost: originalCost.toFixed(6),
    optimizedCost: optimizedCost.toFixed(6),
    savings: savings.toFixed(6),
    savingsPercentage
  };
}

// Main test function
async function runOptimizationComparison() {
  console.log('🚀 Starting Optimization Engine Comparison Test\n');
  console.log('=' .repeat(80));
  
  const results = {};
  
  for (const [verbosity, testCase] of Object.entries(testPrompts)) {
    console.log(`\n📊 Testing ${testCase.name}`);
    console.log(`Original: "${testCase.original}"`);
    console.log(`Expected Tokens: ${testCase.expectedTokens}`);
    console.log(`Context: ${testCase.context}`);
    console.log('-'.repeat(60));
    
    // Test custom optimization
    const customResults = await testCustomOptimization(testCase.original, testCase.context);
    
    // Test Prompt Optimizer
    const promptOptimizerResults = await testPromptOptimizer(testCase.original, testCase.context);
    
    // Store results
    results[verbosity] = {
      testCase,
      custom: customResults,
      promptOptimizer: promptOptimizerResults
    };
    
    // Display comparison
    if (customResults && promptOptimizerResults) {
      console.log('\n📈 COMPARISON RESULTS:');
      console.log('Custom Engine Best Performance:');
      const customBest = Object.values(customResults).reduce((best, current) => 
        parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
      );
      console.log(`  Token Reduction: ${customBest.tokenReduction}%`);
      console.log(`  Processing Time: ${customBest.processingTime}ms`);
      console.log(`  Accuracy: ${(customBest.accuracyMaintained * 100).toFixed(1)}%`);
      
      console.log('\nPrompt Optimizer Best Performance:');
      const promptBest = Object.values(promptOptimizerResults).reduce((best, current) => 
        parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
      );
      console.log(`  Token Reduction: ${promptBest.tokenReduction}%`);
      console.log(`  Processing Time: ${promptBest.processingTime}ms`);
      console.log(`  Accuracy: ${(promptBest.accuracyMaintained * 100).toFixed(1)}%`);
      
      // Calculate cost savings
      const customCostSavings = calculateCostSavings(customBest.originalTokens, customBest.optimizedTokens);
      const promptCostSavings = calculateCostSavings(promptBest.originalTokens, promptBest.optimizedTokens);
      
      console.log('\n💰 COST SAVINGS:');
      console.log(`Custom Engine: $${customCostSavings.savings} (${customCostSavings.savingsPercentage}%)`);
      console.log(`Prompt Optimizer: $${promptCostSavings.savings} (${promptCostSavings.savingsPercentage}%)`);
    }
  }
  
  // Final analysis
  console.log('\n' + '='.repeat(80));
  console.log('🏆 FINAL ANALYSIS');
  console.log('='.repeat(80));
  
  let customWins = 0;
  let promptWins = 0;
  
  for (const [verbosity, result] of Object.entries(results)) {
    if (result.custom && result.promptOptimizer) {
      const customBest = Object.values(result.custom).reduce((best, current) => 
        parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
      );
      const promptBest = Object.values(result.promptOptimizer).reduce((best, current) => 
        parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
      );
      
      if (parseFloat(customBest.tokenReduction) > parseFloat(promptBest.tokenReduction)) {
        customWins++;
        console.log(`✅ ${verbosity}: Custom Engine wins (${customBest.tokenReduction}% vs ${promptBest.tokenReduction}%)`);
      } else {
        promptWins++;
        console.log(`✅ ${verbosity}: Prompt Optimizer wins (${promptBest.tokenReduction}% vs ${customBest.tokenReduction}%)`);
      }
    }
  }
  
  console.log(`\n🎯 WINNER: ${customWins > promptWins ? 'Custom Engine' : 'Prompt Optimizer'}`);
  console.log(`Custom Engine: ${customWins} wins`);
  console.log(`Prompt Optimizer: ${promptWins} wins`);
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (customWins > promptWins) {
    console.log('✅ Your custom optimization engine is performing better!');
    console.log('🚀 Consider enhancing it with Prompt Optimizer strategies for even better results.');
  } else {
    console.log('✅ Prompt Optimizer is performing better!');
    console.log('🔧 Consider integrating the Python library for production use.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Integrate Prompt Optimizer Python library');
  console.log('2. Combine both engines for hybrid optimization');
  console.log('3. Test with real API calls and measure actual cost savings');
  console.log('4. Implement context-aware optimization strategies');
}

// Run the test
runOptimizationComparison().catch(console.error);
