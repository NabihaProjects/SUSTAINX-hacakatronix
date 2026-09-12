// SOIL IQ - Commercial ROI & Economic Payback Calculation Service
// Provides transparent hardware amortization, input savings, and net impact modeling

export interface HardwareCostBreakdown {
  soilSensors: number; // e.g. 4 nodes * $180 = $720
  rtkReceiver: number; // e.g. Dual-band RTK kit = $450
  flowMeter: number; // e.g. In-line pulse flow meter = $220
  tankSensor: number; // e.g. Hydrostatic pressure sensor = $160
  edgeGateway: number; // e.g. Cellular/LoRa edge gateway = $280
  sprayerController: number; // e.g. PWM valve controller = $380
  installationLabor: number; // e.g. Field tech setup = $300
  annualMaintenance: number; // e.g. Calibration + sensor replacements = $150
}

export interface RoiParameters {
  farmAreaAcres: number;
  fertilizerSpendPerAcreUsd: number;
  expectedReductionPct: number; // Typically 15 - 25%
  hardwareCosts: HardwareCostBreakdown;
  annualSoftwareSubscriptionUsd: number;
  depreciationYears: number; // Default 3 years
  currencySymbol?: string;
}

export interface RoiSummary {
  annualGrossInputSpendUsd: number;
  annualFertilizerSavingsUsd: number;
  totalInitialCapitalExpenseUsd: number;
  annualAmortizedHardwareCostUsd: number;
  annualTotalCostUsd: number;
  annualNetSavingsUsd: number;
  paybackPeriodMonths: number;
  threeYearNetReturnUsd: number;
  returnOnInvestmentPct: number;
  costPerAcreBenefitedUsd: number;
  disclaimer: string;
}

export class RoiService {
  /**
   * Default baseline hardware deployment cost template
   */
  static getDefaultHardwareCosts(): HardwareCostBreakdown {
    return {
      soilSensors: 720,
      rtkReceiver: 450,
      flowMeter: 220,
      tankSensor: 160,
      edgeGateway: 280,
      sprayerController: 380,
      installationLabor: 300,
      annualMaintenance: 150,
    };
  }

  /**
   * Calculate complete economic ROI and payback timeline
   */
  static calculateRoi(params: RoiParameters): RoiSummary {
    const {
      farmAreaAcres,
      fertilizerSpendPerAcreUsd,
      expectedReductionPct,
      hardwareCosts,
      annualSoftwareSubscriptionUsd,
      depreciationYears = 3,
    } = params;

    // 1. Gross chemical input economics
    const annualGrossInputSpendUsd = Math.round(farmAreaAcres * fertilizerSpendPerAcreUsd);
    const annualFertilizerSavingsUsd = Math.round(
      annualGrossInputSpendUsd * (Math.min(40, Math.max(5, expectedReductionPct)) / 100)
    );

    // 2. Hardware CapEx & OpEx
    const totalInitialCapitalExpenseUsd =
      hardwareCosts.soilSensors +
      hardwareCosts.rtkReceiver +
      hardwareCosts.flowMeter +
      hardwareCosts.tankSensor +
      hardwareCosts.edgeGateway +
      hardwareCosts.sprayerController +
      hardwareCosts.installationLabor;

    const annualAmortizedHardwareCostUsd = Math.round(
      totalInitialCapitalExpenseUsd / Math.max(1, depreciationYears) + hardwareCosts.annualMaintenance
    );

    // 3. Total annual cost of system (Hardware amortization + SaaS subscription)
    const annualTotalCostUsd = annualAmortizedHardwareCostUsd + annualSoftwareSubscriptionUsd;

    // 4. Net annual financial return
    const annualNetSavingsUsd = annualFertilizerSavingsUsd - annualTotalCostUsd;

    // 5. Payback period in months: CapEx / Monthly gross savings
    const monthlyGrossSavings = annualFertilizerSavingsUsd / 12;
    const paybackPeriodMonths =
      monthlyGrossSavings > 0
        ? Number((totalInitialCapitalExpenseUsd / monthlyGrossSavings).toFixed(1))
        : 99.9;

    // 6. 3-Year cumulative net return & ROI %
    const threeYearGrossSavings = annualFertilizerSavingsUsd * 3;
    const threeYearTotalInvestment =
      totalInitialCapitalExpenseUsd +
      hardwareCosts.annualMaintenance * 3 +
      annualSoftwareSubscriptionUsd * 3;
    const threeYearNetReturnUsd = threeYearGrossSavings - threeYearTotalInvestment;
    const returnOnInvestmentPct =
      threeYearTotalInvestment > 0
        ? Math.round((threeYearNetReturnUsd / threeYearTotalInvestment) * 100)
        : 0;

    const costPerAcreBenefitedUsd = Number(
      (annualTotalCostUsd / Math.max(1, farmAreaAcres)).toFixed(2)
    );

    return {
      annualGrossInputSpendUsd,
      annualFertilizerSavingsUsd,
      totalInitialCapitalExpenseUsd,
      annualAmortizedHardwareCostUsd,
      annualTotalCostUsd,
      annualNetSavingsUsd,
      paybackPeriodMonths,
      threeYearNetReturnUsd,
      returnOnInvestmentPct,
      costPerAcreBenefitedUsd,
      disclaimer:
        'Estimates based on modeled variable-rate efficiency and customer-provided cost inputs. Actual savings depend on soil baseline variability, equipment calibration, and weather conditions.',
    };
  }
}
