import { redirect, fail } from '@sveltejs/kit';
import { createCommunity } from '$lib/db/queries.js';
import { sendEmail, createAdminMagicLinkEmail } from '$lib/email.js';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, url }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const email = data.get('email') as string;
        const description = data.get('description') as string;

        if (!name || !email) {
            return fail(400, {
                error: 'Name and email are required',
                name,
                email,
                description
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return fail(400, {
                error: 'Please enter a valid email address',
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

            console.log('📧 Sending admin magic link email...');
            const emailSent = await sendEmail(emailData);
            if (!emailSent) {
                console.error('❌ Failed to send admin magic link email');
                // Don't fail the request, just log the error
            } else {
                console.log('✅ Admin magic link email logged to console');
            }

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
