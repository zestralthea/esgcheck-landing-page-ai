import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Configuration
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const SERVER_URL = `http://localhost:${process.env.PORT || 3000}`;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase client for direct comparison
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

// Test functions
async function testHealth() {
  console.log('Testing health endpoint...');
  try {
    const result = await fetch(`${SERVER_URL}/health`);
    const data = await result.json();
    console.log('Health check result:', data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

async function testStorageBuckets() {
  console.log('\nTesting storage buckets endpoint...');
  try {
    const result = await mcpRequest('/storage/buckets');
    console.log('Storage buckets:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Storage buckets test failed:', error.message);
  }
}

async function testListUsers() {
  console.log('\nTesting list users endpoint...');
  try {
    const result = await mcpRequest('/auth/users');
    console.log('Users count:', result.users.length);
    console.log('First user (if any):', result.users[0] ? {
      id: result.users[0].id,
      email: result.users[0].email,
      created_at: result.users[0].created_at
    } : 'No users found');
  } catch (error) {
    console.error('List users test failed:', error.message);
  }
}

async function testRestCrud() {
  console.log('\nTesting REST CRUD endpoint...');
  try {
    // Test select operation on a known table
    const result = await mcpRequest('/rest/crud', {
      method: 'POST',
      body: JSON.stringify({
        operation: 'select',
        table: 'profiles',
        limit: 5
      })
    });
    console.log('CRUD select result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('REST CRUD test failed:', error.message);
  }
}

async function testRpcCall() {
  console.log('\nTesting RPC call endpoint...');
  try {
    // Try to call a simple function (this might fail if no functions exist)
    const result = await mcpRequest('/rpc/call', {
      method: 'POST',
      body: JSON.stringify({
        function: 'version'  // This is a built-in Postgres function
      })
    });
    console.log('RPC call result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('RPC call test failed:', error.message);
  }
}

async function testDirectSupabase() {
  console.log('\nTesting direct Supabase client for comparison...');
  try {
    // Test with a known table from our schema
    const { data, error } = await supabase.from('profiles').select('*').limit(5);
    if (error) throw error;
    console.log('Direct Supabase result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Direct Supabase test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Running MCP Server Tests\n');
  console.log('Server URL:', SERVER_URL);
  console.log('Admin API Key configured:', !!ADMIN_API_KEY);
  console.log('Supabase URL configured:', !!SUPABASE_URL);
  console.log('Supabase Service Role Key configured:', !!SUPABASE_SERVICE_ROLE_KEY);
  
  await testHealth();
  await testStorageBuckets();
  await testListUsers();
  await testRestCrud();
  await testRpcCall();
  await testDirectSupabase();
  
  console.log('\nAll tests completed!');
}

// Run the tests
runAllTests().catch(console.error);