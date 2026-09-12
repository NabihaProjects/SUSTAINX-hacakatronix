// SOIL IQ - Intelligence Summary & Insights API Route
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { FarmSummaryService } from '@/lib/domain/farmSummaryService';
import { EarlyWarningService } from '@/lib/domain/earlyWarningService';
import { IntelligenceSeedService } from '@/lib/services/intelligenceSeedService';

export async function GET() {
  try {
    const session = await getSession();
    let orgId = session?.organizationId;

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) {
        return NextResponse.json({ error: 'No organization found' }, { status: 404 });
      }
      orgId = firstOrg.id;
    }

    // Ensure baseline intelligence data is seeded
    await IntelligenceSeedService.ensureIntelligenceSeeded(orgId);

    const farm = await prisma.farm.findFirst({
      where: { organizationId: orgId },
      include: {
        fields: {
          include: {
            grids: {
              include: {
                nutrientBudget: true,
                soilProfiles: { take: 1 },
              },
            },
          },
        },
      },
    });

    const allGrids = farm?.fields.flatMap((f) => f.grids) || [];
    const briefing = FarmSummaryService.generateBriefing(farm?.name || 'Green Valley Farm', allGrids, 78);
    const earlyWarnings = EarlyWarningService.scanFarmWarnings(allGrids);

    const insights = await prisma.intelligenceInsight.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const parsedInsights = insights.map((ins) => ({
      ...ins,
      evidence: ins.evidenceJson ? JSON.parse(ins.evidenceJson) : [],
    }));

    return NextResponse.json({
      briefing,
      earlyWarnings,
      insights: parsedInsights,
    });
  } catch (error: any) {
    console.error('Intelligence summary error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
