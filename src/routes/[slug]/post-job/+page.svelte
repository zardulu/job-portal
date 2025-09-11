<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { countryOptions } from '$lib/countries';
    
    interface Props {
        data: {
            community: {
                slug: string;
                name: string;
            };
        };
    }
    
    let { data }: Props = $props();
    let loading = $state(false);
    let isRemote = $state(false);
    let jobType = $state<'Full-time' | 'Part-time' | 'Contract'>('Full-time');
    let selectedLocation = $state('🌐 Anywhere');
</script>

<svelte:head>
    <title>Post a Job - {data.community.name}</title>
</svelte:head>

<div class="min-h-screen bg-bg font-brutal">
    <!-- Brutalist Navbar -->
    <nav class="bg-primary border-b-4 border-border shadow-brutal rounded-b-brutal">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex items-center justify-between py-4">
                <div class="flex items-center">
                    <a href="/" class="text-brutal-lg text-text font-bold tracking-wider hover:animate-brutal-bounce">fren.work</a>
                    <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                    <a href="/{data.community.slug}" class="text-brutal-lg text-text font-bold tracking-wider hover:animate-brutal-bounce">{data.community.name}</a>
                    <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                    <span class="text-brutal-lg text-text font-bold">Post Job</span>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-2xl mx-auto px-4 py-6">
        <div class="bg-surface border-3 border-border shadow-brutal-card p-6 rounded-brutal-lg">
            <!-- Header -->
            <h1 class="text-brutal-xl font-bold text-text mb-6 text-center">
                Post a New<br>
                <span class="bg-green-400 text-text px-3 py-1 inline-block shadow-brutal-soft rounded-brutal">Job</span>
            </h1>
            
            <form method="POST" use:enhance={() => {
                loading = true;
                return async ({ result, update }) => {
                    loading = false;
                    if (result.type === 'redirect') {
                        goto(result.location);
                    } else {
                        await update();
                    }
                };
            }} class="space-y-6">
                
                <!-- Job Title -->
                <div>
                    <label for="title" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="Senior Frontend Developer"
                    />
                </div>

                <!-- Company Name -->
                <div>
                    <label for="company" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="Tech Corp"
                    />
                </div>

                <!-- Remote Toggle -->
                <div class="flex items-center gap-3">
                    <input id="remote" type="checkbox" class="h-5 w-5 border-3 border-border rounded-brutal"
                        bind:checked={isRemote} />
                    <label for="remote" class="text-brutal-md font-semibold text-text tracking-wide">Remote</label>
                    <input type="hidden" name="remote" value={isRemote ? '1' : '0'} />
                </div>

                <!-- Location -->
                <div>
                    <label for="location" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Location {isRemote ? '(optional)' : '*'}
                    </label>
                    <select
                        id="location"
                        name="location"
                        bind:value={selectedLocation}
                        required={!isRemote}
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                    >
                        {#each countryOptions as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </div>

                <!-- Category -->
                <div>
                    <label for="category" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Category *
                    </label>
                    <select
                        id="category"
                        name="category"
                        required
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                    >
                        <option value="">Select Category</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <!-- Job Type -->
                <div>
                    <div class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">Job Type</div>
                    <div class="flex flex-wrap gap-4">
                        <label class="inline-flex items-center gap-2 px-3 py-2 border-3 border-border rounded-brutal cursor-pointer">
                            <input type="radio" name="job_type" value="Full-time" bind:group={jobType} checked class="h-4 w-4" />
                            <span>Full-time</span>
                        </label>
                        <label class="inline-flex items-center gap-2 px-3 py-2 border-3 border-border rounded-brutal cursor-pointer">
                            <input type="radio" name="job_type" value="Part-time" bind:group={jobType} class="h-4 w-4" />
                            <span>Part-time</span>
                        </label>
                        <label class="inline-flex items-center gap-2 px-3 py-2 border-3 border-border rounded-brutal cursor-pointer">
                            <input type="radio" name="job_type" value="Contract" bind:group={jobType} class="h-4 w-4" />
                            <span>Contract</span>
                        </label>
                    </div>
                </div>

                <!-- Salary Range (Min) -->
                <div>
                    <label for="salary_min" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Salary Range (Min)
                    </label>
                    <input
                        type="number"
                        id="salary_min"
                        name="salary_min"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="50000"
                    />
                </div>

                <!-- Salary Range (Max) -->
                <div>
                    <label for="salary_max" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Salary Range (Max)
                    </label>
                    <input
                        type="number"
                        id="salary_max"
                        name="salary_max"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="100000"
                    />
                </div>

                <!-- Job Description -->
                <div>
                    <label for="description" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Job Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows="6"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 resize-none rounded-brutal"
                        placeholder="Describe the role, responsibilities, requirements..."
                    ></textarea>
                </div>

                <!-- Contact Information -->
                <div>
                    <label for="contact_info" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Contact Information *
                    </label>
                    <input
                        type="email"
                        id="contact_info"
                        name="contact_info"
                        required
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="hr@company.com"
                    />
                    <div class="bg-surface border-3 border-border p-3 mt-3 shadow-brutal-soft rounded-brutal">
                        <p class="text-text font-medium text-brutal-sm text-center">
                            This email will be displayed to applicants
                        </p>
                    </div>
                </div>

                <!-- Your Email (For Editing) -->
                <div>
                    <label for="poster_email" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Your Email (For Editing) *
                    </label>
                    <input
                        type="email"
                        id="poster_email"
                        name="poster_email"
                        required
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="your@email.com"
                    />
                    <div class="bg-green-400 border-3 border-border p-3 mt-3 shadow-brutal-soft rounded-brutal">
                        <p class="text-text font-medium text-brutal-sm text-center">
                            We'll send you a magic link to edit this job posting
                        </p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-4 justify-center pt-3">
                    <button
                        type="button"
                        onclick={() => goto(`/${data.community.slug}`)}
                        class="bg-surface text-text px-6 py-3 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 rounded-brutal"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        class="bg-green-400 text-text px-6 py-3 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:bg-green-500 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm transition-all duration-150 rounded-brutal {loading ? 'animate-brutal-pulse' : ''}"
                    >
                        {loading ? 'Posting Job...' : 'Post Job'}
                    </button>
                </div>
            </form>

            <!-- Motivation Section -->
            <div class="mt-8 bg-green-400 border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                <h3 class="font-semibold text-brutal-md mb-3 text-center">Why Post Here?</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <p class="text-text font-medium text-brutal-sm">Fast Posting</p>
                    <p class="text-text font-medium text-brutal-sm">Cost Effective</p>
                    <p class="text-text font-medium text-brutal-sm">Targeted Reach</p>
                </div>
            </div>
        </div>
    </main>
</div>