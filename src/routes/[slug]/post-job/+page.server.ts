import { redirect, fail, error } from '@sveltejs/kit';
import { getCommunityBySlug, createJob } from '$lib/db/queries.js';
import { sendEmail, createJobEditMagicLinkEmail } from '$lib/email.js';
import { verifyTurnstile, validateEmail, getClientIP, getRateLimitKey, isDevelopmentMode, TURNSTILE_SECRET_KEY_TEST } from '$lib/turnstile.js';
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
    default: async ({ request, params, url, platform }) => {
        const data = await request.formData();
        const { slug } = params;
        const turnstileToken = data.get('cf-turnstile-response') as string;

        const jobData = {
            title: data.get('title') as string,
            company: data.get('company') as string,
            location: data.get('location') as string,
            category: data.get('category') as string,
            job_type: data.get('job_type') as string,
            remote: data.get('remote') as string,
            salary_min: data.get('salary_min') as string,
            salary_max: data.get('salary_max') as string,
            description: data.get('description') as string,
            contact_info: data.get('contact_info') as string,
            poster_email: data.get('poster_email') as string,
        };

        // Validate required fields (category and contact_info are now optional)
        const requiredFields = ['title', 'company', 'description', 'poster_email'];
        for (const field of requiredFields) {
            if (!jobData[field as keyof typeof jobData]?.trim()) {
                return fail(400, {
                    error: `${field.replace('_', ' ')} is required`,
                    ...jobData
                });
            }
        }

        // Verify Turnstile token
        let secretKey = platform?.env?.TURNSTILE_SECRET_KEY;
        
        // Use test secret key in development mode
        if (isDevelopmentMode()) {
            secretKey = TURNSTILE_SECRET_KEY_TEST;
            console.log('🧪 Using development mode for Turnstile');
        }
        
        if (!secretKey) {
            console.error('❌ TURNSTILE_SECRET_KEY not configured');
            return fail(500, {
                error: 'Security verification not configured. Please try again later.',
                ...jobData
            });
        }

        if (!turnstileToken) {
            return fail(400, {
                error: 'Please complete the security verification',
                ...jobData
            });
        }

        const clientIP = getClientIP(request);
        const isValidTurnstile = await verifyTurnstile(turnstileToken, secretKey, clientIP);
        
        if (!isValidTurnstile) {
            return fail(400, {
                error: 'Security verification failed. Please try again.',
                ...jobData
            });
        }

        // Rate limiting check
        const rateLimitKey = getRateLimitKey(clientIP, 'post_job');
        console.log(`📊 Job posting attempt from IP: ${clientIP}`);

        // Enhanced email validation for poster email
        const posterEmailValidation = validateEmail(jobData.poster_email);
        if (!posterEmailValidation.isValid) {
            return fail(400, {
                error: posterEmailValidation.error,
                ...jobData
            });
        }

        // Validate contact_info email if provided
        if (jobData.contact_info && jobData.contact_info.trim()) {
            const contactEmailValidation = validateEmail(jobData.contact_info);
            if (!contactEmailValidation.isValid) {
                return fail(400, {
                    error: `Contact email: ${contactEmailValidation.error}`,
                    ...jobData
                });
            }
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
                company: jobData.company.trim(),
                location: jobData.location.trim(),
                category: jobData.category?.trim() || null,
                job_type: jobData.job_type.trim(),
                remote: jobData.remote === '1' ? 1 : 0,
                salary_min: jobData.salary_min ? parseInt(jobData.salary_min) : null,
                salary_max: jobData.salary_max ? parseInt(jobData.salary_max) : null,
                description: jobData.description.trim(),
                contact_info: jobData.contact_info?.trim() || null,
                poster_email: jobData.poster_email.trim()
            });

            // Send edit link email
            const baseUrl = url.origin;
            const emailData = createJobEditMagicLinkEmail(job.title, editToken, baseUrl);
            emailData.to = job.poster_email;

            console.log('Queueing job edit magic link email (background)...');
            platform?.context?.waitUntil(sendEmail(emailData));

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