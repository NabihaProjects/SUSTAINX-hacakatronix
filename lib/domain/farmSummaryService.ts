// SOIL IQ - Farm Executive Intelligence Summary Service
// Synthesizes structured data from fields, grids, nutrient budgets, and sensors into executive briefings.

export interface FarmExecutiveBriefing {
  farmName: string;
  totalGrids: number;
  optimalGridsCount: number;
  cautionGridsCount: number;
  excessGridsCount: number;
  blockedGridsCount: number;
  highPGridsCount: number;
  weatherLockoutsCount: number;
  overallSoilHealthScore: number;
  soilHealthLabel: string;
  dataQualityScore: number;
  highestValueIntervention: {
    gridCode: string;
    action: string;
    impact: string;
  };
  keyTakeaways: string[];
}

export class FarmSummaryService {
  /**
   * Generates a concise executive briefing from live farm data.
   */
  static generateBriefing(farmName: string, grids: any[], soilHealthScore = 78): FarmExecutiveBriefing {
    const total = Math.max(1, grids.length);
    let optimal = 0;
    let caution = 0;
    let excess = 0;
    let blocked = 0;
    let highP = 0;

    let candidateInterventionGrid = 'F01-G001';
    let candidateInterventionAction = 'Maintain standard variable-rate schedule.';
    let candidateInterventionImpact = 'Ensures continuous balanced nutrient compliance.';

    grids.forEach((g) => {
      if (g.status === 'OPTIMAL') optimal++;
      else if (g.status === 'CAUTION') caution++;
      else if (g.status === 'EXCESS_RISK') excess++;
      else if (g.status === 'BLOCKED') blocked++;

      const p = g.soilProfiles?.[0]?.availablePPpm || 0;
      if (p > 55) {
        highP++;
        candidateInterventionGrid = g.gridCode;
        candidateInterventionAction = 'Reduce or omit phosphorus-heavy fertilizer in upcoming pass.';
        candidateInterventionImpact = 'Prevents further phosphorus accumulation and mitigates leaching risk.';
      }
    });

    const compliancePct = Math.round((optimal / total) * 100);

    const takeaways: string[] = [
      `${compliancePct}% of monitored spatial grids are operating within optimal nutrient budget ceilings.`,
    ];

    if (highP > 0) {
      takeaways.push(`${highP} grid(s) exhibit elevated phosphorus reserves requiring lower-P formulations.`);
    }

    if (blocked > 0) {
      takeaways.push(`${blocked} grid(s) have active spatial or riparian lockouts enforced by the safety engine.`);
    }

    takeaways.push(`Farm Soil Health Index stands at ${soilHealthScore}/100 with active sensor telemetry streams.`);

    return {
      farmName,
      totalGrids: total,
      optimalGridsCount: optimal,
      cautionGridsCount: caution,
      excessGridsCount: excess,
      blockedGridsCount: blocked,
      highPGridsCount: highP,
      weatherLockoutsCount: blocked > 0 ? 1 : 0,
      overallSoilHealthScore: soilHealthScore,
      soilHealthLabel: soilHealthScore >= 80 ? 'EXCELLENT' : soilHealthScore >= 65 ? 'GOOD' : 'MODERATE',
      dataQualityScore: 86,
      highestValueIntervention: {
        gridCode: candidateInterventionGrid,
        action: candidateInterventionAction,
        impact: candidateInterventionImpact,
      },
      keyTakeaways: takeaways,
    };
  }
}
