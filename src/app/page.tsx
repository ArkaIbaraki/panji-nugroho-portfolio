import Navigation from '@/components/Navigation';
import Projects from '@/components/Projects';
import Hero from '@/components/Hero';
import Skills from '@/components/Skills';
import About from '@/components/About';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getProjects() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return projects;
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />
      <Hero />
      <About />
      <Skills />
      <Projects projects={projects} />
    </main>
  );
}
