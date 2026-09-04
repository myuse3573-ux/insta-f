import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database';
import { decryptToken } from '@/lib/encryption';
import { getCurrentAccount } from '@/lib/session';
import { fetchRemoteMessages, syncMessagesToDb, sendInstagramMessage } from '@/lib/instagram/messages';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId parameter' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const account = await getCurrentAccount(request);

  if (account && conversation.instagramConversationId && !conversation.instagramConversationId.startsWith('conv_')) {
    try {
      const decryptedToken = decryptToken(account.accessTokenEncrypted);
      const remoteMsgs = await fetchRemoteMessages(conversation.instagramConversationId, decryptedToken);
      await syncMessagesToDb(conversation.id, account.instagramUserId, remoteMsgs);
    } catch (syncErr: any) {
      console.warn('[Messages Remote Sync Warning]', syncErr.message);
    }
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    conversation,
    messages,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, text } = body;

    // Input Validation (Section 35)
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing conversationId' }, { status: 400 });
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'Message text must not be empty' }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Message text exceeds the maximum character limit (1000 characters)' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const account = await getCurrentAccount(request);

    if (!account) {
      return NextResponse.json({ error: 'No connected Instagram account found' }, { status: 401 });
    }

    const decryptedToken = decryptToken(account.accessTokenEncrypted);

    // Send reply via Meta Send API
    const message = await sendInstagramMessage({
      instagramUserId: account.instagramUserId,
      recipientId: conversation.participantId,
      conversationId: conversation.id,
      text: text.trim(),
      accessToken: decryptedToken,
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('[Send Message Error]', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
