import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

// Configuration
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'sk-admin-1234567890';
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

// Function to read all migration files
async function readMigrationFiles() {
  console.log('Reading migration files...');
  const migrationsDir = path.join('supabase', 'migrations');
  const files = await fs.readdir(migrationsDir);
  
  // Filter for SQL files and sort them
  const sqlFiles = files
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  const migrations = [];
  
  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    migrations.push({
      fileName: file,
      content
    });
  }
  
  return migrations;
}

// Function to extract table definitions from migration files
function extractTableDefinitions(migrations) {
  console.log('Extracting table definitions from migration files...');
  const tableDefinitions = {};
  
  for (const migration of migrations) {
    // Look for CREATE TABLE statements
    const createTableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = createTableRegex.exec(migration.content)) !== null) {
      const tableName = match[1];
      const tableDefinition = match[2];
      
      if (!tableDefinitions[tableName]) {
        tableDefinitions[tableName] = [];
      }
      
      tableDefinitions[tableName].push({
        fileName: migration.fileName,
        definition: tableDefinition
      });
    }
  }
  
  return tableDefinitions;
}

// Function to compare database schema with migration files
async function compareSchemaWithMigrations() {
  console.log('Starting schema comparison...\n');
  
  try {
    // Get current database schema
    console.log('=== CURRENT DATABASE SCHEMA ===');
    const dbTables = await getTables();
    console.log('Tables found in database:', dbTables);
    
    const dbSchema = {};
    for (const table of dbTables) {
      const columns = await getTableColumns(table);
      dbSchema[table] = columns;
    }
    
    // Get expected schema from migration files
    console.log('\n=== EXPECTED SCHEMA FROM MIGRATIONS ===');
    const migrations = await readMigrationFiles();
    const expectedSchema = extractTableDefinitions(migrations);
    console.log('Tables expected from migrations:', Object.keys(expectedSchema));
    
    // Compare schemas
    console.log('\n=== SCHEMA COMPARISON ===');
    
    // Check for tables in database but not in migrations
    const extraTables = dbTables.filter(table => !expectedSchema[table]);
    if (extraTables.length > 0) {
      console.log('Tables in database but not in migrations:');
      extraTables.forEach(table => console.log(`  - ${table}`));
    }
    
    // Check for tables in migrations but not in database
    const missingTables = Object.keys(expectedSchema).filter(table => !dbTables.includes(table));
    if (missingTables.length > 0) {
      console.log('Tables in migrations but not in database:');
      missingTables.forEach(table => console.log(`  - ${table}`));
    }
    
    // Check column differences for tables that exist in both
    const commonTables = dbTables.filter(table => expectedSchema[table]);
    console.log('\nChecking column differences for common tables...');
    
    for (const table of commonTables) {
      console.log(`\nTable: ${table}`);
      const dbColumns = dbSchema[table];
      const expectedColumns = expectedSchema[table];
      
      // For now, we'll just log that we're checking this table
      // A more detailed comparison would require parsing the SQL definitions
      console.log(`  Database columns: ${dbColumns.length}`);
      console.log(`  Expected columns: ${expectedColumns.length} (from ${expectedColumns.length} migration files)`);
    }
    
    console.log('\nSchema comparison completed!');
  } catch (error) {
    console.error('Comparison failed:', error.message);
  }
}

// Run the comparison
compareSchemaWithMigrations().catch(console.error);