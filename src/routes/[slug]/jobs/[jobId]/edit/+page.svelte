<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
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
            };
        };
    }
    
    let { data }: Props = $props();
    let loading = $state(false);

    function confirmDelete() {
        if (typeof globalThis !== 'undefined' && globalThis.confirm && globalThis.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
            if (typeof globalThis.document !== 'undefined') {
                const form = globalThis.document.getElementById('delete-form');
                if (form && 'submit' in form) {
                    (form as any).submit();
                }
            }
        }
    }
</script>

<svelte:head>
    <title>Edit Job - {data.job.title}</title>
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
                    <span class="text-lg text-gray-600">Edit Job</span>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Job Posting</h1>
            
            <form method="POST" action="?/updateJob" use:enhance={() => {
                loading = true;
                return async ({ result, update }) => {
                    loading = false;
                    if (result.type === 'redirect') {
                        goto(result.location);
                    } else {
                        await update();
                    }
                };
            }}>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={data.job.title}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            required
                            value={data.job.company}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                        </label>
                        <select
                            id="location"
                            name="location"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Remote" selected={data.job.location === 'Remote'}>Remote</option>
                            <option value="New York" selected={data.job.location === 'New York'}>New York</option>
                            <option value="San Francisco" selected={data.job.location === 'San Francisco'}>San Francisco</option>
                            <option value="London" selected={data.job.location === 'London'}>London</option>
                            <option value="Other" selected={data.job.location === 'Other'}>Other</option>
                        </select>
                    </div>

                    <div>
                        <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Engineering" selected={data.job.category === 'Engineering'}>Engineering</option>
                            <option value="Design" selected={data.job.category === 'Design'}>Design</option>
                            <option value="Marketing" selected={data.job.category === 'Marketing'}>Marketing</option>
                            <option value="Sales" selected={data.job.category === 'Sales'}>Sales</option>
                            <option value="Other" selected={data.job.category === 'Other'}>Other</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label for="salary_min" class="block text-sm font-medium text-gray-700 mb-2">
                            Salary Range (Min)
                        </label>
                        <input
                            type="number"
                            id="salary_min"
                            name="salary_min"
                            value={data.job.salary_min || ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="salary_max" class="block text-sm font-medium text-gray-700 mb-2">
                            Salary Range (Max)
                        </label>
                        <input
                            type="number"
                            id="salary_max"
                            name="salary_max"
                            value={data.job.salary_max || ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div class="mb-6">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                        Job Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows="8"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >{data.job.description}</textarea>
                </div>

                <div class="mb-6">
                    <label for="contact_info" class="block text-sm font-medium text-gray-700 mb-2">
                        Contact Information *
                    </label>
                    <input
                        type="email"
                        id="contact_info"
                        name="contact_info"
                        required
                        value={data.job.contact_info}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="flex gap-4">
                    <button
                        type="button"
                        onclick={() => goto(`/${data.community.slug}/jobs/${data.job.id}`)}
                        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
            <div class="bg-red-50 border border-red-200 rounded-md p-4">
                <p class="text-sm text-red-700 mb-4">
                    Deleting this job posting will permanently remove it from the job board. This action cannot be undone.
                </p>
                <form id="delete-form" method="POST" action="?/deleteJob" class="hidden">
                    <!-- Hidden form for deletion -->
                </form>
                <button
                    type="button"
                    onclick={confirmDelete}
                    class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                    Delete Job Posting
                </button>
            </div>
        </div>
    </main>
</div>
