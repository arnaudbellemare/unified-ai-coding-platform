const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if tasks table exists
    const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks'");
    console.log('Tasks table exists:', result.rows.length > 0);
    
    // Check current schema
    const schemaResult = await client.query('SELECT current_schema()');
    console.log('Current schema:', schemaResult.rows[0]);
    
    // List all tables in public schema
    const allTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('All tables in public schema:', allTables.rows.map(r => r.table_name));
    
    // Try to query the tasks table directly
    try {
      const tasksResult = await client.query('SELECT COUNT(*) FROM tasks');
      console.log('Tasks count:', tasksResult.rows[0].count);
    } catch (error) {
      console.log('❌ Cannot query tasks table:', error.message);
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();