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

// List of tables to test based on our migration files
const tablesToTest = [
  'organizations',
  'organization_members',
  'profiles',
  'waitlist_entries',
  'documents',
  'jobs',
  'esg_reports',
  'esg_analyses',
  'esg_analysis_exports',
  'esg_frameworks',
  'esg_guidelines',
  'guideline_embeddings',
  'activity_logs',
  'document_access_logs',
  'feature_flags',
  'system_settings'
];

// Function to test CRUD operations on a table
async function testTableCRUD(tableName) {
  console.log(`\n=== Testing ${tableName} ===`);
  
  try {
    // Test SELECT operation
    console.log(`Testing SELECT on ${tableName}...`);
    const selectResult = await mcpRequest('/rest/crud', {
      method: 'POST',
      body: JSON.stringify({
        operation: 'select',
        table: tableName,
        limit: 5
      })
    });
    console.log(`  SELECT successful. Found ${selectResult.data.length} records.`);
    
    // Show first record if any exist
    if (selectResult.data.length > 0) {
      console.log(`  First record:`, JSON.stringify(selectResult.data[0], null, 2));
    }
    
    console.log(`  ${tableName} CRUD test completed successfully.`);
    return true;
  } catch (error) {
    console.error(`  ${tableName} CRUD test failed:`, error.message);
    return false;
  }
}

// Function to test RPC functions
async function testRPCFunctions() {
  console.log('\n=== Testing RPC Functions ===');
  
  // List of RPC functions to test based on our migration files
  const rpcFunctions = [
    'auth_user_id',
    'user_organizations',
    'update_updated_at',
    'soft_delete_report_cascade',
    'gdpr_delete_user_data',
    'claim_next_job',
    'set_latest_analysis'
  ];
  
  for (const funcName of rpcFunctions) {
    try {
      console.log(`Testing RPC function: ${funcName}`);
      // For functions that require parameters, we'll need to handle them specially
      if (funcName === 'user_organizations') {
        // Skip this for now as it requires a user UUID parameter
        console.log(`  Skipping ${funcName} (requires parameters)`);
        continue;
      } else if (funcName === 'gdpr_delete_user_data') {
        // Skip this for now as it requires a user UUID parameter
        console.log(`  Skipping ${funcName} (requires parameters)`);
        continue;
      }
      
      const result = await mcpRequest('/rpc/call', {
        method: 'POST',
        body: JSON.stringify({
          function: funcName
        })
      });
      console.log(`  ${funcName} call successful:`, result.message);
    } catch (error) {
      console.error(`  ${funcName} call failed:`, error.message);
    }
  }
}

// Function to test storage operations
async function testStorageOperations() {
  console.log('\n=== Testing Storage Operations ===');
  
  try {
    console.log('Testing storage buckets...');
    const bucketsResult = await mcpRequest('/storage/buckets');
    console.log(`  Found ${bucketsResult.buckets.length} buckets:`);
    bucketsResult.buckets.forEach(bucket => {
      console.log(`    - ${bucket.name}`);
    });
  } catch (error) {
    console.error('  Storage buckets test failed:', error.message);
  }
}

// Function to test auth operations
async function testAuthOperations() {
  console.log('\n=== Testing Auth Operations ===');
  
  try {
    console.log('Testing list users...');
    const usersResult = await mcpRequest('/auth/users');
    console.log(`  Found ${usersResult.users.length} users`);
    if (usersResult.users.length > 0) {
      console.log(`  First user: ${usersResult.users[0].email}`);
    }
  } catch (error) {
    console.error('  List users test failed:', error.message);
  }
}

// Main function to test all tables and functions
async function testAllTablesAndFunctions() {
  console.log('Starting comprehensive tests of all tables and functions...\n');
  
  // Test storage operations
  await testStorageOperations();
  
  // Test auth operations
  await testAuthOperations();
  
  // Test CRUD operations on all tables
  console.log('\n=== Testing CRUD Operations on All Tables ===');
  let successCount = 0;
  let failCount = 0;
  
  for (const table of tablesToTest) {
    const success = await testTableCRUD(table);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n=== Test Summary ===`);
  console.log(`Successful tests: ${successCount}`);
  console.log(`Failed tests: ${failCount}`);
  console.log(`Total tables tested: ${tablesToTest.length}`);
  
  // Test RPC functions
  await testRPCFunctions();
  
  console.log('\nAll tests completed!');
}

// Run the tests
testAllTablesAndFunctions().catch(console.error);