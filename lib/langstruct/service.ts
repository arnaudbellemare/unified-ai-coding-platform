/**
 * LangStruct TypeScript Service
 * Integrates Python LangStruct with our Node.js/TypeScript stack
 */

import { spawn } from 'child_process'
import {
  ExtractionResult,
  GEOQueryEntities,
  ACPPaymentEntities,
  AP2AgentEntities,
  DocumentMetadataEntities,
  ExtractorType,
  LangStructConfig,
} from './types'

export class LangStructService {
  private config: LangStructConfig
  private pythonPath: string

  constructor(config: LangStructConfig = {}) {
    this.config = {
      refine: false,
      maxWorkers: 4,
      rateLimit: 60,
      ...config,
    }
    this.pythonPath = 'python3' // or 'python' depending on system
  }

  /**
   * Extract structured data using LangStruct
   */
  async extract(extractorType: ExtractorType, text: string): Promise<ExtractionResult> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, ['lib/langstruct-service.py', extractorType, text])

      let output = ''
      let error = ''

      python.stdout.on('data', (data) => {
        output += data.toString()
      })

      python.stderr.on('data', (data) => {
        error += data.toString()
      })

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`LangStruct service failed: ${error}`))
          return
        }

        try {
          const result = JSON.parse(output) as ExtractionResult
          resolve(result)
        } catch (parseError) {
          reject(new Error(`Failed to parse LangStruct output: ${parseError}`))
        }
      })
    })
  }

  /**
   * Extract GEO query data
   */
  async extractGEOQuery(query: string): Promise<ExtractionResult> {
    return this.extract('geo_query', query)
  }

  /**
   * Extract ACP payment data
   */
  async extractACPPayment(text: string): Promise<ExtractionResult> {
    return this.extract('acp_payment', text)
  }

  /**
   * Extract AP2 agent communication data
   */
  async extractAP2Agent(text: string): Promise<ExtractionResult> {
    return this.extract('ap2_agent', text)
  }

  /**
   * Extract document metadata
   */
  async extractDocumentMetadata(text: string): Promise<ExtractionResult> {
    return this.extract('document_metadata', text)
  }

  /**
   * Batch extract multiple texts
   */
  async batchExtract(extractorType: ExtractorType, texts: string[]): Promise<ExtractionResult[]> {
    const promises = texts.map((text) => this.extract(extractorType, text))
    return Promise.all(promises)
  }

  /**
   * Parse user query into structured filters for RAG
   */
  async parseQueryForRAG(query: string): Promise<{
    semanticTerms: string[]
    structuredFilters: Record<string, any>
  }> {
    const result = await this.extractGEOQuery(query)

    if (!result.success) {
      throw new Error(`Failed to parse query: ${result.error}`)
    }

    const entities = result.entities as GEOQueryEntities

    return {
      semanticTerms: [entities.product_category, entities.brand_preference, entities.location].filter(
        Boolean,
      ) as string[],

      structuredFilters: {
        price_range: entities.price_range,
        urgency: entities.urgency,
        query_type: entities.query_type,
      },
    }
  }
}

// Singleton instance
export const langStructService = new LangStructService({
  refine: true, // Use refinement for better accuracy
  maxWorkers: 8,
  rateLimit: 120,
})
