import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveAdminSession } from '@/lib/admin-session';

async function ensureDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('Missing DATABASE_URL environment variable');
    }

    // Attempt a short connect to surface connection errors early
    try {
        await prisma.$connect();
    } catch (err) {
        // Wrap error with a helpful message
        throw new Error(`Database connection failed: ${err instanceof Error ? err.message : String(err)}`);
    }
}

export async function GET() {
    try {
        await ensureDb();

        const projects = await prisma.project.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getActiveAdminSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureDb();

        const json = await request.json();

        // Validate required fields
        const requiredFields = ['title', 'description', 'imageUrl'];
        for (const field of requiredFields) {
            if (!json[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Ensure tags is a string (JSON array)
        if (json.tags && !Array.isArray(JSON.parse(json.tags))) {
            return NextResponse.json(
                { error: 'Tags must be a JSON string array' },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                title: json.title,
                description: json.description,
                imageUrl: json.imageUrl,
                liveUrl: json.liveUrl || null,
                githubUrl: json.githubUrl || null,
                tags: json.tags || '[]',
                featured: json.featured || false
            },
        });

        revalidatePath('/');
        revalidatePath('/admin');

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to create project:', error);
        // Return more detailed error information
        return NextResponse.json(
            {
                error: 'Failed to create project',
                details: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}