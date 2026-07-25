import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch latest user details from DB
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      family: {
        select: { headName: true, familyId: true },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const userName = user.family?.headName || user.email?.split('@')[0] || user.mobileNumber;

  const formattedSession = {
    userId: user.id,
    role: user.role,
    mobileNumber: user.mobileNumber,
    userName,
    familyId: user.family?.familyId || null,
  };

  return (
    <DashboardShell session={formattedSession}>
      {children}
    </DashboardShell>
  );
}
