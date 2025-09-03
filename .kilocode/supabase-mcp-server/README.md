# Supabase MCP Server

A comprehensive server for managing Supabase database operations with "god mode" access via service role key.

## Features

- Direct SQL access via pg driver with SSL configuration for secure Supabase DB connections
- Supabase REST/Storage/Auth-Admin via @supabase/supabase-js with service role key
- Tools for:
  * sql.query — parameterized SQL through Postgres → full DB access
  * rest.crud — generic select/insert/update/delete via PostgREST
  * rpc.call — call any exposed function via REST
  * storage.* — list buckets, list objects, upload text objects
  * auth.* — list users, get user by ID (Admin API)

## Security

- Authentication with ADMIN_API_KEY
- Helmet for security headers
- Rate limiting (60 requests per minute)
- CORS disabled for server-to-server communication
- Table allowlist for additional protection

## Endpoints

### Health and Readiness
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint (requires authentication)

### SQL Operations
- `POST /sql/query` - Execute parameterized SQL queries (requires authentication)

### REST CRUD Operations
- `POST /rest/crud` - Generic select/insert/update/delete operations (requires authentication)

### RPC Function Calls
- `POST /rpc/call` - Call any exposed Postgres function (requires authentication)

### Storage Operations
- `GET /storage/buckets` - List all storage buckets (requires authentication)
- `GET /storage/objects/:bucketId` - List objects in a specific bucket (requires authentication)
- `POST /storage/upload/:bucketId/:fileName` - Upload a text object to storage (requires authentication)

### Auth Administration
- `GET /auth/users` - List all users (requires authentication)
- `GET /auth/user/:userId` - Get a specific user by ID (requires authentication)

## Configuration

The server requires the following environment variables to be set in a `.env` file:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_DB_URL` - Your Supabase database connection string
- `ADMIN_API_KEY` - API key for authenticating requests to the server
- `PORT` - Port to run the server on (default: 3000)

## Usage

1. Configure the `.env` file with your Supabase credentials
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server
4. The server will be available on port 3000 (or the port specified in .env)

All endpoints require authentication with the ADMIN_API_KEY in the Authorization header as a Bearer token.

Example:
```bash
curl -X GET http://localhost:3000/health
curl -X GET http://localhost:3000/storage/buckets -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

## Troubleshooting

### Database Connection Issues

If you're experiencing issues with the direct database connection (`SUPABASE_DB_URL`), try the following:

1. Verify that the database URL is correct:
   - Format should be: `postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres`
   - Ensure special characters in the password are properly escaped

2. Test the connection with the provided test script:
   ```bash
   node test-db-connection.js
   ```

3. Check network/firewall settings:
   - Ensure port 5432 is accessible from your location
   - Some networks may block direct database connections

4. Verify that your Supabase project allows direct database connections

Note: Even if the direct database connection is not working, the server will continue to function using the Supabase client for REST, Storage, and Auth operations.

## Development

To run in development mode:
```bash
npm run dev
```

To build the project:
```bash
npm run build
```

To clean build artifacts:
```bash
npm run clean