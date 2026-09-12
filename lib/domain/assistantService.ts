// SOIL IQ - Grounded AI Farm Assistant Service
// Implements tool-based retrieval over authoritative domain databases.
// Answers agronomist queries with explicit evidence citations and refuses to hallucinate facts.

import prisma from '@/lib/db/prisma';
import { FarmSummaryService } from './farmSummaryService';

export interface AssistantQueryResponse {
  answer: string;
  responseType: 'FACTUAL_SUMMARY' | 'EXPLANATION' | 'RECOMMENDATION' | 'COMPARISON' | 'ALERT_SUMMARY';
  retrievedFacts: string[];
  evidenceData: Record<string, any>;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
}

export class AssistantService {
  /**
   * Processes a natural language query using grounded database tools.
   */
  static async handleQuery(organizationId: string, query: string): Promise<AssistantQueryResponse> {
    const q = query.toLowerCase().trim();

    // 1. Tool Retrieval: Farm Summary & Overall Health
    if (q.includes('how is') || q.includes('doing') || q.includes('overview') || q.includes('summary') || q.includes('status of farm')) {
      return this.toolFarmSummary(organizationId);
    }

    // 2. Tool Retrieval: Which grids need attention?
    if (q.includes('attention') || q.includes('risk') || q.includes('problem') || q.includes('warn') || q.includes('which grid')) {
      return this.toolGridsNeedingAttention(organizationId);
    }

    // 3. Tool Retrieval: Why was spraying stopped? (E.g. in G047 or generally)
    if (q.includes('stop') || q.includes('halt') || q.includes('shut off') || q.includes('valve')) {
      return this.toolExplainSprayStop(organizationId, q);
    }

    // 4. Tool Retrieval: What happened today / Activity
    if (q.includes('today') || q.includes('recent') || q.includes('activity') || q.includes('history') || q.includes('timeline')) {
      return this.toolTodayActivity(organizationId);
    }

    // 5. Tool Retrieval: Fertilizer Usage / Efficiency
    if (q.includes('fertilizer') || q.includes('usage') || q.includes('most') || q.includes('applied') || q.includes('efficiency')) {
      return this.toolFertilizerUsage(organizationId);
    }

    // 6. Fallback: Query not mapped to structured tool
    return {
      answer: 'SOIL IQ does not have sufficient structured data to answer this query reliably. You can ask about farm summary, which grids need attention, why spraying was stopped, fertilizer consumption, or recent activities.',
      responseType: 'FACTUAL_SUMMARY',
      retrievedFacts: ['Query did not match supported agronomic tool domains.'],
      evidenceData: {},
      confidenceLevel: 'LOW',
      confidenceScore: 0.2,
    };
  }

  private static async toolFarmSummary(organizationId: string): Promise<AssistantQueryResponse> {
    const farm = await prisma.farm.findFirst({
      where: { organizationId },
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

    if (!farm) {
      return {
        answer: 'SOIL IQ could not locate an active farm record for this organization.',
        responseType: 'FACTUAL_SUMMARY',
        retrievedFacts: ['No farm record found.'],
        evidenceData: {},
        confidenceLevel: 'LOW',
        confidenceScore: 0.1,
      };
    }

    const allGrids = farm.fields.flatMap((f) => f.grids);
    const briefing = FarmSummaryService.generateBriefing(farm.name, allGrids, 78);

    const answer = `${farm.name} is operating in a healthy state with ${briefing.totalGrids} monitored grids. ${briefing.optimalGridsCount} grids (${Math.round((briefing.optimalGridsCount / briefing.totalGrids) * 100)}%) are within optimal nutrient budget limits. ${briefing.highPGridsCount > 0 ? `${briefing.highPGridsCount} grids show elevated phosphorus accumulation.` : ''} The Prototype Soil Health Index is ${briefing.overallSoilHealthScore}/100 (${briefing.soilHealthLabel}). Top intervention: ${briefing.highestValueIntervention.action} on grid ${briefing.highestValueIntervention.gridCode}.`;

    return {
      answer,
      responseType: 'FACTUAL_SUMMARY',
      retrievedFacts: [
        `Farm: ${farm.name}`,
        `Total Grids: ${briefing.totalGrids}`,
        `Optimal: ${briefing.optimalGridsCount}, Caution/Excess: ${briefing.cautionGridsCount + briefing.excessGridsCount}`,
        `Elevated P Grids: ${briefing.highPGridsCount}`,
        `Soil Health Index: ${briefing.overallSoilHealthScore}/100`,
      ],
      evidenceData: briefing,
      confidenceLevel: 'HIGH',
      confidenceScore: 0.95,
    };
  }

  private static async toolGridsNeedingAttention(organizationId: string): Promise<AssistantQueryResponse> {
    const grids = await prisma.grid.findMany({
      where: { organizationId, isActive: true },
      include: { nutrientBudget: true, soilProfiles: { take: 1 }, field: true },
    });

    const attentionGrids = grids.filter(
      (g) =>
        g.status === 'EXCESS_RISK' ||
        g.status === 'CAUTION' ||
        g.status === 'BLOCKED' ||
        g.isBlocked ||
        (g.soilProfiles[0]?.availablePPpm || 0) > 55
    );

    if (attentionGrids.length === 0) {
      return {
        answer: 'All active spatial grids are currently operating within nominal nutrient bounds with zero safety locks.',
        responseType: 'ALERT_SUMMARY',
        retrievedFacts: ['Checked all active grids. Zero in CAUTION, EXCESS_RISK, or BLOCKED state.'],
        evidenceData: { count: 0 },
        confidenceLevel: 'HIGH',
        confidenceScore: 0.95,
      };
    }

    const items = attentionGrids.slice(0, 5).map((g) => {
      const reason = g.isBlocked
        ? 'Environmental/Riparian Block'
        : g.status === 'EXCESS_RISK'
        ? 'Nitrogen budget ceiling reached'
        : (g.soilProfiles[0]?.availablePPpm || 0) > 55
        ? `Elevated phosphorus (${g.soilProfiles[0]?.availablePPpm} ppm)`
        : 'Approaching caution threshold';
      return `• Grid ${g.gridCode} (${g.field.name}): ${reason}`;
    });

    const answer = `There are ${attentionGrids.length} grid(s) requiring agronomic attention:\n${items.join('\n')}\n\nRecommended Action: Adjust upcoming prescriptions to avoid over-applying nitrogen and phosphorus in these sectors.`;

    return {
      answer,
      responseType: 'ALERT_SUMMARY',
      retrievedFacts: items,
      evidenceData: { attentionCount: attentionGrids.length, gridCodes: attentionGrids.map((g) => g.gridCode) },
      confidenceLevel: 'HIGH',
      confidenceScore: 0.92,
    };
  }

  private static async toolExplainSprayStop(organizationId: string, query: string): Promise<AssistantQueryResponse> {
    // Check recent control decisions
    const decisions = await prisma.controlDecision.findMany({
      where: { decision: 'STOP' },
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: { grid: true, sprayer: true },
    });

    if (decisions.length === 0) {
      return {
        answer: 'No recent STOP decisions have been recorded for active sprayers. All sprayers have been operating within nominal prescription windows.',
        responseType: 'EXPLANATION',
        retrievedFacts: ['Checked ControlDecision ledger. Zero STOP events recorded in recent history.'],
        evidenceData: {},
        confidenceLevel: 'HIGH',
        confidenceScore: 0.9,
      };
    }

    const latest = decisions[0];
    const gridCode = latest.grid?.gridCode || 'unknown';

    const answer = `The smart sprayer (${latest.sprayer.name}) was instructed to STOP on grid ${gridCode} at ${new Date(latest.timestamp).toLocaleTimeString()}.\n\nReason: "${latest.reason}"\n\nDeterministic Safety Chain: The closed-loop controller continuously monitors position against active grid prescriptions and boundary lockouts. When the machine encountered this constraint, solenoid valves were closed immediately (0% duty cycle) to prevent unprescribed dosing or environmental misplacement.`;

    return {
      answer,
      responseType: 'EXPLANATION',
      retrievedFacts: [
        `Sprayer: ${latest.sprayer.name}`,
        `Grid: ${gridCode}`,
        `Decision: STOP`,
        `Reason: ${latest.reason}`,
        `Timestamp: ${latest.timestamp.toISOString()}`,
      ],
      evidenceData: latest,
      confidenceLevel: 'HIGH',
      confidenceScore: 0.96,
    };
  }

  private static async toolTodayActivity(organizationId: string): Promise<AssistantQueryResponse> {
    const activities = await prisma.farmActivity.findMany({
      where: { organizationId },
      take: 5,
      orderBy: { timestamp: 'desc' },
    });

    const applications = await prisma.fertilizerApplication.findMany({
      where: { organizationId },
      take: 5,
      orderBy: { applicationDate: 'desc' },
      include: { fertilizer: true, grid: true },
    });

    const lines: string[] = [];
    if (activities.length > 0) {
      lines.push('Recent Farm Activities:');
      activities.forEach((a) => lines.push(`• [${new Date(a.timestamp).toLocaleTimeString()}] ${a.actorName}: ${a.description}`));
    }

    if (applications.length > 0) {
      lines.push('\nRecent Fertilizer Passes:');
      applications.forEach((app) =>
        lines.push(`• Applied ${app.quantityKg} kg of ${app.fertilizer.name} on grid ${app.grid.gridCode} (Contributed ${app.contributedN} kg N, ${app.contributedP} kg P).`)
      );
    }

    const answer = lines.join('\n') || 'No major operational activities or fertilizer passes have been logged for today yet.';

    return {
      answer,
      responseType: 'FACTUAL_SUMMARY',
      retrievedFacts: lines,
      evidenceData: { activityCount: activities.length, applicationCount: applications.length },
      confidenceLevel: 'HIGH',
      confidenceScore: 0.94,
    };
  }

  private static async toolFertilizerUsage(organizationId: string): Promise<AssistantQueryResponse> {
    const fields = await prisma.field.findMany({
      where: { organizationId },
      include: {
        applications: {
          include: { fertilizer: true },
        },
      },
    });

    let totalGrossKg = 0;
    let fieldSummaries: { name: string; kg: number }[] = [];

    fields.forEach((f) => {
      const fieldKg = f.applications.reduce((acc, app) => acc + app.quantityKg, 0);
      totalGrossKg += fieldKg;
      fieldSummaries.push({ name: f.name, kg: fieldKg });
    });

    fieldSummaries.sort((a, b) => b.kg - a.kg);
    const topField = fieldSummaries[0] || { name: 'Main Field', kg: 0 };

    const answer = `Total fertilizer applied across all active fields is ${totalGrossKg} kg. The highest input utilization occurred in ${topField.name} (${topField.kg} kg applied).`;

    return {
      answer,
      responseType: 'COMPARISON',
      retrievedFacts: fieldSummaries.map((fs) => `${fs.name}: ${fs.kg} kg`),
      evidenceData: { totalGrossKg, fieldSummaries },
      confidenceLevel: 'HIGH',
      confidenceScore: 0.92,
    };
  }
}
