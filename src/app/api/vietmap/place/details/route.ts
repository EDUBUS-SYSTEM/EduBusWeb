import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref_id = searchParams.get('ref_id');

    if (!ref_id) {
      return NextResponse.json(
        { error: 'ref_id parameter is required' },
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
      ref_id: ref_id
    });

    const vietmapUrl = `https://maps.vietmap.vn/api/place/details?${params}`;

    console.log(`[VietMap Proxy] Fetching place details for ref_id: ${ref_id}`);

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
        console.error(`[VietMap Proxy] API returned ${response.status} for ref_id: ${ref_id}`);
        
        // Return null for client errors (4xx), but pass through server errors (5xx)
        if (response.status >= 400 && response.status < 500) {
          return NextResponse.json(null, { status: 200 });
        }
        
        return NextResponse.json(
          { error: `VietMap API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[VietMap Proxy] Successfully fetched place details');

      return NextResponse.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[VietMap Proxy] Error:', error);
      
      // Handle timeout errors
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

