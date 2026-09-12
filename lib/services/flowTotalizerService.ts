// SOIL IQ - Chemical Flow Totalizer Service
// Implements discrete time-integral flow accumulation, deduplication, and multi-tier totals

export interface FlowSliceInput {
  eventId: string;
  sprayerId: string;
  gridId: string;
  fieldId: string;
  flowRateLpm: number;
  intervalSeconds: number;
  timestamp: Date;
}

export interface TotalizerMetrics {
  sessionTotalLiters: number;
  gridTotalLiters: number;
  fieldTotalLiters: number;
  lastEventId: string;
}

export class FlowTotalizerService {
  private static processedEvents = new Set<string>();
  private static sessionTotals = new Map<string, number>(); // sprayerId -> total liters
  private static gridTotals = new Map<string, number>(); // gridId -> total liters
  private static fieldTotals = new Map<string, number>(); // fieldId -> total liters

  /**
   * Integrate discrete flow slice into cumulative totals.
   * Prevents double-counting duplicate telemetry transmissions.
   */
  static recordFlowSlice(input: FlowSliceInput): {
    sliceLiters: number;
    metrics: TotalizerMetrics;
    isDuplicate: boolean;
  } {
    // 1. Idempotency check: ignore already processed slice
    if (this.processedEvents.has(input.eventId)) {
      return {
        sliceLiters: 0,
        metrics: {
          sessionTotalLiters: this.sessionTotals.get(input.sprayerId) || 0,
          gridTotalLiters: this.gridTotals.get(input.gridId) || 0,
          fieldTotalLiters: this.fieldTotals.get(input.fieldId) || 0,
          lastEventId: input.eventId,
        },
        isDuplicate: true,
      };
    }

    // 2. Compute discrete slice volume in liters:
    // Volume (L) = Flow (L/min) * (intervalSeconds / 60)
    const validRate = Math.max(0, input.flowRateLpm);
    const validSeconds = Math.max(0, input.intervalSeconds);
    const sliceLiters = Number(((validRate * validSeconds) / 60).toFixed(4));

    // 3. Update aggregators
    this.processedEvents.add(input.eventId);
    // Keep set bounded
    if (this.processedEvents.size > 20000) {
      const firstItems = Array.from(this.processedEvents).slice(0, 5000);
      firstItems.forEach((id) => this.processedEvents.delete(id));
    }

    const currentSession = (this.sessionTotals.get(input.sprayerId) || 0) + sliceLiters;
    const currentGrid = (this.gridTotals.get(input.gridId) || 0) + sliceLiters;
    const currentField = (this.fieldTotals.get(input.fieldId) || 0) + sliceLiters;

    this.sessionTotals.set(input.sprayerId, Number(currentSession.toFixed(4)));
    this.gridTotals.set(input.gridId, Number(currentGrid.toFixed(4)));
    this.fieldTotals.set(input.fieldId, Number(currentField.toFixed(4)));

    return {
      sliceLiters,
      metrics: {
        sessionTotalLiters: this.sessionTotals.get(input.sprayerId)!,
        gridTotalLiters: this.gridTotals.get(input.gridId)!,
        fieldTotalLiters: this.fieldTotals.get(input.fieldId)!,
        lastEventId: input.eventId,
      },
      isDuplicate: false,
    };
  }

  static getTotals(sprayerId: string, gridId?: string, fieldId?: string) {
    return {
      sessionTotalLiters: this.sessionTotals.get(sprayerId) || 0,
      gridTotalLiters: gridId ? this.gridTotals.get(gridId) || 0 : 0,
      fieldTotalLiters: fieldId ? this.fieldTotals.get(fieldId) || 0 : 0,
    };
  }

  static resetSession(sprayerId: string) {
    this.sessionTotals.set(sprayerId, 0);
  }

  static resetAll() {
    this.processedEvents.clear();
    this.sessionTotals.clear();
    this.gridTotals.clear();
    this.fieldTotals.clear();
  }
}
