import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

// User management
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: text('github_id').unique().notNull(),
  username: text('username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  subscription: text('subscription', { enum: ['free', 'pro', 'enterprise'] }).default('free'),
  usageLimit: integer('usage_limit').default(10), // Tasks per month
  usageCurrent: integer('usage_current').default(0),
  apiKey: text('api_key').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Updated tasks table with user isolation
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  prompt: text('prompt').notNull(),
  repoUrl: text('repo_url'),
  selectedAgent: text('selected_agent').default('claude'),
  selectedModel: text('selected_model'),
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'error'],
  })
    .notNull()
    .default('pending'),
  progress: integer('progress').default(0),
  logs: jsonb('logs').$type<LogEntry[]>(),
  error: text('error'),
  branchName: text('branch_name'),
  sandboxUrl: text('sandbox_url'),
  costOptimization: jsonb('cost_optimization').$type<CostOptimization>(),
  estimatedCost: integer('estimated_cost').default(0), // In cents
  actualCost: integer('actual_cost').default(0), // In cents
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
})

// Usage tracking
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  taskId: text('task_id').references(() => tasks.id),
  action: text('action').notNull(), // 'task_created', 'api_call', 'sandbox_created'
  cost: integer('cost').default(0), // In cents
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// API rate limiting
export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  endpoint: text('endpoint').notNull(),
  requests: integer('requests').default(0),
  windowStart: timestamp('window_start').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Existing schemas
export const logEntrySchema = z.object({
  type: z.enum(['info', 'command', 'error', 'success']),
  message: z.string(),
  timestamp: z.date().optional(),
})

export const costOptimizationSchema = z.object({
  originalCost: z.number(),
  optimizedCost: z.number(),
  savings: z.number(),
  savingsPercentage: z.string(),
  originalTokens: z.number(),
  optimizedTokens: z.number(),
  apiCalls: z.number(),
  realApiCost: z.number(),
  originalPrompt: z.string(),
  optimizedPrompt: z.string(),
  optimizationApplied: z.boolean(),
  estimatedMonthlySavings: z.number().optional(),
})

export type LogEntry = z.infer<typeof logEntrySchema>
export type CostOptimization = z.infer<typeof costOptimizationSchema>
export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Task = typeof tasks.$inferSelect
export type UsageLog = typeof usageLogs.$inferSelect
