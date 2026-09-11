// SOIL IQ - Sprayer Detail & Diagnostics API Route
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ sprayerId: string }> }
) {
  try {
    const { sprayerId } = await context.params;

    const sprayer = await prisma.sprayer.findUnique({
      where: { id: sprayerId },
      include: {
        fertilizer: true,
        controlDecisions: {
          take: 20,
          orderBy: { timestamp: 'desc' },
          include: { grid: true },
        },
        telemetryEvents: {
          take: 30,
          orderBy: { timestamp: 'desc' },
        },
        applicationEvents: {
          take: 20,
          orderBy: { timestamp: 'desc' },
          include: { fertilizer: true },
        },
        transitionEvents: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!sprayer) {
      return NextResponse.json({ error: 'Sprayer not found' }, { status: 404 });
    }

    return NextResponse.json({ sprayer });
  } catch (error: any) {
    console.error('Sprayer detail error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
