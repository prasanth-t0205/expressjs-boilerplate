import crypto from 'crypto';

/**
 * Minimal RFC 6238 TOTP Implementation
 * No external dependencies (otplib etc.)
 */
export class TwoFactorService {
  private static readonly BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  /**
   * Generates a random Base32 string to be used as a TOTP secret
   * @param length Default is 32 characters (160 bits)
   */
  static generateSecret(length: number = 32): string {
    const bytes = crypto.randomBytes(length);
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += this.BASE32_CHARS[bytes[i] % this.BASE32_CHARS.length];
    }
    return secret;
  }

  /**
   * Generates the `otpauth://` URI required for QR Code generation.
   */
  static getOtpAuthUri(label: string, issuer: string, secret: string): string {
    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Validates a 6-digit TOTP code against a Base32 secret.
   * Checks current window and previous window to handle drift.
   */
  static verify(secret: string, code: string, window: number = 1): boolean {
    if (!code || code.length !== 6) return false;

    // Check current time step, and +/- window
    const timeStep = Math.floor(Date.now() / 1000 / 30);

    for (let i = -window; i <= window; i++) {
      const generatedCode = this.generateTotp(secret, timeStep + i);
      if (generatedCode === code) return true;
    }

    return false;
  }

  /**
   * Core TOTP generation function (RFC 6238)
   */
  private static generateTotp(secret: string, timeStep: number): string {
    const key = this.base32ToBuffer(secret);

    // Create 8-byte buffer for the time step
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(Math.floor(timeStep / 2 ** 32), 0); // high 32 bits
    timeBuffer.writeUInt32BE(timeStep & 0xffffffff, 4); // low 32 bits

    // HMAC-SHA1
    const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();

    // Dynamic Truncation
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Helper: Convert Base32 string to Buffer
   */
  private static base32ToBuffer(base32: string): Buffer {
    let bits = '';
    for (const char of base32.toUpperCase()) {
      const val = this.BASE32_CHARS.indexOf(char);
      if (val === -1) continue; // Ignore padding or invalid chars
      bits += val.toString(2).padStart(5, '0');
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return Buffer.from(bytes);
  }

  /**
   * Generate one-time recovery backup codes.
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex')); // 8 char hex codes
    }
    return codes;
  }
}
