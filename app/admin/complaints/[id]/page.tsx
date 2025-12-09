import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import AdminComplaintDetailClient from './client';
import { getSession } from '@/lib/session';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default async function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  if (!session || (typeof session === 'object' && session !== null && session.role !== 'ADMIN')) {
    notFound();
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      company: { select: { name: true } },
      images: true
    }
  });

  if (!complaint) {
    notFound();
  }

  return <AdminComplaintDetailClient complaint={complaint} />;
}