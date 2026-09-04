import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyWebhookSignature } from '../lib/instagram/webhook';

describe('Meta Webhook Verification & HMAC Signature', () => {
  const secret = 'test_meta_app_secret_12345';
  const body = JSON.stringify({
    object: 'instagram',
    entry: [
      {
        id: '17841400000000000',
        time: 1700000000,
        messaging: [
          {
            sender: { id: '987654321' },
            recipient: { id: '17841400000000000' },
            timestamp: 1700000000000,
            message: { mid: 'mid.123456', text: 'Hey bro, what is up?' },
          },
        ],
      },
    ],
  });

  it('should verify valid Meta HMAC-SHA256 signature', () => {
    const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    const signatureHeader = `sha256=${hash}`;

    const isValid = verifyWebhookSignature(body, signatureHeader, secret);
    expect(isValid).toBe(true);
  });

  it('should reject invalid Meta HMAC-SHA256 signature', () => {
    const signatureHeader = 'sha256=invalid_hash_value_12345';
    const isValid = verifyWebhookSignature(body, signatureHeader, secret);
    expect(isValid).toBe(false);
  });

  it('should reject missing signature header', () => {
    const isValid = verifyWebhookSignature(body, null, secret);
    expect(isValid).toBe(false);
  });
});
