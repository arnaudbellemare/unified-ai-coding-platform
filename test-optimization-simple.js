#!/usr/bin/env node

/**
 * Simple Optimization Engine Comparison Test
 * Tests optimization strategies across different verbosity levels
 */

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

// Custom optimization strategies (simulating your engine)
function customOptimize(prompt, level) {
  let optimized = prompt;
  let strategies = [];
  
  switch (level) {
    case 1: // Light optimization
      optimized = prompt
        .replace(/\b(please|kindly|would you|could you)\b/gi, '')
        .replace(/\b(very|really|quite|rather|somewhat|pretty|fairly)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      strategies = ['remove_politeness', 'remove_filler_words'];
      break;
      
    case 2: // Medium optimization
      optimized = prompt
        .replace(/\b(please|kindly|would you|could you|I would like you to)\b/gi, '')
        .replace(/\b(very|really|quite|rather|somewhat|pretty|fairly|absolutely|definitely)\b/gi, '')
        .replace(/\b(comprehensive|detailed|thorough|extensive)\b/gi, 'complete')
        .replace(/\b(optimization|improvement|enhancement)\b/gi, 'optimize')
        .replace(/\s+/g, ' ')
        .trim();
      strategies = ['remove_politeness', 'remove_filler_words', 'synonym_replacement'];
      break;
      
    case 3: // Aggressive optimization
      optimized = prompt
        .replace(/\b(please|kindly|would you|could you|I would like you to|I would really appreciate it if you could)\b/gi, '')
        .replace(/\b(very|really|quite|rather|somewhat|pretty|fairly|absolutely|definitely)\b/gi, '')
        .replace(/\b(comprehensive|detailed|thorough|extensive|complete|full)\b/gi, 'complete')
        .replace(/\b(optimization|improvement|enhancement|better|best)\b/gi, 'optimize')
        .replace(/\b(methodology|approach|strategy|method|way)\b/gi, 'method')
        .replace(/\b(implementation|execution|development|creation)\b/gi, 'build')
        .replace(/\s+/g, ' ')
        .trim();
      strategies = ['remove_politeness', 'remove_filler_words', 'synonym_replacement', 'aggressive_compression'];
      break;
      
    case 4: // Maximum optimization
      optimized = prompt
        .replace(/\b(please|kindly|would you|could you|I would like you to|I would really appreciate it if you could)\b/gi, '')
        .replace(/\b(very|really|quite|rather|somewhat|pretty|fairly|absolutely|definitely)\b/gi, '')
        .replace(/\b(comprehensive|detailed|thorough|extensive|complete|full)\b/gi, 'complete')
        .replace(/\b(optimization|improvement|enhancement|better|best)\b/gi, 'optimize')
        .replace(/\b(methodology|approach|strategy|method|way)\b/gi, 'method')
        .replace(/\b(implementation|execution|development|creation)\b/gi, 'build')
        .replace(/\b(application|app|system|platform)\b/gi, 'app')
        .replace(/\b(component|module|part|section)\b/gi, 'comp')
        .replace(/\s+/g, ' ')
        .trim();
      strategies = ['remove_politeness', 'remove_filler_words', 'synonym_replacement', 'aggressive_compression', 'remove_redundancy'];
      break;
  }
  
  return {
    optimizedPrompt: optimized,
    strategies,
    level
  };
}

// Prompt Optimizer strategies (simulating the Python library)
function promptOptimizerOptimize(prompt, strategy) {
  let optimized = prompt;
  let description = '';
  
  switch (strategy) {
    case 'entropyOptim':
      // Remove low-entropy words (articles, prepositions, etc.)
      optimized = prompt.replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|be|been|being)\b/gi, '');
      description = 'Entropy Optimization - removes low-entropy tokens';
      break;
      
    case 'synonymReplace':
      // Replace with shorter synonyms
      optimized = prompt
        .replace(/\b(comprehensive|detailed|thorough|extensive)\b/gi, 'complete')
        .replace(/\b(optimization|improvement|enhancement)\b/gi, 'optimize')
        .replace(/\b(methodology|approach|strategy)\b/gi, 'method')
        .replace(/\b(implementation|execution|development)\b/gi, 'build')
        .replace(/\b(application|system|platform)\b/gi, 'app');
      description = 'Synonym Replacement - replaces with shorter words';
      break;
      
    case 'lemmatization':
      // Reduce to root forms
      optimized = prompt
        .replace(/\b(creating|creates|created)\b/gi, 'create')
        .replace(/\b(analyzing|analyzes|analyzed)\b/gi, 'analyze')
        .replace(/\b(optimizing|optimizes|optimized)\b/gi, 'optimize')
        .replace(/\b(implementing|implements|implemented)\b/gi, 'implement')
        .replace(/\b(developing|develops|developed)\b/gi, 'develop');
      description = 'Lemmatization - reduces words to root forms';
      break;
      
    case 'punctuationOptim':
      // Remove unnecessary punctuation
      optimized = prompt.replace(/[,;:]/g, '').replace(/\s+/g, ' ');
      description = 'Punctuation Optimization - removes unnecessary punctuation';
      break;
  }
  
  return {
    optimizedPrompt: optimized,
    strategy,
    description
  };
}

// Calculate metrics
function calculateMetrics(original, optimized) {
  const originalTokens = Math.ceil(original.length / 4);
  const optimizedTokens = Math.ceil(optimized.length / 4);
  const tokenReduction = ((originalTokens - optimizedTokens) / originalTokens) * 100;
  const costPer1K = 0.03; // $0.03 per 1K tokens
  const originalCost = (originalTokens / 1000) * costPer1K;
  const optimizedCost = (optimizedTokens / 1000) * costPer1K;
  const costSavings = originalCost - optimizedCost;
  const savingsPercentage = ((costSavings / originalCost) * 100);
  
  return {
    originalTokens,
    optimizedTokens,
    tokenReduction: tokenReduction.toFixed(2),
    originalCost: originalCost.toFixed(6),
    optimizedCost: optimizedCost.toFixed(6),
    costSavings: costSavings.toFixed(6),
    savingsPercentage: savingsPercentage.toFixed(2)
  };
}

// Test function
function testOptimization(prompt, context) {
  console.log(`\n📊 Testing: ${context.name}`);
  console.log(`Original: "${context.original}"`);
  console.log(`Expected Tokens: ${context.expectedTokens}`);
  console.log('-'.repeat(60));
  
  const results = {
    custom: {},
    promptOptimizer: {}
  };
  
  // Test Custom Engine
  console.log('\n🔧 Custom Engine Results:');
  for (let level = 1; level <= 4; level++) {
    const startTime = Date.now();
    const optimization = customOptimize(prompt, level);
    const endTime = Date.now();
    const metrics = calculateMetrics(prompt, optimization.optimizedPrompt);
    
    results.custom[`level${level}`] = {
      ...optimization,
      ...metrics,
      processingTime: endTime - startTime
    };
    
    console.log(`  Level ${level}: ${metrics.tokenReduction}% reduction (${metrics.optimizedTokens} tokens)`);
    console.log(`    Strategies: ${optimization.strategies.join(', ')}`);
    console.log(`    Cost Savings: $${metrics.costSavings} (${metrics.savingsPercentage}%)`);
  }
  
  // Test Prompt Optimizer
  console.log('\n🐍 Prompt Optimizer Results:');
  const strategies = ['entropyOptim', 'synonymReplace', 'lemmatization', 'punctuationOptim'];
  
  for (const strategy of strategies) {
    const startTime = Date.now();
    const optimization = promptOptimizerOptimize(prompt, strategy);
    const endTime = Date.now();
    const metrics = calculateMetrics(prompt, optimization.optimizedPrompt);
    
    results.promptOptimizer[strategy] = {
      ...optimization,
      ...metrics,
      processingTime: endTime - startTime
    };
    
    console.log(`  ${strategy}: ${metrics.tokenReduction}% reduction (${metrics.optimizedTokens} tokens)`);
    console.log(`    Description: ${optimization.description}`);
    console.log(`    Cost Savings: $${metrics.costSavings} (${metrics.savingsPercentage}%)`);
  }
  
  return results;
}

// Main test function
function runComparison() {
  console.log('🚀 Optimization Engine Comparison Test');
  console.log('=' .repeat(80));
  
  const allResults = {};
  
  // Test each verbosity level
  for (const [verbosity, testCase] of Object.entries(testPrompts)) {
    allResults[verbosity] = testOptimization(testCase.original, testCase);
  }
  
  // Final analysis
  console.log('\n' + '='.repeat(80));
  console.log('🏆 FINAL ANALYSIS');
  console.log('='.repeat(80));
  
  let customWins = 0;
  let promptWins = 0;
  
  for (const [verbosity, results] of Object.entries(allResults)) {
    console.log(`\n📈 ${verbosity.toUpperCase()} RESULTS:`);
    
    // Find best custom result
    const customBest = Object.values(results.custom).reduce((best, current) => 
      parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
    );
    
    // Find best prompt optimizer result
    const promptBest = Object.values(results.promptOptimizer).reduce((best, current) => 
      parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
    );
    
    console.log(`  Custom Engine Best: ${customBest.tokenReduction}% reduction`);
    console.log(`  Prompt Optimizer Best: ${promptBest.tokenReduction}% reduction`);
    
    if (parseFloat(customBest.tokenReduction) > parseFloat(promptBest.tokenReduction)) {
      customWins++;
      console.log(`  ✅ Custom Engine wins!`);
    } else {
      promptWins++;
      console.log(`  ✅ Prompt Optimizer wins!`);
    }
  }
  
  console.log(`\n🎯 OVERALL WINNER: ${customWins > promptWins ? 'Custom Engine' : 'Prompt Optimizer'}`);
  console.log(`Custom Engine: ${customWins} wins`);
  console.log(`Prompt Optimizer: ${promptWins} wins`);
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (customWins > promptWins) {
    console.log('✅ Your custom optimization engine is performing better!');
    console.log('🚀 Consider enhancing it with Prompt Optimizer strategies for even better results.');
  } else {
    console.log('✅ Prompt Optimizer strategies are performing better!');
    console.log('🔧 Consider integrating the Python library for production use.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Integrate Prompt Optimizer Python library');
  console.log('2. Combine both engines for hybrid optimization');
  console.log('3. Test with real API calls and measure actual cost savings');
  console.log('4. Implement context-aware optimization strategies');
}

// Run the test
runComparison();
