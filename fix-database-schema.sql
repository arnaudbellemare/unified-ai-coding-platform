-- Ensure we're in the public schema
SET search_path TO public;

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS tasks CASCADE;

-- Create the tasks table in the public schema
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  repo_url TEXT,
  selected_agent TEXT DEFAULT 'claude',
  selected_model TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  progress INTEGER DEFAULT 0,
  logs JSONB,
  error TEXT,
  branch_name TEXT,
  sandbox_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_selected_agent ON tasks(selected_agent);

-- Grant permissions to the postgres user
GRANT ALL PRIVILEGES ON TABLE tasks TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Test the table
INSERT INTO tasks (id, prompt, status, progress)
VALUES ('test-schema-fix', 'Schema fix test', 'pending', 0);

-- Verify the table exists and is accessible
SELECT 
  table_name, 
  table_schema,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;

-- Count tasks
SELECT COUNT(*) as task_count FROM tasks;

-- Clean up test data
DELETE FROM tasks WHERE id = 'test-schema-fix';
