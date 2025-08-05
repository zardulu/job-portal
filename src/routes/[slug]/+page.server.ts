import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    // TODO: Fetch from database
    // For now, return mock data
    const community = {
        id: 1,
        slug: slug,
        name: slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Jobs',
        description: 'Find great opportunities in our community'
    };

    const jobs = [
        {
            id: 1,
            title: 'Senior Frontend Developer',
            description: 'We are looking for a skilled frontend developer to join our team. Experience with React, TypeScript, and modern web technologies required.',
            company: 'Tech Corp',
            location: 'Remote',
            category: 'Engineering',
            contact_info: 'hr@techcorp.com',
            created_at: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            title: 'UX Designer',
            description: 'Join our design team to create beautiful and intuitive user experiences. Figma and prototyping skills essential.',
            company: 'Design Studio',
            location: 'San Francisco',
            category: 'Design',
            contact_info: 'design@studio.com',
            created_at: '2024-01-14T15:30:00Z'
        },
        {
            id: 3,
            title: 'Marketing Manager',
            description: 'Lead our marketing efforts across digital channels. Experience with growth marketing and analytics required.',
            company: 'Growth Co',
            location: 'New York',
            category: 'Marketing',
            contact_info: 'jobs@growthco.com',
            created_at: '2024-01-13T09:15:00Z'
        }
    ];

    return {
        community,
        jobs
    };
};
