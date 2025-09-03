import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const SERVER_URL = `http://localhost:${process.env.PORT || 3000}`;

// Helper function to make authenticated requests to the MCP server
async function mcpRequest(endpoint, options = {}) {
  const url = `${SERVER_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${ADMIN_API_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  return response.json();
}

// Test direct SQL queries
async function testDirectSQLQueries() {
  console.log('Testing direct SQL queries...\n');
  
  try {
    // Test a simple SELECT query
    console.log('Testing simple SELECT query...');
    const selectResult = await mcpRequest('/sql/query', {
      method: 'POST',
      body: JSON.stringify({
        query: 'SELECT COUNT(*) as count FROM profiles'
      })
    });
    console.log('  SELECT query successful:', selectResult);
    
    // Test a query with parameters
    console.log('Testing parameterized query...');
    const paramResult = await mcpRequest('/sql/query', {
      method: 'POST',
      body: JSON.stringify({
        query: 'SELECT * FROM esg_frameworks WHERE is_active = $1 LIMIT $2',
        params: [true, 3]
      })
    });
    console.log('  Parameterized query successful:', paramResult);
    
    // Test a query that joins tables
    console.log('Testing JOIN query...');
    const joinResult = await mcpRequest('/sql/query', {
      method: 'POST',
      body: JSON.stringify({
        query: `
          SELECT f.name as framework_name, COUNT(g.id) as guideline_count
          FROM esg_frameworks f
          LEFT JOIN esg_guidelines g ON f.id = g.framework_id
          WHERE f.is_active = $1
          GROUP BY f.id, f.name
          ORDER BY guideline_count DESC
        `,
        params: [true]
      })
    });
    console.log('  JOIN query successful:', joinResult);
    
    console.log('\nAll SQL query tests completed successfully!');
  } catch (error) {
    console.error('SQL query test failed:', error.message);
  }
}

// Run the tests
testDirectSQLQueries().catch(console.error);