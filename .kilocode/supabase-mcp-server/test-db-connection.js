import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to test database connection
async function testConnection() {
  // Log the connection string (without password for security)
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (dbUrl) {
    const urlObj = new URL(dbUrl);
    console.log('Attempting to connect to:', `${urlObj.protocol}//${urlObj.username}:***@${urlObj.host}${urlObj.pathname}`);
  } else {
    console.log('SUPABASE_DB_URL is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Successfully connected to PostgreSQL');
    
    // Test with a simple query
    console.log('Executing test query...');
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
    console.log('Connection test completed successfully');
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    console.error('Error details:', {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    });
    
    // Try to parse the connection string to provide more details
    try {
      const url = new URL(dbUrl);
      console.log('Connection string details:');
      console.log('  Host:', url.hostname);
      console.log('  Port:', url.port || 5432);
      console.log('  Database:', url.pathname.substring(1));
      console.log('  Username:', url.username);
    } catch (parseErr) {
      console.error('Failed to parse connection string:', parseErr.message);
    }
    
    await client.end();
    process.exit(1);
  }
}

testConnection();