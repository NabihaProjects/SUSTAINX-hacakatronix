// SOIL IQ - Sprayer Simulation Playback Controls API Route
import { NextResponse } from 'next/server';
import { simulationDriver } from '@/lib/services/sprayerSimulationDriver';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, multiplier } = body;

    let state = simulationDriver.getState();
    if (!state) {
      return NextResponse.json({ error: 'Simulation not initialized' }, { status: 400 });
    }

    switch (action) {
      case 'start':
        simulationDriver.setRunning(true);
        break;
      case 'pause':
        simulationDriver.setRunning(false);
        break;
      case 'reset':
        simulationDriver.reset();
        break;
      case 'step':
        state = await simulationDriver.step();
        break;
      case 'set-speed':
        if (typeof multiplier === 'number') {
          simulationDriver.setClockMultiplier(multiplier);
        }
        break;
      default:
        return NextResponse.json({ error: 'Unknown control action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: simulationDriver.getState() });
  } catch (error: any) {
    console.error('Simulation control error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
