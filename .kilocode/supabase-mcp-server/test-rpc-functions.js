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

// Test specific RPC functions
async function testSpecificRPCFunctions() {
  console.log('Testing specific RPC functions...\n');
  
  const rpcFunctionsToTest = [
    'is_admin',
    'auth_user_id',
    'user_organizations',
    'version'
  ];
  
  for (const funcName of rpcFunctionsToTest) {
    try {
      console.log(`Testing RPC function: ${funcName}`);
      
      // Handle functions that require parameters
      let params = {};
      if (funcName === 'user_organizations') {
        // We need a valid user UUID, let's get one from the users list
        try {
          const usersResult = await mcpRequest('/auth/users');
          if (usersResult.users && usersResult.users.length > 0) {
            params = { user_uuid: usersResult.users[0].id };
          } else {
            console.log(`  Skipping ${funcName} (no users found)`);
            continue;
          }
        } catch (error) {
          console.log(`  Skipping ${funcName} (failed to get users: ${error.message})`);
          continue;
        }
      }
      
      const result = await mcpRequest('/rpc/call', {
        method: 'POST',
        body: JSON.stringify({
          function: funcName,
          params: params
        })
      });
      console.log(`  ${funcName} call successful:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`  ${funcName} call failed:`, error.message);
    }
  }
}

// Run the tests
testSpecificRPCFunctions().catch(console.error);