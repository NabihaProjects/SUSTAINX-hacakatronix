import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { GridService } from '@/lib/services/gridService';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ gridId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gridId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const updated = await GridService.toggleGridBlock(
      gridId,
      session.organizationId,
      body.blockReason,
      session.name,
      session.userId
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
