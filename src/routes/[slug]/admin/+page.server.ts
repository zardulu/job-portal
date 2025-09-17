import { redirect, error, fail } from '@sveltejs/kit';
import { getCommunityByAdminToken, getJobsByCommunityId, deleteJob } from '$lib/db/queries.js';
import { db } from '$lib/db/server.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const { slug } = params;
    const token = url.searchParams.get('token');

    if (!token) {
        throw redirect(303, `/${slug}`);
    }

    try {
        // Validate admin token
        const community = await getCommunityByAdminToken(token);
        
        if (!community) {
            throw error(403, 'Invalid or expired admin token');
        }

        // Ensure the token belongs to this community
        if (community.slug !== slug) {
            throw error(403, 'Admin token does not match this community');
        }

        // Fetch jobs for this community
        const jobs = await getJobsByCommunityId(community.id);

        return {
            community: {
                id: community.id,
                slug: community.slug,
                name: community.name,
                description: community.description,
                admin_email: community.admin_email,
                created_at: community.created_at
            },
            jobs: jobs.map(job => ({
                id: job.id,
                title: job.title,
                description: job.description,
                contact_info: job.contact_info,
                poster_email: job.poster_email,
                created_at: job.created_at
            }))
        };
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        
        console.error('Failed to load admin page:', err);
        throw error(500, 'Failed to load admin page');
    }
};

export const actions: Actions = {
    deleteJob: async ({ request, params, url }) => {
        const data = await request.formData();
        const jobId = data.get('jobId') as string;
        const token = (data.get('token') as string) || url.searchParams.get('token');
        const { slug } = params;

        if (!jobId) {
            return fail(400, { error: 'Job ID is required' });
        }

        if (!token) {
            return fail(403, { error: 'Admin token is required' });
        }

        try {
            // Validate admin token
            const community = await getCommunityByAdminToken(token);
            
            if (!community || community.slug !== slug) {
                return fail(403, { error: 'Invalid admin access' });
            }

            // Delete the job
            const deleted = await deleteJob(parseInt(jobId));
            
            if (!deleted) {
                return fail(404, { error: 'Job not found' });
            }

            // Redirect to the job board after successful deletion
            throw redirect(303, `/${slug}?jobDeleted=true`);
        } catch (err) {
            console.error('Failed to delete job:', err);
            return fail(500, { error: 'Failed to delete job' });
        }
    },

    deleteBoard: async ({ request, params, url }) => {
        const data = await request.formData();
        const token = (data.get('token') as string) || url.searchParams.get('token');
        const { slug } = params;

        if (!token) {
            return fail(403, { error: 'Admin token is required' });
        }

        try {
            // Validate admin token
            const community = await getCommunityByAdminToken(token);
            
            if (!community || community.slug !== slug) {
                return fail(403, { error: 'Invalid admin access' });
            }

            // Delete all jobs first, then the community
            await db.execute({
                sql: 'DELETE FROM jobs WHERE community_id = ?',
                args: [community.id]
            });

            await db.execute({
                sql: 'DELETE FROM communities WHERE id = ?',
                args: [community.id]
            });

            throw redirect(303, '/?deleted=true');
        } catch (err) {
            if (err instanceof Error && 'status' in err) {
                throw err; // Re-throw SvelteKit errors
            }
            
            console.error('Failed to delete board:', err);
            return fail(500, { error: 'Failed to delete job board' });
        }
    }
};
