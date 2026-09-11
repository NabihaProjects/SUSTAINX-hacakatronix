// SOIL IQ - Grid Generation Engine
// Clips spatial grids strictly to field polygons and generates stable human-readable grid codes.

import { isPointInPolygon, calculatePolygonAreaHectares } from './units';

export interface GridCellDefinition {
  gridCode: string;
  rowIndex: number;
  colIndex: number;
  geometryGeoJson: string; // GeoJSON Polygon string
  calculatedArea: number; // in hectares
  status: 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED' | 'UNKNOWN';
}

export interface GridGenerationOptions {
  fieldCodePrefix?: string; // e.g. "F01"
  gridSizeMeters?: number; // e.g. 25, 50
  targetRows?: number; // for manual rows/cols
  targetCols?: number;
}

export class GridGenerationService {
  /**
   * Generates discrete spatial grid cells within the bounding box of a field polygon,
   * keeping only cells whose centroid falls strictly inside the field boundary.
   */
  static generateGridsForField(
    fieldPolygonCoords: [number, number][],
    options: GridGenerationOptions = {}
  ): GridCellDefinition[] {
    if (!fieldPolygonCoords || fieldPolygonCoords.length < 3) {
      throw new Error('Valid field polygon with at least 3 vertices is required.');
    }

    // 1. Calculate field bounding box [minLon, minLat, maxLon, maxLat]
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    for (const [lon, lat] of fieldPolygonCoords) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    const midLat = (minLat + maxLat) / 2.0;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLon = 111320 * Math.cos((midLat * Math.PI) / 180);

    const fieldWidthMeters = Math.max(20, (maxLon - minLon) * metersPerDegreeLon);
    const fieldHeightMeters = Math.max(20, (maxLat - minLat) * metersPerDegreeLat);

    let rows: number;
    let cols: number;

    if (options.targetRows && options.targetCols) {
      rows = Math.max(1, Math.min(20, options.targetRows));
      cols = Math.max(1, Math.min(20, options.targetCols));
    } else {
      const sizeMeters = Math.max(10, Math.min(200, options.gridSizeMeters || 30));
      cols = Math.max(2, Math.min(15, Math.ceil(fieldWidthMeters / sizeMeters)));
      rows = Math.max(2, Math.min(15, Math.ceil(fieldHeightMeters / sizeMeters)));
    }

    const stepLon = (maxLon - minLon) / cols;
    const stepLat = (maxLat - minLat) / rows;

    const prefix = options.fieldCodePrefix || 'F01';
    const cells: GridCellDefinition[] = [];
    let counter = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellMinLon = minLon + c * stepLon;
        const cellMaxLon = minLon + (c + 1) * stepLon;
        const cellMinLat = minLat + r * stepLat;
        const cellMaxLat = minLat + (r + 1) * stepLat;

        const centroid: [number, number] = [
          (cellMinLon + cellMaxLon) / 2.0,
          (cellMinLat + cellMaxLat) / 2.0,
        ];

        // Strict spatial filter: Keep only cells whose centroid lies within the field polygon
        if (isPointInPolygon(centroid, fieldPolygonCoords)) {
          const polygonCoords: [number, number][] = [
            [Number(cellMinLon.toFixed(6)), Number(cellMinLat.toFixed(6))],
            [Number(cellMaxLon.toFixed(6)), Number(cellMinLat.toFixed(6))],
            [Number(cellMaxLon.toFixed(6)), Number(cellMaxLat.toFixed(6))],
            [Number(cellMinLon.toFixed(6)), Number(cellMaxLat.toFixed(6))],
            [Number(cellMinLon.toFixed(6)), Number(cellMinLat.toFixed(6))],
          ];

          const areaHa = calculatePolygonAreaHectares(polygonCoords);
          const gridCode = `${prefix}-G${String(counter).padStart(3, '0')}`;

          cells.push({
            gridCode,
            rowIndex: r,
            colIndex: c,
            geometryGeoJson: JSON.stringify({
              type: 'Polygon',
              coordinates: [polygonCoords],
            }),
            calculatedArea: Math.max(0.01, areaHa),
            status: 'OPTIMAL',
          });

          counter++;
        }
      }
    }

    // Edge case safety: If no centroid was inside due to irregular sharp shape, take bounding box subdivisions
    if (cells.length === 0) {
      const defaultPolygon = [
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat],
      ];
      cells.push({
        gridCode: `${prefix}-G001`,
        rowIndex: 0,
        colIndex: 0,
        geometryGeoJson: JSON.stringify({
          type: 'Polygon',
          coordinates: [defaultPolygon],
        }),
        calculatedArea: calculatePolygonAreaHectares(defaultPolygon as [number, number][]),
        status: 'OPTIMAL',
      });
    }

    return cells;
  }
}
