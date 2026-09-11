import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PrescriptionService } from '@/lib/services/prescriptionService';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const prescription = await PrescriptionService.generatePrescription({
      organizationId: session.organizationId,
      gridId: body.gridId,
      growthStageName: body.growthStageName,
      targetYieldTonsHa: body.targetYieldTonsHa ? Number(body.targetYieldTonsHa) : undefined,
      environmentalConditions: body.environmentalConditions,
      isSimulation: !!body.isSimulation,
      actorName: session.name,
      userId: session.userId,
    });

    return NextResponse.json(prescription);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
