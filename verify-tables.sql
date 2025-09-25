-- Verify that the tasks table exists and is accessible
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;

-- Test inserting a sample task
INSERT INTO tasks (id, prompt, status, progress, created_at, updated_at)
VALUES ('test-verification', 'Database verification test', 'pending', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test selecting tasks
SELECT COUNT(*) as task_count FROM tasks;

-- Clean up test data
DELETE FROM tasks WHERE id = 'test-verification';
