import { db } from '$lib/db/server.ts';
import { TokenService } from '$lib/server/utils/tokenService.ts';
import type { ResultSet } from '@libsql/client';

/**
 * Data types for community operations
 */
export interface Community {
  id: number;
  slug: string;
  name: string;
  description?: string;
  adminEmail: string;
  adminToken?: string;
  adminTokenExpires?: Date;
  createdAt: Date;
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  adminEmail: string;
  slug: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  adminEmail?: string;
}

/**
 * Database errors for better error handling
 */
export class CommunityError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CommunityError';
  }
}

/**
 * Service for managing community database operations
 */
export class CommunityService {
  /**
   * Creates a new community with generated admin token
   */
  static async createCommunity(data: CreateCommunityData): Promise<Community> {
    try {
      // Generate admin token and expiry
      const adminToken = TokenService.generateSecureToken();
      const adminTokenExpires = TokenService.generateTokenExpiry(24);

      const result = await db.execute({
        sql: `INSERT INTO communities (slug, name, description, admin_email, admin_token, admin_token_expires)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          data.slug,
          data.name,
          data.description || null,
          data.adminEmail,
          adminToken,
          adminTokenExpires.toISOString()
        ]
      });

      if (!result.lastInsertRowid) {
        throw new CommunityError('Failed to create community');
      }

      // Fetch the created community
      const community = await this.getCommunityById(Number(result.lastInsertRowid));
      if (!community) {
        throw new CommunityError('Failed to retrieve created community');
      }

      return community;
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new CommunityError('A community with this slug already exists', 'DUPLICATE_SLUG');
      }
      if (error instanceof CommunityError) {
        throw error;
      }
      throw new CommunityError(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a community by its slug
   */
  static async getCommunityBySlug(slug: string): Promise<Community | null> {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM communities WHERE slug = ?',
        args: [slug]
      });

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToCommunity(result.rows[0]);
    } catch (error) {
      throw new CommunityError(`Failed to fetch community by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a community by its admin token
   */
  static async getCommunityByToken(token: string): Promise<Community | null> {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM communities WHERE admin_token = ?',
        args: [token]
      });

      if (result.rows.length === 0) {
        return null;
      }

      const community = this.mapRowToCommunity(result.rows[0]);
      
      // Validate token expiry
      if (community.adminTokenExpires && !TokenService.validateToken(token, community.adminTokenExpires)) {
        return null;
      }

      return community;
    } catch (error) {
      throw new CommunityError(`Failed to fetch community by token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a community by its ID
   */
  static async getCommunityById(id: number): Promise<Community | null> {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM communities WHERE id = ?',
        args: [id]
      });

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToCommunity(result.rows[0]);
    } catch (error) {
      throw new CommunityError(`Failed to fetch community by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates a community's information
   */
  static async updateCommunity(id: number, data: UpdateCommunityData): Promise<Community> {
    try {
      const updates: string[] = [];
      const args: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        args.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        args.push(data.description);
      }
      if (data.adminEmail !== undefined) {
        updates.push('admin_email = ?');
        args.push(data.adminEmail);
      }

      if (updates.length === 0) {
        throw new CommunityError('No fields to update');
      }

      args.push(id);

      const result = await db.execute({
        sql: `UPDATE communities SET ${updates.join(', ')} WHERE id = ?`,
        args
      });

      if (result.rowsAffected === 0) {
        throw new CommunityError('Community not found', 'NOT_FOUND');
      }

      const updatedCommunity = await this.getCommunityById(id);
      if (!updatedCommunity) {
        throw new CommunityError('Failed to retrieve updated community');
      }

      return updatedCommunity;
    } catch (error) {
      if (error instanceof CommunityError) {
        throw error;
      }
      throw new CommunityError(`Failed to update community: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a new magic link token for a community
   */
  static async generateMagicLink(communityId: number): Promise<string> {
    try {
      const token = TokenService.generateSecureToken();
      const expires = TokenService.generateTokenExpiry(24);

      const result = await db.execute({
        sql: 'UPDATE communities SET admin_token = ?, admin_token_expires = ? WHERE id = ?',
        args: [token, expires.toISOString(), communityId]
      });

      if (result.rowsAffected === 0) {
        throw new CommunityError('Community not found', 'NOT_FOUND');
      }

      return token;
    } catch (error) {
      if (error instanceof CommunityError) {
        throw error;
      }
      throw new CommunityError(`Failed to generate magic link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps a database row to a Community object
   */
  private static mapRowToCommunity(row: any): Community {
    return {
      id: Number(row.id),
      slug: String(row.slug),
      name: String(row.name),
      description: row.description ? String(row.description) : undefined,
      adminEmail: String(row.admin_email),
      adminToken: row.admin_token ? String(row.admin_token) : undefined,
      adminTokenExpires: row.admin_token_expires ? new Date(String(row.admin_token_expires)) : undefined,
      createdAt: new Date(String(row.created_at))
    };
  }
}