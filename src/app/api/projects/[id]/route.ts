import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

async function ensureDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('Missing DATABASE_URL environment variable');
    }

    try {
        await prisma.$connect();
    } catch (err) {
        throw new Error(`Database connection failed: ${err instanceof Error ? err.message : String(err)}`);
    }
}

export async function GET(request: NextRequest) {
    const id = request.nextUrl.pathname.split('/').pop();

    try {
        await ensureDb();
        const project = await prisma.project.findUnique({
            where: {
                id,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to fetch project:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const id = request.nextUrl.pathname.split('/').pop();

    try {
        await ensureDb();
        const json = await request.json();
        const project = await prisma.project.update({
            where: {
                id,
            },
            data: json,
        });

        revalidatePath('/');
        revalidatePath('/admin');
        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to update project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.pathname.split('/').pop();

    try {
        await ensureDb();
        await prisma.project.delete({
            where: {
                id,
            },
        });

        revalidatePath('/');
        revalidatePath('/admin');
        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Failed to delete project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
