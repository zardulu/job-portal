import { redirect } from '@sveltejs/kit';
// import { randomBytes } from 'crypto'; // TODO: Uncomment when implementing database
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    // TODO: Fetch community from database
    const community = {
        id: 1,
        slug: slug,
        name: slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Jobs',
        description: 'Find great opportunities in our community'
    };

    return {
        community
    };
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        const { slug } = params;

        const jobData = {
            title: data.get('title') as string,
            company: data.get('company') as string,
            location: data.get('location') as string,
            category: data.get('category') as string,
            salary_min: data.get('salary_min') as string,
            salary_max: data.get('salary_max') as string,
            description: data.get('description') as string,
            contact_info: data.get('contact_info') as string,
            poster_email: data.get('poster_email') as string,
        };

        // Validate required fields
        const requiredFields = ['title', 'company', 'location', 'category', 'description', 'contact_info', 'poster_email'];
        for (const field of requiredFields) {
            if (!jobData[field as keyof typeof jobData]) {
                return {
                    error: `${field.replace('_', ' ')} is required`
                };
            }
        }

        // TODO: Generate edit token when implementing database
        // const editToken = randomBytes(32).toString('hex');
        // const tokenExpires = new Date();
        // tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hour expiry

        // TODO: Save to database
        // console.log('Creating job posting:', {
        //     ...jobData,
        //     editToken,
        //     tokenExpires,
        //     slug
        // });

        // TODO: Send edit link email to poster
        // console.log(`Edit link: /${slug}/jobs/edit/${editToken}`);

        throw redirect(303, `/${slug}?posted=true`);
    }
};
