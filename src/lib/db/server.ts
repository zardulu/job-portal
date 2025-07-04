import { createClient } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

if (!TURSO_DATABASE_URL) {
	throw new Error('Missing TURSO_DATABASE_URL environment variable');
}

if (!TURSO_AUTH_TOKEN) {
	throw new Error('Missing TURSO_AUTH_TOKEN environment variable');
}

export const db = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
}); 