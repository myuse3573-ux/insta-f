import { instagramApiFetch } from './client';
import prisma from '../database';
import dashboardEvents from '../events';
import { parseWebhookEvent } from './webhook';

export interface RemoteMessage {
  id: string;
  created_time: string;
  message?: string;
  from?: {
    id: string;
    username?: string;
    name?: string;
  };
  to?: {
    data: Array<{ id: string; username?: string }>;
  };
}

export interface FetchMessagesResponse {
  id: string;
  messages?: {
    data: RemoteMessage[];
    paging?: { cursors?: { before: string; after: string }; next?: string };
  };
}

/**
 * Fetches message history for a specific conversation from graph.instagram.com.
 */
export async function fetchRemoteMessages(
  conversationId: string,
  accessToken: string
): Promise<RemoteMessage[]> {
  const endpoint = `/${conversationId}`;
  const response = await instagramApiFetch<FetchMessagesResponse>(endpoint, {
    accessToken,
    params: {
      fields: 'id,messages{id,created_time,message,from,to}',
    },
  });

  return response.messages?.data || [];
}

/**
 * Syncs remote message list into database.
 */
export async function syncMessagesToDb(
  dbConversationId: string,
  currentIgUserId: string,
  remoteMessages: RemoteMessage[]
) {
  const savedMessages = [];

  for (const remote of remoteMessages) {
    if (!remote.id) continue;

    const senderId = remote.from?.id || 'unknown';
    const senderUsername = remote.from?.username || (senderId === currentIgUserId ? 'You' : 'Friend');
    const direction = senderId === currentIgUserId ? 'OUTBOUND' : 'INBOUND';
    const text = remote.message || '[Attachment / Sticker / Media]';
    const createdAt = remote.created_time ? new Date(remote.created_time) : new Date();

    const msg = await prisma.message.upsert({
      where: { instagramMessageId: remote.id },
      update: { text },
      create: {
        instagramMessageId: remote.id,
        conversationId: dbConversationId,
        senderId,
        senderUsername,
        text,
        direction,
        createdAt,
      },
    });

    savedMessages.push(msg);
  }

  return savedMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Sends a reply message to an Instagram user using official Instagram Send API.
 * Only saves OUTBOUND message to database AFTER successful Meta API confirmation.
 */
export async function sendInstagramMessage(options: {
  instagramUserId: string;
  recipientId: string;
  conversationId: string;
  text: string;
  accessToken: string;
}) {
  const { instagramUserId, recipientId, conversationId, text, accessToken } = options;

  const endpoint = `/${instagramUserId}/messages`;
  
  const payload = {
    recipient: { id: recipientId },
    message: { text },
  };

  const response = await instagramApiFetch<{ message_id: string; recipient_id: string }>(endpoint, {
    method: 'POST',
    body: payload,
    accessToken,
  });

  const messageId = response.message_id || `out_${Date.now()}`;

  // Store OUTBOUND message in database AFTER Meta confirmation
  const createdMsg = await prisma.message.create({
    data: {
      instagramMessageId: messageId,
      conversationId,
      senderId: instagramUserId,
      senderUsername: 'You',
      text,
      direction: 'OUTBOUND',
    },
  });

  // Update conversation lastMessage & timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: text,
      lastMessageAt: new Date(),
    },
  });

  // Broadcast event to UI via SSE
  dashboardEvents.emit('message_sent', createdMsg);

  return createdMsg;
}

/**
 * Processes incoming Meta Webhook event payloads with deduplication.
 */
export async function processIncomingWebhookPayload(payload: any) {
  const normalizedMessages = parseWebhookEvent(payload);
  if (normalizedMessages.length === 0) {
    return { success: true, processedCount: 0 };
  }

  let processedCount = 0;

  for (const msgData of normalizedMessages) {
    const { instagramMessageId, senderId, recipientId, text, timestamp } = msgData;

    // 1. Deduplication check
    const existing = await prisma.message.findUnique({
      where: { instagramMessageId },
    });

    if (existing) {
      console.log(`[Webhook] Duplicate message ${instagramMessageId} skipped.`);
      continue;
    }

    // 2. Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { participantId: senderId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          instagramConversationId: `conv_${senderId}_${recipientId}`,
          participantId: senderId,
          participantUsername: `User_${senderId.substring(0, 6)}`,
          lastMessage: text,
          lastMessageAt: timestamp,
        },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: text,
          lastMessageAt: timestamp,
        },
      });
    }

    // 3. Save message
    const createdMessage = await prisma.message.create({
      data: {
        instagramMessageId,
        conversationId: conversation.id,
        senderId,
        senderUsername: conversation.participantUsername,
        text,
        direction: 'INBOUND',
        createdAt: timestamp,
      },
    });

    // 4. Real-time broadcast
    dashboardEvents.emit('message_received', {
      message: createdMessage,
      conversationId: conversation.id,
    });

    processedCount++;
  }

  return { success: true, processedCount };
}
