import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { FarmService } from '@/lib/services/farmService';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      // For demo/sim mode: fall back to first org's farms
      const prisma = (await import('@/lib/db/prisma')).default;
      const org = await prisma.organization.findFirst();
      if (!org) return NextResponse.json({ farms: [] });
      const farms = await FarmService.getFarms(org.id);
      return NextResponse.json({ farms });
    }
    const search = req.nextUrl.searchParams.get('search') || undefined;
    const farms = await FarmService.getFarms(session.organizationId, search);
    return NextResponse.json({ farms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const farm = await FarmService.createFarm(
      {
        organizationId: session.organizationId,
        name: body.name,
        description: body.description,
        declaredArea: Number(body.declaredArea),
        areaUnit: body.areaUnit || 'acre',
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        locationLabel: body.locationLabel,
      },
      session.name,
      session.userId
    );

    return NextResponse.json(farm);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
