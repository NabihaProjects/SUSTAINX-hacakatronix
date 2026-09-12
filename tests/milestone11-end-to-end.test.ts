// SOIL IQ - Milestone 11 End-to-End Integration & Judge Mode Test Suite
import assert from 'node:assert/strict';
import { ApplicationSessionService } from '../lib/services/applicationSessionService';
import { JudgeSceneEngine, JUDGE_SCENES } from '../lib/services/JudgeSceneEngine';

console.log('====================================================');
console.log('  SOIL IQ - MILESTONE 11 END-TO-END & JUDGE TESTS   ');
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

async function main() {
  console.log('--- TEST GROUP 1: Canonical Correlation ID & Session Architecture ---');
  runTest('Generates standard correlation ID: OP-YYYY-NNNNN', () => {
    const cid = ApplicationSessionService.generateCorrelationId(47);
    const year = new Date().getFullYear();
    assert.equal(cid, `OP-${year}-00047`);
  });

  runTest('Correlation ID is uniquely formatted across sequence numbers', () => {
    const cid1 = ApplicationSessionService.generateCorrelationId(1);
    const cid2 = ApplicationSessionService.generateCorrelationId(2);
    assert.notEqual(cid1, cid2);
  });

  console.log('\n--- TEST GROUP 2: Judge Scene Engine & Presentation Flow ---');
  runTest('Initializes with Scene 1 (Normal precision application)', () => {
    JudgeSceneEngine.reset();
    const scene = JudgeSceneEngine.getCurrentScene();
    assert.equal(scene.id, 1);
    assert.equal(scene.code, 'NORMAL');
    assert.equal(scene.sprayer.decision, 'CONTINUE');
  });

  runTest('Steps sequentially through 10 deterministic scenes', () => {
    JudgeSceneEngine.reset();
    assert.equal(JudgeSceneEngine.getTotalScenes(), 10);
    const s2 = JudgeSceneEngine.nextScene();
    assert.equal(s2.id, 2);
    assert.equal(s2.code, 'TRANSITION');
  });

  runTest('Supports instant scenario recovery jump to HEAVY_RAIN', () => {
    const rainScene = JudgeSceneEngine.jumpToCode('HEAVY_RAIN');
    assert.equal(rainScene.code, 'HEAVY_RAIN');
    assert.equal(rainScene.sprayer.environment, 'HIGH_RAIN_RISK');
    assert.equal(rainScene.sprayer.decision, 'DEFER');
  });

  runTest('Closed-Loop Stop scene triggers safe machine halt with zero flow', () => {
    const stopScene = JudgeSceneEngine.jumpToCode('CLOSED_LOOP_STOP');
    assert.equal(stopScene.sprayer.decision, 'STOP');
    assert.equal(stopScene.sprayer.actualFlowLpm, 0.0);
    assert.equal(stopScene.sprayer.actualRateKgHa, 0.0);
  });

  runTest('Maintains speed multipliers from 1X to 5X', () => {
    JudgeSceneEngine.setSpeed(2);
    assert.equal(JudgeSceneEngine.getSpeed(), 2);
    JudgeSceneEngine.setSpeed(5);
    assert.equal(JudgeSceneEngine.getSpeed(), 5);
    JudgeSceneEngine.setSpeed(10); // clamped to 5
    assert.equal(JudgeSceneEngine.getSpeed(), 5);
  });

  console.log('\n--- TEST GROUP 3: Data Trust Labels & Classification Integrity ---');
  runTest('All 10 judge scenes maintain valid telemetry and impact properties', () => {
    for (const sc of JUDGE_SCENES) {
      assert.ok(sc.sprayer.actualRateKgHa >= 0);
      assert.ok(sc.impact.appliedKg >= 0);
      assert.ok(sc.impact.costSavingsUsd >= 0);
      assert.ok(sc.grid.nRemaining >= 0);
      assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(sc.grid.confidence));
    }
  });

  console.log('====================================================');
  console.log(`  TEST RESULTS: ${passCount} PASSED, 0 FAILED`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
