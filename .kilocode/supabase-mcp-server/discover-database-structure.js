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

// Function to execute SQL queries through the MCP server
async function executeSQLQuery(query, params = []) {
  try {
    const result = await mcpRequest('/sql/query', {
      method: 'POST',
      body: JSON.stringify({
        query,
        params
      })
    });
    return result;
  } catch (error) {
    console.error('SQL query failed:', error.message);
    throw error;
  }
}

// Function to get all tables in the public schema
async function getTables() {
  console.log('Fetching list of tables...');
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  
  const result = await executeSQLQuery(query);
  return result.rows.map(row => row.table_name);
}

// Function to get column information for a specific table
async function getTableColumns(tableName) {
  console.log(`Fetching columns for table: ${tableName}`);
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `;
  
  const result = await executeSQLQuery(query, [tableName]);
  return result.rows;
}

// Function to get all functions in the public schema
async function getFunctions() {
  console.log('Fetching list of functions...');
  const query = `
    SELECT proname, proargtypes, prorettype
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY proname;
  `;
  
  const result = await executeSQLQuery(query);
  return result.rows;
}

// Function to get all triggers
async function getTriggers() {
  console.log('Fetching list of triggers...');
  const query = `
    SELECT tgname, tgrelid::regclass as table_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname NOT LIKE 'RI_ConstraintTrigger%'
    ORDER BY tgname;
  `;
  
  const result = await executeSQLQuery(query);
  return result.rows;
}

// Main function to discover the database structure
async function discoverDatabaseStructure() {
  console.log('Starting database structure discovery...\n');
  
  try {
    // Get all tables
    const tables = await getTables();
    console.log('Tables found:', tables);
    console.log('');
    
    // Get column information for each table
    console.log('=== TABLE STRUCTURES ===');
    for (const table of tables) {
      const columns = await getTableColumns(table);
      console.log(`\nTable: ${table}`);
      console.log('Columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
    // Get functions
    console.log('\n=== FUNCTIONS ===');
    const functions = await getFunctions();
    console.log('Functions found:', functions.length);
    functions.forEach(func => {
      console.log(`  - ${func.proname}`);
    });
    
    // Get triggers
    console.log('\n=== TRIGGERS ===');
    const triggers = await getTriggers();
    console.log('Triggers found:', triggers.length);
    triggers.forEach(trigger => {
      console.log(`  - ${trigger.tgname} on ${trigger.table_name}`);
    });
    
    console.log('\nDatabase structure discovery completed!');
  } catch (error) {
    console.error('Discovery failed:', error.message);
  }
}

// Run the discovery
discoverDatabaseStructure().catch(console.error);