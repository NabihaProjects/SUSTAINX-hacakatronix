// SOIL IQ - Soil Adjustment Service
// Converts soil measurements (available ppm, organic carbon, pH) into effective nutrient credits (kg/ha)
// Accounts for measurement source (SOIL_TEST, SENSOR, ESTIMATED) and test freshness.

export interface SoilMeasurementInput {
  ph?: number;
  organicCarbonPct?: number;
  moisturePct?: number;
  ecDsm?: number;
  availableNPpm?: number;
  availablePPpm?: number;
  availableKPpm?: number;
  source?: 'SOIL_TEST' | 'SENSOR' | 'ESTIMATED';
  sampleDate?: Date | string;
}

export interface SoilAvailabilityResult {
  availableN: {
    kgPerHa: number;
    confidence: number;
    status: 'LOW' | 'MEDIUM' | 'OPTIMAL' | 'HIGH';
  };
  availableP: {
    kgPerHa: number;
    confidence: number;
    status: 'LOW' | 'MEDIUM' | 'OPTIMAL' | 'HIGH';
  };
  availableK: {
    kgPerHa: number;
    confidence: number;
    status: 'LOW' | 'MEDIUM' | 'OPTIMAL' | 'HIGH';
  };
  overallConfidence: number;
  measurementSource: 'SOIL_TEST' | 'SENSOR' | 'ESTIMATED';
  freshnessDays: number;
  soilHealthNotes: string[];
}

export class SoilAdjustmentService {
  /**
   * Translates ppm soil concentration to available plant uptake credits in kg/ha.
   * Standard agronomic rule of thumb for topsoil (15cm depth, bulk density ~1.33 g/cm3):
   * 1 ppm ~ 2.0 kg/ha in the root zone.
   * Bioavailability multipliers:
   * N availability from organic matter & mineral N: ~0.50
   * P availability index (strongly depends on pH 6.0-7.0): ~0.35 - 0.50
   * K exchangeable availability: ~0.40 - 0.60
   */
  static estimateSoilNutrientAvailability(soil: SoilMeasurementInput | null | undefined): SoilAvailabilityResult {
    const notes: string[] = [];

    if (!soil) {
      return {
        availableN: { kgPerHa: 15.0, confidence: 0.35, status: 'LOW' },
        availableP: { kgPerHa: 8.0, confidence: 0.35, status: 'LOW' },
        availableK: { kgPerHa: 25.0, confidence: 0.35, status: 'LOW' },
        overallConfidence: 0.35,
        measurementSource: 'ESTIMATED',
        freshnessDays: 365,
        soilHealthNotes: ['No empirical soil data found. Using conservative baseline estimates.'],
      };
    }

    const source = soil.source || 'SOIL_TEST';
    let sourceConfidence = source === 'SOIL_TEST' ? 0.9 : source === 'SENSOR' ? 0.7 : 0.45;

    // Calculate freshness penalty
    const sampleDate = soil.sampleDate ? new Date(soil.sampleDate) : new Date();
    const ageDays = Math.max(0, Math.floor((Date.now() - sampleDate.getTime()) / (1000 * 60 * 60 * 24)));
    if (ageDays > 180) {
      sourceConfidence *= 0.8;
      notes.push(`Soil measurement is ${ageDays} days old. Fresh soil testing recommended.`);
    } else {
      notes.push(`Soil sample is recent (${ageDays} days old).`);
    }

    // pH impact on P fixation
    const ph = soil.ph ?? 6.5;
    let pFixationMultiplier = 1.0;
    if (ph < 5.8) {
      pFixationMultiplier = 0.65;
      notes.push(`Acidic soil (pH ${ph}) decreases phosphorus availability due to aluminum/iron fixation.`);
    } else if (ph > 7.8) {
      pFixationMultiplier = 0.7;
      notes.push(`Alkaline soil (pH ${ph}) causes phosphorus fixation with calcium.`);
    } else {
      notes.push(`Soil pH (${ph}) is within optimal range for nutrient mobility.`);
    }

    // Organic carbon impact on N mineralization
    const oc = soil.organicCarbonPct ?? 1.0;
    const nOcBonus = oc > 1.2 ? 10.0 : oc < 0.6 ? -5.0 : 0;
    if (oc > 1.2) {
      notes.push(`High organic carbon (${oc}%) provides steady nitrogen mineralization.`);
    }

    // Convert ppm to effective kg/ha credits
    const nPpm = soil.availableNPpm ?? 30.0;
    const pPpm = soil.availablePPpm ?? 20.0;
    const kPpm = soil.availableKPpm ?? 120.0;

    const availableNkg = Math.max(0, Number(((nPpm * 2.0 * 0.45) + nOcBonus).toFixed(2)));
    const availablePkg = Math.max(0, Number((pPpm * 2.0 * 0.4 * pFixationMultiplier).toFixed(2)));
    const availableKkg = Math.max(0, Number((kPpm * 2.0 * 0.45).toFixed(2)));

    const getStatus = (val: number, low: number, opt: number, high: number): 'LOW' | 'MEDIUM' | 'OPTIMAL' | 'HIGH' => {
      if (val < low) return 'LOW';
      if (val < opt) return 'MEDIUM';
      if (val < high) return 'OPTIMAL';
      return 'HIGH';
    };

    return {
      availableN: {
        kgPerHa: availableNkg,
        confidence: Number(sourceConfidence.toFixed(2)),
        status: getStatus(availableNkg, 20, 35, 55),
      },
      availableP: {
        kgPerHa: availablePkg,
        confidence: Number(sourceConfidence.toFixed(2)),
        status: getStatus(availablePkg, 10, 20, 35),
      },
      availableK: {
        kgPerHa: availableKkg,
        confidence: Number(sourceConfidence.toFixed(2)),
        status: getStatus(availableKkg, 50, 90, 140),
      },
      overallConfidence: Number(sourceConfidence.toFixed(2)),
      measurementSource: source,
      freshnessDays: ageDays,
      soilHealthNotes: notes,
    };
  }
}
