import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filePath = searchParams.get('path');
        const fileName = searchParams.get('name');

        if (!filePath) {
            return NextResponse.json({ error: 'File path is required' }, { status: 400 });
        }

        const backendUrl = process.env.BACKEND_LINK || 'http://localhost:3001';
        const fileUrl = `${backendUrl}/${filePath}`;

        // Fetch file from backend
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Get the file as array buffer
        const arrayBuffer = await response.arrayBuffer();

        // Create response with proper headers to force download
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileName || 'download'}"`,
                'Content-Length': arrayBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
