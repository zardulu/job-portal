import { error, redirect } from '@sveltejs/kit';
import { getCommunityByAdminToken } from '$lib/db/queries.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const token = url.searchParams.get('token');
    
    if (!token) {
        throw error(400, 'Admin token is required');
    }

    try {
        const community = await getCommunityByAdminToken(token);
        
        if (!community) {
            throw error(404, 'Invalid or expired admin token');
        }

        // Redirect to the community-specific admin page
        throw redirect(302, `/${community.slug}/admin?token=${token}`);
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        
        console.error('Failed to validate admin token:', err);
        throw error(500, 'Failed to validate admin access');
    }
};