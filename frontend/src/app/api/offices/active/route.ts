import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * BFF (Backend for Frontend) proxy for /api/office/active
 * This allows Server Components to make authenticated requests
 * by forwarding cookies from the browser to the backend API
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No authentication token found',
          status: 401,
        },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backend URL not configured',
          status: 500,
        },
        { status: 500 }
      );
    }

    // Forward request to backend with authentication cookie
    const response = await fetch(`${backendUrl}/api/office/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward the cookie to backend
        Cookie: `accessToken=${accessToken.value}`,
      },
      cache: 'no-store', // Don't cache authenticated requests
    });

    const data = await response.json();

    // Return the response from backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in offices proxy:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch offices',
        status: 500,
      },
      { status: 500 }
    );
  }
}

