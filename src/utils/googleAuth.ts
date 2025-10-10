import { OAuth2Client } from 'google-auth-library';
import appAssert from './appAssert';
import { UNAUTHORIZED } from '../constants/http';
import { GOOGLE_CLIENT_ID } from '../constants/env';

const client = new OAuth2Client();

export interface GoogleTokenPayload {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  aud: string; // Audience (client ID)
  iss: string; // Issuer
  iat: number; // Issued at
  exp: number; // Expires at
}

export const verifyGoogleToken = async (idToken: string): Promise<GoogleTokenPayload> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    appAssert(payload, UNAUTHORIZED, 'Invalid Google token');

    // Additional security checks
    appAssert(payload.email_verified, UNAUTHORIZED, 'Google email not verified');
    appAssert(payload.email, UNAUTHORIZED, 'No email in Google token');
    appAssert(payload.sub, UNAUTHORIZED, 'No Google user ID in token');

    return {
      sub: payload.sub,
      email: payload.email!,
      email_verified: payload.email_verified!,
      name: payload.name || '',
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      picture: payload.picture || '',
      aud: payload.aud!,
      iss: payload.iss!,
      iat: payload.iat!,
      exp: payload.exp!,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    appAssert(false, UNAUTHORIZED, 'Invalid Google authentication token');
  }
};
