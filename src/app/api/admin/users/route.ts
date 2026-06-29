import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getActiveAdminSession } from '@/lib/admin-session';

export async function GET() {
    const session = await getActiveAdminSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
    const session = await getActiveAdminSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();

    if (!json.email || !json.password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: json.email,
        },
    });

    if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const password = await hash(json.password, 10);

    const user = await prisma.user.create({
        data: {
            name: json.name || null,
            email: json.email,
            password,
            isActive: json.isActive ?? true,
        },
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