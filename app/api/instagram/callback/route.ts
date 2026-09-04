import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForAccessToken } from '@/lib/instagram/auth';
import { encryptToken } from '@/lib/encryption';
import prisma from '@/lib/database';
import { setSessionCookie } from '@/lib/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');

  if (error || errorReason) {
    const errorDescription = searchParams.get('error_description') || 'Authorization was cancelled or failed.';
    console.error('[OAuth Callback Error]', errorDescription);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorDescription)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=No+authorization+code+provided', request.url));
  }

  try {
    const details = await exchangeCodeForAccessToken(code);
    const encryptedToken = encryptToken(details.accessToken);

    const expiresAt = details.expiresInSeconds
      ? new Date(Date.now() + details.expiresInSeconds * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const account = await prisma.instagramAccount.upsert({
      where: { instagramUserId: details.profile.id },
      update: {
        username: details.profile.username,
        accessTokenEncrypted: encryptedToken,
        tokenExpiresAt: expiresAt,
      },
      create: {
        instagramUserId: details.profile.id,
        username: details.profile.username,
        accessTokenEncrypted: encryptedToken,
        tokenExpiresAt: expiresAt,
      },
    });

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set HTTP-only application session cookie (ig_session)
    setSessionCookie(response, account.instagramUserId);

    return response;
  } catch (err: any) {
    console.error('[OAuth Callback Exchange Failed]', err.message);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err.message || 'Failed to exchange token')}`, request.url)
    );
  }
}
