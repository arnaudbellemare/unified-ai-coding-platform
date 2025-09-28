-- Supabase Database Schema for Unified AI Coding Platform
-- Run this SQL in your Supabase SQL Editor

-- Ensure we're in the public schema
SET search_path TO public;

-- Drop the existing table if it exists (to start fresh)
DROP TABLE IF EXISTS tasks CASCADE;

-- Create the tasks table with the correct schema
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- Added for user isolation
  prompt TEXT NOT NULL,
  repo_url TEXT,
  selected_agent TEXT DEFAULT 'claude',
  selected_model TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  progress INTEGER DEFAULT 0,
  logs JSONB, -- For storing log entries
  error TEXT,
  branch_name TEXT,
  sandbox_url TEXT,
  cost_optimization JSONB, -- For storing cost optimization data
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_selected_agent ON tasks(selected_agent);
CREATE INDEX idx_tasks_user_id ON tasks(user_id); -- For user isolation

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE tasks TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Test the table with a sample insert
INSERT INTO tasks (id, prompt, status, progress, user_id)
VALUES ('test-unified-ai', 'Test task for Unified AI Platform', 'pending', 0, 'test-user');

-- Verify the table structure
SELECT 
  table_name, 
  table_schema,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;

-- Show the task count
SELECT COUNT(*) as task_count FROM tasks;

-- Clean up test data
DELETE FROM tasks WHERE id = 'test-unified-ai';

-- Success message
SELECT 'Database schema created successfully! Your Unified AI Coding Platform is ready.' as status;
