import { createClient } from '@libsql/client';
import { PUBLIC_TURSO_DATABASE_URL, PUBLIC_TURSO_AUTH_TOKEN } from '$env/static/public';

if (!PUBLIC_TURSO_DATABASE_URL) {
	throw new Error('Missing PUBLIC_TURSO_DATABASE_URL environment variable');
}

if (!PUBLIC_TURSO_AUTH_TOKEN) {
	throw new Error('Missing PUBLIC_TURSO_AUTH_TOKEN environment variable');
}

export const db = createClient({
	url: PUBLIC_TURSO_DATABASE_URL,
	authToken: PUBLIC_TURSO_AUTH_TOKEN
}); 