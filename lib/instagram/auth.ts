/**
 * Official Instagram Login / Business Login OAuth Handler
 * Required Permissions: instagram_business_basic, instagram_business_manage_messages
 */

import { getInstagramAccountProfile, InstagramAccountProfile } from './account';
import { getInstagramApiVersion } from './client';

export function getOAuthUrl(): string {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri || appId === 'your_meta_app_id_here') {
    throw new Error('Please replace your_meta_app_id_here in your .env file with your real Meta App ID from developers.facebook.com');
  }

  const scopes = ['instagram_business_basic', 'instagram_business_manage_messages'].join(',');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state: 'ig_dash_' + Math.random().toString(36).substring(7),
  });

  // Official Instagram Business Login OAuth endpoint
  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

export interface InstagramAuthDetails {
  profile: InstagramAccountProfile;
  accessToken: string;
  expiresInSeconds?: number;
}

/**
 * Exchanges OAuth authorization code for an Instagram access token
 * and checks account eligibility.
 */
export async function exchangeCodeForAccessToken(code: string): Promise<InstagramAuthDetails> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Missing Meta / Instagram configuration in environment variables');
  }

  // 1. Exchange code for Instagram access token
  const tokenUrl = 'https://api.instagram.com/oauth/access_token';
  const bodyData = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyData.toString(),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error_message || tokenData.error) {
    const errMsg = tokenData.error_message || tokenData.error?.message || 'Failed to exchange authorization code';
    console.error('[Instagram OAuth Error]', errMsg);
    throw new Error(errMsg);
  }

  const accessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in;

  // 2. Fetch profile and verify professional account eligibility
  const profile = await getInstagramAccountProfile(accessToken);

  return {
    profile,
    accessToken,
    expiresInSeconds: expiresIn,
  };
}
