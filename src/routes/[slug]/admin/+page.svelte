<script lang="ts">
    import '../../../app.css';
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
                description: string;
                contact_info: string;
                poster_email: string;
                created_at: string;
            }>;
        };
    }
    
    let { data }: Props = $props();
    
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).toUpperCase();
    }

    function confirmBoardDeletion() {
        if (typeof globalThis !== 'undefined' && globalThis.confirm && globalThis.confirm(`ARE YOU SURE YOU WANT TO DELETE "${data.community.name.toUpperCase()}"? THIS CANNOT BE UNDONE!`)) {
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
    <title>ADMIN - {data.community.name.toUpperCase()}</title>
</svelte:head>

<div class="min-h-screen bg-bg font-brutal">
    <!-- Brutalist Navbar -->
    <nav class="bg-primary border-b-4 border-border shadow-brutal">
        <div class="flex items-center justify-between p-6">
            <div class="flex items-center gap-4">
                <a href="/" class="text-brutal-xl text-text font-black uppercase tracking-wider hover:bg-secondary hover:px-2  hover:text-green-400 transition-all ">FREN.WORK</a>
                <span class="text-brutal-lg font-black">/</span>
                <a href="/{data.community.slug}" class="text-brutal-lg text-text font-black uppercase hover:bg-accent hover:px-2 transition-all">{data.community.name}</a>
                <span class="text-brutal-lg font-black">/</span>
                <span class="text-brutal-lg text-text font-black uppercase bg-warning px-2 py-1">ADMIN</span>
            </div>
            <div class="flex gap-4">
                <a
                    href="/{data.community.slug}"
                    class="bg-secondary text-text px-6 py-3 border-3 border-border font-black uppercase tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-100"
                >
                    VIEW BOARD
                </a>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto p-8">
        <!-- Header -->
        <div class="mb-12">
            <h1 class="text-6xl font-black text-text mb-4 uppercase tracking-tighter">ADMIN DASHBOARD</h1>
            <p class="text-brutal-lg text-text font-bold uppercase tracking-wide">MANAGE YOUR BRUTAL JOB BOARD</p>
        </div>

        <!-- Board Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="bg-brutal-cyan border-4 border-border shadow-brutal p-8">
                <div class="text-6xl mb-4 text-center">📊</div>
                <h3 class="font-black text-brutal-md mb-4 uppercase text-center">TOTAL JOBS</h3>
                <p class="text-6xl font-black text-text text-center">{data.jobs.length}</p>
            </div>
            
            <div class="bg-brutal-lime border-4 border-border shadow-brutal p-8">
                <div class="text-6xl mb-4 text-center">📅</div>
                <h3 class="font-black text-brutal-md mb-4 uppercase text-center">THIS MONTH</h3>
                <p class="text-6xl font-black text-text text-center">
                    {data.jobs.filter(job => {
                        const jobDate = new Date(job.created_at);
                        const now = new Date();
                        return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
                    }).length}
                </p>
            </div>
            
            <div class="bg-brutal-pink border-4 border-border shadow-brutal p-8">
                <div class="text-6xl mb-4 text-center">🚀</div>
                <h3 class="font-black text-brutal-md mb-4 uppercase text-center">CREATED</h3>
                <p class="text-brutal-sm font-black text-text text-center">{formatDate(data.community.created_at)}</p>
            </div>
        </div>

        <!-- Jobs Management -->
        <div class="bg-surface border-4 border-border shadow-brutal-lg mb-12">
            <div class="bg-warning border-b-4 border-border p-6">
                <h2 class="text-brutal-xl font-black text-text uppercase">MANAGE JOBS</h2>
            </div>
            
            {#if data.jobs.length === 0}
                <div class="text-center py-16">
                    <div class="text-8xl mb-8">😴</div>
                    <p class="text-brutal-lg font-black text-text uppercase mb-8">NO JOBS YET. TIME TO GET BRUTAL!</p>
                    <a
                        href="/{data.community.slug}/post-job"
                        class="bg-success text-text px-8 py-4 border-3 border-border font-black uppercase tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-2 hover:translate-y-2 transition-all duration-100"
                    >
                        POST FIRST JOB
                    </a>
                </div>
            {:else}
                <div class="p-6">
                    <div class="space-y-6">
                        {#each data.jobs as job}
                            <div class="bg-bg border-3 border-border shadow-brutal-sm p-6">
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div class="flex-1">
                                        <h3 class="text-brutal-lg font-black text-text uppercase mb-2">{job.title}</h3>
                                        <p class="text-brutal-sm font-bold text-text uppercase mb-2">📧 {job.poster_email}</p>
                                        <p class="text-brutal-sm font-bold text-text uppercase">📅 {formatDate(job.created_at)}</p>
                                    </div>
                                    <div class="flex gap-4">
                                        <a
                                            href="/{data.community.slug}/jobs/{job.id}"
                                            class="bg-brutal-blue text-bg px-4 py-2 border-3 border-border font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-100"
                                        >
                                            VIEW
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
                                                onclick={() => typeof globalThis !== 'undefined' && globalThis.confirm && globalThis.confirm('DELETE THIS JOB? NO GOING BACK!')}
                                                class="bg-error text-bg px-4 py-2 border-3 border-border font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-100"
                                            >
                                                DELETE
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <!-- Board Management -->
        <div class="bg-surface border-4 border-border shadow-brutal-lg">
            <div class="bg-secondary border-b-4 border-border p-6">
                <h2 class="text-brutal-xl font-black text-text uppercase">BOARD SETTINGS</h2>
            </div>
            <div class="p-6">
                <div class="mb-8">
                    <h3 class="text-brutal-lg font-black text-text uppercase mb-6">BOARD INFO</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-bg border-3 border-border shadow-brutal-sm p-4">
                            <dt class="text-brutal-sm font-black text-text uppercase mb-2">NAME</dt>
                            <dd class="text-brutal-md font-bold text-text">{data.community.name}</dd>
                        </div>
                        <div class="bg-bg border-3 border-border shadow-brutal-sm p-4">
                            <dt class="text-brutal-sm font-black text-text uppercase mb-2">URL</dt>
                            <dd class="text-brutal-md font-bold text-text">/{data.community.slug}</dd>
                        </div>
                        <div class="bg-bg border-3 border-border shadow-brutal-sm p-4">
                            <dt class="text-brutal-sm font-black text-text uppercase mb-2">ADMIN EMAIL</dt>
                            <dd class="text-brutal-md font-bold text-text">{data.community.admin_email}</dd>
                        </div>
                        <div class="bg-bg border-3 border-border shadow-brutal-sm p-4">
                            <dt class="text-brutal-sm font-black text-text uppercase mb-2">CREATED</dt>
                            <dd class="text-brutal-md font-bold text-text">{formatDate(data.community.created_at)}</dd>
                        </div>
                    </div>
                </div>

                <div class="border-t-4 border-border pt-8">
                    <h3 class="text-brutal-lg font-black text-error uppercase mb-6">⚠️ DANGER ZONE ⚠️</h3>
                    <div class="bg-error border-4 border-border shadow-brutal p-6">
                        <p class="text-brutal-md font-black text-bg uppercase mb-6">
                            DELETING YOUR BOARD WILL NUKE EVERYTHING. NO TAKEBACKS!
                        </p>
                        <form id="delete-board-form" method="POST" action="?/deleteBoard" class="hidden">
                            <!-- Hidden form for board deletion -->
                        </form>
                        <button
                            type="button"
                            onclick={confirmBoardDeletion}
                            class="bg-bg text-error px-8 py-4 border-3 border-border font-black uppercase tracking-wide shadow-brutal-sm hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-100"
                        >
                            🗑️ DELETE BOARD
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
