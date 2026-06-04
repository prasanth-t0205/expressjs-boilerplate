import crypto from 'crypto';
import { AppError } from '@forge/errors';

export class WebhookVerifier {
  /**
   * Safely verifies an inbound webhook signature to prevent timing attacks.
   *
   * @param secret The shared secret
   * @param rawBody The RAW string body of the request (not the parsed JSON)
   * @param signatureHeader The value of the X-Webhook-Signature header
   * @param timestampHeader The value of the X-Webhook-Timestamp header
   * @param toleranceSeconds How old the timestamp can be before we reject it (replay attack prevention)
   */
  static verify(
    secret: string,
    rawBody: string,
    signatureHeader: string | undefined,
    timestampHeader: string | undefined,
    toleranceSeconds: number = 300, // 5 minutes
  ): boolean {
    if (!signatureHeader || !timestampHeader) {
      throw new AppError('Missing webhook signature headers', 401);
    }

    // Check for replay attacks (timestamp too old)
    const timestamp = parseInt(timestampHeader, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(timestamp) || Math.abs(now - timestamp) > toleranceSeconds) {
      throw new AppError('Webhook timestamp is outside tolerance zone', 401);
    }

    // signatureHeader often looks like: "sha256=abc123def456..."
    let providedSignature = signatureHeader;
    if (signatureHeader.startsWith('sha256=')) {
      providedSignature = signatureHeader.replace('sha256=', '');
    }

    // Recompute the expected signature
    const signatureContent = `${timestampHeader}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureContent)
      .digest('hex');

    // Prevent timing attacks by using constant-time comparison
    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(providedSignature, 'utf-8'),
        Buffer.from(expectedSignature, 'utf-8'),
      );

      if (!match) {
        throw new AppError('Webhook signature validation failed', 401);
      }

      return true;
    } catch (err) {
      // Buffer length mismatch throws an error in timingSafeEqual
      throw new AppError('Webhook signature length mismatch', 401);
    }
  }
}
