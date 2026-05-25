import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchIssuedDocuments } from '@/lib/digilocker';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle errors from DigiLocker
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Authorization failed';
    return NextResponse.redirect(
      new URL(`/dashboard/register?digilocker_error=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/register?digilocker_error=No authorization code received', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Fetch user's documents
    const documents = await fetchIssuedDocuments(tokenData.access_token);

    // Store token and documents in session/cookie for the registration page
    // In production, use secure HTTP-only cookies or server-side session
    const response = NextResponse.redirect(
      new URL('/dashboard/register?digilocker_success=true', request.url)
    );

    // Set secure cookie with token (short-lived)
    response.cookies.set('digilocker_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      path: '/',
    });

    // Store document list in a separate cookie (non-sensitive metadata)
    response.cookies.set('digilocker_docs', JSON.stringify(documents.map(d => ({
      uri: d.uri,
      name: d.name,
      type: d.doctype,
      issuer: d.issuer,
    }))), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('DigiLocker callback error:', err);
    return NextResponse.redirect(
      new URL('/dashboard/register?digilocker_error=Failed to fetch documents', request.url)
    );
  }
}
