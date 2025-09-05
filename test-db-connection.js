import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

console.log('Testing Turso database connection...');
console.log('Database URL:', TURSO_DATABASE_URL ? 'Set' : 'Missing');
console.log('Auth Token:', TURSO_AUTH_TOKEN ? 'Set' : 'Missing');

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.error('❌ Missing required environment variables');
    console.error('Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env.local');
    process.exit(1);
}

const db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN
});

async function testConnection() {
    try {
        // Test basic connection
        const result = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful');
        console.log('Test query result:', result.rows[0]);

        // Test if tables exist
        const tables = await db.execute(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);
        
        console.log('\n📋 Available tables:');
        if (tables.rows.length === 0) {
            console.log('  No tables found - you may need to run migrations');
        } else {
            tables.rows.forEach(row => {
                console.log(`  - ${row.name}`);
            });
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();