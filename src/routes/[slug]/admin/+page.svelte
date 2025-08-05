<script lang="ts">
    import { enhance } from '$app/forms';
    
    interface Props {
        data: {
            community: {
                slug: string;
                name: string;
                admin_email: string;
                created_at: string;
            };
            jobs: Array<{
                id: number;
                title: string;
                company: string;
                location: string;
                category: string;
                created_at: string;
            }>;
        };
    }
    
    let { data }: Props = $props();
    
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString();
    }

    function confirmBoardDeletion() {
        if (typeof globalThis !== 'undefined' && globalThis.confirm && globalThis.confirm(`Are you sure you want to delete the entire "${data.community.name}" job board? This action cannot be undone and will delete all jobs.`)) {
            if (typeof globalThis.document !== 'undefined') {
                const form = globalThis.document.getElementById('delete-board-form');
                if (form && 'submit' in form) {
                    (form as any).submit();
                }
            }
        }
    }
</script>

<svelte:head>
    <title>Admin - {data.community.name}</title>
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
                    <span class="text-lg text-gray-600">Admin</span>
                </div>
                <div class="flex gap-2">
                    <a
                        href="/{data.community.slug}"
                        class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        View Board
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600 mt-2">Manage your job board and postings</p>
        </div>

        <!-- Board Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Jobs</h3>
                <p class="text-3xl font-bold text-blue-600">{data.jobs.length}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
                <p class="text-3xl font-bold text-green-600">
                    {data.jobs.filter(job => {
                        const jobDate = new Date(job.created_at);
                        const now = new Date();
                        return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
                    }).length}
                </p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Board Created</h3>
                <p class="text-lg text-gray-600">{formatDate(data.community.created_at)}</p>
            </div>
        </div>

        <!-- Jobs Management -->
        <div class="bg-white rounded-lg shadow mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">Manage Jobs</h2>
            </div>
            
            {#if data.jobs.length === 0}
                <div class="text-center py-12">
                    <p class="text-gray-500">No jobs posted yet.</p>
                    <a
                        href="/{data.community.slug}/post-job"
                        class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Post First Job
                    </a>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Job Details
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
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
                            {#each data.jobs as job}
                                <tr>
                                    <td class="px-6 py-4">
                                        <div>
                                            <h3 class="text-sm font-medium text-gray-900">{job.title}</h3>
                                            <p class="text-sm text-gray-500">{job.location} • {job.category}</p>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{job.company || 'Not specified'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-500">{formatDate(job.created_at)}</td>
                                    <td class="px-6 py-4 text-sm">
                                        <div class="flex gap-2">
                                            <a
                                                href="/{data.community.slug}/jobs/{job.id}"
                                                class="text-blue-600 hover:text-blue-900"
                                            >
                                                View
                                            </a>
                                            <form method="POST" action="?/deleteJob" use:enhance={() => {
                                                return async ({ result, update }) => {
                                                    if (result.type === 'success') {
                                                        await update();
                                                    }
                                                };
                                            }} class="inline">
                                                <input type="hidden" name="jobId" value={job.id} />
                                                <button
                                                    type="submit"
                                                    onclick={() => typeof globalThis !== 'undefined' && globalThis.confirm && globalThis.confirm('Are you sure you want to delete this job?')}
                                                    class="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>

        <!-- Board Management -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">Board Settings</h2>
            </div>
            <div class="p-6">
                <div class="mb-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Board Information</h3>
                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Name</dt>
                            <dd class="text-sm text-gray-900">{data.community.name}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">URL</dt>
                            <dd class="text-sm text-gray-900">/{data.community.slug}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Admin Email</dt>
                            <dd class="text-sm text-gray-900">{data.community.admin_email}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-gray-500">Created</dt>
                            <dd class="text-sm text-gray-900">{formatDate(data.community.created_at)}</dd>
                        </div>
                    </dl>
                </div>

                <div class="border-t border-gray-200 pt-6">
                    <h3 class="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                    <div class="bg-red-50 border border-red-200 rounded-md p-4">
                        <p class="text-sm text-red-700 mb-4">
                            Deleting your job board will permanently remove all jobs and cannot be undone.
                        </p>
                        <form id="delete-board-form" method="POST" action="?/deleteBoard" class="hidden">
                            <!-- Hidden form for board deletion -->
                        </form>
                        <button
                            type="button"
                            onclick={confirmBoardDeletion}
                            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                        >
                            Delete Job Board
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
