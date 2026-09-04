import crypto from 'crypto';

export interface NormalizedWebhookMessage {
  instagramMessageId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: Date;
}

/**
 * Validates Meta Webhook HMAC-SHA256 signature header (X-Hub-Signature-256)
 * using timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;

  const expectedHash = parts[1];
  const actualHash = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const bufA = Buffer.from(expectedHash, 'utf8');
  const bufB = Buffer.from(actualHash, 'utf8');

  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Normalizes an incoming Meta Webhook messaging event into application format.
 */
export function normalizeWebhookMessage(messagingEvent: any): NormalizedWebhookMessage | null {
  if (!messagingEvent || !messagingEvent.message || !messagingEvent.message.mid) {
    return null;
  }

  const { sender, recipient, timestamp, message } = messagingEvent;

  return {
    instagramMessageId: message.mid,
    senderId: sender?.id || 'unknown',
    recipientId: recipient?.id || 'unknown',
    text: message.text || '[Media / Sticker / Attachment]',
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  };
}

/**
 * Parses a complete Meta Webhook JSON payload and returns list of normalized incoming messages.
 */
export function parseWebhookEvent(payload: any): NormalizedWebhookMessage[] {
  if (!payload || payload.object !== 'instagram') return [];

  const normalizedList: NormalizedWebhookMessage[] = [];
  const entries = payload.entry || [];

  for (const entry of entries) {
    const messagingList = entry.messaging || [];
    for (const messagingEvent of messagingList) {
      const normalized = normalizeWebhookMessage(messagingEvent);
      if (normalized) {
        normalizedList.push(normalized);
      }
    }
  }

  return normalizedList;
}
