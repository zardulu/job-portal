import { error } from '@sveltejs/kit';
import { getCommunityBySlug, getJobsByCommunityId } from '$lib/db/queries.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    try {
        // Fetch community from database
        const community = await getCommunityBySlug(slug);
        
        if (!community) {
            throw error(404, 'Job board not found');
        }

        // Fetch jobs for this community
        const jobs = await getJobsByCommunityId(community.id);

        return {
            community: {
                id: community.id,
                slug: community.slug,
                name: community.name,
                description: community.description
            },
            jobs: jobs.map(job => ({
                id: job.id,
                title: job.title,
                description: job.description,
                contact_info: job.contact_info,
                created_at: job.created_at,
                company: job.company,
                location: job.location,
                category: job.category,
                job_type: job.job_type,
                remote: job.remote,
                salary_min: job.salary_min,
                salary_max: job.salary_max
            }))
        };
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        
        console.error('Failed to load community:', err);
        throw error(500, 'Failed to load job board');
    }
};
