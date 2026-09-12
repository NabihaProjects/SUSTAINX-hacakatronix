// SOIL IQ - Mobile Offline Synchronization Service
import prisma from '@/lib/db/prisma';

export interface OfflineAction {
  actionId: string;
  type: 'FIELD_NOTE' | 'ACKNOWLEDGE_ALERT' | 'COMPLETE_TASK';
  organizationId: string;
  payload: Record<string, unknown>;
  queuedAt: string;
}

export interface SyncResult {
  successfulCount: number;
  failedCount: number;
  conflicts: Array<{ actionId: string; reason: string }>;
}

export class MobileSyncService {
  private static localActionQueue: OfflineAction[] = [];

  /**
   * Enqueue a safe field operator action while offline
   */
  static queueOfflineAction(action: OfflineAction) {
    // Only safe non-actuation actions are permitted to be queued offline
    if (
      action.type !== 'FIELD_NOTE' &&
      action.type !== 'ACKNOWLEDGE_ALERT' &&
      action.type !== 'COMPLETE_TASK'
    ) {
      throw new Error(
        `Unsafe action ${action.type} cannot be queued offline. Physical machine control requires live validated connectivity.`
      );
    }

    // Deduplicate idempotently by actionId
    const existingIndex = this.localActionQueue.findIndex((a) => a.actionId === action.actionId);
    if (existingIndex >= 0) {
      this.localActionQueue[existingIndex] = action;
      return this.localActionQueue.length;
    }

    this.localActionQueue.push(action);
    return this.localActionQueue.length;
  }

  static getQueuedActions(): OfflineAction[] {
    return [...this.localActionQueue];
  }

  /**
   * Replay and synchronize all queued actions to the server
   */
  static async processSyncQueue(): Promise<SyncResult> {
    const queue = [...this.localActionQueue];
    this.localActionQueue = [];

    let successfulCount = 0;
    let failedCount = 0;
    const conflicts: Array<{ actionId: string; reason: string }> = [];

    for (const action of queue) {
      try {
        if (action.type === 'FIELD_NOTE') {
          const p = action.payload as {
            gridId?: string;
            fieldId?: string;
            farmId?: string;
            text: string;
            category: string;
            photoUrl?: string;
            userId?: string;
          };

          await prisma.fieldNote.create({
            data: {
              organizationId: action.organizationId,
              gridId: p.gridId,
              fieldId: p.fieldId,
              farmId: p.farmId,
              text: p.text,
              category: p.category || 'SOIL',
              photoUrl: p.photoUrl,
              userId: p.userId,
              isOfflineQueued: true,
            },
          });
          successfulCount++;
        } else if (action.type === 'ACKNOWLEDGE_ALERT') {
          const p = action.payload as { alertId: string; userId?: string };
          const alert = await prisma.alert.findUnique({
            where: { id: p.alertId },
          });

          if (!alert) {
            conflicts.push({
              actionId: action.actionId,
              reason: 'Target alert was deleted on server during offline period',
            });
            failedCount++;
          } else {
            await prisma.alert.update({
              where: { id: p.alertId },
              data: { status: 'ACKNOWLEDGED', resolvedByUserId: p.userId },
            });
            successfulCount++;
          }
        } else if (action.type === 'COMPLETE_TASK') {
          const p = action.payload as { taskId: string; userId?: string };
          const task = await prisma.operatorTask.findUnique({
            where: { id: p.taskId },
          });

          if (!task) {
            conflicts.push({
              actionId: action.actionId,
              reason: 'Target task was removed or re-assigned on server',
            });
            failedCount++;
          } else {
            await prisma.operatorTask.update({
              where: { id: p.taskId },
              data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                assigneeId: p.userId,
              },
            });
            successfulCount++;
          }
        }
      } catch (err: unknown) {
        failedCount++;
        conflicts.push({
          actionId: action.actionId,
          reason: err instanceof Error ? err.message : 'Database synchronization error',
        });
      }
    }

    return {
      successfulCount,
      failedCount,
      conflicts,
    };
  }

  static clearQueue() {
    this.localActionQueue = [];
  }
}
