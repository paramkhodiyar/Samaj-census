import { getAuthSession } from '@/lib/auth';
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

  // Cast session to standard props payload
  const formattedSession = {
    userId: session.userId,
    role: session.role,
    mobileNumber: session.mobileNumber,
  };

  return (
    <DashboardShell session={formattedSession}>
      {children}
    </DashboardShell>
  );
}
