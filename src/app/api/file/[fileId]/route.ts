import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get token from Authorization header (case-insensitive)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let token = authHeader?.replace(/^Bearer\s+/i, '') || '';
    
    // Also try to get from cookies
    if (!token) {
      const cookieToken = request.cookies.get('token')?.value;
      if (cookieToken) {
        token = cookieToken;
      }
    }

    if (!token) {
      console.error('[File API] No token found. Headers:', Object.fromEntries(request.headers.entries()));
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Get API URL from environment variable
    // Try multiple possible ports
    const possiblePorts = ['5000', '5223', '7061'];
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      // Try to detect from common ports
      apiUrl = 'http://localhost:5000/api';
    }

    // Normalize API URL - remove trailing slash
    apiUrl = apiUrl.replace(/\/$/, '');
    
    // For localhost HTTPS, convert to HTTP to avoid SSL certificate issues
    // Node.js fetch doesn't trust self-signed certificates by default
    if (apiUrl.includes('https://localhost')) {
      apiUrl = apiUrl.replace('https://localhost', 'http://localhost');
      console.log(`[File API] Converted HTTPS localhost to HTTP: ${apiUrl}`);
    }
    
    // Build file URL
    const fileUrl = `${apiUrl}/File/${fileId}`;

    console.log(`[File API] Fetching file from: ${fileUrl}`);
    console.log(`[File API] Token present: ${token ? 'Yes' : 'No'}, length: ${token.length}`);

    // Fetch file from backend API with token
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    // Build list of URLs to try (HTTP and HTTPS for each port)
    const urlsToTry: string[] = [];
    
    // Add primary URL
    urlsToTry.push(fileUrl);
    
    // If primary is HTTPS, also try HTTP version
    if (fileUrl.startsWith('https://')) {
      urlsToTry.push(fileUrl.replace('https://', 'http://'));
    }
    
    // Extract base info for alternative ports
    const urlMatch = apiUrl.match(/^(https?:\/\/localhost)(?::\d+)?(\/api)$/);
    if (urlMatch) {
      const [, , path] = urlMatch;
      const currentPort = apiUrl.match(/:(\d+)/)?.[1];
      
      // Add alternative ports (both HTTP and HTTPS)
      for (const port of possiblePorts) {
        if (port === currentPort) continue;
        urlsToTry.push(`http://localhost:${port}${path}/File/${fileId}`);
        urlsToTry.push(`https://localhost:${port}${path}/File/${fileId}`);
      }
    }
    
    // Try each URL until one works
    for (const url of urlsToTry) {
      try {
        console.log(`[File API] Trying URL: ${url}`);
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
          },
          cache: 'no-store',
        });
        
        if (response.ok) {
          console.log(`[File API] Successfully fetched file from: ${url}`);
          break;
        } else {
          const errorText = await response.text().catch(() => '');
          console.error(`[File API] Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
          console.error(`[File API] Error response: ${errorText.substring(0, 200)}`);
          response = null; // Reset to try next URL
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Only log if it's not a connection error (which is expected when trying multiple URLs)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('ECONNREFUSED') && !errorMessage.includes('certificate')) {
          console.error(`[File API] Error fetching from ${url}:`, errorMessage);
        }
        response = null;
        continue;
      }
    }

    if (!response) {
      console.error('[File API] No response from any backend URL');
      return NextResponse.json(
        { error: 'Failed to connect to backend API', details: lastError?.message },
        { status: 500 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[File API] Backend returned error: ${response.status} ${response.statusText}`);
      console.error(`[File API] Error details: ${errorText}`);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Token invalid or expired', details: errorText },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'File not found', details: errorText },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch file', status: response.status, details: errorText },
        { status: response.status }
      );
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Get file data as blob
    const blob = await response.blob();

    console.log(`[File API] Successfully returning file, size: ${blob.size} bytes, type: ${contentType}`);

    // Return file with proper headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[File API] Unexpected error:', error);
    if (errorStack) {
      console.error('[File API] Error stack:', errorStack);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

