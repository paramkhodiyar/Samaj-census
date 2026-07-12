import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    
    // 1. Delete expired verification codes
    const deletedCodes = await prisma.verificationCode.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    // 2. Delete expired OTP rate limits (older than 15 mins)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const deletedIpLimits = await prisma.ipRateLimit.deleteMany({
      where: { lastAttempt: { lt: fifteenMinsAgo } }
    });
    const deletedOtpLimits = await prisma.otpRateLimit.deleteMany({
      where: { lastAttempt: { lt: fifteenMinsAgo } }
    });

    // 3. Delete rejected join requests older than 30 days (DPDP Act data minimization)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deletedJoinRequests = await prisma.joinRequest.deleteMany({
      where: {
        status: 'REJECTED',
        updatedAt: { lt: thirtyDaysAgo }
      }
    });

    // Log the cleanup event
    await prisma.auditLog.create({
      data: {
        action: 'CRON_CLEANUP',
        description: `Automated cleanup completed: Purged ${deletedCodes.count} expired OTPs, ${deletedIpLimits.count + deletedOtpLimits.count} rate limits, and ${deletedJoinRequests.count} stale rejected join requests.`,
      }
    });

    return NextResponse.json({
      success: true,
      purgedOtps: deletedCodes.count,
      purgedRateLimits: deletedIpLimits.count + deletedOtpLimits.count,
      purgedRejectedJoins: deletedJoinRequests.count
    });
  } catch (error: any) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
