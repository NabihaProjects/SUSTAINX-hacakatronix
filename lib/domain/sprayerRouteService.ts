// SOIL IQ - Sprayer Route Generation Service
// Generates realistic coverage paths (Boustrophedon serpentine sweep, straight lines, waypoints)
// across field spatial grids for simulation and machine tracking.

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  gridId?: string;
  gridCode?: string;
  headingDeg: number;
  targetSpeedKmh: number;
  sequenceIndex: number;
}

export interface GridRouteInfo {
  id: string;
  gridCode: string;
  rowIndex: number;
  colIndex: number;
  centerLat: number;
  centerLng: number;
}

export class SprayerRouteService {
  /**
   * Generates a Boustrophedon serpentine grid-sweep route across field grids.
   * Alternates directions across rows (e.g. Row 0: Left->Right, Row 1: Right->Left).
   */
  static generateGridSweepRoute(
    grids: GridRouteInfo[],
    defaultSpeedKmh = 12.0,
    stepsBetweenGrids = 4
  ): RouteWaypoint[] {
    if (grids.length === 0) return [];

    // Group grids by rowIndex
    const rowMap = new Map<number, GridRouteInfo[]>();
    for (const g of grids) {
      if (!rowMap.has(g.rowIndex)) {
        rowMap.set(g.rowIndex, []);
      }
      rowMap.get(g.rowIndex)!.push(g);
    }

    const sortedRowIndices = Array.from(rowMap.keys()).sort((a, b) => a - b);
    const orderedGridCenters: GridRouteInfo[] = [];

    sortedRowIndices.forEach((rowIndex, idx) => {
      const rowGrids = rowMap.get(rowIndex)!;
      // Alternate left-to-right and right-to-left
      if (idx % 2 === 0) {
        rowGrids.sort((a, b) => a.colIndex - b.colIndex);
      } else {
        rowGrids.sort((a, b) => b.colIndex - a.colIndex);
      }
      orderedGridCenters.push(...rowGrids);
    });

    // Interpolate waypoints between grid centers so machine travels smoothly
    const waypoints: RouteWaypoint[] = [];
    let seq = 0;

    for (let i = 0; i < orderedGridCenters.length; i++) {
      const current = orderedGridCenters[i];
      const next = orderedGridCenters[i + 1] || current;

      const heading = this.calculateHeading(
        current.centerLat,
        current.centerLng,
        next.centerLat,
        next.centerLng
      );

      // Add intermediate steps towards next grid
      const steps = i === orderedGridCenters.length - 1 ? 1 : stepsBetweenGrids;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const lat = current.centerLat + (next.centerLat - current.centerLat) * t;
        const lng = current.centerLng + (next.centerLng - current.centerLng) * t;

        waypoints.push({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          gridId: current.id,
          gridCode: current.gridCode,
          headingDeg: heading,
          targetSpeedKmh: defaultSpeedKmh,
          sequenceIndex: seq++,
        });
      }
    }

    return waypoints;
  }

  /**
   * Calculates compass heading in degrees (0 = North, 90 = East, 180 = South, 270 = West).
   */
  static calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);

    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    brng = (brng + 360) % 360;
    return Math.round(brng);
  }

  /**
   * Calculates approximate distance in meters between two lat/lon coordinates.
   */
  static calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }
}
