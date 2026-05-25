/**
 * DigiLocker Integration for Document Verification
 *
 * DigiLocker is Government of India's digital document wallet.
 * Doctors can share verified documents (Aadhaar, degree certificates) directly.
 *
 * Integration Flow:
 * 1. User clicks "Fetch from DigiLocker"
 * 2. Redirects to DigiLocker OAuth consent screen
 * 3. User authorizes access to specific documents
 * 4. DigiLocker redirects back with auth code
 * 5. Exchange code for access token
 * 6. Fetch document URIs and metadata
 *
 * Setup Required:
 * 1. Register as a requester at https://partners.digitallocker.gov.in/
 * 2. Get Client ID and Client Secret
 * 3. Configure redirect URI in DigiLocker dashboard
 * 4. Set environment variables
 *
 * Documents available via DigiLocker:
 * - Aadhaar (UIDAI)
 * - PAN Card (CBDT)
 * - Driving License (various RTOs)
 * - Educational Certificates (various universities)
 * - Medical Council Registration (some state councils)
 */

// DigiLocker API Configuration
const DIGILOCKER_CONFIG = {
  authorizationUrl: 'https://api.digitallocker.gov.in/public/oauth2/1/authorize',
  tokenUrl: 'https://api.digitallocker.gov.in/public/oauth2/1/token',
  documentsUrl: 'https://api.digitallocker.gov.in/public/oauth2/1/files/issued',
  eAadhaarUrl: 'https://api.digitallocker.gov.in/public/oauth2/2/xml/eaadhaar',

  // These should be in environment variables
  clientId: process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID || '',
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI || '',
};

// Document type codes for DigiLocker
export const DIGILOCKER_DOC_TYPES = {
  AADHAAR: 'ADHAR',
  PAN: 'PANCR',
  DRIVING_LICENSE: 'DRVLC',
  CLASS_10_MARKSHEET: 'HSCER',
  CLASS_12_MARKSHEET: 'SSCER',
  DEGREE_CERTIFICATE: 'DGCER',
};

export interface DigiLockerDocument {
  uri: string;
  doctype: string;
  name: string;
  description: string;
  issuerid: string;
  issuer: string;
  issuedOn?: string;
}

export interface DigiLockerProfile {
  digilockerid: string;
  name: string;
  dob: string;
  gender: string;
  eaadhaar?: string;
}

/**
 * Generate DigiLocker OAuth authorization URL
 * User will be redirected here to authorize document access
 */
export function getDigiLockerAuthUrl(state: string): string {
  if (!DIGILOCKER_CONFIG.clientId) {
    throw new Error('DigiLocker Client ID not configured');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: DIGILOCKER_CONFIG.clientId,
    redirect_uri: DIGILOCKER_CONFIG.redirectUri,
    state: state,
    // Scope determines what data we can access
    // 'openid' for basic profile, 'files' for documents
    scope: 'openid files',
  });

  return `${DIGILOCKER_CONFIG.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * Call this from your API route after DigiLocker callback
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const response = await fetch(DIGILOCKER_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: DIGILOCKER_CONFIG.clientId,
      client_secret: DIGILOCKER_CONFIG.clientSecret,
      redirect_uri: DIGILOCKER_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Fetch list of documents from user's DigiLocker
 */
export async function fetchIssuedDocuments(
  accessToken: string
): Promise<DigiLockerDocument[]> {
  const response = await fetch(DIGILOCKER_CONFIG.documentsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Fetch specific document by URI
 */
export async function fetchDocument(
  accessToken: string,
  documentUri: string
): Promise<Blob> {
  const response = await fetch(
    `https://api.digitallocker.gov.in${documentUri}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }

  return response.blob();
}

/**
 * Verify if DigiLocker is configured
 */
export function isDigiLockerConfigured(): boolean {
  return !!(
    DIGILOCKER_CONFIG.clientId &&
    DIGILOCKER_CONFIG.clientSecret &&
    DIGILOCKER_CONFIG.redirectUri
  );
}

/**
 * Document verification status from DigiLocker
 * Documents from DigiLocker are cryptographically signed by issuers
 */
export interface VerificationResult {
  isVerified: boolean;
  issuer: string;
  issuedOn: string;
  documentType: string;
  holderName: string;
}

/**
 * Parse and verify a DigiLocker document's digital signature
 * DigiLocker documents come with XML digital signatures
 */
export function parseDigiLockerDocument(xmlData: string): VerificationResult | null {
  // In production, this would parse the XML and verify the digital signature
  // DigiLocker documents are signed using PKI infrastructure
  // The signature can be verified using the issuer's public key

  // Placeholder for actual implementation
  console.log('Parsing DigiLocker document...');

  return null;
}
