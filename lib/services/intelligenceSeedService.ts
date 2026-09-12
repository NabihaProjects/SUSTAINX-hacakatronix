// SOIL IQ - Intelligence & Anomaly Seed Helper
// Populates baseline model versions, insights, anomalies, and soil health snapshots for demo readiness.

import prisma from '@/lib/db/prisma';

export class IntelligenceSeedService {
  static async ensureIntelligenceSeeded(organizationId: string) {
    // 1. Model Versions
    const existingModel = await prisma.modelVersion.findFirst({
      where: { modelCode: 'RULE_ENGINE_V1' },
    });

    if (!existingModel) {
      await prisma.modelVersion.createMany({
        data: [
          {
            modelCode: 'RULE_ENGINE_V1',
            name: 'Deterministic Agronomic Rule Engine',
            version: 'v1.4',
            type: 'RULE_ENGINE',
            status: 'ACTIVE',
            description: 'Core nutrient ledger balance and phenological uptake curves.',
          },
          {
            modelCode: 'PREDICTION_ENGINE_V1',
            name: 'Statistical Trend Forecaster',
            version: 'v1.1',
            type: 'STATISTICAL_MODEL',
            status: 'ACTIVE',
            description: 'Linear regression with widening uncertainty bands for nutrient trajectories.',
          },
          {
            modelCode: 'ANOMALY_ENGINE_V1',
            name: 'Multi-Modal Anomaly Detector',
            version: 'v1.2',
            type: 'STATISTICAL_MODEL',
            status: 'ACTIVE',
            description: 'Threshold, moving-average deviation, and sudden spike anomaly detector.',
          },
        ],
      });
    }

    // 2. Intelligence Insights
    const insightCount = await prisma.intelligenceInsight.count({ where: { organizationId } });
    if (insightCount === 0) {
      await prisma.intelligenceInsight.createMany({
        data: [
          {
            organizationId,
            title: 'Elevated Phosphorus Accumulation in Central Sector',
            summary: 'Grids F01-G003 and F01-G004 show legacy phosphorus buildup (>55 ppm) from previous DAP passes.',
            priority: 'HIGH',
            category: 'NUTRIENT',
            source: 'RULE_ENGINE',
            confidence: 0.92,
            confidenceLevel: 'HIGH',
            modelVersion: 'RULE_ENGINE_V1',
            recommendedAction: 'Switch upcoming top-dress to single-nutrient Nitrogen (Urea 46-0-0) to allow soil P depletion.',
            potentialImpact: 'Avoids chemical over-saturation and saves $18.40/ha in unnecessary phosphorus inputs.',
            evidenceJson: JSON.stringify([
              'Soil P measured at 58 ppm (Optimal: 25-45 ppm)',
              'Previous DAP application delivered 9.2 kg elemental P',
              'Cumulative grid budget P is 96% consumed',
            ]),
          },
          {
            organizationId,
            title: 'Optimal Spray Window Closing in 18 Hours',
            summary: 'Current low-drift conditions (wind 6 km/h, clear skies) will deteriorate as cold front arrives.',
            priority: 'MEDIUM',
            category: 'ENVIRONMENT',
            source: 'STATISTICAL_MODEL',
            confidence: 0.88,
            confidenceLevel: 'HIGH',
            modelVersion: 'PREDICTION_ENGINE_V1',
            recommendedAction: 'Prioritize Field 1 application passes during the next 12 hours before precipitation probability rises.',
            potentialImpact: 'Prevents chemical runoff and eliminates mandatory sprayer weather lockouts.',
            evidenceJson: JSON.stringify([
              'Rain probability increases from 10% to 85% in 24 hours',
              'Wind expected to exceed 22 km/h by tomorrow morning',
            ]),
          },
          {
            organizationId,
            title: 'Variable-Rate Nitrogen Efficiency Exceeds Baseline by 14%',
            summary: 'Autonomous closed-loop throttling reduced total fertilizer applied without underfeeding deficient zones.',
            priority: 'LOW',
            category: 'EFFICIENCY',
            source: 'STATISTICAL_MODEL',
            confidence: 0.95,
            confidenceLevel: 'HIGH',
            modelVersion: 'RULE_ENGINE_V1',
            recommendedAction: 'Continue spatial grid variable-rate management into next flowering stage.',
            potentialImpact: 'Annualized reduction of 320 kg gross fertilizer across the farm.',
            evidenceJson: JSON.stringify([
              'Target vs actual adherence score: 92/100',
              '4 overapplication events successfully prevented by closed-loop engine',
            ]),
          },
        ],
      });
    }

    // 3. Sample Anomaly Events
    const anomalyCount = await prisma.anomalyEvent.count({ where: { organizationId } });
    if (anomalyCount === 0) {
      await prisma.anomalyEvent.createMany({
        data: [
          {
            organizationId,
            metricName: 'soil_moisture',
            anomalyType: 'ENVIRONMENT_ANOMALY',
            method: 'SUDDEN_SPIKE',
            expectedValue: 42.0,
            actualValue: 74.5,
            deviationPct: 77.4,
            severity: 'WARNING',
            description: 'Sudden spike of 77.4% in soil moisture on grid F01-G003 within a 2-hour window.',
            rootCauseHypothesesJson: JSON.stringify([
              'Localized heavy precipitation shower over northern headland',
              'Subsurface drip lateral irrigation pipe breach',
              'Probe capacitive measurement noise from surface ponding',
            ]),
          },
          {
            organizationId,
            metricName: 'soil_p',
            anomalyType: 'SOIL_ANOMALY',
            method: 'THRESHOLD',
            expectedValue: 45.0,
            actualValue: 62.0,
            deviationPct: 37.8,
            severity: 'CRITICAL',
            description: 'Phosphorus concentration exceeded upper safety ceiling on grid F01-G004.',
            rootCauseHypothesesJson: JSON.stringify([
              'Multi-pass overlapping from manual sprayer headland turns',
              'High legacy mineralized phosphate reserve',
            ]),
          },
        ],
      });
    }

    // 4. Sample Soil Health Snapshot
    const snapshotCount = await prisma.soilHealthSnapshot.count({ where: { organizationId } });
    if (snapshotCount === 0) {
      await prisma.soilHealthSnapshot.create({
        data: {
          organizationId,
          overallScore: 78.0,
          nutrientBalanceScore: 82.0,
          phScore: 88.0,
          organicCarbonScore: 64.0,
          ecScore: 79.0,
          moistureStabilityScore: 75.0,
          excessHistoryScore: 72.0,
          dataConfidenceScore: 86.0,
          componentsJson: JSON.stringify({
            nutrientBalance: { score: 82, weight: 0.25 },
            phCondition: { score: 88, weight: 0.20 },
            organicCarbon: { score: 64, weight: 0.15 },
            salinityEc: { score: 79, weight: 0.15 },
            moistureStability: { score: 75, weight: 0.15 },
            excessHistory: { score: 72, weight: 0.10 },
          }),
        },
      });
    }
  }
}
