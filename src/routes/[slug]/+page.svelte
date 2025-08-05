<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    interface Props {
        data: { 
            community: { slug: string; name: string; }; 
            jobs: Array<{
                id: number;
                title: string;
                description: string;
                company: string;
                location: string;
                category: string;
                created_at: string;
            }>;
        };
    }
    
    let { data }: Props = $props();
    
    let searchQuery = $state('');
    let selectedCategory = $state('');
    let selectedLocation = $state('');
    
    let filteredJobs = $derived(data.jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || job.category === selectedCategory;
        const matchesLocation = !selectedLocation || job.location === selectedLocation;
        
        return matchesSearch && matchesCategory && matchesLocation;
    }));

    function createJob() {
        goto(`/${data.community.slug}/post-job`);
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString();
    }
</script>

<svelte:head>
    <title>{data.community.name} - Job Board</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-lg font-semibold text-gray-900">fren.work</a>
                    <span class="mx-2 text-gray-400">/</span>
                    <h1 class="text-lg font-semibold text-gray-900">{data.community.name}</h1>
                </div>
                <button
                    onclick={createJob}
                    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                    + Post Job
                </button>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Success messages -->
        {#if $page?.url?.searchParams?.get('created')}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                🎉 Job board created successfully! Check your email for the management link.
            </div>
        {/if}

        {#if $page?.url?.searchParams?.get('posted')}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                ✅ Job posted successfully! Check your email for the edit link.
            </div>
        {/if}

        {#if $page?.url?.searchParams?.get('deleted')}
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                🗑️ Job deleted successfully.
            </div>
        {/if}

        <!-- Filters and Search -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
                        Search Jobs
                    </label>
                    <input
                        type="text"
                        id="search"
                        bind:value={searchQuery}
                        placeholder="Search by title or description..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        id="category"
                        bind:value={selectedCategory}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <select
                        id="location"
                        bind:value={selectedLocation}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Locations</option>
                        <option value="Remote">Remote</option>
                        <option value="New York">New York</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="London">London</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Jobs Table -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">
                    Jobs ({filteredJobs.length})
                </h2>
            </div>
            
            {#if filteredJobs.length === 0}
                <div class="text-center py-12">
                    <p class="text-gray-500">No jobs found matching your criteria.</p>
                    <button
                        onclick={createJob}
                        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Post the First Job
                    </button>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Job Title
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posted
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each filteredJobs as job}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <div>
                                            <h3 class="text-sm font-medium text-gray-900">{job.title}</h3>
                                            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{job.company || 'Not specified'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{job.location || 'Remote'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-500">{formatDate(job.created_at)}</td>
                                    <td class="px-6 py-4 text-sm">
                                        <a
                                            href="/{data.community.slug}/jobs/{job.id}"
                                            class="text-blue-600 hover:text-blue-900"
                                        >
                                            View Details
                                        </a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </main>
</div>

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
