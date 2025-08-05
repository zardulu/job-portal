<script lang="ts">
    import { page } from '$app/stores';
    
    interface Props {
        data: {
            community: {
                slug: string;
                name: string;
            };
            job: {
                id: number;
                title: string;
                description: string;
                company: string;
                location: string;
                category: string;
                contact_info: string;
                salary_min?: number;
                salary_max?: number;
                created_at: string;
            };
        };
    }
    
    let { data }: Props = $props();
    
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatSalary(min?: number, max?: number) {
        if (!min && !max) return 'Salary not specified';
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        if (min) return `From $${min.toLocaleString()}`;
        if (max) return `Up to $${max.toLocaleString()}`;
    }
</script>

<svelte:head>
    <title>{data.job.title} - {data.community.name}</title>
    <meta name="description" content={data.job.description.substring(0, 150)} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-lg font-semibold text-gray-900">fren.work</a>
                    <span class="mx-2 text-gray-400">/</span>
                    <a href="/{data.community.slug}" class="text-lg font-semibold text-gray-900">{data.community.name}</a>
                    <span class="mx-2 text-gray-400">/</span>
                    <span class="text-lg text-gray-600">Job Details</span>
                </div>
                <a
                    href="/{data.community.slug}"
                    class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                    Back to Jobs
                </a>
            </div>
        </div>
    </nav>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Success message -->
        {#if $page?.url?.searchParams?.get('updated')}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                ✅ Job updated successfully!
            </div>
        {/if}
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Job Header -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
                <div class="flex items-start justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">{data.job.title}</h1>
                        <div class="flex items-center gap-4 text-blue-100">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"></path>
                                </svg>
                                {data.job.company}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                                </svg>
                                {data.job.location}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                                </svg>
                                {data.job.category}
                            </span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-blue-100">Posted</div>
                        <div class="text-lg font-semibold">{formatDate(data.job.created_at)}</div>
                    </div>
                </div>
            </div>

            <!-- Job Content -->
            <div class="px-8 py-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main Content -->
                    <div class="lg:col-span-2">
                        <div class="mb-8">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                            <div class="prose prose-gray max-w-none">
                                <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {data.job.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="lg:col-span-1">
                        <div class="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                            <dl class="space-y-3">
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Company</dt>
                                    <dd class="text-sm text-gray-900">{data.job.company}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Location</dt>
                                    <dd class="text-sm text-gray-900">{data.job.location}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Category</dt>
                                    <dd class="text-sm text-gray-900">{data.job.category}</dd>
                                </div>
                                {#if data.job.salary_min || data.job.salary_max}
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">Salary</dt>
                                        <dd class="text-sm text-gray-900">{formatSalary(data.job.salary_min, data.job.salary_max)}</dd>
                                    </div>
                                {/if}
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Posted</dt>
                                    <dd class="text-sm text-gray-900">{formatDate(data.job.created_at)}</dd>
                                </div>
                            </dl>
                        </div>

                        <!-- Apply Section -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Apply for this Job</h3>
                            <p class="text-sm text-gray-600 mb-4">
                                Interested in this position? Reach out directly to the hiring team.
                            </p>
                            <a
                                href="mailto:{data.job.contact_info}?subject=Application for {data.job.title}"
                                class="w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600 transition block"
                            >
                                Apply Now
                            </a>
                            <p class="text-xs text-gray-500 mt-2 text-center">
                                {data.job.contact_info}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
