<script>
    import { enhance } from '$app/forms';
    
    let loading = $state(false);
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-gray-100 shadow">
        <div class="flex items-center justify-between p-5">
            <a href="/" class="text-2xl font-bold text-gray-900">fren.work</a>
        </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-md mx-auto pt-16 p-6">
        <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Your Job Board</h1>
            
            <form method="POST"             use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    loading = false;
                    await update();
                };
            }}>
                <div class="mb-4">
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                        Job Board Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Tech Jobs Board"
                    />
                </div>

                <div class="mb-6">
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Your Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="admin@example.com"
                    />
                    <p class="text-sm text-gray-500 mt-1">
                        We'll send a magic link to manage your board
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition"
                >
                    {loading ? 'Creating Board...' : 'Create Job Board'}
                </button>
            </form>
        </div>
    </main>
</div>
