<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { countryOptions } from '$lib/countries';

	interface Props {
		data: {
			community: { slug: string; name: string };
			jobs: Array<{
				id: number;
				title: string;
				description: string;
				company: string;
				location: string;
				category: string;
				job_type: string;
				remote: number;
				salary_min: number | null;
				salary_max: number | null;
				created_at: string;
			}>;
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('');
	let selectedLocation = $state('');
	let filterRemoteOnly = $state(false);
	let currentPage = $state(1);
	const jobsPerPage = 10;

	let filteredJobs = $derived(
		data.jobs.filter((job) => {
			const matchesSearch =
				job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				job.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = !selectedCategory || job.category === selectedCategory;
			const matchesLocation = !selectedLocation || job.location === selectedLocation;
			const matchesRemote = !filterRemoteOnly || job.remote === 1;

			return matchesSearch && matchesCategory && matchesLocation && matchesRemote;
		})
	);

	let totalPages = $derived(Math.ceil(filteredJobs.length / jobsPerPage));
	let paginatedJobs = $derived(
		filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
	);

	// Reset to page 1 when filters change
	$effect(() => {
		searchQuery;
		selectedCategory;
		selectedLocation;
		filterRemoteOnly;
		currentPage = 1;
	});

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

<div class="min-h-screen bg-bg font-brutal">
	<!-- Brutalist Navbar -->
	<nav class="bg-primary border-b-4 border-border shadow-brutal rounded-b-brutal">
		<div class="max-w-6xl mx-auto px-4">
			<div class="flex items-center justify-between py-4">
				<div class="flex items-center">
					 <a href="/" class="text-brutal-xl text-text font-black uppercase tracking-wider hover:bg-secondary hover:px-2  hover:text-green-400 transition-all ">FREN.WORK</a>
					<span class="mx-3 text-text font-semibold text-brutal-md">/</span>
					<h1 class="text-brutal-lg text-text font-bold tracking-wider">{data.community.name}</h1>
				</div>
				<button
					onclick={createJob}
					class="bg-green-400 text-text px-4 py-2 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:bg-green-500 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 rounded-brutal"
				>
					+ Post Job
				</button>
			</div>
		</div>
	</nav>

	<main class="max-w-5xl mx-auto px-4 py-6">
		<!-- Success messages -->
		{#if $page?.url?.searchParams?.get('created')}
			<div
				class="bg-green-400 text-text px-6 py-3 border-3 border-border shadow-brutal-soft font-semibold mb-6 rounded-brutal"
			>
				Job board created successfully! Check your email for the management link.
			</div>
		{/if}

		{#if $page?.url?.searchParams?.get('posted')}
			<div
				class="bg-green-400 text-text px-6 py-3 border-3 border-border shadow-brutal-soft font-semibold mb-6 rounded-brutal"
			>
				Job posted successfully! Check your email for the edit link.
			</div>
		{/if}

		{#if $page?.url?.searchParams?.get('deleted')}
			<div
				class="bg-surface text-text px-6 py-3 border-3 border-border shadow-brutal-soft font-semibold mb-6 rounded-brutal"
			>
				Job deleted successfully.
			</div>
		{/if}

		<!-- Filters and Search -->
		<div class="bg-surface border-3 border-border shadow-brutal-card p-6 mb-6 rounded-brutal-lg">
			<h2 class="text-brutal-lg font-semibold text-text mb-4 text-center">Find Your Perfect Job</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label
						for="search"
						class="block text-brutal-md font-semibold text-text mb-3 tracking-wide"
					>
						Search Jobs
					</label>
					<input
						type="text"
						id="search"
						bind:value={searchQuery}
						placeholder="Search by title or description..."
						class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
					/>
				</div>

				<div>
					<label
						for="category"
						class="block text-brutal-md font-semibold text-text mb-3 tracking-wide"
					>
						Category
					</label>
					<select
						id="category"
						bind:value={selectedCategory}
						class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
					>
						<option value="">All Categories</option>
						<option value="Engineering">Engineering</option>
						<option value="Design">Design</option>
						<option value="Marketing">Marketing</option>
						<option value="Sales">Sales</option>
						<option value="Product">Product</option>
						<option value="Data">Data</option>
						<option value="Operations">Operations</option>
						<option value="Finance">Finance</option>
						<option value="HR">HR</option>
						<option value="Customer Success">Customer Success</option>
						<option value="Legal">Legal</option>
						<option value="Other">Other</option>
					</select>
				</div>

				<div>
					<label
						for="location"
						class="block text-brutal-md font-semibold text-text mb-3 tracking-wide"
					>
						Location
					</label>
					<select
						id="location"
						bind:value={selectedLocation}
						class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
					>
						<option value="">All Locations</option>
						{#each countryOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
					<div class="flex items-center gap-3 mt-3">
						<input
							id="remote-only"
							type="checkbox"
							class="h-5 w-5 border-3 border-border rounded-brutal"
							bind:checked={filterRemoteOnly}
						/>
						<label for="remote-only" class="text-text">Remote only</label>
					</div>
				</div>
			</div>
		</div>

		<!-- Jobs Grid -->
		<div
			class="bg-surface border-3 border-border shadow-brutal-card rounded-brutal-lg overflow-hidden"
		>
			<div class="px-6 py-4 border-b-3 border-border bg-green-400">
				<h2 class="text-brutal-lg font-semibold text-text text-center">
					Available Jobs ({filteredJobs.length})
				</h2>
			</div>

			{#if filteredJobs.length === 0}
				<div class="text-center py-12">
					<p class="text-brutal-lg text-text font-semibold mb-6">
						No jobs found matching your criteria.
					</p>
					<button
						onclick={createJob}
						class="bg-green-400 text-text px-6 py-3 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:bg-green-500 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 rounded-brutal"
					>
						Post a new Job
					</button>
				</div>
			{:else}
				<div class="divide-y-3 divide-border">
					{#each paginatedJobs as job}
						<div class="p-6 hover:bg-surface/20 transition-all duration-150">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<h3 class="text-brutal-md font-semibold text-text mb-1">{job.title}</h3>
									{#if job.company}
										<p class="text-gray-500 font-medium text-brutal-sm mb-3">{job.company}</p>
									{/if}

									<div class="flex flex-wrap gap-2 mb-3">
										{#if job.job_type}
											<span
												class="bg-brutal-cyan text-text px-3 py-1 font-medium text-xs rounded-brutal bg-blue-200"
											>
												{job.job_type === 'Full-time'
													? '💼'
													: job.job_type === 'Part-time'
														? '⏰'
														: '📋'}
												{job.job_type}
											</span>
										{/if}
										{#if job.remote}
											<span
												class="bg-brutal-green text-text px-3 py-1 font-medium text-xs rounded-brutal bg-green-200"
											>
												💻 Remote
											</span>
										{/if}
										{#if job.location}
											<span
												class="bg-brutal-purple text-text px-3 py-1 font-medium text-xs rounded-brutal bg-orange-200"
											>
												📍 {job.location}
											</span>
										{/if}
										{#if job.category}
											<span
												class="bg-brutal-orange text-text px-3 py-1 font-medium text-xs rounded-brutal bg-yellow-200"
											>
												🏷️ {job.category}
											</span>
										{/if}
										<span
											class="bg-surface text-text px-3 py-1 font-medium text-xs rounded-brutal bg-green-200"
										>
											📅 {formatDate(job.created_at)}
										</span>
									</div>
								</div>

								<a
									href="/{data.community.slug}/jobs/{job.id}"
									class="bg-green-400 text-text px-4 py-2 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:bg-green-500 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 ml-3 rounded-brutal"
								>
									View Details
								</a>
							</div>
						</div>
					{/each}
				</div>

				<!-- Pagination Controls -->
				{#if totalPages > 1}
					<div class="px-6 py-4 border-t-3 border-border bg-surface">
						<div class="flex items-center justify-between">
							<div class="text-brutal-sm text-text font-medium">
								Showing {(currentPage - 1) * jobsPerPage + 1} to {Math.min(
									currentPage * jobsPerPage,
									filteredJobs.length
								)} of {filteredJobs.length} jobs
							</div>
							<div class="flex items-center gap-2">
								<button
									onclick={() => (currentPage = Math.max(1, currentPage - 1))}
									disabled={currentPage === 1}
									class="bg-surface text-text px-3 py-2 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm transition-all duration-150 rounded-brutal"
								>
									← Prev
								</button>

								{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
									{#if pageNum === currentPage || pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
										<button
											onclick={() => (currentPage = pageNum)}
											class="px-3 py-2 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 rounded-brutal {pageNum ===
											currentPage
												? 'bg-green-400 text-text'
												: 'bg-surface text-text'}"
										>
											{pageNum}
										</button>
									{:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
										<span class="text-text font-medium">...</span>
									{/if}
								{/each}

								<button
									onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
									disabled={currentPage === totalPages}
									class="bg-surface text-text px-3 py-2 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm transition-all duration-150 rounded-brutal"
								>
									Next →
								</button>
							</div>
						</div>
					</div>
				{/if}
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
