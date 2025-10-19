import { cookies, headers } from 'next/headers';
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

    // Debug logging
    console.log('[BFF] /api/offices/active - Access Token found:', !!accessToken);
    if (accessToken) {
      console.log('[BFF] /api/offices/active - Token value (first 20 chars):', accessToken.value.substring(0, 20) + '...');
    } else {
      console.log('[BFF] /api/offices/active - No access token in cookies');
      // Log all available cookies for debugging
      const allCookies = cookieStore.getAll();
      console.log('[BFF] /api/offices/active - All cookies:', allCookies.map(c => c.name));
      
      // Try to get token from Authorization header as fallback
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      console.log('[BFF] /api/offices/active - Authorization header:', authHeader ? 'Found' : 'Not found');
      
      if (!accessToken && !authHeader) {
        return NextResponse.json(
          {
            success: false,
            message: 'No authentication token found',
            status: 401,
          },
          { status: 401 }
        );
      }
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      console.log('[BFF] /api/offices/active - Backend URL not configured');
      return NextResponse.json(
        {
          success: false,
          message: 'Backend URL not configured',
          status: 500,
        },
        { status: 500 }
      );
    }

    console.log('[BFF] /api/offices/active - Calling backend:', `${backendUrl}/api/office/active`);

    // Prepare headers for backend request
    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use cookie if available, otherwise try Authorization header
    if (accessToken) {
      backendHeaders['Cookie'] = `accessToken=${accessToken.value}`;
      console.log('[BFF] /api/offices/active - Using cookie authentication');
    } else {
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      if (authHeader) {
        backendHeaders['Authorization'] = authHeader;
        console.log('[BFF] /api/offices/active - Using Authorization header authentication');
      }
    }

    // Forward request to backend with authentication
    const response = await fetch(`${backendUrl}/api/office/active`, {
      method: 'GET',
      headers: backendHeaders,
      cache: 'no-store', // Don't cache authenticated requests
    });

    console.log('[BFF] /api/offices/active - Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('[BFF] /api/offices/active - Backend error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[BFF] /api/offices/active - Backend success, data length:', data.data?.length || 0);

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

