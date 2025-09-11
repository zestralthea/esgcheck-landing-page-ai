# Supabase Documentation

## Auto-generated Documentation

Supabase generates documentation in the Dashboard which updates as you make database changes.

1. Go to the API page in the Dashboard.
2. Select any table under Tables and Views in the sidebar.
3. Switch between the JavaScript and the cURL docs using the tabs.

## Client Libraries

### Official libraries

| Language | Source Code | Documentation |
|----------|-------------|---------------|
| Javascript/Typescript | [supabase-js](https://github.com/supabase/supabase-js) | [Docs](https://supabase.com/docs/reference/javascript/introduction) |
| Dart/Flutter | [supabase-flutter](https://github.com/supabase/supabase-flutter/tree/main/packages/supabase_flutter) | [Docs](https://supabase.com/docs/reference/dart/introduction) |
| Swift | [supabase-swift](https://github.com/supabase/supabase-swift) | [Docs](https://supabase.com/docs/reference/swift/introduction) |
| Python | [supabase-py](https://github.com/supabase/supabase-py) | [Docs](https://supabase.com/docs/reference/python/initializing) |

### Community libraries

| Language | Source Code | Documentation |
|----------|-------------|---------------|
| C# | [supabase-csharp](https://github.com/supabase-community/supabase-csharp) | [Docs](https://supabase.com/docs/reference/csharp/introduction) |
| Go | [supabase-go](https://github.com/supabase-community/supabase-go) | |
| Kotlin | [supabase-kt](https://github.com/supabase-community/supabase-kt) | [Docs](https://supabase.com/docs/reference/kotlin/introduction) |
| Ruby | [supabase-rb](https://github.com/supabase-community/supabase-rb) | |
| Godot Engine (GDScript) | [supabase-gdscript](https://github.com/supabase-community/godot-engine.supabase) | |

## Local Development with Schema Migrations

Develop locally with the Supabase CLI and schema migrations.

### Database Migrations

Database changes are managed through "migrations." Database migrations are a common way of tracking changes to your database over time.

### Creating Migrations

1. Generate a new migration: `supabase migration new <migration_name>`
2. Add SQL to your migration file
3. Apply your migration: `supabase db reset`
4. Deploy your changes: `supabase db push`

### Using Auth Locally

To use Auth locally, update your project's `supabase/config.toml` file:

```toml
[auth.external.github]
enabled = true
client_id = "env(SUPABASE_AUTH_GITHUB_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_GITHUB_SECRET)"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

## RAG with Permissions

Fine-grain access control with Retrieval Augmented Generation.

Since pgvector is built on top of Postgres, you can implement fine-grain access control on your vector database using Row Level Security (RLS). This means you can restrict which documents are returned during a vector similarity search to users that have access to them.

### Example

```sql
-- Track documents/pages/files/etc
create table documents (
  id bigint primary key generated always as identity,
  name text not null,
  owner_id uuid not null references auth.users (id) default auth.uid(),
  created_at timestamp with time zone not null default now()
);

-- Store the content and embedding vector for each section in the document
-- with a reference to original document (one-to-many)
create table document_sections (
  id bigint primary key generated always as identity,
  document_id bigint not null references documents (id),
  content text not null,
  embedding vector (384)
);
```

### RLS Policy

```sql
-- enable row level security
alter table document_sections enable row level security;

-- setup RLS for select operations
create policy "Users can query their own document sections"
on document_sections for select to authenticated using (
  document_id in (
    select id
    from documents
    where (owner_id = (select auth.uid()))
  )
);
