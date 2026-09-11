// SOIL IQ - One-Click Hackathon Demo Runner API Route
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { simulationDriver } from '@/lib/services/sprayerSimulationDriver';

export async function POST() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Initialize or reset driver
    await simulationDriver.initialize(org.id);
    simulationDriver.reset();
    simulationDriver.setClockMultiplier(2);
    simulationDriver.setRunning(true);

    const state = simulationDriver.getState();

    return NextResponse.json({
      success: true,
      message: 'SOIL IQ Demonstration Mode started successfully!',
      demoStoryline: [
        '1. Serpentine traversal across field grids in Green Valley Farm.',
        '2. Variable-Rate Application: Automatic adjustment to distinct grid prescriptions (40 -> 25 -> 55 kg/ha).',
        '3. Budget Protection: Flow throttling to REDUCE (60% duty cycle) when approaching nitrogen limits.',
        '4. Boundary/Riparian Lockout: Automatic STOP upon entering blocked buffer zone.',
      ],
      state,
    });
  } catch (error: any) {
    console.error('Demo runner error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
