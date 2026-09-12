// SOIL IQ - Saved What-If Scenarios API Route
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getSession();
    let orgId = session?.organizationId;

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) return NextResponse.json({ error: 'No org found' }, { status: 404 });
      orgId = firstOrg.id;
    }

    const scenarios = await prisma.scenarioSimulation.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = scenarios.map((s) => ({
      ...s,
      inputs: JSON.parse(s.inputsJson),
      results: JSON.parse(s.resultsJson),
      baseline: JSON.parse(s.baselineJson),
      comparison: JSON.parse(s.comparisonJson),
    }));

    return NextResponse.json({ scenarios: parsed });
  } catch (error: any) {
    console.error('Scenarios query error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let orgId = session?.organizationId;

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) return NextResponse.json({ error: 'No org found' }, { status: 404 });
      orgId = firstOrg.id;
    }

    const body = await request.json();
    const { name, description, scenarioType, inputs, results, baseline, comparison } = body;

    const saved = await prisma.scenarioSimulation.create({
      data: {
        organizationId: orgId,
        name: name || 'Untitled Scenario',
        description,
        scenarioType: scenarioType || 'LESS_FERTILIZER',
        inputsJson: JSON.stringify(inputs || {}),
        resultsJson: JSON.stringify(results || {}),
        baselineJson: JSON.stringify(baseline || {}),
        comparisonJson: JSON.stringify(comparison || {}),
        createdByUserId: session?.userId || null,
      },
    });

    return NextResponse.json({ success: true, scenario: saved });
  } catch (error: any) {
    console.error('Save scenario error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
