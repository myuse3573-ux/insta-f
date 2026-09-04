import { instagramApiFetch } from './client';
import prisma from '../database';

export interface RemoteConversation {
  id: string;
  updated_time?: string;
  participants?: {
    data: Array<{
      id: string;
      username?: string;
      name?: string;
    }>;
  };
  messages?: {
    data: Array<{
      id: string;
      created_time: string;
      message?: string;
      from?: { id: string; username?: string };
    }>;
  };
}

export interface FetchConversationsResponse {
  data: RemoteConversation[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

/**
 * Fetches active Instagram Direct conversations for the connected Professional account from graph.instagram.com.
 */
export async function fetchRemoteConversations(
  instagramUserId: string,
  accessToken: string
): Promise<RemoteConversation[]> {
  const endpoint = `/${instagramUserId}/conversations`;
  const response = await instagramApiFetch<FetchConversationsResponse>(endpoint, {
    accessToken,
    params: {
      platform: 'instagram',
      fields: 'id,updated_time,participants,messages{id,created_time,message,from}',
    },
  });

  return response.data || [];
}

/**
 * Synchronizes remote Meta API conversations to database.
 */
export async function syncConversationsToDb(
  instagramUserId: string,
  remoteConversations: RemoteConversation[]
) {
  const updatedConversations = [];

  for (const remote of remoteConversations) {
    const participants = remote.participants?.data || [];
    const otherParticipant = participants.find((p) => p.id !== instagramUserId) || participants[0] || {
      id: 'unknown',
      username: 'Instagram User',
    };

    const participantId = otherParticipant.id;
    const participantUsername = otherParticipant.username || otherParticipant.name || `User_${participantId.substring(0, 5)}`;
    
    const lastMsgObj = remote.messages?.data?.[0];
    const lastMessage = lastMsgObj?.message || 'Media / Attachment';
    const lastMessageAt = remote.updated_time ? new Date(remote.updated_time) : new Date();

    const conversation = await prisma.conversation.upsert({
      where: { instagramConversationId: remote.id },
      update: {
        participantId,
        participantUsername,
        lastMessage,
        lastMessageAt,
      },
      create: {
        instagramConversationId: remote.id,
        participantId,
        participantUsername,
        lastMessage,
        lastMessageAt,
      },
    });

    if (lastMsgObj && lastMsgObj.id) {
      const senderId = lastMsgObj.from?.id || participantId;
      const senderUsername = lastMsgObj.from?.username || (senderId === instagramUserId ? 'You' : participantUsername);
      const direction = senderId === instagramUserId ? 'OUTBOUND' : 'INBOUND';

      await prisma.message.upsert({
        where: { instagramMessageId: lastMsgObj.id },
        update: {},
        create: {
          instagramMessageId: lastMsgObj.id,
          conversationId: conversation.id,
          senderId,
          senderUsername,
          text: lastMessage,
          direction,
          createdAt: new Date(lastMsgObj.created_time),
        },
      });
    }

    updatedConversations.push(conversation);
  }

  return updatedConversations;
}
