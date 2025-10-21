<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { TURNSTILE_SITE_KEY } from '$lib/turnstile';

	let loading = $state(false);
	let turnstileToken = $state('');
	let turnstileLoaded = $state(false);
	let turnstileWidget: string | null = null;

	onMount(() => {
		// Check if Turnstile script is already loaded
		if (window.turnstile) {
			turnstileLoaded = true;
			setupCallbacks();
			return;
		}

		// Load Turnstile script
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;

		script.onload = () => {
			// Wait a bit for Turnstile to initialize
			setTimeout(() => {
				turnstileLoaded = true;
				setupCallbacks();
			}, 100);
		};

		document.head.appendChild(script);

		return () => {
			// Cleanup
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
			cleanupCallbacks();
		};
	});

	function setupCallbacks() {
		// Set up unique callback functions for create board
		window.onTurnstileSuccessCreateBoard = (token: string) => {
			turnstileToken = token;
		};

		window.onTurnstileErrorCreateBoard = () => {
			turnstileToken = '';
		};

		window.onTurnstileExpiredCreateBoard = () => {
			turnstileToken = '';
		};

		// Fallback: manually render widgets if auto-render doesn't work
		setTimeout(() => {
			const widgets = document.querySelectorAll('.cf-turnstile');
			if (window.turnstile && widgets.length > 0) {
				widgets.forEach((widget) => {
					// Only render if widget is empty (not already rendered)
					if (widget.innerHTML.trim().length === 0) {
						window.turnstile?.render(widget, {
							sitekey: TURNSTILE_SITE_KEY,
							callback: window.onTurnstileSuccessCreateBoard,
							'error-callback': window.onTurnstileErrorCreateBoard,
							'expired-callback': window.onTurnstileExpiredCreateBoard,
							theme: 'light',
							size: 'normal'
						});
					}
				});
			}
		}, 500);
	}

	function cleanupCallbacks() {
		// Clean up create board callbacks
		delete window.onTurnstileSuccessCreateBoard;
		delete window.onTurnstileErrorCreateBoard;
		delete window.onTurnstileExpiredCreateBoard;
	}

	function resetTurnstile() {
		if (window.turnstile) {
			window.turnstile.reset();
			turnstileToken = '';
		}
	}
</script>

<svelte:head>
	<title>Create Your Job Board</title>
</svelte:head>

<div class="min-h-screen bg-bg font-brutal">
	<!-- Brutalist Navbar -->
	<nav class="bg-primary border-b-4 border-border shadow-brutal rounded-b-brutal">
		<div class="flex items-center justify-between p-4">
			<a
				href="/"
				class="text-brutal-xl text-text font-black uppercase tracking-wider hover:text-green-400 transition-colors"
			>
				FREN.WORK
			</a>
		</div>
	</nav>

	<!-- Main content -->
	<main class="max-w-xl mx-auto pt-12 p-6">
		<div class="bg-[#f8feff] border-3 border-border shadow-brutal-card p-6 rounded-brutal-lg">
			<!-- Brutalist Header -->
			<div class="text-center mb-6">
				<h1 class="text-brutal-xl font-bold text-text mb-3 tracking-tight">
					Start a board for your community<br />
				</h1>
			</div>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						resetTurnstile();
						await update();
					};
				}}
				class="space-y-6"
			>
				<!-- Job Board Name -->
				<div>
					<label for="name" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
						Job Board Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						title="Please enter a name for your job board"
						oninvalid={(e) =>
							e.currentTarget.setCustomValidity('Please enter a name for your board')}
						oninput={(e) => e.currentTarget.setCustomValidity('')}
						class="w-full px-4 py-3 border-3 border-border bg-surface text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
						placeholder="Tech Jobs Board"
					/>
				</div>

				<!-- Email -->
				<div>
					<label
						for="email"
						class="block text-brutal-md font-semibold text-text mb-3 tracking-wide"
					>
						Your Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						title="Please enter a valid email address"
						oninvalid={(e) =>
							e.currentTarget.setCustomValidity(
								e.currentTarget.validity.valueMissing
									? 'Email is required - we need this to send you the magic link!'
									: 'Please enter a valid email address (e.g., admin@example.com)'
							)}
						oninput={(e) => e.currentTarget.setCustomValidity('')}
						class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
						placeholder="admin@example.com"
					/>
					<div class=" p-1 mt-3 shadow-brutal-soft rounded-brutal">
						<p class="text-text text-brutal-sm text-center">
							We'll send a magic link to manage your board!
						</p>
					</div>
				</div>

				<!-- Security Verification -->
				<div class="space-y-4">
					<div class="text-center">
						<p class="text-brutal-sm font-medium text-text mb-3">Security Verification</p>
						{#if turnstileLoaded}
							<div class="flex justify-center">
								<div
									class="cf-turnstile"
									data-sitekey={TURNSTILE_SITE_KEY}
									data-callback="onTurnstileSuccessCreateBoard"
									data-error-callback="onTurnstileErrorCreateBoard"
									data-expired-callback="onTurnstileExpiredCreateBoard"
									data-theme="light"
									data-size="normal"
								></div>
							</div>
						{:else}
							<div class="bg-surface border-3 border-border p-4 rounded-brutal animate-pulse">
								<p class="text-brutal-sm text-text">Loading security verification...</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Hidden field for Turnstile token -->
				<input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

				<!-- Submit Button -->
				<div class="text-center pt-3">
					<button
						type="submit"
						disabled={loading || !turnstileToken}
						class="bg-green-400 text-text py-3 px-8 border-3 border-border font-semibold text-brutal-md tracking-wide shadow-brutal-soft hover:bg-green-500 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-soft transition-all duration-150 rounded-brutal {loading
							? 'animate-brutal-pulse'
							: ''}"
					>
						{loading ? 'Creating Board...' : 'Create Job Board'}
					</button>
					{#if !turnstileToken && turnstileLoaded}
						<p class="text-brutal-xs text-red-500 mt-2 font-medium">
							Please complete the security verification above
						</p>
					{/if}
				</div>
			</form>

			<!-- Steps Section -->
			<div class="bg-green-400 border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
				<h3 class="font-semibold text-brutal-md mb-3 text-center">What Happens Next?</h3>
				<div class="space-y-2 text-center">
					<p class="text-text font-medium text-brutal-sm">1. Check your email for magic link</p>
					<p class="text-text font-medium text-brutal-sm">2. Share the link with your community</p>
					<p class="text-text font-medium text-brutal-sm">3. Start posting jobs</p>
					<p class="text-text font-medium text-brutal-sm">4. Hire amazing people</p>
				</div>
			</div>
		</div>

		<!-- Side Info -->
		<!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div class="bg-green-400 border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                <h4 class="font-semibold text-brutal-md mb-2 text-center">Fast</h4>
                <p class="text-text font-medium text-brutal-sm text-center">Your board will be live in seconds</p>
            </div>
            
            <div class="bg-surface border-3 border-border shadow-brutal-soft p-4 rounded-brutal">
                <h4 class="font-semibold text-brutal-md mb-2 text-center">Secure</h4>
                <p class="text-text font-medium text-brutal-sm text-center">Magic links = no passwords to forget</p>
            </div>
        </div> -->
	</main>
</div>
