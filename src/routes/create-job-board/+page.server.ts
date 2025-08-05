import { redirect } from '@sveltejs/kit';
import { randomBytes } from 'crypto';

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name') as string;
        const email = data.get('email') as string;

        if (!name || !email) {
            return {
                error: 'Name and email are required'
            };
        }

        // Generate a unique slug from the name
        const baseSlug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Add some randomness to ensure uniqueness
        const randomSuffix = randomBytes(4).toString('hex');
        const slug = `${baseSlug}-${randomSuffix}`;

        // TODO: Generate admin token when implementing database
        // const adminToken = randomBytes(32).toString('hex');
        // const tokenExpires = new Date();
        // tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hour expiry

        // TODO: Save to database
        // For now, just simulate the creation
        // console.log('Creating job board:', { name, email, slug, adminToken });

        // TODO: Send magic link email
        // console.log(`Magic link: /admin/${adminToken}`);

        throw redirect(303, `/${slug}?created=true`);
    }
};
