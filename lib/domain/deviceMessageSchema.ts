import { z } from 'zod';

/**
 * SOIL IQ - Versioned Device Message Contract
 * Standardized envelope for MQTT and HTTP telemetry, commands, and acknowledgements.
 */

export const DeviceMessageTypeSchema = z.enum([
  'TELEMETRY',
  'STATUS',
  'HEARTBEAT',
  'EVENT',
  'ACK',
  'COMMAND_RESPONSE',
]);

export type DeviceMessageType = z.infer<typeof DeviceMessageTypeSchema>;

export const TelemetryPayloadSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).max(100).default(0),
  headingDeg: z.number().min(0).max(360).default(0),
  flowRateLpm: z.number().min(0).default(0),
  tankLevelLiters: z.number().min(0).default(0),
  tankLevelPct: z.number().min(0).max(100).default(100),
  pressureBar: z.number().min(0).optional(),
  applicationRateLpha: z.number().min(0).default(0),
  gnssFixStatus: z.enum(['NO_FIX', 'GNSS', 'DGPS', 'RTK_FLOAT', 'RTK_FIXED']).default('RTK_FIXED'),
  horizontalAccuracyM: z.number().min(0).default(0.02),
  satellites: z.number().int().min(0).default(18),
  activeFertilizerId: z.string().optional(),
  machineStatus: z.enum(['ONLINE', 'OFFLINE', 'WARNING', 'ERROR', 'MANUAL', 'AUTOMATIC']).default('AUTOMATIC'),
  totalizerLiters: z.number().min(0).optional(),
});

export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;

export const StatusPayloadSchema = z.object({
  batteryPct: z.number().min(0).max(100),
  signalDbm: z.number().min(-140).max(0),
  temperatureC: z.number().optional(),
  firmwareVersion: z.string(),
  hardwareVersion: z.string(),
  uptimeSeconds: z.number().int().min(0),
  errorCount: z.number().int().min(0).default(0),
  communicationQuality: z.enum(['EXCELLENT', 'GOOD', 'DEGRADED', 'POOR']).default('GOOD'),
});

export type StatusPayload = z.infer<typeof StatusPayloadSchema>;

export const CommandResponsePayloadSchema = z.object({
  commandId: z.string(),
  command: z.string(),
  status: z.enum(['ACKNOWLEDGED', 'EXECUTING', 'COMPLETED', 'FAILED', 'REJECTED']),
  errorCode: z.string().optional(),
  executionTimeMs: z.number().optional(),
});

export type CommandResponsePayload = z.infer<typeof CommandResponsePayloadSchema>;

export const DeviceMessageEnvelopeSchema = z.object({
  version: z.literal('1.0'),
  messageId: z.string().min(1),
  deviceId: z.string().min(1),
  organizationId: z.string().min(1),
  timestamp: z.string().datetime(),
  type: DeviceMessageTypeSchema,
  payload: z.record(z.string(), z.unknown()),
});

export type DeviceMessageEnvelope = z.infer<typeof DeviceMessageEnvelopeSchema>;
