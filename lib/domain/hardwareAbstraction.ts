// SOIL IQ - Hardware & Device Abstraction Layer
// Defines vendor-neutral interfaces for sprayer telemetry, soil sensor nodes,
// flow meters, and future MQTT / LoRaWAN gateway connections.

export interface SprayerDevice {
  deviceId: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber?: string;
  hardwareVersion: string;
  firmwareVersion: string;
  communicationProtocol: 'MQTT' | 'CAN_BUS_ISOBUS' | 'CELLULAR_LTE' | 'SIMULATOR';
  capabilities: {
    hasRtkGnss: boolean;
    hasIndividualNozzleControl: boolean;
    hasBoomSectionControl: boolean;
    boomWidthMeters: number;
    tankCapacityLiters: number;
  };
}

export interface SensorDevice {
  sensorId: string;
  nodeType: 'IN_SITU_SOIL_PROBE' | 'WEATHER_STATION' | 'TANK_LEVEL' | 'FLOW_METER';
  gridId?: string;
  batteryLevelPct: number;
  transmissionIntervalSeconds: number;
  lastTelemetryTimestamp: Date;
}

export interface TelemetryEvent {
  deviceId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDeg: number;
  flowRateLpm: number;
  tankLevelLiters: number;
  applicationRateLpha: number; // L/ha or kg/ha
  activeFertilizerId?: string;
  machineStatus: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'ERROR' | 'MANUAL' | 'AUTOMATIC';
  gnssFixQuality: 'RTK_FIXED' | 'RTK_FLOAT' | 'DGPS' | 'STANDALONE' | 'SIMULATED';
  rawPayload?: Record<string, unknown>;
}

export interface ApplicationEvent {
  eventId: string;
  sprayerId: string;
  gridId: string;
  fertilizerId: string;
  appliedQuantity: number;
  unit: string;
  durationSeconds: number;
  averageFlowRateLpm: number;
  timestamp: Date;
}

export interface ControlDecision {
  decisionId: string;
  sprayerId: string;
  gridId: string;
  decision: 'CONTINUE' | 'REDUCE' | 'STOP' | 'MANUAL_OVERRIDE';
  reason: string;
  targetApplicationRate: number; // e.g. L/ha
  actualApplicationRate: number;
  rateVariancePct: number;
  nutrientState: {
    consumedPct: number;
    remainingBudgetKgHa: number;
  };
  isAutomatic: boolean;
  timestamp: Date;
}

/**
 * Clean MQTT broker client abstraction interface.
 * Can be backed by an in-memory event bus or external MQTT/EMQX broker.
 */
export interface MqttBrokerClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(topic: string, callback: (event: TelemetryEvent) => void): Promise<void>;
  publish(topic: string, payload: Record<string, unknown>): Promise<void>;
  isConnected(): boolean;
}
