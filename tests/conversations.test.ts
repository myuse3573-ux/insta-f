import { describe, it, expect } from 'vitest';
import { parseWebhookEvent } from '../lib/instagram/webhook';

describe('Conversations & Webhook Payload Parsing', () => {
  it('should parse complete Instagram webhook payload with multiple entries', () => {
    const payload = {
      object: 'instagram',
      entry: [
        {
          id: 'ig_user_1',
          time: 1700000000,
          messaging: [
            {
              sender: { id: 'sender_1' },
              recipient: { id: 'ig_user_1' },
              timestamp: 1700000000000,
              message: { mid: 'mid_entry_1', text: 'First message' },
            },
            {
              sender: { id: 'sender_2' },
              recipient: { id: 'ig_user_1' },
              timestamp: 1700000100000,
              message: { mid: 'mid_entry_2', text: 'Second message' },
            },
          ],
        },
      ],
    };

    const parsed = parseWebhookEvent(payload);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].instagramMessageId).toBe('mid_entry_1');
    expect(parsed[1].instagramMessageId).toBe('mid_entry_2');
  });

  it('should return empty array for non-instagram objects', () => {
    const payload = { object: 'page', entry: [] };
    expect(parseWebhookEvent(payload)).toEqual([]);
  });
});
