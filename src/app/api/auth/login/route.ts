import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock successful login for testing
    const token = `test-token-${Date.now()}`;
    const refreshToken = `test-refresh-${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        accessToken: token,
        refreshToken: refreshToken,
        fullName: 'Admin User',
        role: 'admin',
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
