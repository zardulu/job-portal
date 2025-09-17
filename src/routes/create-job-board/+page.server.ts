import { redirect, fail } from '@sveltejs/kit';
import { createCommunity } from '$lib/db/queries.js';
import { sendEmail, createAdminMagicLinkEmail } from '$lib/email.js';
import { verifyTurnstile, validateEmail, getClientIP, getRateLimitKey, isDevelopmentMode, TURNSTILE_SECRET_KEY_TEST } from '$lib/turnstile.js';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, url, platform }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const email = data.get('email') as string;
        const description = data.get('description') as string;
        const turnstileToken = data.get('cf-turnstile-response') as string;

        if (!name || !email) {
            return fail(400, {
                error: 'Name and email are required',
                name,
                email,
                description
            });
        }

        // Verify Turnstile token
        let secretKey = platform?.env?.TURNSTILE_SECRET_KEY;
        
        // Use test secret key in development mode
        if (isDevelopmentMode()) {
            secretKey = TURNSTILE_SECRET_KEY_TEST;
        }
        
        if (!secretKey) {
            console.error('❌ TURNSTILE_SECRET_KEY not configured');
            return fail(500, {
                error: 'Security verification not configured. Please try again later.',
                name,
                email,
                description
            });
        }

        if (!turnstileToken) {
            return fail(400, {
                error: 'Please complete the security verification',
                name,
                email,
                description
            });
        }

        const clientIP = getClientIP(request);
        const isValidTurnstile = await verifyTurnstile(turnstileToken, secretKey, clientIP);
        
        if (!isValidTurnstile) {
            return fail(400, {
                error: 'Security verification failed. Please try again.',
                name,
                email,
                description
            });
        }

        // Rate limiting check
        const rateLimitKey = getRateLimitKey(clientIP, 'create_board');
        // Note: You'll need to implement KV storage for rate limiting in production

        // Enhanced email validation
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return fail(400, {
                error: emailValidation.error,
                name,
                email,
                description
            });
        }

        try {
            console.log('🚀 Creating community:', { name: name.trim(), email: email.trim() });
            
            // Create the community in the database
            const { community, adminToken } = await createCommunity({
                name: name.trim(),
                description: description?.trim() || undefined,
                admin_email: email.trim()
            });

            console.log('✅ Community created:', community.slug);

            // Send magic link email
            const baseUrl = url.origin;
            const emailData = createAdminMagicLinkEmail(community.name, adminToken, baseUrl);
            emailData.to = email;

            console.log('📧 Queueing admin magic link email (background)...');
            platform?.context?.waitUntil(sendEmail(emailData));

            console.log(`🎉 Redirecting to: /${community.slug}?created=true`);
            throw redirect(303, `/${community.slug}?created=true`);
        } catch (error) {
            // Check if it's a redirect (which is expected)
            if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
                throw error; // Re-throw redirect
            }
            
            console.error('❌ Failed to create community:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to create job board. Please try again.';
            if (error instanceof Error) {
                if (error.message.includes('UNIQUE constraint failed')) {
                    errorMessage = 'A job board with this name already exists. Please try a different name.';
                } else if (error.message.includes('database')) {
                    errorMessage = 'Database connection error. Please check your configuration.';
                }
            }
            
            return fail(500, {
                error: errorMessage,
                name,
                email,
                description
            });
        }
    }
};