import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken } from '../lib/encryption';

describe('Token Security & AES-256-GCM Encryption', () => {
  it('should encrypt and decrypt access token correctly', () => {
    const originalToken = 'EAAGm0PXZA8wBO1234567890ABCDEF_IG_ACCESS_TOKEN_SAMPLE';
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted.split(':')).toHaveLength(3); // IV:TAG:CIPHERTEXT

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('should handle empty token gracefully', () => {
    expect(encryptToken('')).toBe('');
    expect(decryptToken('')).toBe('');
  });

  it('should throw error on malformed encrypted string', () => {
    expect(() => decryptToken('invalid_token_string')).toThrow('Invalid encrypted token format');
  });
});
