import { error, redirect } from '@sveltejs/kit';
import { getCommunityByAdminToken } from '$lib/db/queries.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const token = url.searchParams.get('token');
    
    console.log('🔍 Admin route - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
        throw error(400, 'Admin token is required');
    }

    try {
        console.log('🔍 Validating admin token...');
        const community = await getCommunityByAdminToken(token);
        
        console.log('🔍 Community found:', community ? community.slug : 'None');
        
        if (!community) {
            throw error(404, 'Invalid or expired admin token');
        }

        console.log(`🔍 Redirecting to: /${community.slug}/admin?token=${token}`);
        // Redirect to the community-specific admin page
        throw redirect(302, `/${community.slug}/admin?token=${token}`);
    } catch (err) {
        // Check if it's a SvelteKit redirect or error (these have a status property)
        if (err && typeof err === 'object' && 'status' in err) {
            console.log('🔍 Re-throwing SvelteKit redirect/error:', err.status);
            throw err; // Re-throw SvelteKit redirects and errors
        }
        
        console.error('❌ Failed to validate admin token:', err);
        throw error(500, 'Failed to validate admin access');
    }
};