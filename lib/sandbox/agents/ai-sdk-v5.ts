import { Sandbox } from '@vercel/sandbox'
import { runCommandInSandbox } from '../commands'
import { AgentExecutionResult } from '../types'
import { redactSensitiveInfo, createCommandLog, createInfoLog, createErrorLog } from '@/lib/utils/logging'
import { LogEntry } from '@/lib/db/schema'
import { TaskLogger } from '@/lib/utils/task-logger'
import { generateText, generateObject, Chat } from 'ai'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

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

  return result
}

export async function executePerplexityAgentV5(
  sandbox: Sandbox,
  instruction: string,
  selectedModel?: string,
  logger?: TaskLogger,
): Promise<AgentExecutionResult> {
  const logs: LogEntry[] = []
  const modelToUse = selectedModel || 'perplexity/sonar'

  try {
    logs.push(createInfoLog(`🚀 Starting AI SDK v5 Perplexity Agent execution with model: ${modelToUse}`))

    // Check for required API keys
    if (!process.env.PERPLEXITY_API_KEY) {
      logs.push(createErrorLog('PERPLEXITY_API_KEY environment variable is required but not found'))
      return {
        success: false,
        output: '',
        error: 'PERPLEXITY_API_KEY environment variable is required but not found',
        cliName: 'perplexity-v5',
        changesDetected: false,
        logs,
      }
    }

    // Create a Node.js script that uses AI SDK v5
    const executionScript = `#!/usr/bin/env node

const { generateText, generateObject, Chat } = require('ai');
const { perplexity } = require('@ai-sdk/perplexity');
const { z } = require('zod');

async function executeAgent() {
  try {
    console.log('🤖 Initializing AI SDK v5 Chat with Perplexity...');
    
    // Create a Chat instance with the new AI SDK v5 message format
    const chat = new Chat({
      model: perplexity(process.env.PERPLEXITY_API_KEY)('${modelToUse}'),
      temperature: 0.7,
    });

    // Add system message
    chat.addMessage({
      role: 'system',
      content: 'You are an expert AI coding assistant with access to real-time information. Provide comprehensive, accurate, and helpful responses.',
    });

    // Add user input as a message with parts
    chat.addMessage({
      role: 'user',
      content: [
        {
          type: 'text',
          text: \`${instruction.replace(/`/g, '\\`')}\`,
        },
      ],
    });

    console.log('📝 Chat messages prepared with new AI SDK v5 format');
    console.log('💬 User input:', '${instruction.substring(0, 100)}...');

    // Generate response using the new Chat API
    const result = await chat.generate();
    
    console.log('✅ AI SDK v5 Chat generation completed');
    console.log('📊 Response length:', result.text.length, 'characters');
    console.log('\\n--- AI Response ---');
    console.log(result.text);
    console.log('--- End Response ---');

    // Also demonstrate structured output for coding tasks
    if ('${instruction.toLowerCase()}'.includes('code') || '${instruction.toLowerCase()}'.includes('function') || '${instruction.toLowerCase()}'.includes('class')) {
      console.log('\\n🔧 Generating structured code analysis...');
      
      const codeSchema = z.object({
        summary: z.string().describe('Brief summary of the code or solution'),
        codeBlocks: z.array(z.object({
          language: z.string(),
          code: z.string(),
          description: z.string(),
        })).describe('Code blocks with language and description'),
        improvements: z.array(z.string()).optional().describe('Suggested improvements'),
        confidence: z.number().min(0).max(1).describe('Confidence in the solution'),
      });

      const structuredResult = await generateObject({
        model: perplexity(process.env.PERPLEXITY_API_KEY)('${modelToUse}'),
        messages: chat.getMessages(),
        schema: codeSchema,
        temperature: 0.3,
      });

      console.log('\\n--- Structured Analysis ---');
      console.log('Summary:', structuredResult.object.summary);
      console.log('Confidence:', (structuredResult.object.confidence * 100).toFixed(1) + '%');
      if (structuredResult.object.codeBlocks?.length) {
        console.log('\\nCode Blocks:');
        structuredResult.object.codeBlocks.forEach((block, i) => {
          console.log(\`\\n\${i + 1}. \${block.language} - \${block.description}\`);
          console.log(block.code);
        });
      }
      if (structuredResult.object.improvements?.length) {
        console.log('\\nImprovements:');
        structuredResult.object.improvements.forEach((improvement, i) => {
          console.log(\`\${i + 1}. \${improvement}\`);
        });
      }
      console.log('--- End Structured Analysis ---');
    }

  } catch (error) {
    console.error('❌ AI SDK v5 execution failed:', error.message);
    process.exit(1);
  }
}

executeAgent();
`

    // Write the script to the sandbox
    logs.push(createInfoLog('📝 Creating AI SDK v5 execution script'))
    await runAndLogCommand(sandbox, 'echo', [`'${executionScript}' > ai-sdk-v5-agent.js`], logs, logger)

    // Make the script executable
    await runAndLogCommand(sandbox, 'chmod', ['+x', 'ai-sdk-v5-agent.js'], logs, logger)

    // Install AI SDK v5 dependencies
    logs.push(createInfoLog('📦 Installing AI SDK v5 dependencies'))
    await runAndLogCommand(sandbox, 'npm', ['init', '-y'], logs, logger)
    await runAndLogCommand(sandbox, 'npm', ['install', 'ai@^5.0.0', '@ai-sdk/perplexity@^2.0.0', 'zod'], logs, logger)

    // Execute the AI SDK v5 agent
    logs.push(createInfoLog('🚀 Executing AI SDK v5 Chat agent'))
    const executionResult = await runAndLogCommand(sandbox, 'node', ['ai-sdk-v5-agent.js'], logs, logger)

    if (executionResult && executionResult.exitCode === 0) {
      logs.push(createInfoLog('✅ AI SDK v5 agent execution completed successfully'))
      return {
        success: true,
        output: executionResult.output || 'AI SDK v5 execution completed successfully',
        error: '',
        cliName: 'perplexity-v5',
        changesDetected: true,
        logs,
      }
    } else {
      logs.push(createErrorLog(`AI SDK v5 agent execution failed with exit code: ${executionResult?.exitCode}`))
      return {
        success: false,
        output: executionResult?.output || '',
        error: `AI SDK v5 agent execution failed with exit code: ${executionResult?.exitCode}`,
        cliName: 'perplexity-v5',
        changesDetected: false,
        logs,
      }
    }
  } catch (error) {
    logs.push(createErrorLog(`AI SDK v5 agent execution error: ${error instanceof Error ? error.message : 'Unknown error'}`))
    return {
      success: false,
      output: '',
      error: `AI SDK v5 agent execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      cliName: 'perplexity-v5',
      changesDetected: false,
      logs,
    }
  }
}

export async function executeOpenAIAgentV5(
  sandbox: Sandbox,
  instruction: string,
  selectedModel?: string,
  logger?: TaskLogger,
): Promise<AgentExecutionResult> {
  const logs: LogEntry[] = []
  const modelToUse = selectedModel || 'gpt-4'

  try {
    logs.push(createInfoLog(`🚀 Starting AI SDK v5 OpenAI Agent execution with model: ${modelToUse}`))

    // Check for required API keys
    if (!process.env.OPENAI_API_KEY) {
      logs.push(createErrorLog('OPENAI_API_KEY environment variable is required but not found'))
      return {
        success: false,
        output: '',
        error: 'OPENAI_API_KEY environment variable is required but not found',
        cliName: 'openai-v5',
        changesDetected: false,
        logs,
      }
    }

    // Create a Node.js script that uses AI SDK v5
    const executionScript = `#!/usr/bin/env node

const { generateText, generateObject, Chat } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');

async function executeAgent() {
  try {
    console.log('🤖 Initializing AI SDK v5 Chat with OpenAI...');
    
    // Create a Chat instance with the new AI SDK v5 message format
    const chat = new Chat({
      model: openai(process.env.OPENAI_API_KEY)('${modelToUse}'),
      temperature: 0.7,
    });

    // Add system message
    chat.addMessage({
      role: 'system',
      content: 'You are an expert AI coding assistant. Provide comprehensive, accurate, and helpful responses with code examples when appropriate.',
    });

    // Add user input as a message with parts
    chat.addMessage({
      role: 'user',
      content: [
        {
          type: 'text',
          text: \`${instruction.replace(/`/g, '\\`')}\`,
        },
      ],
    });

    console.log('📝 Chat messages prepared with new AI SDK v5 format');
    console.log('💬 User input:', '${instruction.substring(0, 100)}...');

    // Generate response using the new Chat API
    const result = await chat.generate();
    
    console.log('✅ AI SDK v5 Chat generation completed');
    console.log('📊 Response length:', result.text.length, 'characters');
    console.log('\\n--- AI Response ---');
    console.log(result.text);
    console.log('--- End Response ---');

    // Also demonstrate structured output for coding tasks
    if ('${instruction.toLowerCase()}'.includes('code') || '${instruction.toLowerCase()}'.includes('function') || '${instruction.toLowerCase()}'.includes('class')) {
      console.log('\\n🔧 Generating structured code analysis...');
      
      const codeSchema = z.object({
        summary: z.string().describe('Brief summary of the code or solution'),
        codeBlocks: z.array(z.object({
          language: z.string(),
          code: z.string(),
          description: z.string(),
        })).describe('Code blocks with language and description'),
        improvements: z.array(z.string()).optional().describe('Suggested improvements'),
        confidence: z.number().min(0).max(1).describe('Confidence in the solution'),
      });

      const structuredResult = await generateObject({
        model: openai(process.env.OPENAI_API_KEY)('${modelToUse}'),
        messages: chat.getMessages(),
        schema: codeSchema,
        temperature: 0.3,
      });

      console.log('\\n--- Structured Analysis ---');
      console.log('Summary:', structuredResult.object.summary);
      console.log('Confidence:', (structuredResult.object.confidence * 100).toFixed(1) + '%');
      if (structuredResult.object.codeBlocks?.length) {
        console.log('\\nCode Blocks:');
        structuredResult.object.codeBlocks.forEach((block, i) => {
          console.log(\`\\n\${i + 1}. \${block.language} - \${block.description}\`);
          console.log(block.code);
        });
      }
      if (structuredResult.object.improvements?.length) {
        console.log('\\nImprovements:');
        structuredResult.object.improvements.forEach((improvement, i) => {
          console.log(\`\${i + 1}. \${improvement}\`);
        });
      }
      console.log('--- End Structured Analysis ---');
    }

  } catch (error) {
    console.error('❌ AI SDK v5 execution failed:', error.message);
    process.exit(1);
  }
}

executeAgent();
`

    // Write the script to the sandbox
    logs.push(createInfoLog('📝 Creating AI SDK v5 execution script'))
    await runAndLogCommand(sandbox, 'echo', [`'${executionScript}' > ai-sdk-v5-openai-agent.js`], logs, logger)

    // Make the script executable
    await runAndLogCommand(sandbox, 'chmod', ['+x', 'ai-sdk-v5-openai-agent.js'], logs, logger)

    // Install AI SDK v5 dependencies
    logs.push(createInfoLog('📦 Installing AI SDK v5 dependencies'))
    await runAndLogCommand(sandbox, 'npm', ['init', '-y'], logs, logger)
    await runAndLogCommand(sandbox, 'npm', ['install', 'ai@^5.0.0', '@ai-sdk/openai@^2.0.0', 'zod'], logs, logger)

    // Execute the AI SDK v5 agent
    logs.push(createInfoLog('🚀 Executing AI SDK v5 Chat agent'))
    const executionResult = await runAndLogCommand(sandbox, 'node', ['ai-sdk-v5-openai-agent.js'], logs, logger)

    if (executionResult && executionResult.exitCode === 0) {
      logs.push(createInfoLog('✅ AI SDK v5 agent execution completed successfully'))
      return {
        success: true,
        output: executionResult.output || 'AI SDK v5 execution completed successfully',
        error: '',
        cliName: 'openai-v5',
        changesDetected: true,
        logs,
      }
    } else {
      logs.push(createErrorLog(`AI SDK v5 agent execution failed with exit code: ${executionResult?.exitCode}`))
      return {
        success: false,
        output: executionResult?.output || '',
        error: `AI SDK v5 agent execution failed with exit code: ${executionResult?.exitCode}`,
        cliName: 'openai-v5',
        changesDetected: false,
        logs,
      }
    }
  } catch (error) {
    logs.push(createErrorLog(`AI SDK v5 agent execution error: ${error instanceof Error ? error.message : 'Unknown error'}`))
    return {
      success: false,
      output: '',
      error: `AI SDK v5 agent execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      cliName: 'openai-v5',
      changesDetected: false,
      logs,
    }
  }
}
