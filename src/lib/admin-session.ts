import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getActiveAdminSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            isActive: true,
        },
    });

    if (!user?.isActive) {
        return null;
    }

    return session;
}