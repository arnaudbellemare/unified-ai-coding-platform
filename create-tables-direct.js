const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create the tasks table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tasks (
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
    `;
    
    await client.query(createTableSQL);
    console.log('✅ Created tasks table');
    
    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_selected_agent ON tasks(selected_agent);
    `;
    
    await client.query(createIndexesSQL);
    console.log('✅ Created indexes');
    
    // Test the table
    const testResult = await client.query('SELECT COUNT(*) FROM tasks');
    console.log('✅ Tasks table is working, count:', testResult.rows[0].count);
    
    // Insert a test task
    const insertTestSQL = `
      INSERT INTO tasks (id, prompt, status, progress)
      VALUES ('test-' + EXTRACT(EPOCH FROM NOW())::TEXT, 'Test task created by script', 'pending', 0)
      ON CONFLICT (id) DO NOTHING;
    `;
    
    await client.query(insertTestSQL);
    console.log('✅ Inserted test task');
    
    // Verify the test task
    const verifyResult = await client.query('SELECT COUNT(*) FROM tasks');
    console.log('✅ Final tasks count:', verifyResult.rows[0].count);
    
    await client.end();
    console.log('✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  }
}

createTables();
