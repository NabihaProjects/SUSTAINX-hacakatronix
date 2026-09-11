// SOIL IQ - Fertilizer Contribution Engine
// CONVENTION: Elemental N, P, K.
// All nutrient values internally represent pure elemental nitrogen (N), pure phosphorus (P), and pure potassium (K) in kilograms.
// Agricultural commercial label convention: N is elemental, P is expressed as P2O5, K as K2O.
// To ensure consistent agronomic precision:
// P elemental = P2O5 * 0.4364
// K elemental = K2O * 0.8302
// In our database catalog, N%, P%, K% store the effective elemental percentages.

export interface FertilizerProfile {
  id?: string;
  name: string;
  formulation: string;
  nPercent: number; // e.g. 19.0 for 19% N
  pPercent: number; // e.g. 19.0 for 19% P
  kPercent: number; // e.g. 19.0 for 19% K
  densityKgPerL?: number; // default 1.0 for liquids, 1.0 for solids
  physicalForm?: string;
}

export interface NutrientContribution {
  fertilizerName: string;
  formulation: string;
  quantityApplied: number;
  unit: string;
  quantityKg: number;
  contributedN: number; // pure kg N
  contributedP: number; // pure kg P
  contributedK: number; // pure kg K
  totalPureNutrientsKg: number;
}

export class FertilizerCalculationService {
  /**
   * Calculates the elemental nutrient contribution (N, P, K in kg)
   * from an applied physical fertilizer quantity.
   */
  static calculateNutrientContribution(
    fertilizer: FertilizerProfile,
    quantity: number,
    unit: string = 'kg'
  ): NutrientContribution {
    if (quantity < 0) {
      throw new Error('Fertilizer quantity cannot be negative');
    }

    // Normalize volume (liters) or mass (lbs) to kg
    let massKg = quantity;
    const lowerUnit = unit.toLowerCase();

    if (lowerUnit === 'l' || lowerUnit === 'liter' || lowerUnit === 'liters') {
      massKg = quantity * (fertilizer.densityKgPerL ?? 1.0);
    } else if (lowerUnit === 'lb' || lowerUnit === 'lbs' || lowerUnit === 'pounds') {
      massKg = quantity * 0.45359237;
    }

    const contributedN = Number(((massKg * fertilizer.nPercent) / 100.0).toFixed(4));
    const contributedP = Number(((massKg * fertilizer.pPercent) / 100.0).toFixed(4));
    const contributedK = Number(((massKg * fertilizer.kPercent) / 100.0).toFixed(4));
    const totalPureNutrientsKg = Number((contributedN + contributedP + contributedK).toFixed(4));

    return {
      fertilizerName: fertilizer.name,
      formulation: fertilizer.formulation,
      quantityApplied: quantity,
      unit,
      quantityKg: Number(massKg.toFixed(4)),
      contributedN,
      contributedP,
      contributedK,
      totalPureNutrientsKg,
    };
  }

  /**
   * Calculates the required physical fertilizer product quantity (in kg)
   * needed to deliver a target amount of a limiting nutrient.
   */
  static calculateRequiredProductQuantity(
    fertilizer: FertilizerProfile,
    targetNutrient: 'N' | 'P' | 'K',
    targetAmountKg: number
  ): number {
    const percentage =
      targetNutrient === 'N'
        ? fertilizer.nPercent
        : targetNutrient === 'P'
        ? fertilizer.pPercent
        : fertilizer.kPercent;

    if (percentage <= 0) {
      throw new Error(`Fertilizer ${fertilizer.name} does not contain ${targetNutrient}`);
    }

    return Number(((targetAmountKg / percentage) * 100.0).toFixed(2));
  }
}
