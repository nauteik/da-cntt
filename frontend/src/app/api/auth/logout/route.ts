import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF (Backend for Frontend) logout endpoint
 * This properly clears the HttpOnly cookie and optionally notifies the backend
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Get the access token before deleting (for backend logout)
    const accessToken = cookieStore.get('accessToken');

    // Optionally call backend logout to invalidate token server-side
    // This is best practice but not strictly required since we're deleting the cookie
    if (accessToken) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      if (backendUrl) {
        try {
          // Direct fetch to backend without using apiClient
          await fetch(`${backendUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Forward the cookie to backend for server-side cleanup
              Cookie: `accessToken=${accessToken.value}`,
            },
          });
          console.log('Backend logout successful');
        } catch (error) {
          console.error('Backend logout failed:', error);
          // Continue anyway since we already cleared the cookie on our side
        }
      }
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    // Clear cookie with same domain settings as login
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? '.nauteik.dev' : undefined;
    
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'none',
      maxAge: 0, // Delete cookie
      domain: cookieDomain,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Logout failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

