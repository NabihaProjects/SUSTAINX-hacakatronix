// SOIL IQ - MQTT Broker & Topic Architecture Service
import {
  DeviceMessageEnvelope,
  DeviceMessageEnvelopeSchema,
  DeviceMessageType,
} from '@/lib/domain/deviceMessageSchema';

export interface MqttConfig {
  brokerUrl: string;
  clientId: string;
  username?: string;
  password?: string;
  tlsEnabled: boolean;
}

export class MqttBrokerService {
  private static isConnectedState = true;
  private static messageLog: DeviceMessageEnvelope[] = [];

  /**
   * Reusable topic builder conforming to SOIL IQ standard convention:
   * soil-iq/{orgId}/devices/{deviceId}/{channel}
   */
  static buildTopic(
    orgId: string,
    deviceId: string,
    channel: 'telemetry' | 'status' | 'command' | 'ack' | 'events'
  ): string {
    const cleanOrg = orgId.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanDev = deviceId.replace(/[^a-zA-Z0-9_-]/g, '');
    return `soil-iq/${cleanOrg}/devices/${cleanDev}/${channel}`;
  }

  /**
   * Parse an incoming topic string into components
   */
  static parseTopic(topic: string): {
    orgId: string;
    deviceId: string;
    channel: string;
  } | null {
    const parts = topic.split('/');
    if (parts.length === 5 && parts[0] === 'soil-iq' && parts[2] === 'devices') {
      return {
        orgId: parts[1],
        deviceId: parts[3],
        channel: parts[4],
      };
    }
    return null;
  }

  /**
   * Validate and wrap an outbound or inbound message envelope
   */
  static formatEnvelope(
    organizationId: string,
    deviceId: string,
    type: DeviceMessageType,
    payload: Record<string, unknown>,
    messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  ): DeviceMessageEnvelope {
    const raw = {
      version: '1.0',
      messageId,
      deviceId,
      organizationId,
      timestamp: new Date().toISOString(),
      type,
      payload,
    };

    return DeviceMessageEnvelopeSchema.parse(raw);
  }

  /**
   * Simulated publish method for prototype
   */
  static async publish(
    topic: string,
    envelope: DeviceMessageEnvelope
  ): Promise<boolean> {
    DeviceMessageEnvelopeSchema.parse(envelope);
    this.messageLog.unshift(envelope);
    if (this.messageLog.length > 500) {
      this.messageLog.pop();
    }
    return true;
  }

  static getRecentMessages(limit = 20): DeviceMessageEnvelope[] {
    return this.messageLog.slice(0, limit);
  }

  static isConnected(): boolean {
    return this.isConnectedState;
  }

  static setConnectionState(connected: boolean) {
    this.isConnectedState = connected;
  }
}
