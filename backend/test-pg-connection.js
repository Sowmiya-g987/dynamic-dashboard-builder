const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'newpass123',  // Use your actual password here
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL connection successful!');
    
    const res = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', res.rows[0].version);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();