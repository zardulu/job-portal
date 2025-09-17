<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let isDeleting = false;
</script>

<svelte:head>
	<title>Edit Job - {data.job.title}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
	<div class="max-w-2xl mx-auto px-4">
		<div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 backdrop-blur-sm">
			<h1 class="text-3xl font-bold text-gray-900 mb-8 text-center border-b border-gray-200 pb-4">
				Edit Job Posting
			</h1>

			{#if form?.success}
				<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
					<p class="text-green-800">{form.message}</p>
				</div>
			{/if}
				{#if form?.error}
					<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
						<p class="text-red-800">{form.error}</p>
					</div>
				{/if}

				<form method="POST" action="?/update" use:enhance class="space-y-8">
					<div class="group">
						<label
							for="title"
							class="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors"
						>
							Job Title *
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={(form && 'title' in form ? form.title : undefined) || data.job.title}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
						/>
					</div>

					<div class="group">
						<label
							for="description"
							class="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors"
						>
							Job Description *
						</label>
						<textarea
							id="description"
							name="description"
							rows="8"
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 resize-vertical"
							>{(form && 'description' in form ? form.description : undefined) ||
								data.job.description}</textarea
						>
					</div>

					<div class="group">
						<label
							for="contact_info"
							class="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors"
						>
							Contact Information *
						</label>
						<textarea
							id="contact_info"
							name="contact_info"
							rows="3"
							required
							placeholder="How should candidates contact you? (email, application link, etc.)"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 resize-vertical placeholder:text-gray-400"
							>{(form && 'contact_info' in form ? form.contact_info : undefined) ||
								data.job.contact_info}</textarea
						>
					</div>

					<div class="flex gap-4 pt-4">
						<button
							type="submit"
							class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
						>
							Update Job
						</button>
					</div>
				</form>

				<div class="mt-10 pt-8 border-t border-gray-200">
					<h3 class="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						Danger Zone
					</h3>
                <form
						method="POST"
						action="?/delete"
						use:enhance={() => {
							isDeleting = true;
							return async ({ result }) => {
								isDeleting = false;
								if (result.type === 'redirect') {
									// Let SvelteKit handle the redirect
									return;
								}
							};
						}}
					>
						<button
							type="submit"
							disabled={isDeleting}
							onclick={(e) => {
								if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
									e.preventDefault();
									return false;
								}
							}}
							class="bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-3 focus:ring-red-500/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
							{isDeleting ? 'Deleting...' : 'Delete Job Posting'}
						</button>
                <input type="hidden" name="token" value={$page.url.searchParams.get('token') || ''} />
                </form>
				</div>

			<div
				class="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500 bg-gray-50 -mx-8 -mb-8 px-8 py-6 rounded-b-xl"
			>
				<div class="flex justify-between items-center">
					<div>
						<p class="font-medium">Posted: {new Date(data.job.created_at).toLocaleDateString()}</p>
						<p>Contact: {data.job.poster_email}</p>
					</div>
					<div class="text-xs text-gray-400">
						Last updated: {new Date().toLocaleDateString()}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
