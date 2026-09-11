import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { SprayerService } from '@/lib/services/sprayerService';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = await SprayerService.ingestTelemetry({
      sprayerId: body.sprayerId,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      speedKmh: Number(body.speedKmh || 12.0),
      flowRateLpm: Number(body.flowRateLpm || 45.0),
      tankLevelLiters: Number(body.tankLevelLiters || 3500.0),
      applicationRateLpha: Number(body.applicationRateLpha || 42.0),
      machineStatus: body.machineStatus || 'AUTOMATIC',
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
