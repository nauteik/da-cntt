import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * BFF (Backend for Frontend) endpoint to get current user info
 * This forwards the HttpOnly cookie to the backend
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
          status: 401,
          errorType: 'AUTHENTICATION_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      throw new Error('Backend URL not configured');
    }

    // Forward the request to backend with the cookie
    // Backend expects cookie named 'accessToken'
    const backendResponse = await fetch(`${backendUrl}/api/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken.value}`,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok || !data.success) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('User info proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal server error occurred.',
        status: 500,
        errorType: 'SYSTEM_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

