// SOIL IQ - Hardware & Device Abstraction Layer
// Vendor-neutral, protocol-agnostic interfaces for field hardware, RTK-GNSS,
// flow meters, tank sensors, actuators, and edge controllers.

export type GnssFixStatus = 'NO_FIX' | 'GNSS' | 'DGPS' | 'RTK_FLOAT' | 'RTK_FIXED';
export type PositionConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INVALID';

export interface PositionReading {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  headingDeg: number;
  speedKmh: number;
  fixStatus: GnssFixStatus;
  horizontalAccuracyM: number;
  satellitesCount: number;
  confidence: PositionConfidence;
  timestamp: Date;
}

export interface FlowReading {
  flowRateLpm: number;
  pressureBar?: number;
  totalizerLiters: number;
  sensorHealth: 'ONLINE' | 'WARNING' | 'FAULT';
  timestamp: Date;
}

export type TankThresholdStatus = 'NORMAL' | 'LOW' | 'CRITICAL' | 'EMPTY';

export interface TankReading {
  levelLiters: number;
  capacityLiters: number;
  percentage: number;
  thresholdStatus: TankThresholdStatus;
  sensorHealth: 'ONLINE' | 'FAULT';
  timestamp: Date;
}

export interface ActuatorCommand {
  actuatorId: string;
  commandType: 'VALVE_OPEN' | 'VALVE_CLOSE' | 'SET_PUMP_RATE' | 'SECTION_CONTROL';
  targetRatePct: number; // 0 to 100%
  timestamp: Date;
}

export interface ActuatorState {
  valveOpen: boolean;
  pumpRatePct: number;
  activeSections: boolean[];
  lastCommandAcknowledgedAt?: Date;
  state: 'OPTIMAL' | 'DEGRADED' | 'LOCKED_SAFE';
}

/**
 * Base adapter contract for all devices (physical or simulated)
 */
export interface DeviceAdapter {
  deviceId: string;
  deviceType: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getHealth(): Promise<{
    batteryPct: number;
    signalDbm: number;
    temperatureC?: number;
    firmwareVersion: string;
    errorCount: number;
  }>;
}

/**
 * RTK-GNSS receiver adapter
 */
export interface RtkGnssAdapter extends DeviceAdapter {
  getPosition(): Promise<PositionReading>;
  getHeading(): Promise<number>;
  getSpeed(): Promise<number>;
  getFixStatus(): Promise<GnssFixStatus>;
  getAccuracy(): Promise<number>;
}

/**
 * Flow meter & chemical totalizer adapter
 */
export interface FlowMeterAdapter extends DeviceAdapter {
  getFlowRate(): Promise<number>;
  getTotalizer(): Promise<number>;
  getPressure(): Promise<number | undefined>;
  getReading(): Promise<FlowReading>;
}

/**
 * Tank level sensor adapter
 */
export interface TankSensorAdapter extends DeviceAdapter {
  getLevel(): Promise<number>;
  getPercentage(): Promise<number>;
  getVolume(): Promise<number>;
  getReading(): Promise<TankReading>;
}

/**
 * Machine actuator & solenoid valve adapter
 */
export interface ActuatorAdapter extends DeviceAdapter {
  getState(): Promise<ActuatorState>;
  setValveState(open: boolean): Promise<boolean>;
  setPumpRate(ratePct: number): Promise<boolean>;
}

/**
 * Composite Sprayer Adapter
 */
export interface SprayerAdapter extends DeviceAdapter {
  rtk: RtkGnssAdapter;
  flowMeter: FlowMeterAdapter;
  tankSensor: TankSensorAdapter;
  actuator: ActuatorAdapter;
  getCurrentSwathWidthMeters(): number;
  getMachineStatus(): 'AUTOMATIC' | 'MANUAL' | 'SAFE_STOP' | 'ERROR';
}

/**
 * LoRaWAN Field Gateway integration bridge
 */
export interface LoRaWanAdapter {
  gatewayId: string;
  organizationId: string;
  uplinkDecode(payloadBase64: string, fPort: number): Record<string, unknown>;
  downlinkEncode(command: Record<string, unknown>): string;
}

/**
 * Helper function to calculate position confidence from RTK GNSS fix state
 */
export function calculatePositionConfidence(
  fixStatus: GnssFixStatus,
  horizontalAccuracyM: number
): PositionConfidence {
  if (fixStatus === 'NO_FIX' || horizontalAccuracyM > 5.0) {
    return 'INVALID';
  }
  if (fixStatus === 'RTK_FIXED' && horizontalAccuracyM <= 0.05) {
    return 'HIGH';
  }
  if (fixStatus === 'RTK_FLOAT' && horizontalAccuracyM <= 0.5) {
    return 'MEDIUM';
  }
  return 'LOW';
}

/**
 * Helper function to evaluate tank threshold status
 */
export function evaluateTankThreshold(percentage: number): TankThresholdStatus {
  if (percentage <= 3.0) return 'EMPTY';
  if (percentage <= 10.0) return 'CRITICAL';
  if (percentage <= 20.0) return 'LOW';
  return 'NORMAL';
}
