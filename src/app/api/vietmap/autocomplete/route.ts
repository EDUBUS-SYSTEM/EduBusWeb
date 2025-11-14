import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    const focus = searchParams.get('focus'); // Optional: "lat,lng"

    if (!text) {
      return NextResponse.json(
        { error: 'text parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY || process.env.VIETMAP_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return NextResponse.json(
        { error: 'VietMap API key not configured' },
        { status: 500 }
      );
    }

    // Build the VietMap API URL
    const params = new URLSearchParams({
      apikey: apiKey,
      text: text,
      display_type: '1'
    });

    if (focus) {
      params.append('focus', focus);
    }

    const vietmapUrl = `https://maps.vietmap.vn/api/autocomplete/v4?${params}`;

    console.log(`[VietMap Proxy] Autocomplete for: ${text}`);

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Make the request from server-side (no CORS issues)
      const response = await fetch(vietmapUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EduBusWeb/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[VietMap Proxy] Autocomplete API returned ${response.status}`);
        return NextResponse.json(
          { error: `VietMap API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[VietMap Proxy] Successfully fetched autocomplete results');

      return NextResponse.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[VietMap Proxy] Error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[VietMap Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

