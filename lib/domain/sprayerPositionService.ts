// SOIL IQ - Sprayer Spatial Position & Grid Detection Engine
// SENSE -> LOCATE -> CALCULATE -> APPLY -> MEASURE -> COMPARE -> CONTROL -> LEARN
// Validates RTK/GPS coordinates and resolves them into field and grid polygons.

import prisma from '@/lib/db/prisma';
import { isPointInPolygon } from '@/lib/domain/units';

export interface PositionResolutionResult {
  insideField: boolean;
  status: 'INSIDE' | 'OUTSIDE_FIELD' | 'UNKNOWN';
  farmId: string | null;
  fieldId: string | null;
  fieldName: string | null;
  gridId: string | null;
  gridCode: string | null;
  confidence: number;
  latitude: number;
  longitude: number;
  message?: string;
}

export interface GridSpatialGeometry {
  id: string;
  gridCode: string;
  fieldId: string;
  fieldName?: string;
  farmId?: string;
  geometryGeoJson: string;
}

export interface FieldSpatialGeometry {
  id: string;
  name: string;
  farmId: string;
  boundaryGeoJson: string;
}

export class SprayerPositionService {
  /**
   * Fast in-memory spatial resolution against provided grid and field geometries.
   * Prevents repeated database lookups during high-frequency simulation ticks.
   */
  static resolveCoordinates(
    latitude: number,
    longitude: number,
    fields: FieldSpatialGeometry[],
    grids: GridSpatialGeometry[]
  ): PositionResolutionResult {
    // 1. Basic coordinate sanity validation
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        insideField: false,
        status: 'UNKNOWN',
        farmId: null,
        fieldId: null,
        fieldName: null,
        gridId: null,
        gridCode: null,
        confidence: 0,
        latitude,
        longitude,
        message: 'Invalid coordinate values.',
      };
    }

    const pt: [number, number] = [longitude, latitude];

    // 2. Identify which field contains the coordinate
    let matchedField: FieldSpatialGeometry | null = null;
    for (const f of fields) {
      try {
        const parsed = JSON.parse(f.boundaryGeoJson);
        const ring = parsed.coordinates?.[0] || parsed.geometry?.coordinates?.[0];
        if (ring && isPointInPolygon(pt, ring)) {
          matchedField = f;
          break;
        }
      } catch {
        // Continue searching
      }
    }

    if (!matchedField) {
      return {
        insideField: false,
        status: 'OUTSIDE_FIELD',
        farmId: null,
        fieldId: null,
        fieldName: null,
        gridId: null,
        gridCode: null,
        confidence: 0,
        latitude,
        longitude,
        message: 'Sprayer position is outside all defined field boundaries.',
      };
    }

    // 3. Identify which grid inside this field contains the coordinate
    const candidateGrids = grids.filter((g) => g.fieldId === matchedField!.id);
    let matchedGrid: GridSpatialGeometry | null = null;

    for (const g of candidateGrids) {
      try {
        const parsed = JSON.parse(g.geometryGeoJson);
        const ring = parsed.coordinates?.[0] || parsed.geometry?.coordinates?.[0];
        if (ring && isPointInPolygon(pt, ring)) {
          matchedGrid = g;
          break;
        }
      } catch {
        // Continue
      }
    }

    if (matchedGrid) {
      return {
        insideField: true,
        status: 'INSIDE',
        farmId: matchedField.farmId,
        fieldId: matchedField.id,
        fieldName: matchedField.name,
        gridId: matchedGrid.id,
        gridCode: matchedGrid.gridCode,
        confidence: 0.98,
        latitude,
        longitude,
      };
    }

    // Fallback: If inside field polygon but slightly outside grid subdivision (e.g. margin/edge)
    return {
      insideField: true,
      status: 'INSIDE',
      farmId: matchedField.farmId,
      fieldId: matchedField.id,
      fieldName: matchedField.name,
      gridId: candidateGrids[0]?.id || null,
      gridCode: candidateGrids[0]?.gridCode || null,
      confidence: 0.75,
      latitude,
      longitude,
      message: 'Position resolved to field boundary edge.',
    };
  }

  /**
   * Database-backed resolution for an organization.
   */
  static async resolvePositionToGrid(
    latitude: number,
    longitude: number,
    organizationId: string
  ): Promise<PositionResolutionResult> {
    const fields = await prisma.field.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: { id: true, name: true, farmId: true, boundaryGeoJson: true },
    });

    const grids = await prisma.grid.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, gridCode: true, fieldId: true, geometryGeoJson: true },
    });

    return this.resolveCoordinates(latitude, longitude, fields, grids);
  }
}
