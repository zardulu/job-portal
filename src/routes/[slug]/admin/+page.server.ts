import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const { slug } = params;
    const token = url.searchParams.get('token');

    // TODO: Validate admin token from database
    if (!token) {
        throw redirect(303, `/${slug}`);
    }

    // TODO: Fetch from database
    const community = {
        id: 1,
        slug: slug,
        name: slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Jobs',
        description: 'Find great opportunities in our community',
        admin_email: 'admin@example.com',
        created_at: '2024-01-10T00:00:00Z'
    };

    const jobs = [
        {
            id: 1,
            title: 'Senior Frontend Developer',
            description: 'We are looking for a skilled frontend developer to join our team.',
            company: 'Tech Corp',
            location: 'Remote',
            category: 'Engineering',
            contact_info: 'hr@techcorp.com',
            created_at: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            title: 'UX Designer',
            description: 'Join our design team to create beautiful user experiences.',
            company: 'Design Studio',
            location: 'San Francisco',
            category: 'Design',
            contact_info: 'design@studio.com',
            created_at: '2024-01-14T15:30:00Z'
        }
    ];

    return {
        community,
        jobs
    };
};

export const actions: Actions = {
    deleteJob: async ({ request }) => {
        const data = await request.formData();
        const jobId = data.get('jobId') as string;

        if (!jobId) {
            return { error: 'Job ID is required' };
        }

        // TODO: Delete job from database
        // console.log(`Deleting job ${jobId} from board ${slug}`);

        return { success: true };
    },

    deleteBoard: async () => {

        // TODO: Delete entire board and all jobs from database
        // console.log(`Deleting entire board: ${slug}`);

        throw redirect(303, '/?deleted=true');
    }
};
