import { error, fail, redirect } from '@sveltejs/kit';
import { getJobByEditToken, updateJob, deleteJob, getCommunityById } from '$lib/db/queries.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const token = url.searchParams.get('token');
    
    if (!token) {
        throw error(400, 'Edit token is required');
    }

    try {
        const job = await getJobByEditToken(token);
        
        if (!job) {
            throw error(404, 'Invalid or expired edit token');
        }

        return {
            job: {
                id: job.id,
                title: job.title,
                description: job.description,
                contact_info: job.contact_info,
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
    update: async ({ request, url }) => {
        const data = await request.formData();
        const token = url.searchParams.get('token');

        if (!token) {
            return fail(403, { error: 'Edit token is required' });
        }

        const jobData = {
            title: data.get('title') as string,
            description: data.get('description') as string,
            contact_info: data.get('contact_info') as string,
        };

        // Validate required fields
        const requiredFields = ['title', 'description', 'contact_info'];
        for (const field of requiredFields) {
            if (!jobData[field as keyof typeof jobData]?.trim()) {
                return fail(400, {
                    error: `${field.replace('_', ' ')} is required`,
                    ...jobData
                });
            }
        }

        try {
            // Validate edit token and get job
            const job = await getJobByEditToken(token);
            
            if (!job) {
                return fail(404, { error: 'Invalid or expired edit token' });
            }

            // Update the job
            const updatedJob = await updateJob(job.id, {
                title: jobData.title.trim(),
                description: jobData.description.trim(),
                contact_info: jobData.contact_info.trim()
            });

            if (!updatedJob) {
                return fail(500, { error: 'Failed to update job' });
            }

            return { 
                success: true, 
                message: 'Job updated successfully',
                job: {
                    id: updatedJob.id,
                    title: updatedJob.title,
                    description: updatedJob.description,
                    contact_info: updatedJob.contact_info,
                    poster_email: updatedJob.poster_email,
                    created_at: updatedJob.created_at
                }
            };
        } catch (err) {
            console.error('Failed to update job:', err);
            return fail(500, { 
                error: 'Failed to update job',
                ...jobData
            });
        }
    },

    delete: async ({ request, url }) => {
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

            // Delete the job
            const deleted = await deleteJob(job.id);
            
            if (!deleted) {
                return fail(500, { error: 'Failed to delete job' });
            }

            // Get the community info to redirect to the job board
            const community = await getCommunityById(job.community_id);
            if (community) {
                throw redirect(303, `/${community.slug}?jobDeleted=true`);
            } else {
                // Fallback to homepage if community not found
                throw redirect(303, '/?jobDeleted=true');
            }
        } catch (err) {
            console.error('Failed to delete job:', err);
            return fail(500, { error: 'Failed to delete job' });
        }
    }
};