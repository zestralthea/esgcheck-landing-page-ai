# Database Structure Discovery Plan

## Objective
Discover the actual database structure in Supabase to identify discrepancies between migration files and the real database schema.

## Approach
1. Use the MCP server's direct SQL query endpoint to query the information schema
2. Retrieve list of all tables in the public schema
3. For each table, retrieve column information
4. Retrieve list of all functions/procedures
5. Retrieve list of all triggers
6. Compare findings with migration files

## Queries to Execute

### 1. List all tables in public schema
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Get column information for each table
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'table_name_here'
ORDER BY ordinal_position;
```

### 3. List all functions
```sql
SELECT proname, proargtypes, prorettype
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;
```

### 4. List all triggers
```sql
SELECT tgname, tgrelid::regclass as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname NOT LIKE 'RI_ConstraintTrigger%'
ORDER BY tgname;
```

## Implementation
We'll create a script that:
1. Makes authenticated requests to the MCP server
2. Executes the above queries via the `/sql/query` endpoint
3. Formats and displays the results
4. Compares findings with expected structure from migration files