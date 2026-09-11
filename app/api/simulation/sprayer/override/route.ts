// SOIL IQ - Sprayer Simulation Manual Override & Emergency Stop API Route
import { NextResponse } from 'next/server';
import { simulationDriver } from '@/lib/services/sprayerSimulationDriver';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emergencyStop, manualOverride, forcedRate } = body;

    if (emergencyStop !== undefined) {
      simulationDriver.setEmergencyStop(Boolean(emergencyStop));
    }

    if (manualOverride !== undefined) {
      simulationDriver.setManualOverride(Boolean(manualOverride), forcedRate);
    }

    return NextResponse.json({ success: true, state: simulationDriver.getState() });
  } catch (error: any) {
    console.error('Override error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
