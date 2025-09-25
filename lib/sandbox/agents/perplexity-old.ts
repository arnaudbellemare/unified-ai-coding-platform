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
      command: redactedCommand,
    }
    logs.push(createErrorLog('Command execution failed - no result returned'))
    if (logger) {
      await logger.error('Command execution failed - no result returned')
    }
    return errorResult
  }

  return result
}

export async function installPerplexityCLI(
  sandbox: Sandbox,
  selectedModel?: string,
): Promise<{ success: boolean; logs: string[] }> {
  const logs: string[] = []

  // Install Node.js dependencies for Perplexity API
  logs.push('Installing Perplexity API dependencies...')
  const installResult = await runCommandInSandbox(sandbox, 'npm', ['install', 'axios', 'dotenv'])

  if (installResult.success) {
    logs.push('Perplexity API dependencies installed successfully')

    // Create a simple Perplexity API client
    const clientCode = `
const axios = require('axios');
require('dotenv').config();

class PerplexityClient {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    this.defaultModel = '${selectedModel || 'sonar-medium-chat'}';
  }

  async chat(messages, options = {}) {
    try {
      const response = await axios.post(this.baseURL, {
        model: options.model || this.defaultModel,
        messages: messages,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        stream: false
      }, {
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = { PerplexityClient };
`

    // Write the client code using a temporary file approach
    // First, create a temporary file with the content
    const tempFile = '/tmp/perplexity-client-temp.js'
    
    // Write to temp file using cat with heredoc
    const writeTemp = await runCommandInSandbox(sandbox, 'sh', ['-c', `cat > ${tempFile} << 'PERPLEXITY_EOF'
${clientCode}
PERPLEXITY_EOF`])
    
    if (writeTemp.success) {
      // Copy from temp file to final location
      const copyFile = await runCommandInSandbox(sandbox, 'cp', [tempFile, 'perplexity-client.js'])
      
      if (copyFile.success) {
        logs.push('Perplexity API client created successfully')
        
        // Verify the file was created
        const verifyClient = await runCommandInSandbox(sandbox, 'ls', ['-la', 'perplexity-client.js'])
        if (verifyClient.success) {
          logs.push('Perplexity client file verified')
          logs.push(`File size: ${verifyClient.output}`)
        } else {
          logs.push('Warning: Perplexity client file not found after creation')
        }
      } else {
        logs.push('Warning: Failed to copy Perplexity API client')
        logs.push(`Error: ${copyFile.error}`)
      }
    } else {
      logs.push('Warning: Failed to create temporary Perplexity API client')
      logs.push(`Error: ${writeTemp.error}`)
    }

    // Create a test script
    const testScript = `
const { PerplexityClient } = require('./perplexity-client');

async function testPerplexity() {
  const client = new PerplexityClient();
  
  if (!client.apiKey) {
    console.log('Warning: PERPLEXITY_API_KEY not found');
    return;
  }

  const messages = [
    {
      role: 'user',
      content: 'Hello, can you help me with a coding task?'
    }
  ];

  const result = await client.chat(messages);
  
  if (result.success) {
    console.log('Perplexity API test successful');
    console.log('Response:', result.response);
  } else {
    console.log('Perplexity API test failed:', result.error);
  }
}

testPerplexity().catch(console.error);
`

    // Write test script using temporary file approach
    const testTempFile = '/tmp/test-perplexity-temp.js'
    
    const writeTestTemp = await runCommandInSandbox(sandbox, 'sh', ['-c', `cat > ${testTempFile} << 'TEST_EOF'
${testScript}
TEST_EOF`])
    
    if (writeTestTemp.success) {
      const copyTest = await runCommandInSandbox(sandbox, 'cp', [testTempFile, 'test-perplexity.js'])
      
      if (copyTest.success) {
        logs.push('Perplexity test script created successfully')
      } else {
        logs.push('Warning: Failed to copy Perplexity test script')
        logs.push(`Error: ${copyTest.error}`)
      }
    } else {
      logs.push('Warning: Failed to create temporary Perplexity test script')
      logs.push(`Error: ${writeTestTemp.error}`)
    }

    return { success: true, logs }
  } else {
    logs.push('Failed to install Perplexity API dependencies')
    return { success: false, logs }
  }
}

export async function executePerplexityInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger?: TaskLogger,
  selectedModel?: string,
): Promise<AgentExecutionResult> {
  const logs: LogEntry[] = []

  try {
    // Check if Perplexity client exists
    const clientCheck = await runAndLogCommand(sandbox, 'ls', ['perplexity-client.js'], logs, logger)

    if (!clientCheck.success) {
      // Install Perplexity CLI
      const installResult = await installPerplexityCLI(sandbox, selectedModel)

      if (!installResult.success) {
        const installLogs = installResult.logs.map((log) => createInfoLog(log))
        return {
          success: false,
          error: `Failed to install Perplexity API client: ${installResult.logs.join(', ')}`,
          cliName: 'perplexity',
          changesDetected: false,
          logs: [...logs, ...installLogs],
        }
      }

      // Add installation logs
      installResult.logs.forEach((log) => {
        logs.push(createInfoLog(log))
      })
    }

    // Check if PERPLEXITY_API_KEY is available
    if (!process.env.PERPLEXITY_API_KEY) {
      return {
        success: false,
        error: 'PERPLEXITY_API_KEY environment variable is required but not found',
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }

    // Create the execution script
    const modelToUse = selectedModel || 'sonar-medium-chat'
    const executionScript = `
const { PerplexityClient } = require('./perplexity-client');
const fs = require('fs');

async function executePerplexityTask() {
  const client = new PerplexityClient();
  
  if (!client.apiKey) {
    console.error('Error: PERPLEXITY_API_KEY not found');
    process.exit(1);
  }

  const instruction = \`${instruction.replace(/`/g, '\\`')}\`;

  const messages = [
    {
      role: 'user',
      content: \`You are an AI coding assistant. Please help with this task: \${instruction}\`
    }
  ];

  console.log('Executing Perplexity API call...');
  const result = await client.chat(messages, {
    model: '${modelToUse}',
    max_tokens: 2000,
    temperature: 0.7
  });

  if (result.success) {
    console.log('Perplexity API execution completed successfully');
    console.log('Response:', result.response);
    
    if (result.usage) {
      console.log('Token usage:', result.usage);
    }
    
    // Save response to file for reference
    fs.writeFileSync('perplexity-response.txt', result.response);
    console.log('Response saved to perplexity-response.txt');
  } else {
    console.error('Perplexity API execution failed:', result.error);
    process.exit(1);
  }
}

executePerplexityTask().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
`

    // Write execution script using temporary file approach
    const execTempFile = '/tmp/execute-perplexity-temp.js'
    
    const writeExecTemp = await runAndLogCommand(sandbox, 'sh', ['-c', `cat > ${execTempFile} << 'EXEC_EOF'
${executionScript}
EXEC_EOF`], logs, logger)
    
    if (!writeExecTemp.success) {
      const errorMessage = `Failed to create temporary Perplexity execution script: ${writeExecTemp.error}`
      logs.push(errorMessage)
      return {
        success: false,
        error: errorMessage,
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }
    
    const copyExec = await runAndLogCommand(sandbox, 'cp', [execTempFile, 'execute-perplexity.js'], logs, logger)
    
    if (!copyExec.success) {
      const errorMessage = `Failed to copy Perplexity execution script: ${copyExec.error}`
      logs.push(errorMessage)
      return {
        success: false,
        error: errorMessage,
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }
    
    logs.push('Perplexity execution script created successfully')


    // Execute the Perplexity task
    if (logger) {
      await logger.info(`Executing Perplexity API with model ${modelToUse} and instruction: ${instruction.substring(0, 100)}...`)
    }

    const result = await runCommandInSandbox(sandbox, 'node', ['execute-perplexity.js'])

    // Check if result is valid
    if (!result) {
      const errorMsg = 'Perplexity execution failed - no result returned'
      logs.push(createErrorLog(errorMsg))
      if (logger) {
        await logger.error(errorMsg)
      }
      return {
        success: false,
        error: errorMsg,
        cliName: 'perplexity',
        changesDetected: false,
        logs,
      }
    }

    // Log the output
    if (result.output && result.output.trim()) {
      const redactedOutput = redactSensitiveInfo(result.output.trim())
      logs.push(createInfoLog(redactedOutput))
      if (logger) {
        await logger.info(redactedOutput)
      }
    }

    if (!result.success && result.error) {
      const redactedError = redactSensitiveInfo(result.error)
      logs.push(createErrorLog(redactedError))
      if (logger) {
        await logger.error(redactedError)
      }
    }

    // Check if any files were modified or created
    const gitStatusCheck = await runAndLogCommand(sandbox, 'git', ['status', '--porcelain'], logs, logger)
    const fileCheck = await runAndLogCommand(sandbox, 'ls', ['-la'], logs, logger)

    const hasChanges = gitStatusCheck.success && gitStatusCheck.output?.trim()
    const hasNewFiles = fileCheck.success && (fileCheck.output?.includes('perplexity-response.txt') || fileCheck.output?.includes('execute-perplexity.js'))

    if (result.success || result.exitCode === 0) {
      return {
        success: true,
        output: `Perplexity API executed successfully${hasChanges || hasNewFiles ? ' (Changes detected)' : ' (No changes made)'}`,
        agentResponse: result.output || 'No detailed response available',
        cliName: 'perplexity',
        changesDetected: !!(hasChanges || hasNewFiles),
        error: undefined,
        logs,
      }
    } else {
      return {
        success: false,
        error: `Perplexity API failed (exit code ${result.exitCode}): ${result.error || 'No error message'}`,
        agentResponse: result.output,
        cliName: 'perplexity',
        changesDetected: !!(hasChanges || hasNewFiles),
        logs,
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to execute Perplexity API in sandbox'
    return {
      success: false,
      error: errorMessage,
      cliName: 'perplexity',
      changesDetected: false,
      logs,
    }
  }
}
