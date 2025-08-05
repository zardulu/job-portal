<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
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
</script>

<svelte:head>
    <title>Post a Job - {data.community.name}</title>
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
                    <span class="text-lg text-gray-600">Post Job</span>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
            
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
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Senior Frontend Developer"
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
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Tech Corp"
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
                            <option value="">Select Location</option>
                            <option value="Remote">Remote</option>
                            <option value="New York">New York</option>
                            <option value="San Francisco">San Francisco</option>
                            <option value="London">London</option>
                            <option value="Other">Other</option>
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
                            <option value="">Select Category</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Other">Other</option>
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
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="50000"
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
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="100000"
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
                        rows="6"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity special..."
                    ></textarea>
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
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="hr@company.com"
                    />
                    <p class="text-sm text-gray-500 mt-1">
                        This email will be displayed to applicants
                    </p>
                </div>

                <div class="mb-6">
                    <label for="poster_email" class="block text-sm font-medium text-gray-700 mb-2">
                        Your Email (for editing) *
                    </label>
                    <input
                        type="email"
                        id="poster_email"
                        name="poster_email"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                    />
                    <p class="text-sm text-gray-500 mt-1">
                        We'll send you a magic link to edit or delete this job posting
                    </p>
                </div>

                <div class="flex gap-4">
                    <button
                        type="button"
                        onclick={() => goto(`/${data.community.slug}`)}
                        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition"
                    >
                        {loading ? 'Posting Job...' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    </main>
</div>
