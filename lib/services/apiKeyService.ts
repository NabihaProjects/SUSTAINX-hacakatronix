// SOIL IQ - Customer API Key Management & Authentication Service
// Cryptographic token generation, SHA-256 hashing, and scope verification
import crypto from 'node:crypto';
import prisma from '@/lib/db/prisma';

export const ALLOWED_API_SCOPES = [
  'READ_FARMS',
  'READ_FIELDS',
  'READ_GRIDS',
  'READ_SOIL',
  'READ_TELEMETRY',
  'READ_PRESCRIPTIONS',
  'READ_ANALYTICS',
] as const;

export type ApiScope = (typeof ALLOWED_API_SCOPES)[number];

export class ApiKeyService {
  /**
   * Generates a new cryptographically secure API key
   * Returns the plaintext key ONLY ONCE for customer display
   */
  static async generateKey(params: {
    organizationId: string;
    name: string;
    scopes: ApiScope[];
    createdByUserId?: string;
    expiresInDays?: number;
  }): Promise<{ plaintextKey: string; keyRecord: any }> {
    const { organizationId, name, scopes, createdByUserId, expiresInDays } = params;

    // Reject disallowed scopes (e.g. machine control actions are forbidden via standard customer API)
    for (const s of scopes) {
      if (!ALLOWED_API_SCOPES.includes(s)) {
        throw new Error(`Forbidden scope '${s}'. Machine control scopes are strictly restricted.`);
      }
    }

    // 256-bit random entropy
    const randomEntropy = crypto.randomBytes(24).toString('hex');
    const plaintextKey = `siq_live_${randomEntropy}`;
    const keyPrefix = plaintextKey.slice(0, 16); // e.g. "siq_live_a1b2c3d4"

    // SHA-256 hash for secure storage
    const keyHash = crypto.createHash('sha256').update(plaintextKey).digest('hex');

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const keyRecord = await prisma.customerApiKey.create({
      data: {
        organizationId,
        name,
        keyPrefix,
        keyHash,
        scopesJson: JSON.stringify(scopes),
        status: 'ACTIVE',
        createdByUserId,
        expiresAt,
      },
    });

    return {
      plaintextKey,
      keyRecord,
    };
  }

  /**
   * Verify an incoming API key against stored SHA-256 hash
   */
  static async verifyKey(plaintextKey: string): Promise<{
    valid: boolean;
    organizationId?: string;
    scopes?: ApiScope[];
    error?: string;
  }> {
    if (!plaintextKey.startsWith('siq_live_')) {
      return { valid: false, error: 'Malformed API key prefix.' };
    }

    const keyPrefix = plaintextKey.slice(0, 16);
    const keyHash = crypto.createHash('sha256').update(plaintextKey).digest('hex');

    const candidate = await prisma.customerApiKey.findFirst({
      where: {
        keyPrefix,
        status: 'ACTIVE',
      },
    });

    if (!candidate) {
      return { valid: false, error: 'API key not found or revoked.' };
    }

    // Constant-time comparison to prevent timing attacks
    const storedBuffer = Buffer.from(candidate.keyHash, 'hex');
    const computedBuffer = Buffer.from(keyHash, 'hex');

    if (
      storedBuffer.length !== computedBuffer.length ||
      !crypto.timingSafeEqual(storedBuffer, computedBuffer)
    ) {
      return { valid: false, error: 'Invalid API key secret.' };
    }

    if (candidate.expiresAt && candidate.expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired.' };
    }

    // Update lastUsed timestamp asynchronously
    await prisma.customerApiKey.update({
      where: { id: candidate.id },
      data: { lastUsedAt: new Date() },
    });

    const scopes: ApiScope[] = JSON.parse(candidate.scopesJson || '[]');

    return {
      valid: true,
      organizationId: candidate.organizationId,
      scopes,
    };
  }

  /**
   * Revoke an active API key
   */
  static async revokeKey(keyId: string, organizationId: string): Promise<void> {
    await prisma.customerApiKey.updateMany({
      where: {
        id: keyId,
        organizationId,
      },
      data: {
        status: 'REVOKED',
      },
    });
  }
}
