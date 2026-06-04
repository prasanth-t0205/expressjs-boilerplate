import crypto from 'crypto';

export interface GeneratedApiKey {
  keyId: string;
  rawKey: string;
  hashedKey: string;
}

export class ApiKeyService {
  /**
   * Generates a cryptographically secure API key
   * @param prefix e.g., 'ak_live', 'ak_test'
   */
  static generate(prefix: string = 'ak_live'): GeneratedApiKey {
    const keyId = `kid_${crypto.randomBytes(12).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');
    const rawKey = `${prefix}_${secret}`;
    const hashedKey = this.hash(rawKey);

    return {
      keyId,
      rawKey,
      hashedKey,
    };
  }

  /**
   * Hashes an API key for safe storage or comparison
   */
  static hash(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  /**
   * Validates if the provided raw key matches the stored hash
   */
  static verify(rawKey: string, storedHash: string): boolean {
    const computedHash = this.hash(rawKey);
    // Prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'utf-8'),
      Buffer.from(storedHash, 'utf-8'),
    );
  }
}
