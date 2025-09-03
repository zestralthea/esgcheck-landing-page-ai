#!/usr/bin/env node

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import { z } from 'zod';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({ origin: false })); // Disable CORS for server-to-server communication
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 60_000, max: 60 })); // 60 requests per minute

// Middleware
app.use(express.json({ limit: '10mb' }));

// Supabase client initialization (service role for admin access)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'X-Client-Info': 'kilocode-supabase-mcp/1.0.0' } }
});

// PostgreSQL client initialization (direct DB access)
const pgClient = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase DB connections
});

// Connect to PostgreSQL
pgClient.connect().catch((err: any) => {
  console.error('Failed to connect to PostgreSQL:', err);
});

// Table allowlist
const allowAllTables = process.env.ALLOW_ALL_TABLES === 'true';
const TABLE_ALLOWLIST = new Set((process.env.TABLE_ALLOWLIST ?? '').split(',').filter(Boolean));

function ensureTableAllowed(name: string) {
  if (allowAllTables) return;
  if (!TABLE_ALLOWLIST.has(name)) {
    const error = new Error('Table not allowed');
    (error as any).status = 403;
    throw error;
  }
}

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.ADMIN_API_KEY;
  
  if (!expectedKey) {
    return res.status(500).json({ error: 'Server not configured properly: missing ADMIN_API_KEY' });
  }
  
  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  
  next();
};

// Utility functions
const toSelect = (cols?: string | string[]) =>
  Array.isArray(cols) ? cols.join(', ') : (cols ?? '*');

function applyConditions(query: any, conditions?: Record<string, any>) {
  if (!conditions) return query;
  for (const [k, v] of Object.entries(conditions)) {
    query = (v === null) ? query.is(k, null) : query.eq(k, v);
  }
  return query;
}

// Zod schemas for validation
const SqlQuerySchema = z.object({
  query: z.string(),
  params: z.array(z.any()).optional().default([])
});

const RestCrudSchema = z.object({
  operation: z.enum(['select', 'insert', 'update', 'delete']),
  table: z.string(),
  data: z.any().optional(),
  conditions: z.record(z.string(), z.any()).optional(),
  columns: z.union([z.string(), z.array(z.string())]).optional(),
  limit: z.number().optional(),
  order: z.string().optional()
}).refine(data => {
  if (data.limit !== undefined) {
    return data.limit <= 1000;
  }
  return true;
}, {
  message: "Limit must be less than or equal to 1000",
  path: ["limit"]
});

const RpcCallSchema = z.object({
  function: z.string(),
  params: z.record(z.string(), z.any()).optional()
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness check endpoint
app.get('/ready', authenticate, async (_req: Request, res: Response) => {
  try {
    await pgClient.query('select 1');
    // We only care that the REST path works, not the result
    await supabase.from('pg_stat_database' as any).select('*').limit(1);
    res.json({ ready: true });
  } catch (e: any) {
    res.status(503).json({ ready: false, details: e.message });
  }
});

// SQL Query endpoint - Direct SQL access
app.post('/sql/query', authenticate, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = SqlQuerySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.flatten() 
      });
    }
    
    const { query, params } = validationResult.data;
    
    // Execute query
    const result = await pgClient.query(query, params);
    
    res.status(200).json({ 
      message: 'Query executed successfully', 
      rowCount: result.rowCount,
      rows: result.rows 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to execute query', details: error.message });
  }
});

// REST CRUD endpoint - Generic select/insert/update/delete
app.post('/rest/crud', authenticate, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = RestCrudSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.flatten() 
      });
    }
    
    const { operation, table, data, conditions, columns, limit, order } = validationResult.data;
    
    // Check if table is allowed
    ensureTableAllowed(table);
    
    let query: any = supabase.from(table);
    
    switch (operation) {
      case 'select':
        query = query.select(toSelect(columns));
        
        // Apply conditions if provided
        query = applyConditions(query, conditions);
        
        // Apply limit if provided
        if (limit) {
          query = query.limit(limit);
        }
        
        // Apply ordering if provided
        if (order) {
          const orderStr: string = order as string;
          const [column, direction] = orderStr.split(':');
          if (column) {
            const ascending = (direction ?? 'asc').toLowerCase() !== 'desc';
            query = query.order(column, { ascending });
          }
        }
        
        const selectResult = await query;
        if (selectResult.error) throw selectResult.error;
        
        res.status(200).json({ data: selectResult.data });
        break;
        
      case 'insert':
        if (!data) {
          return res.status(400).json({ error: 'Data is required for insert operation' });
        }
        
        const insertResult = await query.insert(data).select();
        if (insertResult.error) throw insertResult.error;
        
        res.status(200).json({ message: 'Data inserted successfully', data: insertResult.data });
        break;
        
      case 'update':
        if (!data) {
          return res.status(400).json({ error: 'Data is required for update operation' });
        }
        if (!conditions) {
          return res.status(400).json({ error: 'Conditions are required for update operation' });
        }
        
        // Apply conditions
        query = applyConditions(query, conditions);
        
        // Add select() to return updated rows
        const updateResult = await query.update(data).select();
        if (updateResult.error) throw updateResult.error;
        
        res.status(200).json({ message: 'Data updated successfully', data: updateResult.data });
        break;
        
      case 'delete':
        if (!conditions) {
          return res.status(400).json({ error: 'Conditions are required for delete operation' });
        }
        
        // Apply conditions
        query = applyConditions(query, conditions);
        
        // Add select() to return deleted rows
        const deleteResult = await query.delete().select();
        if (deleteResult.error) throw deleteResult.error;
        
        res.status(200).json({ message: 'Data deleted successfully', data: deleteResult.data });
        break;
        
      default:
        res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to execute CRUD operation', details: error.message });
  }
});

// RPC Call endpoint - Call any exposed function
app.post('/rpc/call', authenticate, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = RpcCallSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.flatten() 
      });
    }
    
    const { function: functionName, params = {} } = validationResult.data;
    
    // Call the RPC function
    const result: any = await supabase.rpc(functionName, params);
    
    if (result.error) throw result.error;
    
    res.status(200).json({ 
      message: `Function ${functionName} called successfully`, 
      data: result.data 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to call RPC function', details: error.message });
  }
});

// Storage endpoints
app.get('/storage/buckets', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    res.status(200).json({ buckets: data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list buckets', details: error.message });
  }
});

app.get('/storage/objects/:bucketId', authenticate, async (req: Request, res: Response) => {
  try {
    const { bucketId } = req.params;
    const prefix = (req.query.prefix as string) ?? '';
    const limit = Math.min(Number(req.query.limit ?? 100), 1000);

    const { data, error } = await supabase.storage.from(bucketId).list(prefix, { limit });
    
    if (error) throw error;
    
    res.status(200).json({ objects: data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list objects', details: error.message });
  }
});

app.post('/storage/upload/:bucketId/:fileName', authenticate, async (req: Request, res: Response) => {
  try {
    const { bucketId, fileName } = req.params;
    const { content, encoding = 'utf8' } = req.body;
    
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' });
    }
    
    const buf = encoding === 'base64'
      ? Buffer.from(content, 'base64')
      : Buffer.from(content, 'utf8');
    
    const { data, error } = await supabase.storage.from(bucketId).upload(fileName, buf, {
      contentType: 'text/plain',
      upsert: true
    });
    
    if (error) throw error;
    
    res.status(200).json({ message: 'File uploaded successfully', data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

// Auth endpoints
app.get('/auth/users', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Math.min(Number(req.query.perPage ?? 50), 1000);
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list users', details: error.message });
  }
});

app.get('/auth/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message ?? 'Internal error' });
});

// Graceful shutdown
async function shutdown() {
  try { 
    // Close HTTP server
    await new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  } catch (err) {
    console.error('Error closing HTTP server:', err);
  }
  
  try { 
    // Close PostgreSQL client
    await pgClient.end(); 
  } catch (err) {
    console.error('Error closing PostgreSQL client:', err);
  }
  
  process.exit(0);
}

// Start the server
const server = app.listen(port, () => {
  console.log(`Supabase MCP Server is running on port ${port}`);
  console.log(`Admin API key: ${process.env.ADMIN_API_KEY ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`Direct DB access: ${process.env.SUPABASE_DB_URL ? 'configured' : 'NOT CONFIGURED'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);