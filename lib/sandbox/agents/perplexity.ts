import { Sandbox } from '@vercel/sandbox'
import { runCommandInSandbox } from '../commands'
import { AgentExecutionResult } from '../types'
import { redactSensitiveInfo, createCommandLog, createInfoLog, createErrorLog } from '@/lib/utils/logging'
import { LogEntry } from '@/lib/db/schema'
import { TaskLogger } from '@/lib/utils/task-logger'

// Helper function to run command and collect logs
async function runAndLogCommand(
  sandbox: Sandbox,
  command: string,
  args: string[],
  logs: LogEntry[],
  logger?: TaskLogger,
) {
  const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command
  const redactedCommand = redactSensitiveInfo(fullCommand)

  // Log to both local logs and database if logger is provided
  logs.push(createCommandLog(redactedCommand))
  if (logger) {
    await logger.command(redactedCommand)
  }

  const result = await runCommandInSandbox(sandbox, command, args)

  // Only try to access properties if result is valid
  if (result && result.output && result.output.trim()) {
    const redactedOutput = redactSensitiveInfo(result.output.trim())
    logs.push(createInfoLog(redactedOutput))
    if (logger) {
      await logger.info(redactedOutput)
    }
  }

  if (result && !result.success && result.error) {
    const redactedError = redactSensitiveInfo(result.error)
    logs.push(createErrorLog(redactedError))
    if (logger) {
      await logger.error(redactedError)
    }
  }

  // If result is null/undefined, create a fallback result
  if (!result) {
    const errorResult = {
      success: false,
      error: 'Command execution failed - no result returned',
      exitCode: -1,
      output: '',
    }
    logs.push(createErrorLog('Command execution failed - no result returned'))
    if (logger) {
      await logger.error('Command execution failed - no result returned')
    }
    return errorResult
  }

  return result
}

export async function executePerplexityInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger?: TaskLogger,
  selectedModel?: string,
): Promise<AgentExecutionResult> {
  const logs: LogEntry[] = []

  try {
    // Use AI Gateway instead of creating files
    logs.push(createInfoLog('Using AI Gateway for Perplexity API calls (no file creation needed)'))

    const modelToUse = selectedModel || 'perplexity/sonar'

    // Check if AI_GATEWAY_API_KEY is available
    if (!process.env.AI_GATEWAY_API_KEY) {
      return {
        success: false,
        error: 'AI_GATEWAY_API_KEY environment variable is required but not found',
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }

    // Create a simple script that uses curl to call the AI Gateway
    const executionScript = `#!/bin/bash

# Set the AI Gateway endpoint and API key
AI_GATEWAY_URL="https://api.vercel.com/v1/ai-gateway/chat/completions"
API_KEY="${process.env.AI_GATEWAY_API_KEY}"

# Prepare the request payload
PAYLOAD=$(cat <<EOF
{
  "model": "${modelToUse}",
  "messages": [
    {
      "role": "user", 
      "content": "You are an AI coding assistant. Please help with this task: ${instruction.replace(/"/g, '\\"')}"
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
EOF
)

echo "Executing Perplexity API call via AI Gateway..."
echo "Model: ${modelToUse}"
echo "Instruction: ${instruction.substring(0, 100)}..."

# Make the API call
RESPONSE=$(curl -s -X POST "$AI_GATEWAY_URL" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "$PAYLOAD")

# Check if the request was successful
if [ $? -eq 0 ]; then
  echo "Perplexity API execution completed successfully"
  echo "Response: $RESPONSE"
  
  # Save response to file for reference
  echo "$RESPONSE" > perplexity-response.txt
  echo "Response saved to perplexity-response.txt"
else
  echo "Perplexity API execution failed"
  exit 1
fi
`

    // Write the execution script using a simple echo approach
    const writeScript = await runAndLogCommand(
      sandbox,
      'sh',
      [
        '-c',
        `cat > execute-perplexity.sh << 'SCRIPT_EOF'
${executionScript}
SCRIPT_EOF`,
      ],
      logs,
      logger,
    )

    if (!writeScript.success) {
      const errorMessage = `Failed to create Perplexity execution script: ${writeScript.error}`
      logs.push(createErrorLog(errorMessage))
      return {
        success: false,
        error: errorMessage,
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }

    // Make the script executable
    const chmodResult = await runAndLogCommand(sandbox, 'chmod', ['+x', 'execute-perplexity.sh'], logs, logger)

    if (!chmodResult.success) {
      logs.push(createInfoLog('Warning: Failed to make script executable, but continuing'))
    }

    logs.push(createInfoLog('Perplexity execution script created successfully'))

    // Execute the Perplexity task
    if (logger) {
      await logger.info(
        `Executing Perplexity API with model ${modelToUse} and instruction: ${instruction.substring(0, 100)}...`,
      )
    }

    const executionResult = await runAndLogCommand(sandbox, 'bash', ['execute-perplexity.sh'], logs, logger)

    if (executionResult.success) {
      logs.push(createInfoLog('Perplexity task executed successfully'))
      return {
        success: true,
        cliName: 'perplexity',
        changesDetected: true,
        logs,
      }
    } else {
      const errorMessage = `Perplexity execution failed: ${executionResult.error}`
      logs.push(createErrorLog(errorMessage))
      return {
        success: false,
        error: errorMessage,
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }
  } catch (error) {
    const errorMessage = `Perplexity agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    logs.push(createErrorLog(errorMessage))
    return {
      success: false,
      error: errorMessage,
      cliName: 'perplexity',
      changesDetected: false,
      logs,
    }
  }
}
