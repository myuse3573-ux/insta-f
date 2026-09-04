import { NextRequest, NextResponse } from 'next/server';
import prisma from './database';

const SESSION_COOKIE_NAME = 'ig_session';

export interface AppSession {
  instagramUserId: string;
}

/**
 * Sets application session cookie on NextResponse object.
 */
export function setSessionCookie(response: NextResponse, instagramUserId: string) {
  response.cookies.set(SESSION_COOKIE_NAME, instagramUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });
}

/**
 * Retrieves current application session from NextRequest.
 */
export function getAppSession(request: NextRequest): AppSession | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie || !cookie.value) return null;
  return { instagramUserId: cookie.value };
}

/**
 * Retrieves current logged-in Instagram account record from database using NextRequest session.
 */
export async function getCurrentAccount(request: NextRequest) {
  const session = getAppSession(request);

  if (session && session.instagramUserId) {
    const account = await prisma.instagramAccount.findUnique({
      where: { instagramUserId: session.instagramUserId },
    });
    if (account) return account;
  }

  // Fallback: return most recently updated connected account
  return prisma.instagramAccount.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
}
