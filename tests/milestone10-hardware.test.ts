// SOIL IQ - Milestone 10 Hardware & IoT Integration Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePositionConfidence,
  evaluateTankThreshold,
} from '../lib/domain/hardwareAbstraction';
import {
  DeviceMessageEnvelopeSchema,
  TelemetryPayloadSchema,
} from '../lib/domain/deviceMessageSchema';
import { MqttBrokerService } from '../lib/services/mqttBrokerService';
import { FlowTotalizerService } from '../lib/services/flowTotalizerService';
import { DeviceProvisioningService } from '../lib/services/deviceProvisioningService';
import { EdgeGatewayService } from '../lib/services/edgeGatewayService';

console.log('====================================================');
console.log('   SOIL IQ - MILESTONE 10 HARDWARE & IoT TESTS      ');
console.log('====================================================\n');

let passCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    throw err;
  }
}

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    throw err;
  }
}

async function main() {
  console.log('--- TEST GROUP 1: RTK-GNSS & Position Confidence ---');
  runTest('RTK_FIXED with <= 5cm yields HIGH confidence', () => {
    const conf = calculatePositionConfidence('RTK_FIXED', 0.021);
    assert.equal(conf, 'HIGH');
  });

  runTest('RTK_FLOAT with <= 50cm yields MEDIUM confidence', () => {
    const conf = calculatePositionConfidence('RTK_FLOAT', 0.25);
    assert.equal(conf, 'MEDIUM');
  });

  runTest('Standard GNSS yields LOW confidence', () => {
    const conf = calculatePositionConfidence('GNSS', 1.8);
    assert.equal(conf, 'LOW');
  });

  runTest('NO_FIX triggers INVALID confidence (Safe Machine Stop)', () => {
    const conf = calculatePositionConfidence('NO_FIX', 99.0);
    assert.equal(conf, 'INVALID');
  });

  console.log('\n--- TEST GROUP 2: Tank Sensor Thresholds ---');
  runTest('Tank at 68% evaluates to NORMAL', () => {
    assert.equal(evaluateTankThreshold(68), 'NORMAL');
  });

  runTest('Tank at 18% evaluates to LOW', () => {
    assert.equal(evaluateTankThreshold(18), 'LOW');
  });

  runTest('Tank at 8% evaluates to CRITICAL', () => {
    assert.equal(evaluateTankThreshold(8), 'CRITICAL');
  });

  runTest('Tank at 2% evaluates to EMPTY (Triggers Automatic Stop)', () => {
    assert.equal(evaluateTankThreshold(2), 'EMPTY');
  });

  console.log('\n--- TEST GROUP 3: MQTT Topic Architecture & Envelope Schemas ---');
  runTest('Generates standard reusable topic: soil-iq/{org}/devices/{dev}/{chan}', () => {
    const topic = MqttBrokerService.buildTopic('green-valley', 'FLOW-01', 'telemetry');
    assert.equal(topic, 'soil-iq/green-valley/devices/FLOW-01/telemetry');
  });

  runTest('Parses valid SOIL IQ topic into components', () => {
    const parsed = MqttBrokerService.parseTopic('soil-iq/green-valley/devices/FLOW-01/telemetry');
    assert.deepEqual(parsed, {
      orgId: 'green-valley',
      deviceId: 'FLOW-01',
      channel: 'telemetry',
    });
  });

  runTest('Validates versioned message envelope with Zod', () => {
    const envelope = MqttBrokerService.formatEnvelope('green-valley', 'FLOW-01', 'TELEMETRY', {
      flowRate: 12.4,
      totalizer: 142.6,
    });
    const parsed = DeviceMessageEnvelopeSchema.safeParse(envelope);
    assert.equal(parsed.success, true);
    assert.equal(envelope.version, '1.0');
  });

  console.log('\n--- TEST GROUP 4: Flow Totalizer Integral Calculation ---');
  runTest('Calculates discrete flow volume slice correctly: Flow * dt / 60', () => {
    FlowTotalizerService.resetAll();
    const res = FlowTotalizerService.recordFlowSlice({
      eventId: 'evt_001',
      sprayerId: 'SP-01',
      gridId: 'G001',
      fieldId: 'F01',
      flowRateLpm: 12.0,
      intervalSeconds: 5.0,
      timestamp: new Date(),
    });
    // 12 L/min * (5/60 min) = 1.0 L
    assert.equal(res.sliceLiters, 1.0);
    assert.equal(res.metrics.sessionTotalLiters, 1.0);
    assert.equal(res.isDuplicate, false);
  });

  runTest('Idempotently prevents double-counting duplicate telemetry event ID', () => {
    const res = FlowTotalizerService.recordFlowSlice({
      eventId: 'evt_001', // duplicate
      sprayerId: 'SP-01',
      gridId: 'G001',
      fieldId: 'F01',
      flowRateLpm: 12.0,
      intervalSeconds: 5.0,
      timestamp: new Date(),
    });
    assert.equal(res.sliceLiters, 0);
    assert.equal(res.metrics.sessionTotalLiters, 1.0);
    assert.equal(res.isDuplicate, true);
  });

  console.log('\n--- TEST GROUP 5: Cryptographic Device Credentials ---');
  runTest('Generates 256-bit secure token with non-reversible SHA-256 hash', () => {
    const cred = DeviceProvisioningService.generateSecret();
    assert.ok(cred.plaintext.startsWith('siq_'));
    assert.equal(cred.hash.length, 64);
    assert.notEqual(cred.plaintext, cred.hash);
  });

  runTest('Constant-time hash verification validates matching secret', () => {
    const cred = DeviceProvisioningService.generateSecret();
    const isValid = DeviceProvisioningService.verifySecret(cred.plaintext, cred.hash);
    assert.equal(isValid, true);
    const isInvalid = DeviceProvisioningService.verifySecret('siq_tampered', cred.hash);
    assert.equal(isInvalid, false);
  });

  console.log('\n--- TEST GROUP 6: Edge Gateway Offline Buffering ---');
  runTest('Buffers telemetry locally on edge during simulated offline scenario', () => {
    EdgeGatewayService.setSimulatedOffline(true);
    const seq = EdgeGatewayService.bufferEventLocally('GW-01', {
      timestamp: new Date().toISOString(),
      latitude: 17.123,
      longitude: 80.456,
      flowRateLpm: 12.4,
      applicationRateLpha: 41.6,
      gridId: 'G001',
      decision: 'CONTINUE',
    });
    assert.equal(seq, 1);
    const buffered = EdgeGatewayService.getBufferedEvents('GW-01');
    assert.equal(buffered.length, 1);
    assert.equal(buffered[0].sequenceId, 1);
    EdgeGatewayService.setSimulatedOffline(false);
  });

  console.log('====================================================');
  console.log(`  TEST RESULTS: ${passCount} PASSED, 0 FAILED`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
