import crypto from 'crypto';
import { eventBus } from '@forge/events';
import { AppError } from '@forge/errors';

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
}

export class WebhookService {
  /**
   * Generates an HMAC-SHA256 signature for a webhook payload
   */
  static signPayload(secret: string, payloadStr: string, timestamp: number): string {
    const signatureContent = `${timestamp}.${payloadStr}`;
    return crypto.createHmac('sha256', secret).update(signatureContent).digest('hex');
  }

  /**
   * Dispatches an asynchronous webhook event.
   */
  static dispatch(event: string, data: any): void {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: Math.floor(Date.now() / 1000),
    };

    eventBus.emit('webhook:dispatch', payload);
  }

  /**
   * Prepares the exact headers needed to send a webhook.
   */
  static prepareHeaders(secret: string, payload: WebhookPayload): Record<string, string> {
    const payloadStr = JSON.stringify(payload);
    const signature = this.signPayload(secret, payloadStr, payload.timestamp);

    return {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `sha256=${signature}`,
      'X-Webhook-Timestamp': payload.timestamp.toString(),
      'X-Webhook-Event': payload.event,
    };
  }
}
