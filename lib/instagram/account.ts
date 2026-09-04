import { instagramApiFetch } from './client';

export interface InstagramAccountProfile {
  id: string;
  username: string;
  account_type?: 'BUSINESS' | 'CREATOR' | 'PERSONAL' | string;
}

/**
 * Fetches connected Instagram Account details from graph.instagram.com/me
 * and verifies account eligibility for the official Messaging API.
 */
export async function getInstagramAccountProfile(accessToken: string): Promise<InstagramAccountProfile> {
  const profile = await instagramApiFetch<InstagramAccountProfile>('/me', {
    accessToken,
    params: {
      fields: 'id,username,account_type',
    },
  });

  // Verify Professional (Business or Creator) eligibility if account_type is present
  if (profile.account_type && profile.account_type === 'PERSONAL') {
    throw new Error(
      'Instagram account not eligible. Please connect an Instagram Professional (Business or Creator) account in your Instagram mobile app settings.'
    );
  }

  return {
    id: profile.id,
    username: profile.username || 'instagram_user',
    account_type: profile.account_type || 'BUSINESS',
  };
}
