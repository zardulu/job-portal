<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    function createBoard() {
        goto('/create-job-board');
    }

	function optimizedBase(src: string): string {
		return src.replace('/pepes/', '/pepes_optimized/').replace('.png', '');
	}

	const pepeImagesDesktop = [
		{ src: '/pepes/pepe1.png', top: '8%', left: '20%', rotate: -10, width: 200 },
		{ src: '/pepes/pepe2.png', top: '10%', left: '78%', rotate: 8, width: 250 },
		{ src: '/pepes/pepe3.png', top: '65%', left: '10%', rotate: 6, width: 250 },
		{ src: '/pepes/pepe4.png', top: '40%', left: '72%', rotate: -6, width: 250 },
		{ src: '/pepes/pepe5.png', top: '30%', left: '5%', rotate: 12, width: 250 },
		{ src: '/pepes/pepe6.png', top: '65%', left: '80%', rotate: -12, width: 250 },
	];

	const pepeImagesMobile = [
		{ src: '/pepes/pepe1.png', top: '5%', left: '5%', rotate: -10, width: 120 },
		{ src: '/pepes/pepe2.png', top: '8%', left: '70%', rotate: 8, width: 140 },
		{ src: '/pepes/pepe3.png', top: '70%', left: '6%', rotate: 6, width: 140 },
		{ src: '/pepes/pepe4.png', top: '42%', left: '72%', rotate: -6, width: 140 },
		{ src: '/pepes/pepe5.png', top: '28%', left: '3%', rotate: 12, width: 130 },
		{ src: '/pepes/pepe6.png', top: '74%', left: '75%', rotate: -12, width: 140 },
	];

	let isMobile = $state(false);
	let pepeImages = $derived(isMobile ? pepeImagesMobile : pepeImagesDesktop);

	import { onMount } from 'svelte';
	onMount(() => {
		if (typeof window !== 'undefined') {
			const mq = window.matchMedia('(max-width: 768px)');
			const update = () => (isMobile = mq.matches);
			mq.addEventListener?.('change', update);
			update();
			return () => mq.removeEventListener?.('change', update);
		}
	});
</script>

<div class="min-h-screen bg-bg flex flex-col font-brutal">
	<!-- Brutalist Navbar -->
	<nav class="bg-primary">
		<!-- <div class="flex items-center justify-between p-6">
			<h1 class="text-brutal-xl text-text font-black uppercase tracking-wider">FREN.WORK</h1>
			<button class="bg-secondary text-text px-6 py-3 border-3 border-border font-black uppercase tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-100">
				SIGN IN
			</button>
		</div> -->
	</nav>

	<!-- Main content -->
	<main class="relative flex flex-1 flex-col items-center justify-center gap-12 p-8">
		<div class="pointer-events-none absolute inset-0 md:opacity-100">
			{#each pepeImages as img (img.src)}
				<img
					src={`${optimizedBase(img.src)}-256.png`}
					srcset={`${optimizedBase(img.src)}-256.png 256w, ${optimizedBase(img.src)}-512.png 512w`}
					sizes={`${img.width}px`}
					alt="Pepe"
					loading="lazy"
					decoding="async"
					fetchpriority="low"
					width={img.width}
					class="absolute select-none"
					style={`top:${img.top};left:${img.left};transform:rotate(${img.rotate}deg);width:${img.width}px;`}
				/>
			{/each}
		</div>
		<!-- Success message for deleted board -->
		{#if $page?.url?.searchParams?.get('deleted')}
			<div class="bg-success text-text px-8 py-4 border-3 border-border shadow-brutal-sm font-black uppercase max-w-md">
				🗑️ JOB BOARD DELETED SUCCESSFULLY.
			</div>
		{/if}
		
		<!-- Hero Section -->
		<div class="relative z-10 text-center max-w-4xl">
			<h2 class="text-4xl md:text-8xl font-black c text-text mb-8 uppercase tracking-tighter leading-none">
				WELCOME TO<br>
				<span class="bg-green-400 text-white px-4 py-2 inline-block transform shadow-brutal">FREN.WORK</span>
			</h2>
			<p class="text-brutal-lg text-text mb-12 font-bold uppercase tracking-wide max-w-2xl mx-auto">
				START HIRING FROM YOUR COMMUNITY
			</p>
			
			<button 
				class="text-text py-3 px-6 md:py-6 md:px-12 border-4 border-border font-bold text-base md:text-brutal-lg tracking-wide shadow-brutal-soft hover:bg-green-400 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-soft transition-all duration-150 rounded-brutal"
				onclick={createBoard}
			>
				+ CREATE JOB BOARD
			</button>
			<p class="text-sm md:text-brutal-sm text-green-400 mt-4 font-medium italic tracking-wide max-w-2xl mx-auto">
				No signups required!
			</p>
		</div>

		<!-- Features Grid -->
		<!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-16">
			<div class="bg-brutal-cyan border-4 border-border shadow-brutal p-8 transform rotate-1">
				<div class="text-6xl mb-4 text-center">🚀</div>
				<h3 class="font-black text-brutal-md mb-4 uppercase text-center">FAST SETUP</h3>
				<p class="text-text font-bold uppercase text-sm text-center">GET YOUR BOARD RUNNING IN 30 SECONDS OR LESS</p>
			</div>
			
			<div class="bg-brutal-pink border-4 border-border shadow-brutal p-8 transform -rotate-1">
				<div class="text-6xl mb-4 text-center">🎯</div>
				<h3 class="font-black text-brutal-md mb-4 uppercase text-center">TARGETED AF</h3>
				<p class="text-text font-bold uppercase text-sm text-center">REACH THE RIGHT PEOPLE, NOT RANDOM SPAM</p>
			</div>
			
			<div class="bg-brutal-lime border-4 border-border shadow-brutal p-8 transform rotate-1">
				<div class="text-6xl mb-4 text-center">💰</div>
				<h3 class="font-black text-brutal-md mb-4 uppercase text-center">CHEAP AS F*</h3>
				<p class="text-text font-bold uppercase text-sm text-center">WAY CHEAPER THAN THOSE OTHER BORING SITES</p>
			</div>
		</div> -->

		<!-- Call to Action -->
		<!-- <div class="bg-warning border-4 border-border shadow-brutal-lg p-8 max-w-2xl transform -rotate-1 mt-12">
			<h3 class="font-black text-brutal-lg mb-4 uppercase text-center">STOP WASTING TIME</h3>
			<p class="text-text font-bold uppercase text-center mb-6">
				WHILE YOU'RE READING THIS, SOMEONE ELSE IS HIRING THE TALENT YOU NEED
			</p>
			<div class="text-center">
				<button 
					class="bg-error text-bg px-8 py-4 border-3 border-border font-black uppercase tracking-wide shadow-brutal-sm hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-100"
					onclick={createBoard}
				>
					START NOW
				</button>
			</div>
		</div> -->
	</main>

	<!-- Footer -->
	<footer class="bg-primary">
		<div class="flex items-center justify-between p-6">
			<div class="flex gap-6">
				<a 
					href="/contact" 
					class="text-text font-bold uppercase tracking-wide hover:text-green-400 transition-colors text-sm"
				>
					CONTACT
				</a>
				<a 
					href="/privacy" 
					class="text-text font-bold uppercase tracking-wide hover:text-green-400 transition-colors text-sm"
				>
					PRIVACY
				</a>
			</div>
			<div class="text-text font-bold uppercase tracking-wide text-sm">
				
			</div>
		</div>
	</footer>
</div>