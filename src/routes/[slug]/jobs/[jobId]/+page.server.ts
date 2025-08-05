import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug, jobId } = params;

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
    const jobs = [
        {
            id: 1,
            title: 'Senior Frontend Developer',
            description: `We are looking for a skilled frontend developer to join our team and help build the next generation of web applications.

About the Role:
We're seeking a passionate Senior Frontend Developer to join our growing engineering team. You'll be responsible for building and maintaining our web applications using modern technologies and best practices.

Responsibilities:
• Develop and maintain high-quality web applications using React, TypeScript, and modern CSS
• Collaborate with designers and backend engineers to implement pixel-perfect UIs
• Write clean, maintainable, and well-tested code
• Participate in code reviews and mentor junior developers
• Optimize applications for maximum speed and scalability

Requirements:
• 5+ years of experience with frontend development
• Strong proficiency in React, TypeScript, and modern JavaScript
• Experience with state management (Redux, Zustand, etc.)
• Knowledge of testing frameworks (Jest, Cypress, etc.)
• Familiarity with modern build tools and CI/CD pipelines
• Strong communication skills and ability to work in a team environment

Nice to Have:
• Experience with Next.js or similar meta-frameworks
• Knowledge of backend technologies (Node.js, Python, etc.)
• Understanding of DevOps practices
• Open source contributions

What We Offer:
• Competitive salary and equity package
• Flexible working hours and remote-friendly culture
• Professional development budget
• Top-tier health, dental, and vision insurance
• Unlimited PTO policy`,
            company: 'Tech Corp',
            location: 'Remote',
            category: 'Engineering',
            contact_info: 'hr@techcorp.com',
            salary_min: 120000,
            salary_max: 180000,
            created_at: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            title: 'UX Designer',
            description: `Join our design team to create beautiful and intuitive user experiences that delight our customers.

About the Role:
We're looking for a talented UX Designer to help shape the future of our products. You'll work closely with product managers, engineers, and other designers to create user-centered designs that solve real problems.

Responsibilities:
• Conduct user research and usability testing
• Create wireframes, prototypes, and high-fidelity designs
• Collaborate with cross-functional teams throughout the product development process
• Maintain and evolve our design system
• Present design solutions to stakeholders

Requirements:
• 3+ years of UX design experience
• Proficiency in Figma and other design tools
• Strong portfolio showcasing user-centered design process
• Experience with user research methodologies
• Understanding of accessibility principles
• Excellent communication and presentation skills

What We Offer:
• Competitive compensation package
• Creative freedom and autonomy
• Collaborative team environment
• Learning and development opportunities
• Modern office space with design-friendly tools`,
            company: 'Design Studio',
            location: 'San Francisco',
            category: 'Design',
            contact_info: 'design@studio.com',
            salary_min: 90000,
            salary_max: 130000,
            created_at: '2024-01-14T15:30:00Z'
        }
    ];

    const job = jobs.find(j => j.id === parseInt(jobId));
    
    if (!job) {
        throw error(404, 'Job not found');
    }

    return {
        community,
        job
    };
};
