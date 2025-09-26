import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'
import { PrivyOpenRouterAuth } from '@/lib/openrouter/privy-auth'
import { Sandbox } from '@vercel/sandbox'
import { runCommandInSandbox } from '@/lib/sandbox/commands'
import { createSandbox } from '@/lib/sandbox/creation'

export async function POST(request: NextRequest) {
  try {
    const { 
      modelId, 
      prompt, 
      useSandbox = true,
      accessToken 
    } = await request.json()

    if (!modelId || !prompt || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (!process.env.OPENROUTER_API_KEY || !process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
      return NextResponse.json(
        { error: 'Required environment variables not configured' },
        { status: 500 }
      )
    }

    // Authenticate user with Privy
    const auth = new PrivyOpenRouterAuth({
      privyAppId: process.env.PRIVY_APP_ID,
      privyAppSecret: process.env.PRIVY_APP_SECRET,
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
    })

    const userSession = await auth.authenticateUser(accessToken)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get OpenRouter client
    const openRouter = auth.getOpenRouterClient()

    // Generate code using OpenRouter
    const messages = [
      {
        role: 'system',
        content: 'You are an expert programmer. Generate clean, efficient, and well-commented code. Always provide working code that can be executed.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const result = await openRouter.generateText(
      modelId,
      messages,
      {
        temperature: 0.3,
        max_tokens: 2000,
      }
    )

    // Check if user has sufficient credits
    const hasCredits = await auth.hasSufficientCredits(userSession.userId, result.cost)
    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          requiredCredits: result.cost,
          availableCredits: userSession.credits
        },
        { status: 402 }
      )
    }

    let sandboxExecutionResult = null

    // Execute code in sandbox if requested
    if (useSandbox && result.content) {
      try {
        // Create sandbox using the existing pattern
        const sandboxCreationResult = await createSandbox({
          repoUrl: 'https://github.com/vercel/next.js', // Use a default repo for sandbox
          timeout: '2m',
          ports: [3000],
          runtime: 'node22',
          resources: { vcpus: 2 },
          taskPrompt: 'Execute generated code',
        })

        if (!sandboxCreationResult.success || !sandboxCreationResult.sandbox) {
          throw new Error(sandboxCreationResult.error || 'Failed to create sandbox')
        }

        const sandbox = sandboxCreationResult.sandbox
        
        // Create a simple script to execute the generated code
        const script = `
// Generated code from OpenRouter
${result.content}

// Export any functions or variables for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    result: typeof result !== 'undefined' ? result : 'Code executed successfully',
    // Add any other exports from the generated code
  }
}
`

        // Write the script to sandbox using echo command (existing pattern)
        const writeResult = await runCommandInSandbox(sandbox, 'sh', ['-c', `echo '${script.replace(/'/g, "'\"'\"'")}' > generated-code.js`])
        
        if (!writeResult.success) {
          throw new Error(`Failed to write script: ${writeResult.error}`)
        }
        
        // Execute the code using the existing runCommandInSandbox helper
        const execution = await runCommandInSandbox(sandbox, 'node', ['generated-code.js'])
        
        sandboxExecutionResult = {
          success: execution.success,
          output: execution.output,
          error: execution.error,
          exitCode: execution.exitCode
        }
      } catch (sandboxError) {
        console.error('Sandbox execution error:', sandboxError)
        sandboxExecutionResult = {
          success: false,
          output: '',
          error: sandboxError instanceof Error ? sandboxError.message : 'Sandbox execution failed',
          exitCode: 1
        }
      }
    }

    // Process payment
    const payment = await auth.processPayment(
      userSession.userId,
      result.cost,
      `OpenRouter vibe code: ${modelId}`
    )

    if (!payment.success) {
      return NextResponse.json(
        { error: `Payment failed: ${payment.error}` },
        { status: 402 }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      usage: result.usage,
      model: result.model,
      cost: result.cost,
      sandboxResult: sandboxExecutionResult,
      transactionHash: payment.transactionHash,
      remainingCredits: userSession.credits - result.cost,
    })
  } catch (error) {
    console.error('Vibe code generation error:', error)
    return NextResponse.json(
      { error: 'Code generation failed' },
      { status: 500 }
    )
  }
}
