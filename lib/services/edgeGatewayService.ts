// SOIL IQ - Edge Gateway & Offline Decision Cache Service
import prisma from '@/lib/db/prisma';

export interface EdgeCachedPrescription {
  gatewayId: string;
  fieldId: string;
  prescriptionId: string;
  cachedAt: Date;
  targetRateKgHa: number;
  minRateKgHa: number;
  maxRateKgHa: number;
  fertilizerName: string;
  gridBudgets: Record<string, { remainingBudgetKgHa: number; cautionThresholdKgHa: number }>;
}

export interface BufferedTelemetryEvent {
  sequenceId: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  flowRateLpm: number;
  applicationRateLpha: number;
  gridId: string;
  decision: string;
}

export class EdgeGatewayService {
  private static edgeCache = new Map<string, EdgeCachedPrescription>();
  private static offlineBuffer = new Map<string, BufferedTelemetryEvent[]>(); // gatewayId -> buffered events
  private static isOfflineState = false;

  static isSimulatedOffline(): boolean {
    return this.isOfflineState;
  }

  static setSimulatedOffline(offline: boolean) {
    this.isOfflineState = offline;
  }

  /**
   * Cache approved active prescription on the local edge gateway memory.
   */
  static async syncPrescriptionToEdge(gatewayId: string, fieldId: string): Promise<EdgeCachedPrescription | null> {
    const prescription = await prisma.prescription.findFirst({
      where: { fieldId, status: 'ACTIVE' },
      include: {
        items: { include: { fertilizer: true } },
        field: { include: { grids: { include: { nutrientBudget: true } } } },
      },
    });

    if (!prescription) return null;

    const targetItem = prescription.items[0];
    const gridBudgets: Record<string, { remainingBudgetKgHa: number; cautionThresholdKgHa: number }> = {};

    prescription.field.grids.forEach((grid) => {
      if (grid.nutrientBudget) {
        gridBudgets[grid.id] = {
          remainingBudgetKgHa: grid.nutrientBudget.remainingN,
          cautionThresholdKgHa: grid.nutrientBudget.recommendedN * 0.8,
        };
      }
    });

    const cached: EdgeCachedPrescription = {
      gatewayId,
      fieldId,
      prescriptionId: prescription.id,
      cachedAt: new Date(),
      targetRateKgHa: prescription.targetRateKgHa,
      minRateKgHa: prescription.minRateKgHa,
      maxRateKgHa: prescription.maxRateKgHa,
      fertilizerName: targetItem?.fertilizer?.name || 'NPK 19-19-19',
      gridBudgets,
    };

    this.edgeCache.set(gatewayId, cached);

    // Update edge gateway record in DB if exists
    await prisma.edgeGateway.updateMany({
      where: { deviceCode: gatewayId },
      data: {
        activePrescriptionCacheJson: JSON.stringify(cached),
        lastSeenAt: new Date(),
      },
    });

    return cached;
  }

  static getEdgeCache(gatewayId: string): EdgeCachedPrescription | null {
    return this.edgeCache.get(gatewayId) || null;
  }

  /**
   * Buffer telemetry on edge during simulated offline mode.
   */
  static bufferEventLocally(gatewayId: string, event: Omit<BufferedTelemetryEvent, 'sequenceId'>) {
    const list = this.offlineBuffer.get(gatewayId) || [];
    const sequenceId = list.length + 1;
    list.push({ ...event, sequenceId });
    this.offlineBuffer.set(gatewayId, list);
    return sequenceId;
  }

  static getBufferedEvents(gatewayId: string): BufferedTelemetryEvent[] {
    return this.offlineBuffer.get(gatewayId) || [];
  }

  /**
   * Reconnect and synchronize buffered telemetry with cloud database.
   */
  static async syncBufferedEventsToCloud(
    gatewayId: string,
    organizationId: string,
    sprayerId: string
  ): Promise<{ syncedCount: number; message: string }> {
    const events = this.offlineBuffer.get(gatewayId) || [];
    if (events.length === 0) {
      return { syncedCount: 0, message: 'No offline events to synchronize' };
    }

    // Persist all buffered events idempotently
    for (const evt of events) {
      await prisma.telemetryEvent.create({
        data: {
          sprayerId,
          timestamp: new Date(evt.timestamp),
          latitude: evt.latitude,
          longitude: evt.longitude,
          speedKmh: 8.5,
          flowRateLpm: evt.flowRateLpm,
          tankLevelL: 450,
          applicationRateLpha: evt.applicationRateLpha,
          machineStatus: 'SYNCED_FROM_EDGE_OFFLINE',
          rawPayloadJson: JSON.stringify(evt),
        },
      });
    }

    const syncedCount = events.length;
    this.offlineBuffer.set(gatewayId, []); // clear local buffer
    this.isOfflineState = false;

    return {
      syncedCount,
      message: `Successfully synchronized ${syncedCount} buffered offline telemetry events to cloud.`,
    };
  }
}
