import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PrescriptionService } from '@/lib/services/prescriptionService';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ prescriptionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prescriptionId } = await context.params;
    const approved = await PrescriptionService.approvePrescription(
      prescriptionId,
      session.organizationId,
      session.userId,
      session.name
    );

    return NextResponse.json(approved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
