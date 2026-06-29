import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getActiveAdminSession } from '@/lib/admin-session';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getActiveAdminSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const json = await request.json();

    const data: {
        name?: string | null;
        email?: string;
        password?: string;
        isActive?: boolean;
    } = {
        name: json.name ?? undefined,
        email: json.email ?? undefined,
        isActive: typeof json.isActive === 'boolean' ? json.isActive : undefined,
    };

    if (json.password) {
        data.password = await hash(json.password, 10);
    }

    const user = await prisma.user.update({
        where: {
            id,
        },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json(user);
}