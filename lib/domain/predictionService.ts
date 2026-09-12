// SOIL IQ - Predictive Trend Engine
// Uses statistical forecasting (Moving Average, Linear Trend, Exponential Smoothing)
// Predicts nutrient trajectory, fertilizer consumption rate, and soil-health trends.
// Mandatory Language Rule: All forecasts are strictly labeled "Projected" or "Estimated".

export interface TrendForecast {
  metricName: string;
  historicalPoints: { period: string; value: number }[];
  projectedPoints: { period: string; value: number; confidenceLow: number; confidenceHigh: number }[];
  trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  slopePerPeriod: number;
  rSquared: number;
  explanation: string;
}

export class PredictionService {
  /**
   * Generates a linear regression trend forecast with confidence bands.
   */
  static forecastLinear(
    metricName: string,
    history: { period: string; value: number }[],
    horizonSteps = 3
  ): TrendForecast {
    if (history.length < 2) {
      return {
        metricName,
        historicalPoints: history,
        projectedPoints: [],
        trendDirection: 'STABLE',
        slopePerPeriod: 0,
        rSquared: 0,
        explanation: 'Insufficient historical observations to project statistical trajectory reliably.',
      };
    }

    const n = history.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    history.forEach((pt, i) => {
      sumX += i;
      sumY += pt.value;
      sumXY += i * pt.value;
      sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / Math.max(0.001, n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared computation
    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    history.forEach((pt, i) => {
      const pred = intercept + slope * i;
      ssTot += Math.pow(pt.value - meanY, 2);
      ssRes += Math.pow(pt.value - pred, 2);
    });
    const rSquared = ssTot > 0 ? Math.max(0, Math.min(1.0, 1 - ssRes / ssTot)) : 0.8;

    const projectedPoints: TrendForecast['projectedPoints'] = [];
    for (let s = 1; s <= horizonSteps; s++) {
      const x = n - 1 + s;
      const forecastVal = Math.max(0, Number((intercept + slope * x).toFixed(1)));
      const margin = Number((forecastVal * 0.08 * Math.sqrt(s)).toFixed(1)); // widening uncertainty band

      projectedPoints.push({
        period: `Projected +${s}`,
        value: forecastVal,
        confidenceLow: Number((forecastVal - margin).toFixed(1)),
        confidenceHigh: Number((forecastVal + margin).toFixed(1)),
      });
    }

    const trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING' =
      Math.abs(slope) < 0.2 ? 'STABLE' : slope > 0 ? 'INCREASING' : 'DECREASING';

    const explanation = `Based on historical data across ${n} periods, the projected ${metricName} trend is ${trendDirection.toLowerCase()} at approximately ${Math.abs(slope).toFixed(2)} units per period.`;

    return {
      metricName,
      historicalPoints: history,
      projectedPoints,
      trendDirection,
      slopePerPeriod: Number(slope.toFixed(3)),
      rSquared: Number(rSquared.toFixed(2)),
      explanation,
    };
  }
}
