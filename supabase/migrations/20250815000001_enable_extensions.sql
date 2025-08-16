-- Migration: Enable Required Extensions
-- Description: Enable UUID generation and vector search capabilities

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector search for embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable crypto functions for secure tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";