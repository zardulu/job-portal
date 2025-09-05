<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let isDeleting = false;
</script>

<svelte:head>
	<title>Edit Job - {data.job.title}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-2xl mx-auto px-4">
		<div class="bg-white rounded-lg shadow-md p-6">
			<h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Job Posting</h1>

			{#if form?.success && !form?.deleted}
				<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
					<p class="text-green-800">{form.message}</p>
				</div>
			{/if}

			{#if form?.success && form?.deleted}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
					<p class="text-red-800">{form.message}</p>
					<p class="text-sm text-red-600 mt-2">This job posting has been permanently removed.</p>
				</div>
			{:else}
				{#if form?.error}
					<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
						<p class="text-red-800">{form.error}</p>
					</div>
				{/if}

				<form method="POST" action="?/update" use:enhance class="space-y-6">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
							Job Title *
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={form?.title || data.job.title}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Job Description *
						</label>
						<textarea
							id="description"
							name="description"
							rows="8"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>{form?.description || data.job.description}</textarea>
					</div>

					<div>
						<label for="contact_info" class="block text-sm font-medium text-gray-700 mb-2">
							Contact Information *
						</label>
						<textarea
							id="contact_info"
							name="contact_info"
							rows="3"
							required
							placeholder="How should candidates contact you? (email, application link, etc.)"
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>{form?.contact_info || data.job.contact_info}</textarea>
					</div>

					<div class="flex gap-4">
						<button
							type="submit"
							class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
						>
							Update Job
						</button>
					</div>
				</form>

				<div class="mt-8 pt-6 border-t border-gray-200">
					<h3 class="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
					<form method="POST" action="?/delete" use:enhance={() => {
						isDeleting = true;
						return async ({ update }) => {
							await update();
							isDeleting = false;
						};
					}}>
						<button
							type="submit"
							disabled={isDeleting}
							onclick="return confirm('Are you sure you want to delete this job posting? This action cannot be undone.')"
							class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
						>
							{isDeleting ? 'Deleting...' : 'Delete Job Posting'}
						</button>
					</form>
				</div>
			{/if}

			<div class="mt-6 text-sm text-gray-500">
				<p>Posted: {new Date(data.job.created_at).toLocaleDateString()}</p>
				<p>Contact: {data.job.poster_email}</p>
			</div>
		</div>
	</div>
</div>