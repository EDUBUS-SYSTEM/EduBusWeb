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

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let token = authHeader?.replace(/^Bearer\s+/i, '') || '';
    
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

    const possiblePorts = ['5000', '5223', '7061'];
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      apiUrl = 'http://localhost:5000/api';
    }

    apiUrl = apiUrl.replace(/\/$/, '');
    
    if (apiUrl.includes('https://localhost')) {
      apiUrl = apiUrl.replace('https://localhost', 'http://localhost');
      console.log(`[File API] Converted HTTPS localhost to HTTP: ${apiUrl}`);
    }
    
    const fileUrl = `${apiUrl}/File/${fileId}`;

    console.log(`[File API] Fetching file from: ${fileUrl}`);
    console.log(`[File API] Token present: ${token ? 'Yes' : 'No'}, length: ${token.length}`);

    let response: Response | null = null;
    let lastError: Error | null = null;
    
    const urlsToTry: string[] = [];
    
    urlsToTry.push(fileUrl);
    
    if (fileUrl.startsWith('https://')) {
      urlsToTry.push(fileUrl.replace('https://', 'http://'));
    }
    
    const urlMatch = apiUrl.match(/^(https?:\/\/localhost)(?::\d+)?(\/api)$/);
    if (urlMatch) {
      const [, , path] = urlMatch;
      const currentPort = apiUrl.match(/:(\d+)/)?.[1];
      
      for (const port of possiblePorts) {
        if (port === currentPort) continue;
        urlsToTry.push(`http://localhost:${port}${path}/File/${fileId}`);
        urlsToTry.push(`https://localhost:${port}${path}/File/${fileId}`);
      }
    }
    
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
          response = null; 
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
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

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    const blob = await response.blob();

    console.log(`[File API] Successfully returning file, size: ${blob.size} bytes, type: ${contentType}`);

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

