import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CommunityService, CommunityError, type CreateCommunityData, type UpdateCommunityData } from './communityService.ts';
import { TokenService } from '$lib/server/utils/tokenService.ts';

// Mock the database
const mockDb = {
  execute: vi.fn()
};

vi.mock('$lib/db/server.ts', () => ({
  db: mockDb
}));

// Mock TokenService
vi.mock('$lib/server/utils/tokenService.ts', () => ({
  TokenService: {
    generateSecureToken: vi.fn(),
    generateTokenExpiry: vi.fn(),
    validateToken: vi.fn()
  }
}));

describe('CommunityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(TokenService.generateSecureToken).mockReturnValue('mock-token-123');
    vi.mocked(TokenService.generateTokenExpiry).mockReturnValue(new Date('2024-01-02T00:00:00Z'));
    vi.mocked(TokenService.validateToken).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCommunity', () => {
    it('should create a community successfully', async () => {
      const createData: CreateCommunityData = {
        name: 'Test Community',
        description: 'A test community',
        adminEmail: 'admin@test.com',
        slug: 'test-community'
      };

      // Mock successful insert
      mockDb.execute
        .mockResolvedValueOnce({ lastInsertRowid: 1, rowsAffected: 1 })
        // Mock the subsequent fetch
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            slug: 'test-community',
            name: 'Test Community',
            description: 'A test community',
            admin_email: 'admin@test.com',
            admin_token: 'mock-token-123',
            admin_token_expires: '2024-01-02T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z'
          }]
        });

      const result = await CommunityService.createCommunity(createData);

      expect(result).toEqual({
        id: 1,
        slug: 'test-community',
        name: 'Test Community',
        description: 'A test community',
        adminEmail: 'admin@test.com',
        adminToken: 'mock-token-123',
        adminTokenExpires: new Date('2024-01-02T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z')
      });

      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: expect.stringContaining('INSERT INTO communities'),
        args: [
          'test-community',
          'Test Community',
          'A test community',
          'admin@test.com',
          'mock-token-123',
          '2024-01-02T00:00:00.000Z'
        ]
      });
    });

    it('should handle duplicate slug error', async () => {
      const createData: CreateCommunityData = {
        name: 'Test Community',
        adminEmail: 'admin@test.com',
        slug: 'existing-slug'
      };

      mockDb.execute.mockRejectedValueOnce(new Error('UNIQUE constraint failed: communities.slug'));

      await expect(CommunityService.createCommunity(createData)).rejects.toThrow(
        new CommunityError('A community with this slug already exists', 'DUPLICATE_SLUG')
      );
    });

    it('should handle database errors', async () => {
      const createData: CreateCommunityData = {
        name: 'Test Community',
        adminEmail: 'admin@test.com',
        slug: 'test-slug'
      };

      mockDb.execute.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(CommunityService.createCommunity(createData)).rejects.toThrow(
        new CommunityError('Database error: Database connection failed')
      );
    });
  });

  describe('getCommunityBySlug', () => {
    it('should return community when found', async () => {
      mockDb.execute.mockResolvedValueOnce({
        rows: [{
          id: 1,
          slug: 'test-community',
          name: 'Test Community',
          description: null,
          admin_email: 'admin@test.com',
          admin_token: 'token-123',
          admin_token_expires: '2024-01-02T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }]
      });

      const result = await CommunityService.getCommunityBySlug('test-community');

      expect(result).toEqual({
        id: 1,
        slug: 'test-community',
        name: 'Test Community',
        description: undefined,
        adminEmail: 'admin@test.com',
        adminToken: 'token-123',
        adminTokenExpires: new Date('2024-01-02T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z')
      });

      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: 'SELECT * FROM communities WHERE slug = ?',
        args: ['test-community']
      });
    });

    it('should return null when community not found', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      const result = await CommunityService.getCommunityBySlug('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockDb.execute.mockRejectedValueOnce(new Error('Database error'));

      await expect(CommunityService.getCommunityBySlug('test')).rejects.toThrow(
        new CommunityError('Failed to fetch community by slug: Database error')
      );
    });
  });

  describe('getCommunityByToken', () => {
    it('should return community when token is valid', async () => {
      mockDb.execute.mockResolvedValueOnce({
        rows: [{
          id: 1,
          slug: 'test-community',
          name: 'Test Community',
          description: null,
          admin_email: 'admin@test.com',
          admin_token: 'valid-token',
          admin_token_expires: '2024-01-02T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }]
      });

      vi.mocked(TokenService.validateToken).mockReturnValue(true);

      const result = await CommunityService.getCommunityByToken('valid-token');

      expect(result).toBeTruthy();
      expect(result?.adminToken).toBe('valid-token');
      expect(TokenService.validateToken).toHaveBeenCalledWith('valid-token', new Date('2024-01-02T00:00:00Z'));
    });

    it('should return null when token is expired', async () => {
      mockDb.execute.mockResolvedValueOnce({
        rows: [{
          id: 1,
          slug: 'test-community',
          name: 'Test Community',
          description: null,
          admin_email: 'admin@test.com',
          admin_token: 'expired-token',
          admin_token_expires: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }]
      });

      vi.mocked(TokenService.validateToken).mockReturnValue(false);

      const result = await CommunityService.getCommunityByToken('expired-token');

      expect(result).toBeNull();
    });

    it('should return null when token not found', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      const result = await CommunityService.getCommunityByToken('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('updateCommunity', () => {
    it('should update community successfully', async () => {
      const updateData: UpdateCommunityData = {
        name: 'Updated Community',
        description: 'Updated description'
      };

      mockDb.execute
        .mockResolvedValueOnce({ rowsAffected: 1 })
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            slug: 'test-community',
            name: 'Updated Community',
            description: 'Updated description',
            admin_email: 'admin@test.com',
            admin_token: 'token-123',
            admin_token_expires: '2024-01-02T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z'
          }]
        });

      const result = await CommunityService.updateCommunity(1, updateData);

      expect(result.name).toBe('Updated Community');
      expect(result.description).toBe('Updated description');

      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: 'UPDATE communities SET name = ?, description = ? WHERE id = ?',
        args: ['Updated Community', 'Updated description', 1]
      });
    });

    it('should throw error when community not found', async () => {
      mockDb.execute.mockResolvedValueOnce({ rowsAffected: 0 });

      await expect(CommunityService.updateCommunity(999, { name: 'Test' })).rejects.toThrow(
        new CommunityError('Community not found', 'NOT_FOUND')
      );
    });

    it('should throw error when no fields to update', async () => {
      await expect(CommunityService.updateCommunity(1, {})).rejects.toThrow(
        new CommunityError('No fields to update')
      );
    });
  });

  describe('generateMagicLink', () => {
    it('should generate new magic link token', async () => {
      mockDb.execute.mockResolvedValueOnce({ rowsAffected: 1 });

      const result = await CommunityService.generateMagicLink(1);

      expect(result).toBe('mock-token-123');
      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: 'UPDATE communities SET admin_token = ?, admin_token_expires = ? WHERE id = ?',
        args: ['mock-token-123', '2024-01-02T00:00:00.000Z', 1]
      });
    });

    it('should throw error when community not found', async () => {
      mockDb.execute.mockResolvedValueOnce({ rowsAffected: 0 });

      await expect(CommunityService.generateMagicLink(999)).rejects.toThrow(
        new CommunityError('Community not found', 'NOT_FOUND')
      );
    });
  });
});