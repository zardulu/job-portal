# Migration from Supabase to Turso (Raw SQL)

This guide will help you complete the migration from Supabase to Turso using raw SQL commands.

## What's Been Done

✅ **Dependencies Updated**
- Removed `@supabase/supabase-js`
- Added `@libsql/client` for direct database access

✅ **Database Setup**
- Created SQL schema file (`src/lib/db/schema.sql`)
- Set up database connection files (`src/lib/db/index.ts`, `src/lib/db/server.ts`)

## What You Need to Do

### 1. Set Up Turso Database

1. Install Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. Sign up and create a database:
   ```bash
   turso auth signup
   turso db create job-portal
   ```

3. Get your database URL and auth token:
   ```bash
   turso db show job-portal
   turso db tokens create job-portal
   ```

### 2. Update Environment Variables

1. Copy `.env.example` to `.env` (or update your existing environment file)
2. Fill in your Turso credentials:
   ```env
   PUBLIC_TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   PUBLIC_TURSO_AUTH_TOKEN=your-auth-token-here
   TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```

### 3. Set Up Database Schema

Run the SQL commands from `src/lib/db/schema.sql` to create your tables. You can do this via:

1. **Turso CLI:**
   ```bash
   turso db shell job-portal < src/lib/db/schema.sql
   ```

2. **Or programmatically in your app:**
   ```typescript
   import { db } from '$lib/db/server';
   import { readFileSync } from 'fs';
   
   const schema = readFileSync('src/lib/db/schema.sql', 'utf8');
   await db.executeMultiple(schema);
   ```

### 4. Update Your Application Code

Replace any Supabase client usage with raw SQL:

**Before (Supabase):**
```typescript
import { supabase } from '$lib/supabase';

// Query all jobs
const { data, error } = await supabase
  .from('jobs')
  .select('*');

// Insert a job
const { error } = await supabase
  .from('jobs')
  .insert({ 
    title: 'Developer', 
    company: 'ACME',
    description: 'Great job'
  });

// Query with filters
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('company', 'ACME')
  .gte('posted_at', '2024-01-01');
```

**After (Turso + Raw SQL):**
```typescript
import { db } from '$lib/db';

// Query all jobs
const jobs = await db.execute('SELECT * FROM jobs');

// Insert a job
await db.execute({
  sql: 'INSERT INTO jobs (title, company, description) VALUES (?, ?, ?)',
  args: ['Developer', 'ACME', 'Great job']
});

// Query with filters
const filteredJobs = await db.execute({
  sql: 'SELECT * FROM jobs WHERE company = ? AND posted_at >= ?',
  args: ['ACME', '2024-01-01']
});

// Access results
console.log(jobs.rows); // Array of job records
console.log(filteredJobs.rows[0]); // First matching job
```

### 5. Common SQL Operations

**Create (Insert):**
```typescript
await db.execute({
  sql: `INSERT INTO jobs (title, description, company, location, salary, type, remote) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
  args: ['Software Engineer', 'Build awesome apps', 'TechCorp', 'Remote', '$100k', 'full-time', 1]
});
```

**Read (Select):**
```typescript
// Get all jobs
const allJobs = await db.execute('SELECT * FROM jobs ORDER BY posted_at DESC');

// Get specific job
const job = await db.execute({
  sql: 'SELECT * FROM jobs WHERE id = ?',
  args: [jobId]
});

// Get jobs with conditions
const remoteJobs = await db.execute({
  sql: 'SELECT * FROM jobs WHERE remote = 1 AND type = ?',
  args: ['full-time']
});
```

**Update:**
```typescript
await db.execute({
  sql: 'UPDATE jobs SET title = ?, salary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
  args: ['Senior Software Engineer', '$120k', jobId]
});
```

**Delete:**
```typescript
await db.execute({
  sql: 'DELETE FROM jobs WHERE id = ?',
  args: [jobId]
});
```

**Transactions:**
```typescript
const transaction = await db.transaction();
try {
  await transaction.execute({
    sql: 'INSERT INTO jobs (title, company, description) VALUES (?, ?, ?)',
    args: ['Job 1', 'Company A', 'Description 1']
  });
  
  await transaction.execute({
    sql: 'INSERT INTO applications (job_id, applicant_name, applicant_email) VALUES (?, ?, ?)',
    args: [jobId, 'John Doe', 'john@example.com']
  });
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Key Differences from Supabase

1. **Raw SQL**: Direct SQL queries instead of method chaining
2. **Parameterized Queries**: Use `?` placeholders for safe parameter binding
3. **Result Structure**: Results come as `{ rows: [], columns: [] }` 
4. **No Built-in Auth**: You'll need to implement authentication separately
5. **No Real-time**: Turso doesn't have built-in real-time subscriptions
6. **SQLite Syntax**: Uses SQLite instead of PostgreSQL syntax

## Next Steps

1. Set up your Turso database and environment variables
2. Run the schema SQL to create your tables
3. Update any existing Supabase queries to use raw SQL
4. Consider implementing authentication if you were using Supabase Auth
5. Test thoroughly before deploying

## Useful Resources

- [Turso Documentation](https://docs.turso.tech/)
- [LibSQL Client Documentation](https://docs.turso.tech/sdk/ts/quickstart)
- [SQLite Documentation](https://www.sqlite.org/docs.html) 