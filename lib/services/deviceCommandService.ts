// SOIL IQ - Device Command Service with Hardware Safety Gate & Idempotency
import prisma from '@/lib/db/prisma';
import { AlertService } from './alertService';

export interface DispatchCommandInput {
  organizationId: string;
  deviceId: string;
  command:
    | 'SET_APPLICATION_RATE'
    | 'STOP_APPLICATION'
    | 'START_APPLICATION'
    | 'PAUSE_APPLICATION'
    | 'RESET_DEVICE'
    | 'REQUEST_STATUS'
    | 'SET_MODE';
  parameters?: Record<string, unknown>;
  idempotencyKey: string;
  operatorUserId?: string;
  timeoutMs?: number;
}

export class DeviceCommandService {
  /**
   * Hardware Safety Gate flag.
   * By default FALSE for prototype safety.
   * Real hardware actuation is NEVER enabled from browser without explicit admin checklist verification.
   */
  private static physicalControlEnabled = false;

  static isPhysicalControlEnabled(): boolean {
    return this.physicalControlEnabled;
  }

  static setPhysicalControlEnabled(
    enabled: boolean,
    checklistVerified = false
  ): { success: boolean; message: string } {
    if (enabled && !checklistVerified) {
      return {
        success: false,
        message:
          'Safety checklist must be explicitly completed and verified before enabling physical machine control.',
      };
    }
    this.physicalControlEnabled = enabled;
    return {
      success: true,
      message: enabled
        ? 'Physical control safety gate unlocked — hardware verification required.'
        : 'Safety gate active — all physical machine controls remain simulated.',
    };
  }

  /**
   * Dispatch a typed device command with idempotency and timeout monitoring.
   */
  static async dispatchCommand(input: DispatchCommandInput) {
    // 1. Check idempotency: Return existing command if key was already submitted
    const existing = await prisma.deviceCommand.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });

    if (existing) {
      return {
        command: existing,
        isDuplicate: true,
      };
    }

    // 2. Validate device state
    const device = await prisma.device.findUnique({
      where: { id: input.deviceId },
    });

    if (!device) {
      throw new Error(`Target device ${input.deviceId} not found`);
    }

    if (device.credentialStatus !== 'ACTIVE') {
      throw new Error(`Device credentials are ${device.credentialStatus} - cannot dispatch commands`);
    }

    // 3. Create command record
    const command = await prisma.deviceCommand.create({
      data: {
        organizationId: input.organizationId,
        deviceId: input.deviceId,
        command: input.command,
        parametersJson: input.parameters ? JSON.stringify(input.parameters) : null,
        status: 'SENT',
        idempotencyKey: input.idempotencyKey,
        operatorUserId: input.operatorUserId,
      },
    });

    // 4. In prototype/simulation mode or when safety gate is active:
    // Automatically acknowledge command within simulated roundtrip latency
    const isPhysical = this.physicalControlEnabled;
    const timeoutDuration = input.timeoutMs || 5000;

    if (!isPhysical) {
      // Immediate simulated ACK
      setTimeout(async () => {
        try {
          await prisma.deviceCommand.update({
            where: { id: command.id },
            data: {
              status: 'ACKNOWLEDGED',
              acknowledgedAt: new Date(),
            },
          });
        } catch {
          // ignore background completion errors
        }
      }, 50);
    } else {
      // In real hardware mode: start timeout monitor
      setTimeout(async () => {
        try {
          const current = await prisma.deviceCommand.findUnique({
            where: { id: command.id },
          });
          if (current && current.status === 'SENT') {
            await prisma.deviceCommand.update({
              where: { id: command.id },
              data: {
                status: 'TIMEOUT',
                errorCode: 'ERR_HARDWARE_ACK_TIMEOUT',
              },
            });

            // Trigger safety alert
            await AlertService.triggerAlert({
              organizationId: input.organizationId,
              deviceId: input.deviceId,
              severity: 'CRITICAL',
              category: 'HARDWARE',
              title: 'Command Acknowledgement Timeout',
              message: `Device ${device.deviceCode} failed to acknowledge command ${input.command} within ${timeoutDuration}ms. Machine entering safe stop simulation.`,
            });
          }
        } catch {
          // ignore
        }
      }, timeoutDuration);
    }

    return {
      command,
      isDuplicate: false,
      isSimulated: !isPhysical,
    };
  }

  static async acknowledgeCommand(
    commandId: string,
    success = true,
    errorCode?: string
  ) {
    return prisma.deviceCommand.update({
      where: { id: commandId },
      data: {
        status: success ? 'ACKNOWLEDGED' : 'FAILED',
        acknowledgedAt: new Date(),
        errorCode: errorCode || null,
      },
    });
  }
}
