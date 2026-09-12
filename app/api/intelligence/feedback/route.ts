// SOIL IQ - Recommendation Feedback API Route
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let orgId = session?.organizationId;

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) return NextResponse.json({ error: 'No org found' }, { status: 404 });
      orgId = firstOrg.id;
    }

    const body = await request.json();
    const { recommendationId, feedbackType, notes } = body;

    const feedback = await prisma.recommendationFeedback.create({
      data: {
        organizationId: orgId,
        recommendationId: recommendationId || null,
        userId: session?.userId || null,
        feedbackType: feedbackType || 'HELPFUL',
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
