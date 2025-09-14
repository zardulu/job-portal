import { error } from '@sveltejs/kit';
import { getCommunityBySlug, getJobById } from '$lib/db/queries.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug, jobId } = params;

    try {
        // Fetch community from database
        const community = await getCommunityBySlug(slug);
        
        if (!community) {
            throw error(404, 'Job board not found');
        }

        // Fetch job from database
        const job = await getJobById(parseInt(jobId));
        
        if (!job) {
            throw error(404, 'Job not found');
        }

        // Verify the job belongs to this community
        if (job.community_id !== community.id) {
            throw error(404, 'Job not found');
        }

        return {
            community: {
                id: community.id,
                slug: community.slug,
                name: community.name,
                description: community.description
            },
            job: {
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
            }
        };
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        
        console.error('Failed to load job:', err);
        throw error(500, 'Failed to load job');
    }
};
