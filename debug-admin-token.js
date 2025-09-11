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

async function debugAdminTokens() {
    try {
        console.log('🔍 Checking all communities and their admin tokens...\n');
        
        // Get all communities
        const communities = await db.execute('SELECT * FROM communities ORDER BY created_at DESC LIMIT 5');
        
        if (communities.rows.length === 0) {
            console.log('❌ No communities found in database');
            return;
        }
        
        console.log(`Found ${communities.rows.length} communities:\n`);
        
        for (const community of communities.rows) {
            console.log(`📋 Community: ${community.name} (${community.slug})`);
            console.log(`   Admin Email: ${community.admin_email}`);
            console.log(`   Admin Token: ${community.admin_token ? 'Set' : 'Missing'}`);
            console.log(`   Token Expires: ${community.admin_token_expires}`);
            
            if (community.admin_token) {
                // Test token validation
                const tokenCheck = await db.execute({
                    sql: 'SELECT * FROM communities WHERE admin_token = ? AND admin_token_expires > datetime("now")',
                    args: [community.admin_token]
                });
                
                const isValid = tokenCheck.rows.length > 0;
                console.log(`   Token Valid: ${isValid ? '✅ Yes' : '❌ No (expired or invalid)'}`);
                
                if (isValid) {
                    console.log(`   🔗 Management Link: http://localhost:5173/admin?token=${community.admin_token}`);
                }
            }
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error debugging admin tokens:', error);
    }
}

debugAdminTokens();