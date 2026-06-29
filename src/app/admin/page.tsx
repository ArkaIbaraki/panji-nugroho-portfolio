import { prisma } from '@/lib/prisma';
import AdminProjects from '@/components/AdminProjects';

export const dynamic = 'force-dynamic';

async function getProjects() {
    const projects = await prisma.project.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
    return projects;
}

export default async function AdminPage() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:px-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
                        Project Management
                    </h1>
                    <AdminProjects projects={projects} />
                </div>
            </div>
        </div>
    );
} 