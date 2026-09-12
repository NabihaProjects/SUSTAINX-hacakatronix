import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Resolve org — use session if logged in, else first org for demo mode
    let organizationId: string;
    const session = await getSession();
    if (session) {
      organizationId = session.organizationId;
    } else {
      const org = await prisma.organization.findFirst();
      if (!org) return NextResponse.json({ error: 'No organization found' }, { status: 404 });
      organizationId = org.id;
    }

    const farm = await prisma.farm.findFirst({
      where: { id, organizationId },
      include: {
        fields: {
          include: {
            crop: true,
            grids: {
              include: {
                nutrientBudget: true,
                prescriptions: {
                  where: { status: 'ACTIVE' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({ farm });
  } catch (err: any) {
    console.error('GET /api/farms/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
