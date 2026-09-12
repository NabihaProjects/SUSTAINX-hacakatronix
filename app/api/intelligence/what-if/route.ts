// SOIL IQ - What-If Scenario Simulation API Route
// Strictly isolated: Calculates comparative metrics without altering production data.

import { NextResponse } from 'next/server';
import { ScenarioSimulationService, ScenarioSimulationInputs } from '@/lib/domain/scenarioSimulationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const inputs: ScenarioSimulationInputs = {
      scenarioName: body.scenarioName || 'Custom Optimization Scenario',
      scenarioType: body.scenarioType || 'LESS_FERTILIZER',
      gridCode: body.gridCode || 'F01-G003',
      fieldAreaHa: body.fieldAreaHa || 2.4,

      baselineProduct: body.baselineProduct || 'NPK 19-19-19',
      baselineFormulation: body.baselineFormulation || '19-19-19',
      baselineRateKgHa: Number(body.baselineRateKgHa) || 40.0,
      baselineTimingDelayHours: Number(body.baselineTimingDelayHours) || 0,
      baselineRainProbPct: Number(body.baselineRainProbPct) || 85,

      scenarioProduct: body.scenarioProduct || 'NPK 19-19-19',
      scenarioFormulation: body.scenarioFormulation || '19-19-19',
      scenarioRateKgHa: Number(body.scenarioRateKgHa) || 30.0,
      scenarioTimingDelayHours: Number(body.scenarioTimingDelayHours) || 24,
      scenarioRainProbPct: Number(body.scenarioRainProbPct) || 15,

      costPerKg: Number(body.costPerKg) || 0.65,

      soilN: Number(body.soilN) || 45.0,
      soilP: Number(body.soilP) || 58.0,
      soilK: Number(body.soilK) || 140.0,
      soilPh: Number(body.soilPh) || 6.5,
      currentBudgetRecommendedN: Number(body.currentBudgetRecommendedN) || 100.0,
      currentBudgetConsumedN: Number(body.currentBudgetConsumedN) || 60.0,
    };

    const result = ScenarioSimulationService.runSimulation(inputs);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('What-if simulation error:', error);
    return NextResponse.json({ error: error.message || 'Simulation failure' }, { status: 500 });
  }
}
