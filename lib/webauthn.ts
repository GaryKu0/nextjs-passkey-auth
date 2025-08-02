import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';

// Configuration
export const rpName = process.env.NEXT_PUBLIC_RP_NAME || 'Passkey Demo';
export const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
export const origin = process.env.NEXT_PUBLIC_RP_ORIGIN || 
  (rpID === 'localhost' ? 'http://localhost:3000' : `https://${rpID}`);

export const generateRegistrationOptionsConfig = (
  username: string,
  userId: string,
  excludeCredentials: any[] = []
): GenerateRegistrationOptionsOpts => ({
  rpName,
  rpID,
  userID: new TextEncoder().encode(userId),
  userName: username,
  userDisplayName: username,
  attestationType: (process.env.NEXT_PUBLIC_ATTESTATION_TYPE as 'none' | 'direct' | 'enterprise') || 'none',
  excludeCredentials: excludeCredentials.map(cred => ({
    id: cred.credential_id, // This should be the base64url string from the database
    type: 'public-key' as const,
    transports: cred.transports,
  })),
  authenticatorSelection: {
    residentKey: (process.env.NEXT_PUBLIC_RESIDENT_KEY as 'discouraged' | 'preferred' | 'required') || 'preferred',
    userVerification: (process.env.NEXT_PUBLIC_USER_VERIFICATION as 'discouraged' | 'preferred' | 'required') || 'preferred',
    authenticatorAttachment: (process.env.NEXT_PUBLIC_AUTHENTICATOR_ATTACHMENT as 'platform' | 'cross-platform') || 'platform',
  },
});

export const generateAuthenticationOptionsConfig = (
  allowCredentials: any[] = []
): GenerateAuthenticationOptionsOpts => ({
  rpID,
  allowCredentials: allowCredentials.length > 0 ? allowCredentials.map(cred => ({
    id: cred.id, // This should already be the base64url string from the database
    type: 'public-key' as const,
    transports: cred.transports,
  })) : undefined,
  userVerification: (process.env.NEXT_PUBLIC_USER_VERIFICATION as 'discouraged' | 'preferred' | 'required') || 'preferred',
});

export const createVerifyRegistrationConfig = (
  expectedChallenge: string,
  expectedOrigin: string,
  expectedRPID: string
) => (opts: Omit<VerifyRegistrationResponseOpts, 'expectedChallenge' | 'expectedOrigin' | 'expectedRPID'>): VerifyRegistrationResponseOpts => ({
  ...opts,
  expectedChallenge,
  expectedOrigin,
  expectedRPID,
});

export const createVerifyAuthenticationConfig = (
  expectedChallenge: string,
  expectedOrigin: string,
  expectedRPID: string
) => (opts: Omit<VerifyAuthenticationResponseOpts, 'expectedChallenge' | 'expectedOrigin' | 'expectedRPID'>): VerifyAuthenticationResponseOpts => ({
  ...opts,
  expectedChallenge,
  expectedOrigin,
  expectedRPID,
});