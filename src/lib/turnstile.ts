/**
 * Cloudflare Turnstile utilities for bot protection
 */

// Development mode - always passes validation
// export const TURNSTILE_SITE_KEY = '1x00000000000000000000AA'; // Test key - always passes
export const TURNSTILE_SECRET_KEY_TEST = '1x0000000000000000000000000000000AA'; // Test secret - always passes

// For production, replace with your actual keys:
export const TURNSTILE_SITE_KEY = '0x4AAAAAAB1zLxbSQT-0VYyV';

// TypeScript declarations for Turnstile
declare global {
	interface Window {
		turnstile?: {
			render: (element: string | Element, options: {
				sitekey: string;
				callback?: (token: string) => void;
				'error-callback'?: () => void;
				'expired-callback'?: () => void;
				theme?: 'light' | 'dark' | 'auto';
				size?: 'normal' | 'compact';
			}) => string;
			reset: (widgetId?: string) => void;
			remove: (widgetId?: string) => void;
		};
		// Global callback functions for Turnstile
		onTurnstileSuccess?: (token: string) => void;
		onTurnstileError?: () => void;
		onTurnstileExpired?: () => void;
		// Job posting specific callbacks
		onTurnstileSuccessJobPost?: (token: string) => void;
		onTurnstileErrorJobPost?: () => void;
		onTurnstileExpiredJobPost?: () => void;
		// Create board specific callbacks
		onTurnstileSuccessCreateBoard?: (token: string) => void;
		onTurnstileErrorCreateBoard?: () => void;
		onTurnstileExpiredCreateBoard?: () => void;
	}
}

/**
 * Check if we're in development mode
 */
export function isDevelopmentMode(): boolean {
	return process.env.NODE_ENV !== 'production';
}

/**
 * Verify Turnstile token on server-side
 */
export async function verifyTurnstile(token: string, secretKey: string, remoteIP?: string): Promise<boolean> {
	if (!token || !secretKey) {
		return false;
	}

	// In development mode with test keys, always return true
	if (isDevelopmentMode() && secretKey === TURNSTILE_SECRET_KEY_TEST) {
		return true;
	}

	try {
		const formData = new FormData();
		formData.append('secret', secretKey);
		formData.append('response', token);
		if (remoteIP) {
			formData.append('remoteip', remoteIP);
		}

		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			return false;
		}

		const result = await response.json();
		
		return result.success;
	} catch (error) {
		return false;
	}
}

/**
 * List of common disposable email domains to block
 */
export const DISPOSABLE_EMAIL_DOMAINS = [
	'10minutemail.com',
	'20minutemail.com',
	'guerrillamail.com',
	'mailinator.com',
	'tempmail.org',
	'temp-mail.org',
	'yopmail.com',
	'throwaway.email',
	'getnada.com',
	'maildrop.cc',
	'sharklasers.com',
	'grr.la',
	'guerrillamailblock.com',
	'pokemail.net',
	'spam4.me',
	'tempail.com',
	'tempemail.com',
	'tempinbox.com',
	'trashmail.com',
	'mohmal.com',
	'emailondeck.com'
];

/**
 * Check if email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
	if (!email || !email.includes('@')) return false;
	
	const domain = email.split('@')[1].toLowerCase();
	return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

/**
 * Enhanced email validation
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
	if (!email) {
		return { isValid: false, error: 'Email is required' };
	}

	// Basic email regex
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { isValid: false, error: 'Please enter a valid email address' };
	}

	// Check for disposable email
	if (isDisposableEmail(email)) {
		return { isValid: false, error: 'Temporary email addresses are not allowed' };
	}

	return { isValid: true };
}

/**
 * Simple rate limiting key generator
 */
export function getRateLimitKey(ip: string, action: string): string {
	return `rate_limit:${ip}:${action}`;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
	// Try various headers that might contain the real IP
	const headers = [
		'cf-connecting-ip', // Cloudflare
		'x-forwarded-for',
		'x-real-ip',
		'x-client-ip'
	];

	for (const header of headers) {
		const ip = request.headers.get(header);
		if (ip) {
			// Handle comma-separated IPs (take the first one)
			return ip.split(',')[0].trim();
		}
	}

	return 'unknown';
}