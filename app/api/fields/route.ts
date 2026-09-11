import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { FieldService } from '@/lib/services/fieldService';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const field = await FieldService.createField(
      {
        organizationId: session.organizationId,
        farmId: body.farmId,
        name: body.name,
        boundaryGeoJson: body.boundaryGeoJson,
        cropId: body.cropId,
        cropVariety: body.cropVariety,
        growthStage: body.growthStage,
        irrigationMethod: body.irrigationMethod,
        soilType: body.soilType,
        gridSizeMeters: body.gridSizeMeters ? Number(body.gridSizeMeters) : 30,
        generateGridsNow: body.generateGridsNow !== false,
      },
      session.name,
      session.userId
    );

    return NextResponse.json(field);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
