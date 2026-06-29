'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

type Project = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    liveUrl: string | null;
    githubUrl: string | null;
    tags: string;
};

export default function AdminProjects({ projects: initialProjects }: { projects: Project[] }) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isCreating, setIsCreating] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        imageUrl: '',
        liveUrl: '',
        githubUrl: '',
        tags: '',
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const emptyProjectForm = {
        title: '',
        description: '',
        imageUrl: '',
        liveUrl: '',
        githubUrl: '',
        tags: '',
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingProjectId(null);
        setNewProject(emptyProjectForm);
    };

    const startCreate = () => {
        setEditingProjectId(null);
        setNewProject(emptyProjectForm);
        setIsCreating(true);
    };

    const startEdit = (project: Project) => {
        setEditingProjectId(project.id);
        setNewProject({
            title: project.title,
            description: project.description,
            imageUrl: project.imageUrl,
            liveUrl: project.liveUrl ?? '',
            githubUrl: project.githubUrl ?? '',
            tags: JSON.parse(project.tags).join(', '),
        });
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setNewProject({ ...newProject, imageUrl: data.url });
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newProject,
                tags: JSON.stringify(
                    newProject.tags
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean),
                ),
            };

            const response = await fetch(editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects', {
                method: editingProjectId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(editingProjectId ? 'Failed to update project' : 'Failed to create project');

            const project = await response.json();
            setProjects(editingProjectId
                ? projects.map(existingProject => existingProject.id === editingProjectId ? project : existingProject)
                : [project, ...projects]
            );
            resetForm();
            router.refresh();
        } catch (error) {
            console.error(editingProjectId ? 'Failed to update project:' : 'Failed to create project:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete project');

            setProjects(projects.filter(project => project.id !== id));
            router.refresh();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
    };

    return (
        <div className="w-full px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <button
                    onClick={startCreate}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add New Project
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="mb-8 space-y-4 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {editingProjectId ? 'Edit Project' : 'Create Project'}
                        </h3>
                        {editingProjectId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            required
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Image
                        </label>
                        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                            />
                            {uploading && <span className="text-sm text-blue-600 dark:text-blue-400">Uploading...</span>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Instagram URL
                        </label>
                        <input
                            type="url"
                            value={newProject.liveUrl}
                            onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            GitHub URL
                        </label>
                        <input
                            type="url"
                            value={newProject.githubUrl}
                            onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            required
                            value={newProject.tags}
                            onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                        >
                            {editingProjectId ? 'Update Project' : 'Create Project'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="w-full">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {project.title}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    {project.description}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {JSON.parse(project.tags).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-2">
                                    {project.liveUrl && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                                            </svg>
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 break-all">
                                                {project.liveUrl}
                                            </a>
                                        </div>
                                    )}
                                    {project.githubUrl && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 break-all">
                                                {project.githubUrl}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => startEdit(project)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 