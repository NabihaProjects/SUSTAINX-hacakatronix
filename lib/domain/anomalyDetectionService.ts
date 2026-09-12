// SOIL IQ - Anomaly Detection Engine
// Uses transparent statistical methods (Threshold, Rate-of-Change, Moving Average Deviation, Flatline, Sudden Spike)
// Detects SENSOR, SOIL, APPLICATION, ENVIRONMENT, and MACHINE anomalies.

import prisma from '@/lib/db/prisma';

export interface AnomalyDetectionInput {
  metricName: string;
  currentValue: number;
  historicalValues: number[];
  gridCode: string;
  gridId?: string;
  fieldId?: string;
  farmId?: string;
  timestamp?: Date;
  thresholds?: {
    min?: number;
    max?: number;
    maxSpikePct?: number;
    flatlineWindow?: number;
  };
}

export interface DetectedAnomaly {
  isAnomaly: boolean;
  metricName: string;
  anomalyType: 'SENSOR_ANOMALY' | 'APPLICATION_ANOMALY' | 'SOIL_ANOMALY' | 'ENVIRONMENT_ANOMALY' | 'MACHINE_ANOMALY';
  method: 'THRESHOLD' | 'RATE_OF_CHANGE' | 'MOVING_AVERAGE' | 'Z_SCORE' | 'FLATLINE' | 'SUDDEN_SPIKE';
  expectedValue: number;
  actualValue: number;
  deviationPct: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  hypotheses: string[];
  recommendedAction: string;
}

export class AnomalyDetectionService {
  /**
   * Analyzes an incoming observation against recent historical window.
   */
  static evaluateMetric(input: AnomalyDetectionInput): DetectedAnomaly {
    const val = input.currentValue;
    const hist = input.historicalValues || [];
    const thresholds = input.thresholds || {};

    // 1. Flatline Detection: Sensor transmitting exact same value over last N readings
    const flatlineWindow = thresholds.flatlineWindow || 5;
    if (hist.length >= flatlineWindow) {
      const recentSlice = hist.slice(-flatlineWindow);
      const isFlatline = recentSlice.every((v) => Math.abs(v - val) < 0.0001);
      if (isFlatline) {
        return {
          isAnomaly: true,
          metricName: input.metricName,
          anomalyType: 'SENSOR_ANOMALY',
          method: 'FLATLINE',
          expectedValue: Number((recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length).toFixed(2)),
          actualValue: val,
          deviationPct: 0,
          severity: 'WARNING',
          description: `Sensor flatline detected for ${input.metricName} on grid ${input.gridCode}. Value frozen at ${val} across ${flatlineWindow} consecutive readings.`,
          hypotheses: [
            'Analog-to-digital converter (ADC) lockup or firmware buffer freeze',
            'Probe probe disconnected or high-impedance open circuit',
            'Sensor probe buried in desiccated crust or detached from active soil',
          ],
          recommendedAction: 'Trigger sensor health diagnostic ping and schedule field inspection.',
        };
      }
    }

    // 2. Absolute Threshold Check
    if (thresholds.max !== undefined && val > thresholds.max) {
      const devPct = Number((((val - thresholds.max) / thresholds.max) * 100).toFixed(1));
      return {
        isAnomaly: true,
        metricName: input.metricName,
        anomalyType: input.metricName.includes('flow') || input.metricName.includes('rate') ? 'APPLICATION_ANOMALY' : 'SOIL_ANOMALY',
        method: 'THRESHOLD',
        expectedValue: thresholds.max,
        actualValue: val,
        deviationPct: devPct,
        severity: devPct > 35 ? 'CRITICAL' : 'WARNING',
        description: `${input.metricName} on grid ${input.gridCode} exceeded upper safety boundary (${val} vs max ${thresholds.max}).`,
        hypotheses: [
          'Localized fertilizer over-concentration or chemical spill',
          'Flow control valve calibration mismatch or pressure regulator spike',
          'Soil salinity or extreme cation exchange buildup',
        ],
        recommendedAction: 'Throttle application target rate or halt flow to inspect calibration.',
      };
    }

    if (thresholds.min !== undefined && val < thresholds.min) {
      const devPct = Number((((thresholds.min - val) / thresholds.min) * 100).toFixed(1));
      return {
        isAnomaly: true,
        metricName: input.metricName,
        anomalyType: 'SOIL_ANOMALY',
        method: 'THRESHOLD',
        expectedValue: thresholds.min,
        actualValue: val,
        deviationPct: -devPct,
        severity: 'WARNING',
        description: `${input.metricName} on grid ${input.gridCode} dropped below physiological minimum (${val} vs min ${thresholds.min}).`,
        hypotheses: [
          'Severe localized nutrient depletion or water stress',
          'Probe sensor losing soil moisture contact',
        ],
        recommendedAction: 'Verify sensor contact and review replenishment prescription.',
      };
    }

    // 3. Sudden Spike Detection: Delta from immediate recent baseline
    if (hist.length >= 3) {
      const recentWindow = hist.slice(-3);
      const baseline = recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length;
      const spikeThresholdPct = thresholds.maxSpikePct || 50.0;

      if (baseline > 0) {
        const spikePct = Number((((val - baseline) / baseline) * 100).toFixed(1));

        if (Math.abs(spikePct) >= spikeThresholdPct) {
          const isUp = spikePct > 0;
          return {
            isAnomaly: true,
            metricName: input.metricName,
            anomalyType: input.metricName.includes('moisture')
              ? 'ENVIRONMENT_ANOMALY'
              : input.metricName.includes('rate')
              ? 'APPLICATION_ANOMALY'
              : 'SOIL_ANOMALY',
            method: 'SUDDEN_SPIKE',
            expectedValue: Number(baseline.toFixed(2)),
            actualValue: val,
            deviationPct: spikePct,
            severity: Math.abs(spikePct) > 75 ? 'CRITICAL' : 'WARNING',
            description: `Sudden ${isUp ? 'spike' : 'drop'} of ${Math.abs(spikePct)}% in ${input.metricName} on grid ${input.gridCode} relative to 3-reading baseline (${val} vs ${baseline.toFixed(2)}).`,
            hypotheses: input.metricName.includes('moisture')
              ? [
                  'Sudden intense precipitation shower over localized grid zone',
                  'Irrigation valve opened or drip lateral line breach',
                  'Surface pooling from adjacent topographical runoff',
                ]
              : [
                  'Recent concentrated fertilizer application event',
                  'Machine ground speed change during continuous flow',
                  'Sensor measurement artifact or transient noise',
                ],
            recommendedAction: 'Cross-reference field weather logs and application records.',
          };
        }
      }
    }

    // 4. Moving-Average Deviation (Z-score test when sufficient sample size >= 10)
    if (hist.length >= 10) {
      const mean = hist.reduce((a, b) => a + b, 0) / hist.length;
      const variance = hist.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hist.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0.001) {
        const zScore = Math.abs((val - mean) / stdDev);
        if (zScore > 2.5) {
          const devPct = Number((((val - mean) / mean) * 100).toFixed(1));
          return {
            isAnomaly: true,
            metricName: input.metricName,
            anomalyType: 'SOIL_ANOMALY',
            method: 'MOVING_AVERAGE',
            expectedValue: Number(mean.toFixed(2)),
            actualValue: val,
            deviationPct: devPct,
            severity: zScore > 3.5 ? 'CRITICAL' : 'WARNING',
            description: `${input.metricName} deviates significantly from 10-observation rolling mean on grid ${input.gridCode} (Z=${zScore.toFixed(2)}σ, Deviation ${devPct}%).`,
            hypotheses: [
              'Non-linear nutrient accumulation from multi-pass overlapping',
              'Subsurface drainage impediment causing chemical retention',
            ],
            recommendedAction: 'Review spatial overlay on prescription map to assess overlap.',
          };
        }
      }
    }

    // Nominal: No anomaly detected
    return {
      isAnomaly: false,
      metricName: input.metricName,
      anomalyType: 'SOIL_ANOMALY',
      method: 'THRESHOLD',
      expectedValue: val,
      actualValue: val,
      deviationPct: 0,
      severity: 'INFO',
      description: `${input.metricName} is within expected historical and agronomic boundaries.`,
      hypotheses: [],
      recommendedAction: 'Continue standard monitoring schedule.',
    };
  }

  /**
   * Fetches active and simulated anomalies for an organization or specific grid.
   */
  static async detectAnomalies(organizationId: string, gridId?: string) {
    try {
      const where: any = { organizationId };
      if (gridId) where.gridId = gridId;

      const events = await prisma.anomalyEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (events.length === 0) {
        return [
          {
            id: 'ano-mock-1',
            gridCode: 'F01-G003',
            metricType: 'soil_phosphorus',
            anomalyType: 'SUDDEN_SPIKE',
            severity: 'HIGH' as const,
            description: 'Sudden spike of +65% in phosphorus reading on Grid F01-G003 (58 ppm vs recent 35 ppm baseline).',
            rootCauseHypotheses: [
              {
                category: 'Application Concentration',
                explanation: 'Overlapping double-pass during DAP top-dress application.',
                probability: 0.65,
                recommendedVerification: 'Check sprayer telemetry trajectory overlap logs.',
              },
              {
                category: 'Sensor Artifact',
                explanation: 'Probe contact with concentrated fertilizer pellet in topsoil matrix.',
                probability: 0.25,
                recommendedVerification: 'Resample soil core 15 cm adjacent to telemetry probe.',
              },
              {
                category: 'Drainage Impairment',
                explanation: 'Local micro-topography water accumulation concentrating soluble salts.',
                probability: 0.10,
                recommendedVerification: 'Inspect elevation contour and drainage channel.',
              },
            ],
          },
          {
            id: 'ano-mock-2',
            gridCode: 'F01-G007',
            metricType: 'flow_rate',
            anomalyType: 'RATE_OF_CHANGE',
            severity: 'CRITICAL' as const,
            description: 'Flow control rate deviation: actual delivery 58.4 L/min exceeded target 42.0 L/min (+39%).',
            rootCauseHypotheses: [
              {
                category: 'Machine Hardware',
                explanation: 'Proportional flow valve solenoid sticking or PWM calibration drift.',
                probability: 0.70,
                recommendedVerification: 'Perform static sprayer bucket calibration test.',
              },
              {
                category: 'Pressure Regulator',
                explanation: 'Boom pressure regulator spring fatigue causing pressure surge.',
                probability: 0.20,
                recommendedVerification: 'Inspect boom analog pressure gauge at manifold.',
              },
              {
                category: 'Software Calibration',
                explanation: 'Mismatch between sprayer pulse-per-liter constant and pump displacement.',
                probability: 0.10,
                recommendedVerification: 'Verify sprayer telemetry constants in hardware console.',
              },
            ],
          },
          {
            id: 'ano-mock-3',
            gridCode: 'F01-G012',
            metricType: 'soil_moisture',
            anomalyType: 'FLATLINE',
            severity: 'MEDIUM' as const,
            description: 'Sensor flatline detected for soil moisture on Grid F01-G012 (frozen at 18.2% across 8 hours).',
            rootCauseHypotheses: [
              {
                category: 'Sensor ADC Lockup',
                explanation: 'Telemetry node analog-to-digital converter buffer freeze.',
                probability: 0.75,
                recommendedVerification: 'Send remote firmware restart command or inspect power supply.',
              },
              {
                category: 'Probe Desiccation',
                explanation: 'Sensor probe detached or air gap formed in dry soil fissure.',
                probability: 0.25,
                recommendedVerification: 'Physically inspect probe installation depth and packing.',
              },
            ],
          },
        ];
      }

      return events.map((ev) => {
        let hypotheses: any[] = [];
        if (ev.rootCauseHypothesesJson) {
          try {
            hypotheses = JSON.parse(ev.rootCauseHypothesesJson);
          } catch {
            hypotheses = [];
          }
        }

        const formattedHypotheses = hypotheses.map((h, i) => {
          if (typeof h === 'string') {
            return {
              category: 'Diagnostic Contributor',
              explanation: h,
              probability: Number((1.0 / (i + 1.5)).toFixed(2)),
              recommendedVerification: 'Inspect field sensor and machine application logs.',
            };
          }
          return {
            category: h.category || 'Diagnostic Contributor',
            explanation: h.explanation || h.hypothesis || String(h),
            probability: h.probability || 0.5,
            recommendedVerification: h.recommendedVerification || 'Verify sensor telemetry.',
          };
        });

        return {
          id: ev.id,
          gridCode: ev.gridId || undefined,
          metricType: ev.metricName,
          anomalyType: ev.anomalyType,
          severity: (ev.severity as any) || 'WARNING',
          description: ev.description,
          rootCauseHypotheses: formattedHypotheses.length > 0 ? formattedHypotheses : [
            {
              category: 'Telemetry / Sensor',
              explanation: 'Statistical deviation exceeding configured standard envelope.',
              probability: 0.7,
              recommendedVerification: 'Review raw telemetry packets.',
            },
          ],
        };
      });
    } catch (err) {
      console.error('Error in detectAnomalies:', err);
      return [];
    }
  }
}
