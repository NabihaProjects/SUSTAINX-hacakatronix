// SOIL IQ - Farm Early Warning System
// Identifies emerging systemic risks before they cause chronic soil degradation or regulatory non-compliance.

export interface EarlyWarningItem {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  gridCodes: string[];
  category: 'NUTRIENT_ACCUMULATION' | 'SOIL_HEALTH_DECLINE' | 'APPLICATION_FIDELITY' | 'WEATHER_DISRUPTION';
  timestamp: string;
}

export class EarlyWarningService {
  /**
   * Scans farm grid metrics and historical applications to detect early warning patterns.
   */
  static scanFarmWarnings(grids: any[]): EarlyWarningItem[] {
    const warnings: EarlyWarningItem[] = [];

    // 1. Phosphorus Accumulation Warning
    const highPGrids = grids.filter((g) => {
      const p = g.soilProfiles?.[0]?.availablePPpm || 0;
      const excessP = g.nutrientBudget?.excessP || 0;
      return p > 55 || excessP > 5.0;
    });

    if (highPGrids.length >= 3) {
      warnings.push({
        id: 'warn-p-accum',
        severity: 'WARNING',
        title: 'Cluster Phosphorus Accumulation Detected',
        whatHappened: `${highPGrids.length} spatial grids exhibit elevated phosphorus concentrations (>55 ppm) or historical excess accounting.`,
        whyItMatters: 'Phosphorus binds tightly to soil colloids and excess accumulation increases water table leaching and eutrophication risks.',
        recommendedAction: 'Shift upcoming seasonal prescriptions to zero-P or low-P formulations (e.g. Urea or Potash only).',
        gridCodes: highPGrids.map((g) => g.gridCode),
        category: 'NUTRIENT_ACCUMULATION',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 2. Severe Over-Application Risk (Exhausted Budget)
    const exhaustedGrids = grids.filter((g) => g.status === 'EXCESS_RISK' || (g.nutrientBudget?.remainingN || 0) <= 0);
    if (exhaustedGrids.length > 0) {
      warnings.push({
        id: 'warn-excess-ceiling',
        severity: 'CRITICAL',
        title: 'Nutrient Budget Exhaustion in Managed Grids',
        whatHappened: `${exhaustedGrids.length} grid(s) have fully exhausted their nitrogen budget ceiling.`,
        whyItMatters: 'Any further fertilizer application in these sectors triggers automated closed-loop machine STOP decisions.',
        recommendedAction: 'Inspect sprayer task logs and lock out further nitrogen passes in these grids.',
        gridCodes: exhaustedGrids.map((g) => g.gridCode),
        category: 'APPLICATION_FIDELITY',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 3. Riparian Buffer or Environmental Lockout
    const blockedGrids = grids.filter((g) => g.isBlocked || g.status === 'BLOCKED');
    if (blockedGrids.length > 0) {
      warnings.push({
        id: 'warn-riparian-buffer',
        severity: 'INFO',
        title: 'Environmental Buffer Lockouts Active',
        whatHappened: `${blockedGrids.length} grid(s) have active spatial block restrictions (riparian zone).`,
        whyItMatters: 'Autonomous sprayers will automatically close solenoids upon crossing into these coordinates.',
        recommendedAction: 'Ensure sprayer navigation waypoints skirt perimeter buffers.',
        gridCodes: blockedGrids.map((g) => g.gridCode),
        category: 'WEATHER_DISRUPTION',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    return warnings;
  }
}
