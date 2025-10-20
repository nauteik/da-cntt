import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      throw new Error('Backend URL not configured');
    }

    // Get the access token from the HttpOnly cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Forward the request to backend with the token as cookie
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

    // Return user info to the client (remove token if present)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, ...userInfo } = data.data;
    return NextResponse.json({ success: true, data: userInfo });

  } catch (error) {
    console.error('User me proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
