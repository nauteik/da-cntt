import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check what cookies are available
 * This helps diagnose cookie issues in production
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    const cookieInfo = allCookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 20) + '...', // First 20 chars only
      // Note: RequestCookie from Next.js doesn't expose domain, path, secure, etc.
      // These are only available when setting cookies, not reading them
    }));

    return NextResponse.json({
      success: true,
      message: 'Cookie debug info',
      totalCookies: allCookies.length,
      cookies: cookieInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug cookies error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get cookie info',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
