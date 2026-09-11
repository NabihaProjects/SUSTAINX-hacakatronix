// SOIL IQ - Sprayer Simulation Fault Injection API Route
import { NextResponse } from 'next/server';
import { simulationDriver } from '@/lib/services/sprayerSimulationDriver';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { faultType } = body;

    if (!faultType) {
      return NextResponse.json({ error: 'faultType is required' }, { status: 400 });
    }

    simulationDriver.injectFault(faultType);
    return NextResponse.json({ success: true, state: simulationDriver.getState() });
  } catch (error: any) {
    console.error('Fault injection error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
