import { Sandbox } from '@vercel/sandbox'
import { AgentExecutionResult } from '../types'
import { executeClaudeInSandbox } from './claude'
import { executeCodexInSandbox } from './codex'
import { executeOpenCodeInSandbox } from './opencode'
import { executePerplexityInSandbox } from './perplexity'
import { executePerplexityAgentV5, executeOpenAIAgentV5 } from './ai-sdk-v5'
import { TaskLogger } from '@/lib/utils/task-logger'

export type AgentType = 'claude' | 'codex' | 'opencode' | 'perplexity' | 'perplexity-v5' | 'openai-v5'

// Re-export types
export type { AgentExecutionResult } from '../types'

// Main agent execution function
export async function executeAgentInSandbox(
  sandbox: Sandbox,
  instruction: string,
  agentType: AgentType,
  logger?: TaskLogger,
  selectedModel?: string,
): Promise<AgentExecutionResult> {
  switch (agentType) {
    case 'claude':
      return executeClaudeInSandbox(sandbox, instruction, logger, selectedModel)

    case 'codex':
      return executeCodexInSandbox(sandbox, instruction, logger, selectedModel)

    case 'opencode':
      return executeOpenCodeInSandbox(sandbox, instruction, logger, selectedModel)

    case 'perplexity':
      return executePerplexityInSandbox(sandbox, instruction, logger, selectedModel)

    case 'perplexity-v5':
      return executePerplexityAgentV5(sandbox, instruction, selectedModel, logger)

    case 'openai-v5':
      return executeOpenAIAgentV5(sandbox, instruction, selectedModel, logger)

    default:
      return {
        success: false,
        error: `Unknown agent type: ${agentType}`,
        cliName: agentType,
        changesDetected: false,
      }
  }
}
