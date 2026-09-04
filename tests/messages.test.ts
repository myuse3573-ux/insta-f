import { describe, it, expect } from 'vitest';
import { normalizeWebhookMessage } from '../lib/instagram/webhook';

describe('Instagram Messaging & Webhook Event Parsing', () => {
  it('should normalize valid Meta webhook messaging event', () => {
    const rawEvent = {
      sender: { id: 'user_12345' },
      recipient: { id: 'ig_user_67890' },
      timestamp: 1700000000000,
      message: {
        mid: 'mid.1001',
        text: 'Hello from test!',
      },
    };

    const normalized = normalizeWebhookMessage(rawEvent);

    expect(normalized).not.toBeNull();
    expect(normalized?.instagramMessageId).toBe('mid.1001');
    expect(normalized?.senderId).toBe('user_12345');
    expect(normalized?.recipientId).toBe('ig_user_67890');
    expect(normalized?.text).toBe('Hello from test!');
  });

  it('should return null on invalid messaging event without mid', () => {
    const invalidEvent = {
      sender: { id: 'user_12345' },
      timestamp: 1700000000000,
    };

    const normalized = normalizeWebhookMessage(invalidEvent);
    expect(normalized).toBeNull();
  });
});
