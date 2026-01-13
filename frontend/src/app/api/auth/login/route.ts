import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      throw new Error('Backend URL not configured');
    }

    // Direct fetch to backend without using apiClient
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok || !data.success) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // Extract token from the backend's JSON response
    // The backend now returns UserInfoResponse with token included
    const userInfoWithToken = data.data;
    const accessToken = userInfoWithToken.token;
    
    if (!accessToken) {
      throw new Error('Token not provided by backend');
    }

    // Remove token from user info before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, ...userInfo } = userInfoWithToken;

    // Set the HttpOnly cookie from the Next.js server
    const cookieStore = await cookies();
    
    // Clear any existing accessToken cookie first
    cookieStore.delete('accessToken');
    
    // Set the new cookie
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'none', // 'lax' is safer and sufficient for first-party contexts
      maxAge: 60 * 60 * 2, // 2 hours in seconds
      // Don't set domain to let browser handle it automatically
    });

    // Return user info to the client, but not the token
    return NextResponse.json({ success: true, data: userInfo });

  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
