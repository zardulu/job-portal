<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { countryOptions } from '$lib/countries';
    import { TURNSTILE_SITE_KEY } from '$lib/turnstile';
    
    interface Props {
        data: {
            community: {
                slug: string;
                name: string;
            };
        };
        form?: {
            error?: string;
            [key: string]: any;
        };
    }
    
    let { data, form }: Props = $props();
    let loading = $state(false);
    let isRemote = $state(false);
    let jobType = $state<'Full-time' | 'Part-time' | 'Contract'>('Full-time');
    let selectedLocation = $state('🌐 Anywhere');
    let turnstileToken = $state('');
    let turnstileLoaded = $state(false);
    let turnstileWidget: string | null = null;
    
    // Validation error states
    let titleError = $state('');
    let companyError = $state('');
    let locationError = $state('');
    let descriptionError = $state('');
    let posterEmailError = $state('');

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
        // Set up unique callback functions for job posting
        window.onTurnstileSuccessJobPost = (token: string) => {
            turnstileToken = token;
        };
        
        window.onTurnstileErrorJobPost = () => {
            turnstileToken = '';
        };
        
        window.onTurnstileExpiredJobPost = () => {
            turnstileToken = '';
        };
        
        // Fallback: manually render widgets if auto-render doesn't work
        setTimeout(() => {
            const widgets = document.querySelectorAll('.cf-turnstile');
            if (window.turnstile && widgets.length > 0) {
                widgets.forEach(widget => {
                    // Only render if widget is empty (not already rendered)
                    if (widget.innerHTML.trim().length === 0) {
                        window.turnstile?.render(widget, {
                            sitekey: TURNSTILE_SITE_KEY,
                            callback: window.onTurnstileSuccessJobPost,
                            'error-callback': window.onTurnstileErrorJobPost,
                            'expired-callback': window.onTurnstileExpiredJobPost,
                            theme: 'light',
                            size: 'normal'
                        });
                    }
                });
            }
        }, 500);
    }
    
    function cleanupCallbacks() {
            // Clean up job posting callbacks
            delete window.onTurnstileSuccessJobPost;
            delete window.onTurnstileErrorJobPost;
            delete window.onTurnstileExpiredJobPost;
    }

    function resetTurnstile() {
        if (window.turnstile) {
            window.turnstile.reset();
            turnstileToken = '';
        }
    }
</script>

<svelte:head>
    <title>Post a Job - {data.community.name}</title>
</svelte:head>

<div class="min-h-screen bg-bg font-brutal">
    <!-- Brutalist Navbar -->
    <nav class="bg-primary border-b-4 border-border shadow-brutal rounded-b-brutal">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex items-center justify-between py-4">
                <div class="flex items-center">
                     <a href="/" class="text-brutal-xl text-text font-black uppercase tracking-wider hover:bg-secondary hover:px-2  hover:text-green-400 transition-all ">FREN.WORK</a>
                    <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                    <a href="/{data.community.slug}" class="text-brutal-lg text-text font-bold tracking-wider hover:animate-brutal-bounce hover:bg-accent hover:px-2 transition-all">{data.community.name}</a>
                    <span class="mx-3 text-text font-semibold text-brutal-md">/</span>
                    <span class="text-brutal-lg text-text font-bold">Post Job</span>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-2xl mx-auto px-4 py-6">
        <div class="bg-teal-50 border-3 border-border shadow-brutal-card p-6 rounded-brutal-lg">
            <!-- Header -->
            <h1 class="text-brutal-xl font-bold text-text mb-6 text-center">
                Post a New<br>
                <span class="bg-green-400 text-text px-3 py-1 inline-block shadow-brutal-soft rounded-brutal">Job</span>
            </h1>

            <!-- Error Display -->
            {#if form?.error}
                <div class="bg-red-400 text-text px-6 py-3 border-3 border-border shadow-brutal-soft font-semibold mb-6 rounded-brutal">
                    {form.error}
                </div>
            {/if}
            
            <form method="POST" use:enhance={() => {
                loading = true;
                return async ({ result, update }) => {
                    loading = false;
                    resetTurnstile();
                    if (result.type === 'redirect') {
                        goto(result.location);
                    } else {
                        await update();
                    }
                };
            }} class="space-y-6">
                
                <!-- Job Title -->
                <div>
                    <label for="title" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        oninvalid={(e) => {
                            e.preventDefault();
                            titleError = 'Job title is required';
                        }}
                        oninput={() => {
                            titleError = '';
                        }}
                        value={form?.title || ''}
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="Senior Frontend Developer"
                    />
                    {#if titleError}
                        <p class="text-brutal-xs text-red-500 mt-2 font-medium">{titleError}</p>
                    {/if}
                </div>

                <!-- Company Name -->
                <div>
                    <label for="company" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        oninvalid={(e) => {
                            e.preventDefault();
                            companyError = 'Company name is required';
                        }}
                        oninput={() => {
                            companyError = '';
                        }}
                        value={form?.company || ''}
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="Tech Corp"
                    />
                    {#if companyError}
                        <p class="text-brutal-xs text-red-500 mt-2 font-medium">{companyError}</p>
                    {/if}
                </div>

                <!-- Remote Toggle -->
                <div class="flex items-center gap-3">
                    <input id="remote" type="checkbox" class="h-5 w-5 border-3 border-border rounded-brutal"
                        bind:checked={isRemote} />
                    <label for="remote" class="text-brutal-md font-semibold text-text tracking-wide">Remote</label>
                    <input type="hidden" name="remote" value={isRemote ? '1' : '0'} />
                </div>

                <!-- Location -->
                <div>
                    <label for="location" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Location {isRemote ? '(optional)' : '*'}
                    </label>
                    <select
                        id="location"
                        name="location"
                        bind:value={selectedLocation}
                        required={!isRemote}
                        oninvalid={(e) => {
                            e.preventDefault();
                            locationError = 'Location is required';
                        }}
                        oninput={() => {
                            locationError = '';
                        }}
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                    >
                        {#each countryOptions as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                    {#if locationError}
                        <p class="text-brutal-xs text-red-500 mt-2 font-medium">{locationError}</p>
                    {/if}
                </div>

                <!-- Category -->
                <div>
                    <label for="category" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                    >
                        <option value="">Select Category</option>
                        <option value="Software Development">Software Development</option>
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

                <!-- Job Type -->
                <div>
                    <div class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">Job Type</div>
                    <div class="flex flex-wrap gap-4">
                        <label class="inline-flex items-center gap-2 px-3 py-2 border-3 border-border rounded-brutal cursor-pointer">
                            <input type="radio" name="job_type" value="Full-time" bind:group={jobType} checked class="h-4 w-4" />
                            <span>Full-time</span>
                        </label>
                        <label class="inline-flex items-center gap-2 px-3 py-2 border-3 border-border rounded-brutal cursor-pointer">
                            <input type="radio" name="job_type" value="Part-time" bind:group={jobType} class="h-4 w-4" />
                            <span>Part-time</span>
                        </label>
                        <label class="inline-flex items-center gap-2 px-3 py-2 border-3 border-border rounded-brutal cursor-pointer">
                            <input type="radio" name="job_type" value="Contract" bind:group={jobType} class="h-4 w-4" />
                            <span>Contract</span>
                        </label>
                    </div>
                </div>

                <!-- Salary Range (Min) -->
                <div>
                    <label for="salary_min" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Salary Range (Min)
                    </label>
                    <input
                        type="number"
                        id="salary_min"
                        name="salary_min"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="50000"
                    />
                </div>

                <!-- Salary Range (Max) -->
                <div>
                    <label for="salary_max" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Salary Range (Max)
                    </label>
                    <input
                        type="number"
                        id="salary_max"
                        name="salary_max"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="100000"
                    />
                </div>

                <!-- Job Description -->
                <div>
                    <label for="description" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Job Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        oninvalid={(e) => {
                            e.preventDefault();
                            descriptionError = 'Job description is required';
                        }}
                        oninput={() => {
                            descriptionError = '';
                        }}
                        rows="6"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 resize-none rounded-brutal"
                        placeholder="Describe the role, responsibilities, requirements..."
                    ></textarea>
                    {#if descriptionError}
                        <p class="text-brutal-xs text-red-500 mt-2 font-medium">{descriptionError}</p>
                    {/if}
                </div>

                <!-- Contact Information -->
                <div>
                    <label for="contact_info" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Contact Information (optional)
                    </label>
                    <input
                        type="email"
                        id="contact_info"
                        name="contact_info"
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="hr@company.com"
                    />
                    <div class="bg-surface border-3 border-border p-3 mt-3 shadow-brutal-soft rounded-brutal">
                        <p class="text-text font-medium text-brutal-sm text-center">
                            If provided, this email will be displayed to applicants for direct contact
                        </p>
                    </div>
                </div>

                <!-- Your Email (For Editing) -->
                <div>
                    <label for="poster_email" class="block text-brutal-md font-semibold text-text mb-3 tracking-wide">
                        Your Email (For Editing) *
                    </label>
                    <input
                        type="email"
                        id="poster_email"
                        name="poster_email"
                        required
                        oninvalid={(e) => {
                            e.preventDefault();
                            posterEmailError = e.currentTarget.validity.valueMissing 
                                ? 'Email is required - we need this to send you the edit link!' 
                                : 'Please enter a valid email address';
                        }}
                        oninput={() => {
                            posterEmailError = '';
                        }}
                        class="w-full px-4 py-3 border-3 border-border bg-bg text-text font-medium text-base placeholder-text/50 shadow-brutal-sm focus:shadow-brutal focus:translate-x-1 focus:translate-y-1 transition-all duration-100 rounded-brutal"
                        placeholder="your@email.com"
                    />
                    {#if posterEmailError}
                        <p class="text-brutal-xs text-red-500 mt-2 font-medium">{posterEmailError}</p>
                    {/if}
                    <div class="bg-green-400 border-3 border-border p-3 mt-3 shadow-brutal-soft rounded-brutal">
                        <p class="text-text font-medium text-brutal-sm text-center">
                            We'll send you a magic link to edit this job posting
                        </p>
                    </div>
                </div>

                <!-- Security Verification -->
                <div class="space-y-4">
                    <div class="text-center">
                        <p class="text-brutal-sm font-medium text-text mb-3">Security Verification</p>
                        {#if turnstileLoaded}
                            <div class="flex justify-center">
                                <div class="cf-turnstile" 
                                     data-sitekey={TURNSTILE_SITE_KEY}
                                     data-callback="onTurnstileSuccessJobPost"
                                     data-error-callback="onTurnstileErrorJobPost"
                                     data-expired-callback="onTurnstileExpiredJobPost"
                                     data-theme="light"
                                     data-size="normal"></div>
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

                <!-- Action Buttons -->
                <div class="flex gap-4 justify-center pt-3">
                    <button
                        type="button"
                        onclick={() => goto(`/${data.community.slug}`)}
                        class="bg-surface text-text px-6 py-3 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-150 rounded-brutal"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !turnstileToken}
                        class="bg-green-400 text-text px-6 py-3 border-3 border-border font-semibold tracking-wide shadow-brutal-sm hover:bg-green-500 hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm transition-all duration-150 rounded-brutal {loading ? 'animate-brutal-pulse' : ''}"
                    >
                        {loading ? 'Posting Job...' : 'Post Job'}
                    </button>
                </div>
                {#if !turnstileToken && turnstileLoaded}
                    <div class="text-center">
                        <p class="text-brutal-xs text-red-500 mt-2 font-medium">Please complete the security verification above</p>
                    </div>
                {/if}
            </form>
        </div>
    </main>
</div>