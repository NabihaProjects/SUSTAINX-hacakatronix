// SOIL IQ - Anomalies & Root Cause Analysis API Route
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getSession();
    let orgId = session?.organizationId;

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) return NextResponse.json({ error: 'No org found' }, { status: 404 });
      orgId = firstOrg.id;
    }

    const anomalies = await prisma.anomalyEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const parsed = anomalies.map((a) => ({
      ...a,
      hypotheses: a.rootCauseHypothesesJson ? JSON.parse(a.rootCauseHypothesesJson) : [],
    }));

    return NextResponse.json({ anomalies: parsed });
  } catch (error: any) {
    console.error('Anomalies query error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
