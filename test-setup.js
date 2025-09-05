#!/usr/bin/env node

/**
 * Test Setup Script for Job Board
 * 
 * This script helps you:
 * 1. Test database connection
 * 2. Initialize database schema
 * 3. Create sample data for testing
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local');
    console.log('\n📝 Please update your .env.local file with your Turso credentials:');
    console.log('TURSO_DATABASE_URL=libsql://your-database-name.turso.io');
    console.log('TURSO_AUTH_TOKEN=your-auth-token-here');
    process.exit(1);
}

const db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN
});

async function testConnection() {
    console.log('🔌 Testing database connection...');
    try {
        const result = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function initializeSchema() {
    console.log('\n📋 Initializing database schema...');
    try {
        const schemaPath = join(__dirname, 'src/lib/db/schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await db.execute(statement.trim());
            }
        }
        
        console.log('✅ Database schema initialized successfully!');
        return true;
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️  Database schema already exists, skipping...');
            return true;
        }
        console.error('❌ Failed to initialize schema:', error.message);
        return false;
    }
}

async function createSampleData() {
    console.log('\n🎯 Creating sample data for testing...');
    try {
        // Create a sample community
        const adminToken = 'test-admin-token-' + Date.now();
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);
        
        const communityResult = await db.execute({
            sql: `INSERT INTO communities (slug, name, description, admin_email, admin_token, admin_token_expires) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: ['test-jobs-board', 'Test Jobs Board', 'A test job board for development', 'admin@test.com', adminToken, tokenExpires.toISOString()]
        });
        
        const communityId = Number(communityResult.lastInsertRowid);
        
        // Create sample jobs
        const jobs = [
            {
                title: 'Senior Frontend Developer',
                description: 'We are looking for a skilled frontend developer to join our team. Experience with React, TypeScript, and modern web technologies required.',
                contact_info: 'Apply at: hr@techcorp.com',
                poster_email: 'hr@techcorp.com'
            },
            {
                title: 'UX Designer',
                description: 'Join our design team to create beautiful and intuitive user experiences. Figma and prototyping skills essential.',
                contact_info: 'Send portfolio to: design@studio.com',
                poster_email: 'design@studio.com'
            }
        ];
        
        for (const job of jobs) {
            const editToken = 'test-edit-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const jobTokenExpires = new Date();
            jobTokenExpires.setHours(jobTokenExpires.getHours() + 24);
            
            await db.execute({
                sql: `INSERT INTO jobs (community_id, title, description, contact_info, poster_email, edit_token, token_expires) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [communityId, job.title, job.description, job.contact_info, job.poster_email, editToken, jobTokenExpires.toISOString()]
            });
        }
        
        console.log('✅ Sample data created successfully!');
        console.log('\n🔗 Test URLs:');
        console.log(`   Job Board: http://localhost:5173/test-jobs-board`);
        console.log(`   Admin Panel: http://localhost:5173/test-jobs-board/admin?token=${adminToken}`);
        console.log(`   Post Job: http://localhost:5173/test-jobs-board/post-job`);
        
        return true;
    } catch (error) {
        console.error('❌ Failed to create sample data:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Job Board Test Setup\n');
    
    const connected = await testConnection();
    if (!connected) return;
    
    const schemaInitialized = await initializeSchema();
    if (!schemaInitialized) return;
    
    const sampleDataCreated = await createSampleData();
    if (!sampleDataCreated) return;
    
    console.log('\n🎉 Setup complete! You can now test the job board.');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:5173');
    console.log('3. Try creating a new job board');
    console.log('4. Check the console for magic link emails');
}

main().catch(console.error);