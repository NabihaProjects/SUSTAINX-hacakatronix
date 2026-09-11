// SOIL IQ - Application History Aggregator Service
// Converts historical fertilizer application records into cumulative elemental nutrient contributions.

import { FertilizerCalculationService, FertilizerProfile } from './fertilizerCalculationService';

export interface ApplicationRecord {
  id: string;
  gridId: string;
  fertilizerId: string;
  fertilizer: FertilizerProfile;
  quantity: number;
  unit: string;
  applicationDate: Date | string;
  contributedN?: number;
  contributedP?: number;
  contributedK?: number;
}

export interface ApplicationHistorySummary {
  gridId: string;
  totalApplications: number;
  totalFertilizerKg: number;
  totalPureN: number; // pure kg N applied to the grid
  totalPureP: number; // pure kg P applied to the grid
  totalPureK: number; // pure kg K applied to the grid
  // Per hectare normalized values
  appliedNPerHa: number;
  appliedPPerHa: number;
  appliedKPerHa: number;
  lastApplicationDate: Date | null;
  applicationsBreakdown: {
    id: string;
    date: Date;
    fertilizerName: string;
    quantity: number;
    unit: string;
    pureN: number;
    pureP: number;
    pureK: number;
  }[];
}

export class ApplicationHistoryService {
  static aggregateGridApplications(
    gridId: string,
    gridAreaHectares: number,
    applications: ApplicationRecord[]
  ): ApplicationHistorySummary {
    let totalFertilizerKg = 0;
    let totalPureN = 0;
    let totalPureP = 0;
    let totalPureK = 0;
    let lastDate: Date | null = null;

    const breakdown = applications.map((app) => {
      const appDate = new Date(app.applicationDate);
      if (!lastDate || appDate > lastDate) {
        lastDate = appDate;
      }

      // If pre-calculated elemental values exist, use them; otherwise calculate
      let pureN = app.contributedN ?? 0;
      let pureP = app.contributedP ?? 0;
      let pureK = app.contributedK ?? 0;
      let massKg = app.quantity;

      if (app.contributedN === undefined && app.fertilizer) {
        const contribution = FertilizerCalculationService.calculateNutrientContribution(
          app.fertilizer,
          app.quantity,
          app.unit
        );
        pureN = contribution.contributedN;
        pureP = contribution.contributedP;
        pureK = contribution.contributedK;
        massKg = contribution.quantityKg;
      }

      totalFertilizerKg += massKg;
      totalPureN += pureN;
      totalPureP += pureP;
      totalPureK += pureK;

      return {
        id: app.id,
        date: appDate,
        fertilizerName: app.fertilizer?.name || 'Fertilizer Product',
        quantity: app.quantity,
        unit: app.unit,
        pureN: Number(pureN.toFixed(2)),
        pureP: Number(pureP.toFixed(2)),
        pureK: Number(pureK.toFixed(2)),
      };
    });

    const area = Math.max(0.001, gridAreaHectares);
    const appliedNPerHa = Number((totalPureN / area).toFixed(2));
    const appliedPPerHa = Number((totalPureP / area).toFixed(2));
    const appliedKPerHa = Number((totalPureK / area).toFixed(2));

    return {
      gridId,
      totalApplications: applications.length,
      totalFertilizerKg: Number(totalFertilizerKg.toFixed(2)),
      totalPureN: Number(totalPureN.toFixed(2)),
      totalPureP: Number(totalPureP.toFixed(2)),
      totalPureK: Number(totalPureK.toFixed(2)),
      appliedNPerHa,
      appliedPPerHa,
      appliedKPerHa,
      lastApplicationDate: lastDate,
      applicationsBreakdown: breakdown,
    };
  }
}
