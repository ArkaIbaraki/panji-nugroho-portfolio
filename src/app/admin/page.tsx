import { prisma } from '@/lib/prisma';
import AdminProjects from '@/components/AdminProjects';
import AdminUsers from '@/components/AdminUsers';
import { redirect } from 'next/navigation';
import { getActiveAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

async function getProjects() {
    const projects = await prisma.project.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
    return projects;
}

async function getUsers() {
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

    return users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }));
}

export default async function AdminPage() {
    const session = await getActiveAdminSession();

    if (!session) {
        redirect('/login');
    }

    const projects = await getProjects();
    const users = await getUsers();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:px-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
                        Project Management
                    </h1>
                    <AdminProjects projects={projects} />
                    <div className="mt-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Admin Accounts
                        </h2>
                        <AdminUsers users={users} />
                    </div>
                </div>
            </div>
        </div>
    );
} 