<script>
	import '../app.css';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    function createBoard() {
        goto('/create-job-board');
    }
   






</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Navbar -->
	<nav class="bg-gray-100 shadow">
		<div class="flex items-center justify-between p-5">
			<h1 class="text-2xl font-bold text-gray-900">fren.work</h1>
			<button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
				Sign in
			</button>
		</div>
	</nav>

	<!-- Main content -->
	<main class="flex flex-1 flex-col items-center justify-center gap-6 p-6">
		<!-- Success message for deleted board -->
		{#if $page?.url?.searchParams?.get('deleted')}
			<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
				🗑️ Job board deleted successfully.
			</div>
		{/if}
		
		<h2 class="text-3xl font-semibold text-gray-800">Welcome to fren.work</h2>
		<button class="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition" onclick={createBoard}>
			+ Create a board
		</button>
	</main>
</div>
