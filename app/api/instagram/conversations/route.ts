import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database';
import { decryptToken } from '@/lib/encryption';
import { getCurrentAccount } from '@/lib/session';
import { fetchRemoteConversations, syncConversationsToDb } from '@/lib/instagram/conversations';

export async function GET(request: NextRequest) {
  const account = await getCurrentAccount(request);

  if (!account) {
    return NextResponse.json(
      { error: 'No Instagram account connected. Please connect your Instagram account first.', connected: false },
      { status: 401 }
    );
  }

  try {
    if (account.accessTokenEncrypted) {
      try {
        const decryptedToken = decryptToken(account.accessTokenEncrypted);
        const remoteConvs = await fetchRemoteConversations(account.instagramUserId, decryptedToken);
        await syncConversationsToDb(account.instagramUserId, remoteConvs);
      } catch (syncErr: any) {
        console.warn('[Conversations Sync Warning]', syncErr.message);
      }
    }

    const conversations = await prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({
      connected: true,
      account: {
        username: account.username,
        instagramUserId: account.instagramUserId,
      },
      conversations,
    });
  } catch (error: any) {
    console.error('[Get Conversations Error]', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}
