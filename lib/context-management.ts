import { compactMessages, createReadFileTool, createGrepAndSearchFileTool } from 'ctx-zip'
import { CoreMessage } from 'ai'

export interface ContextManagementConfig {
  maxMessages: number
  storage: 'blob:/' | 'file:/'
  boundary: {
    type: 'first-n-messages'
    count: number
  }
  preserveSystemMessages?: boolean
  preserveToolResults?: boolean
}

export class ContextManager {
  private config: ContextManagementConfig
  private messageHistory: CoreMessage[] = []

  constructor(config: ContextManagementConfig) {
    this.config = config
  }

  /**
   * Prepare messages for AI generation with context compaction
   */
  async prepareMessages(messages: CoreMessage[]): Promise<CoreMessage[]> {
    this.messageHistory = messages

    // If we're under the limit, return as-is
    if (messages.length <= this.config.maxMessages) {
      return messages
    }

    console.log(`🧠 Context compaction: ${messages.length} → ${this.config.maxMessages} messages`)

    try {
      // Use ctx-zip for intelligent context compaction
      const compactedMessages = await compactMessages(messages, {
        storage: this.config.storage,
        boundary: this.config.boundary,
      })

      console.log(`✅ Context compacted successfully: ${compactedMessages.length} messages retained`)
      return compactedMessages
    } catch (error) {
      console.error('❌ Context compaction failed:', error)
      
      // Fallback: simple truncation keeping most recent messages
      const fallbackMessages = this.simpleTruncation(messages)
      console.log(`⚠️ Using fallback truncation: ${fallbackMessages.length} messages`)
      return fallbackMessages
    }
  }

  /**
   * Fallback context management using simple truncation
   */
  private simpleTruncation(messages: CoreMessage[]): CoreMessage[] {
    const { maxMessages, preserveSystemMessages } = this.config
    
    if (preserveSystemMessages) {
      // Keep system messages and recent messages
      const systemMessages = messages.filter(msg => msg.role === 'system')
      const otherMessages = messages.filter(msg => msg.role !== 'system')
      const recentMessages = otherMessages.slice(-(maxMessages - systemMessages.length))
      
      return [...systemMessages, ...recentMessages]
    }
    
    // Simple truncation: keep the most recent messages
    return messages.slice(-maxMessages)
  }

  /**
   * Get context statistics
   */
  getContextStats(): {
    totalMessages: number
    maxMessages: number
    compressionRatio: number
    isCompressed: boolean
  } {
    const totalMessages = this.messageHistory.length
    const maxMessages = this.config.maxMessages
    const compressionRatio = totalMessages > 0 ? maxMessages / totalMessages : 1
    const isCompressed = totalMessages > maxMessages

    return {
      totalMessages,
      maxMessages,
      compressionRatio,
      isCompressed,
    }
  }

  /**
   * Create context management tools for AI agents
   */
  createContextTools() {
    return {
      readFile: createReadFileTool({ storage: this.config.storage }),
      grepAndSearchFile: createGrepAndSearchFileTool({ storage: this.config.storage }),
    }
  }
}

/**
 * Default context management configuration for production
 */
export const DEFAULT_CONTEXT_CONFIG: ContextManagementConfig = {
  maxMessages: 20,
  storage: 'blob:/', // Use Vercel blob storage in production
  boundary: {
    type: 'first-n-messages',
    count: 20,
  },
  preserveSystemMessages: true,
  preserveToolResults: true,
}

/**
 * Development context management configuration
 */
export const DEV_CONTEXT_CONFIG: ContextManagementConfig = {
  maxMessages: 50, // More generous for development
  storage: 'file:/', // Use local file system for development
  boundary: {
    type: 'first-n-messages',
    count: 50,
  },
  preserveSystemMessages: true,
  preserveToolResults: true,
}

/**
 * High-performance context management for cost optimization
 */
export const OPTIMIZED_CONTEXT_CONFIG: ContextManagementConfig = {
  maxMessages: 10, // Very aggressive for cost savings
  storage: 'blob:/',
  boundary: {
    type: 'first-n-messages',
    count: 10,
  },
  preserveSystemMessages: true,
  preserveToolResults: false, // Don't preserve tool results to save tokens
}
