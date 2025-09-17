import { redirect, error, fail } from '@sveltejs/kit';
import { getCommunityBySlug, getJobById, updateJob, deleteJob, getJobByEditToken } from '$lib/db/queries.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const { slug, jobId } = params;
    const token = url.searchParams.get('token');

    if (!token) {
        throw redirect(303, `/${slug}/jobs/${jobId}`);
    }

    try {
        // Validate edit token and get job
        const job = await getJobByEditToken(token);
        
        if (!job) {
            throw error(404, 'Invalid or expired edit token');
        }

        // Fetch community from database
        const community = await getCommunityBySlug(slug);
        
        if (!community) {
            throw error(404, 'Job board not found');
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
                company: job.company,
                location: job.location,
                category: job.category,
                contact_info: job.contact_info,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                poster_email: job.poster_email,
                created_at: job.created_at
            }
        };
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        
        console.error('Failed to load job for editing:', err);
        throw error(500, 'Failed to load job');
    }
};

export const actions: Actions = {
    updateJob: async ({ request, params }) => {
        const data = await request.formData();
        const { slug, jobId } = params;

        const jobData = {
            title: data.get('title') as string,
            company: data.get('company') as string,
            location: data.get('location') as string,
            category: data.get('category') as string,
            salary_min: data.get('salary_min') as string,
            salary_max: data.get('salary_max') as string,
            description: data.get('description') as string,
            contact_info: data.get('contact_info') as string,
        };

        // Validate required fields
        const requiredFields = ['title', 'company', 'location', 'category', 'description', 'contact_info'];
        for (const field of requiredFields) {
            if (!jobData[field as keyof typeof jobData]) {
                return {
                    error: `${field.replace('_', ' ')} is required`
                };
            }
        }

        // TODO: Update job in database
        // console.log('Updating job:', { jobId, ...jobData });

        throw redirect(303, `/${slug}/jobs/${jobId}?updated=true`);
    },

    deleteJob: async ({ request, params, url }) => {
        const { slug, jobId } = params;
        const data = await request.formData();
        const token = (data.get('token') as string) || url.searchParams.get('token');

        if (!token) {
            return fail(403, { error: 'Edit token is required' });
        }

        try {
            // Validate edit token and get job
            const job = await getJobByEditToken(token);
            
            if (!job) {
                return fail(404, { error: 'Invalid or expired edit token' });
            }

            // Verify the job ID matches
            if (job.id !== parseInt(jobId)) {
                return fail(404, { error: 'Job not found' });
            }

            // Delete the job
            const deleted = await deleteJob(job.id);
            
            if (!deleted) {
                return fail(500, { error: 'Failed to delete job' });
            }

            // Redirect to the job board
            throw redirect(303, `/${slug}?jobDeleted=true`);
        } catch (err) {
            if (err instanceof Error && 'status' in err) {
                throw err; // Re-throw SvelteKit errors
            }
            
            console.error('Failed to delete job:', err);
            return fail(500, { error: 'Failed to delete job' });
        }
    }
};
