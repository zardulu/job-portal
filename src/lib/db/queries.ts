import { db } from './server.js';
import { randomBytes } from 'crypto';

export interface Community {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    admin_email: string;
    admin_token: string | null;
    admin_token_expires: string | null;
    created_at: string;
}

export interface Job {
    id: number;
    community_id: number;
    title: string;
    description: string;
    contact_info: string;
    poster_email: string;
    edit_token: string | null;
    token_expires: string | null;
    created_at: string;
}

export interface CreateCommunityData {
    name: string;
    description?: string;
    admin_email: string;
}

export interface CreateJobData {
    community_id: number;
    title: string;
    description: string;
    contact_info: string;
    poster_email: string;
}

// Community functions
export async function createCommunity(data: CreateCommunityData): Promise<{ community: Community; adminToken: string }> {
    // Generate unique slug
    const baseSlug = data.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const randomSuffix = randomBytes(4).toString('hex');
    const slug = `${baseSlug}-${randomSuffix}`;

    // Generate admin token
    const adminToken = randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hour expiry

    await db.execute({
        sql: `INSERT INTO communities (slug, name, description, admin_email, admin_token, admin_token_expires) 
			  VALUES (?, ?, ?, ?, ?, ?)`,
        args: [slug, data.name, data.description || null, data.admin_email, adminToken, tokenExpires.toISOString()]
    });

    const community = await getCommunityBySlug(slug);
    if (!community) {
        throw new Error('Failed to create community');
    }

    return { community, adminToken };
}

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
    const result = await db.execute({
        sql: 'SELECT * FROM communities WHERE slug = ?',
        args: [slug]
    });

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id as number,
        slug: row.slug as string,
        name: row.name as string,
        description: row.description as string | null,
        admin_email: row.admin_email as string,
        admin_token: row.admin_token as string | null,
        admin_token_expires: row.admin_token_expires as string | null,
        created_at: row.created_at as string
    };
}

export async function getCommunityByAdminToken(token: string): Promise<Community | null> {
    const result = await db.execute({
        sql: 'SELECT * FROM communities WHERE admin_token = ? AND admin_token_expires > datetime("now")',
        args: [token]
    });

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id as number,
        slug: row.slug as string,
        name: row.name as string,
        description: row.description as string | null,
        admin_email: row.admin_email as string,
        admin_token: row.admin_token as string | null,
        admin_token_expires: row.admin_token_expires as string | null,
        created_at: row.created_at as string
    };
}

// Job functions
export async function createJob(data: CreateJobData): Promise<{ job: Job; editToken: string }> {
    // Generate edit token
    const editToken = randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hour expiry

    const result = await db.execute({
        sql: `INSERT INTO jobs (community_id, title, description, contact_info, poster_email, edit_token, token_expires) 
			  VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [data.community_id, data.title, data.description, data.contact_info, data.poster_email, editToken, tokenExpires.toISOString()]
    });

    const jobId = Number(result.lastInsertRowid);
    const job = await getJobById(jobId);
    if (!job) {
        throw new Error('Failed to create job');
    }

    return { job, editToken };
}

export async function getJobById(id: number): Promise<Job | null> {
    const result = await db.execute({
        sql: 'SELECT * FROM jobs WHERE id = ?',
        args: [id]
    });

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id as number,
        community_id: row.community_id as number,
        title: row.title as string,
        description: row.description as string,
        contact_info: row.contact_info as string,
        poster_email: row.poster_email as string,
        edit_token: row.edit_token as string | null,
        token_expires: row.token_expires as string | null,
        created_at: row.created_at as string
    };
}

export async function getJobsByCommunityId(communityId: number): Promise<Job[]> {
    const result = await db.execute({
        sql: 'SELECT * FROM jobs WHERE community_id = ? ORDER BY created_at DESC',
        args: [communityId]
    });

    return result.rows.map(row => ({
        id: row.id as number,
        community_id: row.community_id as number,
        title: row.title as string,
        description: row.description as string,
        contact_info: row.contact_info as string,
        poster_email: row.poster_email as string,
        edit_token: row.edit_token as string | null,
        token_expires: row.token_expires as string | null,
        created_at: row.created_at as string
    }));
}

export async function getJobByEditToken(token: string): Promise<Job | null> {
    const result = await db.execute({
        sql: 'SELECT * FROM jobs WHERE edit_token = ? AND token_expires > datetime("now")',
        args: [token]
    });

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id as number,
        community_id: row.community_id as number,
        title: row.title as string,
        description: row.description as string,
        contact_info: row.contact_info as string,
        poster_email: row.poster_email as string,
        edit_token: row.edit_token as string | null,
        token_expires: row.token_expires as string | null,
        created_at: row.created_at as string
    };
}

export async function updateJob(id: number, data: Partial<CreateJobData>): Promise<Job | null> {
    const updates: string[] = [];
    const args: any[] = [];

    if (data.title) {
        updates.push('title = ?');
        args.push(data.title);
    }
    if (data.description) {
        updates.push('description = ?');
        args.push(data.description);
    }
    if (data.contact_info) {
        updates.push('contact_info = ?');
        args.push(data.contact_info);
    }

    if (updates.length === 0) {
        return getJobById(id);
    }

    args.push(id);

    await db.execute({
        sql: `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`,
        args
    });

    return getJobById(id);
}

export async function deleteJob(id: number): Promise<boolean> {
    const result = await db.execute({
        sql: 'DELETE FROM jobs WHERE id = ?',
        args: [id]
    });

    return result.rowsAffected > 0;
}