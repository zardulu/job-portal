import { redirect, fail, error } from '@sveltejs/kit';
import { getCommunityBySlug, createJob } from '$lib/db/queries.js';
import { sendEmail, createJobEditMagicLinkEmail } from '$lib/email.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    try {
        // Fetch community from database
        const community = await getCommunityBySlug(slug);
        
        if (!community) {
            throw error(404, 'Job board not found');
        }

        return {
            community: {
                id: community.id,
                slug: community.slug,
                name: community.name,
                description: community.description
            }
        };
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        
        console.error('Failed to load community:', err);
        throw error(500, 'Failed to load job board');
    }
};

export const actions: Actions = {
    default: async ({ request, params, url }) => {
        const data = await request.formData();
        const { slug } = params;

        const jobData = {
            title: data.get('title') as string,
            description: data.get('description') as string,
            contact_info: data.get('contact_info') as string,
            poster_email: data.get('poster_email') as string,
        };

        // Validate required fields
        const requiredFields = ['title', 'description', 'contact_info', 'poster_email'];
        for (const field of requiredFields) {
            if (!jobData[field as keyof typeof jobData]?.trim()) {
                return fail(400, {
                    error: `${field.replace('_', ' ')} is required`,
                    ...jobData
                });
            }
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(jobData.poster_email)) {
            return fail(400, {
                error: 'Please enter a valid email address',
                ...jobData
            });
        }

        try {
            // Get community
            const community = await getCommunityBySlug(slug);
            if (!community) {
                throw error(404, 'Job board not found');
            }

            // Create job
            const { job, editToken } = await createJob({
                community_id: community.id,
                title: jobData.title.trim(),
                description: jobData.description.trim(),
                contact_info: jobData.contact_info.trim(),
                poster_email: jobData.poster_email.trim()
            });

            // Send edit link email
            const baseUrl = url.origin;
            const emailData = createJobEditMagicLinkEmail(job.title, editToken, baseUrl);
            emailData.to = job.poster_email;

            const emailSent = await sendEmail(emailData);
            if (!emailSent) {
                console.error('Failed to send job edit magic link email');
                // Don't fail the request, just log the error
            }

            throw redirect(303, `/${slug}?posted=true`);
        } catch (err) {
            // Check if it's a redirect (which is expected success)
            if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
                throw err; // Re-throw redirect
            }
            
            if (err instanceof Error && 'status' in err) {
                throw err; // Re-throw SvelteKit errors
            }
            
            console.error('Failed to create job:', err);
            return fail(500, {
                error: 'Failed to create job posting. Please try again.',
                ...jobData
            });
        }
    }
};
