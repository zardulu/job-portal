import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const { slug, jobId } = params;
    const token = url.searchParams.get('token');

    // TODO: Validate edit token from database
    if (!token) {
        throw redirect(303, `/${slug}/jobs/${jobId}`);
    }

    // TODO: Fetch from database
    const community = {
        id: 1,
        slug: slug,
        name: slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Jobs',
        description: 'Find great opportunities in our community'
    };

    // Mock job data - in reality this would come from database
    const job = {
        id: parseInt(jobId),
        title: 'Senior Frontend Developer',
        description: 'We are looking for a skilled frontend developer to join our team and help build the next generation of web applications.',
        company: 'Tech Corp',
        location: 'Remote',
        category: 'Engineering',
        contact_info: 'hr@techcorp.com',
        salary_min: 120000,
        salary_max: 180000,
        poster_email: 'poster@example.com',
        edit_token: token,
        created_at: '2024-01-15T10:00:00Z'
    };

    if (!job) {
        throw error(404, 'Job not found');
    }

    return {
        community,
        job
    };
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

    deleteJob: async ({ params }) => {
        const { slug } = params;

        // TODO: Delete job from database
        // console.log(`Deleting job ${jobId}`);

        throw redirect(303, `/${slug}?deleted=true`);
    }
};
