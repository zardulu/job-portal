import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN
});

async function getCommunityByAdminToken(token) {
    const result = await db.execute({
        sql: 'SELECT * FROM communities WHERE admin_token = ? AND admin_token_expires > datetime("now")',
        args: [token]
    });

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        admin_email: row.admin_email,
        admin_token: row.admin_token,
        admin_token_expires: row.admin_token_expires,
        created_at: row.created_at
    };
}

async function testAdminToken() {
    const testToken = '6c9079c33bd87982951639f76ab7de3f96b55fd4adb436e09fa341d0e1089202';
    
    try {
        console.log('🔍 Testing admin token:', testToken);
        const community = await getCommunityByAdminToken(testToken);
        
        if (community) {
            console.log('✅ Token is valid!');
            console.log('Community:', community.name, `(${community.slug})`);
            console.log('Expected redirect:', `/${community.slug}/admin?token=${testToken}`);
        } else {
            console.log('❌ Token is invalid or expired');
        }
    } catch (error) {
        console.error('❌ Error testing token:', error);
    }
}

testAdminToken();