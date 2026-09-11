// SOIL IQ - Sprayer Simulation State API Route
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { simulationDriver } from '@/lib/services/sprayerSimulationDriver';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stepParam = searchParams.get('step');

    let state = simulationDriver.getState();
    if (!state) {
      // Auto-initialize using the first organization
      const org = await prisma.organization.findFirst();
      if (!org) {
        return NextResponse.json({ error: 'No organization found' }, { status: 404 });
      }
      state = await simulationDriver.initialize(org.id);
    }

    // Advance by one step if requested or if status is RUNNING
    if (stepParam === 'true' || state.status === 'RUNNING') {
      state = await simulationDriver.step();
    }

    return NextResponse.json({ state });
  } catch (error: any) {
    console.error('Simulation state error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
