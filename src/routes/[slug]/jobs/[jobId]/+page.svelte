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
                job_type?: string;
                remote?: number;
                contact_info?: string;
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
        if (!min && !max) return 'SALARY NOT SPECIFIED';
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        if (min) return `FROM $${min.toLocaleString()}`;
        if (max) return `UP TO $${max.toLocaleString()}`;
    }
</script>

<svelte:head>
    <title>{data.job.title} - {data.community.name}</title>
    <meta name="description" content={data.job.description.substring(0, 150)} />
</svelte:head>

<div class="min-h-screen bg-bg font-brutal">
    <!-- Brutalist Navbar -->
    <nav class="bg-primary border-b-4 border-border shadow-brutal rounded-b-brutal">
        <div class="max-w-5xl mx-auto px-4">
            <div class="flex items-center justify-between py-4">
                <!-- <div class="flex items-center">
                    <a href="/" class="text-brutal-lg text-text font-bold tracking-wider hover:animate-brutal-bounce">fren.work</a>
                    <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                    <a href="/{data.community.slug}" class="text-brutal-lg text-text font-bold tracking-wider hover:animate-brutal-bounce">{data.community.name}</a>
                    <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                    <span class="text-brutal-lg text-text font-bold">Job Details</span>
                </div> -->
                <div class="flex items-center">
                    <a href="/" class="text-brutal-xl text-text font-black uppercase tracking-wider hover:bg-secondary hover:px-2  hover:text-green-400 transition-all ">FREN.WORK</a>
                   <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                   <a href="/{data.community.slug}" class="text-brutal-lg text-text font-bold tracking-wider hover:animate-brutal-bounce hover:bg-accent hover:px-2 transition-all">{data.community.name}</a>
                   <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                   <span class="text-brutal-lg text-text font-bold">{data.job.title}</span>
               </div>
                <a
                    href="/{data.community.slug}"
                    class="bg-surface text-text px-4 py-2 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 rounded-brutal"
                >
                    Back to Jobs
                </a>
            </div>
        </div>
    </nav>

    <main class="max-w-4xl mx-auto px-4 py-6">
        <!-- Success message -->
        {#if $page?.url?.searchParams?.get('updated')}
            <div class="bg-green-400 text-text px-6 py-3 border-3 border-border shadow-brutal-soft font-semibold mb-6 rounded-brutal">
                Job updated successfully!
            </div>
        {/if}

        <div class="bg-surface border-3 border-border shadow-brutal-card rounded-brutal-lg overflow-hidden">
            <!-- Job Header -->
            <div class="bg-green-400 border-b-3 border-border px-6 py-6">
                <div class="flex items-start justify-between">
                    <div>
                        <h1 class="text-xl font-bold text-text py-4">{data.job.title}</h1>
                        <!-- <div class="flex flex-wrap items-center gap-3">
                            {#if data.job.job_type}
                                <span class="bg-brutal-cyan text-white px-3 py-1 font-semibold text-brutal-sm rounded-brutal">
                                    {data.job.job_type === 'Full-time' ? '💼' : data.job.job_type === 'Part-time' ? '⏰' : '📋'} {data.job.job_type}
                                </span>
                            {/if}
                            {#if data.job.remote}
                                <span class="bg-brutal-green text-white px-3 py-1 font-semibold text-brutal-sm rounded-brutal">
                                    💻 Remote
                                </span>
                            {/if}
                            {#if data.job.company}
                                <span class="bg-brutal-blue text-white px-3 py-1 font-semibold text-brutal-sm rounded-brutal">
                                    🏢 {data.job.company}
                                </span>
                            {/if}
                            {#if data.job.location}
                                <span class="bg-brutal-purple text-white px-3 py-1 font-semibold text-brutal-sm rounded-brutal">
                                    📍 {data.job.location}
                                </span>
                            {/if}
                            {#if data.job.category}
                                <span class="bg-brutal-orange text-white px-3 py-1 font-semibold text-brutal-sm rounded-brutal">
                                    🏷️ {data.job.category}
                                </span>
                            {/if}
                        </div> -->
                    </div>
                    <div class="text-right bg-surface text-text px-4 py-3 border-3 border-border shadow-brutal-soft rounded-brutal">
                        <div class="text-brutal-sm font-semibold">Posted</div>
                        <div class="text-brutal-md font-semibold">{formatDate(data.job.created_at)}</div>
                    </div>
                </div>
            </div>

            <!-- Job Content -->
            <div class="px-6 py-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main Content -->
                    <div class="lg:col-span-2">
                        <div class="bg-bg border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                            <!-- <h2 class="text-brutal-lg font-semibold text-text mb-4 text-center bg-surface px-3 py-2 inline-block shadow-brutal-soft rounded-brutal">Job Description</h2> -->
                            <div class="">
                                <div class="whitespace-pre-wrap text-text font-medium text-base leading-relaxed">
                                    {data.job.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="lg:col-span-1 space-y-4">
                        <!-- Job Details -->
                        <div class="bg-surface border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                            <h3 class="text-brutal-md font-semibold text-text mb-4 text-center">Job Details</h3>
                            <dl class="space-y-3">
                                {#if data.job.job_type}
                                    <div>
                                        <dt class="text-brutal-sm font-semibold text-text mb-1">💼 Job Type</dt>
                                        <dd class="text-text font-medium text-base">{data.job.job_type}</dd>
                                    </div>
                                {/if}
                                {#if data.job.remote}
                                    <div>
                                        <dt class="text-brutal-sm font-semibold text-text mb-1">💻 Remote</dt>
                                        <dd class="text-text font-medium text-base">Yes</dd>
                                    </div>
                                {/if}
                                {#if data.job.company}
                                    <div>
                                        <dt class="text-brutal-sm font-semibold text-text mb-1">🏢 Company</dt>
                                        <dd class="text-text font-medium text-base">{data.job.company}</dd>
                                    </div>
                                {/if}
                                {#if data.job.location}
                                    <div>
                                        <dt class="text-brutal-sm font-semibold text-text mb-1">📍 Location</dt>
                                        <dd class="text-text font-medium text-base">{data.job.location}</dd>
                                    </div>
                                {/if}
                                {#if data.job.category}
                                    <div>
                                        <dt class="text-brutal-sm font-semibold text-text mb-1">🏷️ Category</dt>
                                        <dd class="text-text font-medium text-base">{data.job.category}</dd>
                                    </div>
                                {/if}
                                {#if data.job.salary_min || data.job.salary_max}
                                    <div>
                                        <dt class="text-brutal-sm font-semibold text-text mb-1">💰 Salary</dt>
                                        <dd class="text-text font-medium text-base">{formatSalary(data.job.salary_min, data.job.salary_max)}</dd>
                                    </div>
                                {/if}
                                <!-- <div>
                                    <dt class="text-brutal-sm font-semibold text-text mb-1">📅 Posted</dt>
                                    <dd class="text-text font-medium text-base">{formatDate(data.job.created_at)}</dd>
                                </div> -->
                            </dl>
                        </div>

                        <!-- Apply Section -->
                        {#if data.job.contact_info}
                            <div class="bg-green-400 border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                                <h3 class="text-brutal-md font-semibold text-text mb-3 text-center">Apply for This Job</h3>
                                <p class="text-text font-medium text-brutal-sm mb-4 text-center">
                                    Interested? Reach out directly to the hiring team.
                                </p>
                                <a
                                    href="mailto:{data.job.contact_info}?subject=Application for {data.job.title}"
                                    class="w-full bg-surface text-text text-center py-3 px-4 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 block rounded-brutal"
                                >
                                    Apply Now
                                </a>
                                <div class="bg-surface border-2 border-border p-2 mt-3 shadow-brutal-soft rounded">
                                    <p class="text-text font-medium text-xs text-center">
                                        {data.job.contact_info}
                                    </p>
                                </div>
                            </div>
                        {:else}
                            <div class="bg-surface border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                                <h3 class="text-brutal-md font-semibold text-text mb-3 text-center">How to Apply</h3>
                                <p class="text-text font-medium text-brutal-sm text-center">
                                    Contact information not provided. Check the job description for application instructions.
                                </p>
                            </div>
                        {/if}

                        <!-- Motivation Box -->
                        <!-- <div class="bg-surface border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                            <h4 class="text-brutal-md font-semibold text-text mb-3 text-center">Don't Wait!</h4>
                            <p class="text-text font-medium text-brutal-sm text-center">
                                The best opportunities go fast. Apply today!
                            </p>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>