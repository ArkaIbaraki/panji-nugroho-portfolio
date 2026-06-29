import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getActiveAdminSession } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
    try {
        const session = await getActiveAdminSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Upload to Vercel Blob Storage
        const filename = Date.now() + '-' + file.name.replaceAll(' ', '_');
        const blob = await put(filename, file, {
            access: 'public',
        });

        return NextResponse.json({
            message: 'File uploaded successfully',
            url: blob.url
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({
            error: 'Error uploading file',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 