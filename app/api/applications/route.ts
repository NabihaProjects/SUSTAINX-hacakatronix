import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ApplicationService } from '@/lib/services/applicationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = await ApplicationService.recordApplication({
      organizationId: session.organizationId,
      gridId: body.gridId,
      fertilizerId: body.fertilizerId,
      quantity: Number(body.quantity),
      unit: body.unit || 'kg',
      applicationMethod: body.applicationMethod || 'SPRAY',
      notes: body.notes,
      appliedByUserId: session.userId,
      actorName: session.name,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
