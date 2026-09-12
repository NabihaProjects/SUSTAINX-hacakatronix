// SOIL IQ - Device Provisioning & Secure Identity Service
import crypto from 'crypto';
import prisma from '@/lib/db/prisma';

export interface ProvisionDeviceInput {
  organizationId: string;
  farmId?: string;
  fieldId?: string;
  gridId?: string;
  deviceCode: string;
  name: string;
  deviceType:
    | 'SOIL_SENSOR'
    | 'WEATHER_SENSOR'
    | 'RTK_GNSS'
    | 'FLOW_METER'
    | 'TANK_SENSOR'
    | 'SPRAYER'
    | 'EDGE_GATEWAY'
    | 'ACTUATOR'
    | 'MULTI_SENSOR';
  hardwareVersion?: string;
  firmwareVersion?: string;
  metadata?: Record<string, unknown>;
}

export interface ProvisionResult {
  device: {
    id: string;
    deviceCode: string;
    name: string;
    deviceType: string;
    credentialStatus: string;
    createdAt: Date;
  };
  credentials: {
    deviceId: string;
    clientId: string;
    // WARNING: Displayed only once upon provisioning, never retrievable again!
    deviceSecretPlaintext: string;
  };
}

export class DeviceProvisioningService {
  /**
   * Generates a 256-bit cryptographically secure token and its SHA-256 hash.
   */
  static generateSecret(): { plaintext: string; hash: string } {
    const plaintext = `siq_${crypto.randomBytes(24).toString('base64url')}`;
    const hash = crypto.createHash('sha256').update(plaintext).digest('hex');
    return { plaintext, hash };
  }

  /**
   * Verify an incoming device secret against the stored SHA-256 hash.
   */
  static verifySecret(plaintext: string, storedHash: string): boolean {
    const computed = crypto.createHash('sha256').update(plaintext).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  }

  /**
   * Provision a new hardware node into the organization.
   */
  static async provisionDevice(input: ProvisionDeviceInput): Promise<ProvisionResult> {
    const { plaintext, hash } = this.generateSecret();
    const clientId = `siq_${input.organizationId.substring(0, 6)}_${input.deviceCode.toLowerCase()}`;

    // Create or update device record
    const device = await prisma.device.upsert({
      where: { deviceCode: input.deviceCode },
      create: {
        organizationId: input.organizationId,
        farmId: input.farmId,
        fieldId: input.fieldId,
        gridId: input.gridId,
        deviceCode: input.deviceCode,
        name: input.name,
        deviceType: input.deviceType,
        hardwareVersion: input.hardwareVersion || 'v1.0',
        firmwareVersion: input.firmwareVersion || '1.2.0',
        secretHash: hash,
        clientId,
        credentialStatus: 'ACTIVE',
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
      update: {
        organizationId: input.organizationId,
        farmId: input.farmId,
        fieldId: input.fieldId,
        gridId: input.gridId,
        name: input.name,
        deviceType: input.deviceType,
        secretHash: hash,
        clientId,
        credentialStatus: 'ACTIVE',
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });

    // Create default connection record
    await prisma.deviceConnection.create({
      data: {
        organizationId: input.organizationId,
        deviceId: device.id,
        connectionType: 'MQTT',
        status: 'CONNECTED',
        endpoint: 'mqtts://broker.soiliq.farm:8883',
        clientIdentifier: clientId,
        protocolVersion: '1.0',
        firmwareVersion: device.firmwareVersion,
      },
    });

    return {
      device: {
        id: device.id,
        deviceCode: device.deviceCode,
        name: device.name,
        deviceType: device.deviceType,
        credentialStatus: device.credentialStatus,
        createdAt: device.createdAt,
      },
      credentials: {
        deviceId: device.id,
        clientId,
        deviceSecretPlaintext: plaintext,
      },
    };
  }

  /**
   * Revoke device credentials while preserving all historical telemetry and events.
   */
  static async revokeCredential(deviceId: string): Promise<boolean> {
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) return false;

    await prisma.device.update({
      where: { id: deviceId },
      data: { credentialStatus: 'REVOKED' },
    });

    // Update connection status
    await prisma.deviceConnection.updateMany({
      where: { deviceId },
      data: { status: 'DISCONNECTED', lastDisconnectedAt: new Date() },
    });

    return true;
  }

  /**
   * Simulated nearby device discovery flow
   */
  static getDiscoveredDevices() {
    return [
      {
        deviceCode: 'NODE-047',
        name: 'In-Situ Soil Probe #47',
        deviceType: 'SOIL_SENSOR',
        signalRssi: -58,
        macAddress: 'E4:5F:01:23:45:67',
        firmware: 'v1.2.0',
      },
      {
        deviceCode: 'NODE-048',
        name: 'Multi-Depth Soil Probe #48',
        deviceType: 'SOIL_SENSOR',
        signalRssi: -72,
        macAddress: 'E4:5F:01:23:45:88',
        firmware: 'v1.2.0',
      },
      {
        deviceCode: 'FLOW-02',
        name: 'Electromagnetic Flow Meter #02',
        deviceType: 'FLOW_METER',
        signalRssi: -64,
        macAddress: 'A0:B1:C2:34:56:78',
        firmware: 'v1.1.4',
      },
    ];
  }
}
