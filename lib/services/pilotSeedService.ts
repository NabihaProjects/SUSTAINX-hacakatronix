// SOIL IQ - Pilot & Commercialization Seed Service
import prisma from '@/lib/db/prisma';

export class PilotSeedService {
  static async seedPilotData(): Promise<void> {
    const org = await prisma.organization.findFirst();
    if (!org) return;

    // 1. Ensure Organization has commercial metadata
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        organizationType: 'FARM',
        currency: 'USD',
        unitSystem: 'METRIC',
        dataRetentionDays: 365,
      },
    });

    // 2. Check if pilot project already exists
    const existingPilot = await prisma.pilotProject.findFirst({
      where: { organizationId: org.id },
    });

    let pilotId = existingPilot?.id;

    if (!existingPilot) {
      const pilot = await prisma.pilotProject.create({
        data: {
          organizationId: org.id,
          name: 'Green Valley Farm Maize VRA Field Pilot',
          description: 'Controlled side-by-side evaluation comparing conventional broadcast fertilizer vs SOIL IQ closed-loop variable-rate prescription spraying.',
          status: 'ACTIVE',
          startDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000), // 42 days ago
          plannedEndDate: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
          leadUser: 'Dr. Jennifer Vance, Lead Agronomist',
          crop: 'Maize (Field Corn)',
          area: 10.0,
          controlArea: 5.0,
          soilIQArea: 5.0,
          baselineType: 'CONTROL_AREA',
          baselineDescription: 'Adjacent 5.0 acre plot receiving uniform broadcast 180 kg/ha N application without sensor modulation.',
          objectivesJson: JSON.stringify([
            'FERTILIZER_REDUCTION',
            'APPLICATION_ACCURACY',
            'INPUT_COST_REDUCTION',
            'NUTRIENT_USE_EFFICIENCY',
            'ENVIRONMENTAL_RISK_REDUCTION',
          ]),
          successCriteriaJson: JSON.stringify([
            { metric: 'Fertilizer Input Reduction', target: '>= 15%', achieved: '20.0%' },
            { metric: 'Application Deviation', target: '<= 6.0%', achieved: '4.2%' },
            { metric: 'Data Telemetry Coverage', target: '>= 80%', achieved: '88.0%' },
            { metric: 'Overapplication Avoidance', target: 'Zero unlogged events', achieved: '16 halted passes' },
          ]),
          notes: 'Sensors calibrated to Bray-1 P lab assay. Closed-loop flow meter active on sprayer unit SP-01.',
        },
      });
      pilotId = pilot.id;

      // Seed Measurement Plans
      const measurements = [
        {
          pilotId: pilot.id,
          category: 'soil',
          frequency: 'pre_post',
          source: 'LAB_SOIL_TEST',
          unit: 'ppm',
          responsibleParty: 'Certified Ag Analytical Lab',
          recordsExpected: 20,
          recordsCollected: 18,
          qualityStatus: 'HIGH',
        },
        {
          pilotId: pilot.id,
          category: 'fertilizer',
          frequency: 'continuous',
          source: 'SPRAYER_TELEMETRY',
          unit: 'L/ha',
          responsibleParty: 'Smart Sprayer SP-01 Totalizer',
          recordsExpected: 120,
          recordsCollected: 114,
          qualityStatus: 'HIGH',
        },
        {
          pilotId: pilot.id,
          category: 'weather',
          frequency: 'daily',
          source: 'FIELD_SENSOR',
          unit: 'mm / km/h',
          responsibleParty: 'On-Farm Weather Node WTH-01',
          recordsExpected: 42,
          recordsCollected: 42,
          qualityStatus: 'HIGH',
        },
        {
          pilotId: pilot.id,
          category: 'yield',
          frequency: 'harvest',
          source: 'SCALE_WEIGHT',
          unit: 'bu/acre',
          responsibleParty: 'Combine Harvester Yield Monitor',
          recordsExpected: 10,
          recordsCollected: 0,
          qualityStatus: 'INCOMPLETE',
        },
      ];

      for (const m of measurements) {
        await prisma.pilotMeasurementPlan.create({ data: m });
      }
    }

    // 3. Seed Agronomic Review Items
    const reviewCount = await prisma.agronomicReviewItem.count({ where: { organizationId: org.id } });
    if (reviewCount === 0) {
      await prisma.agronomicReviewItem.createMany({
        data: [
          {
            organizationId: org.id,
            targetType: 'SOIL_BASELINE',
            targetId: 'SR-2026-00412',
            issueTitle: 'Field 3 Laboratory Baseline Discrepancy Review',
            evidenceJson: JSON.stringify({
              labPhosphorus: 44.0,
              sensorEstimate: 71.0,
              discrepancyPct: 46.9,
              labDate: '2026-08-28',
            }),
            recommendationText: 'Laboratory Bray-1 extraction is high quality. Prefer Lab Baseline of 44 kg/ha; recalibrate sensor offset for organic matter impedance.',
            confidenceScore: 0.94,
            status: 'PENDING',
          },
          {
            organizationId: org.id,
            targetType: 'PRESCRIPTION',
            targetId: 'RX-DEMO-01',
            issueTitle: 'Grid G047 High Zinc Prescription Flag',
            evidenceJson: JSON.stringify({
              targetCrop: 'Maize',
              prescribedZincKgHa: 4.5,
              regionalStandardMax: 5.0,
            }),
            recommendationText: 'Zinc application is within physiological upper boundary for early vegetative corn in alkaline calcareous topsoil.',
            confidenceScore: 0.88,
            status: 'PENDING',
          },
          {
            organizationId: org.id,
            targetType: 'SAMPLING_REC',
            targetId: 'G058',
            issueTitle: 'Sampling Recommended for Grid G058 (180m from nearest core)',
            evidenceJson: JSON.stringify({
              gridCode: 'G058',
              nearestSampleDistM: 180,
              dataAgeDays: 380,
            }),
            recommendationText: 'Collect 5-core composite soil sample before side-dress fertilizer pass to confirm nitrate residual.',
            confidenceScore: 0.85,
            status: 'PENDING',
          },
        ],
      });
    }

    // 4. Seed Knowledge Sources and Articles
    const articleCount = await prisma.knowledgeArticle.count();
    if (articleCount === 0) {
      const source = await prisma.knowledgeSource.create({
        data: {
          title: 'ICAR & FAO Precision Nutrient Management Handbook',
          publisher: 'Food and Agriculture Organization / ICAR',
          url: 'https://www.fao.org/soils-portal',
          documentReference: 'FAO-SOIL-TR-492',
          sourceType: 'GOVERNMENT',
          notes: 'Standard nitrogen, phosphorus, and potassium fertilizer application benchmarks and oxide conversion tables.',
        },
      });

      await prisma.knowledgeArticle.createMany({
        data: [
          {
            category: 'SOIL',
            title: 'Bray-1 vs Olsen Phosphorus Extraction Methods',
            summary: 'Selection criteria for soil test phosphorus based on soil pH and calcium carbonate content.',
            content: 'Bray-1 extraction is the gold standard for acid to neutral soils (pH < 7.2). For alkaline and calcareous soils (pH > 7.3), the Olsen sodium bicarbonate method must be employed to avoid calcium phosphate precipitation during laboratory assaying.',
            sourceId: source.id,
            version: '1.1',
          },
          {
            category: 'MACHINES',
            title: 'Speed-Compensated PWM Nozzle Modulation',
            summary: 'Maintaining target application rate (L/ha) dynamically during tractor velocity variations.',
            content: 'Standard rate controllers adjust spray pressure to vary nozzle flow. Pulse-Width Modulation (PWM) maintains constant boom pressure and droplet spectrum by pulsing individual solenoids at 10-20 Hz, eliminating droplet drift while maintaining uniform chemical coverage.',
            sourceId: source.id,
            version: '1.0',
          },
          {
            category: 'ENVIRONMENT',
            title: 'Riparian Buffer Setbacks & Fertilizer Leaching Mitigation',
            summary: 'Mandatory non-spray zones near waterways and drainage canals.',
            content: 'Fertilizer application within 15 meters of open watercourses, wetlands, and drainage tiles carries severe ecological risks of eutrophication. SOIL IQ enforces automatic hardware shutoff when the spray boom enters configured riparian buffer zones.',
            sourceId: source.id,
            version: '2.0',
          },
        ],
      });
    }

    // 5. Seed Deployment Checklist
    const checklistCount = await prisma.deploymentChecklist.count({ where: { organizationId: org.id } });
    if (checklistCount === 0) {
      const checklistItems = [
        { id: 'item-1', name: 'Field boundary verified via RTK coordinates', status: 'PASSED' },
        { id: 'item-2', name: 'Spatial grid mesh generated and indexed', status: 'PASSED' },
        { id: 'item-3', name: 'Laboratory soil baseline validated and approved', status: 'PASSED' },
        { id: 'item-4', name: 'In-situ capacitance soil probes installed', status: 'PASSED' },
        { id: 'item-5', name: 'Telemetry link verified on MQTT broker', status: 'PASSED' },
        { id: 'item-6', name: 'Dual-band RTK GNSS centimeter fix confirmed', status: 'PASSED' },
        { id: 'item-7', name: 'In-line flow meter pulse calibration tested', status: 'PASSED' },
        { id: 'item-8', name: 'Hydrostatic tank level sensor zero-calibrated', status: 'PASSED' },
        { id: 'item-9', name: 'Edge gateway local SQLite buffering tested', status: 'PASSED' },
        { id: 'item-10', name: 'Prescription matrix signed off by certified agronomist', status: 'PASSED' },
        { id: 'item-11', name: 'Wind drift and rain deferral policy configured', status: 'PASSED' },
        { id: 'item-12', name: 'Closed-loop machine safety stop gate tested', status: 'PASSED' },
        { id: 'item-13', name: 'Field operator trained on mobile offline PWA', status: 'PASSED' },
      ];

      await prisma.deploymentChecklist.create({
        data: {
          organizationId: org.id,
          itemsJson: JSON.stringify(checklistItems),
          readinessScore: 100,
          status: 'READY',
          notes: 'Pre-pilot physical inspection and hardware signoff completed by field engineering team.',
        },
      });
    }

    // 6. Seed Support Ticket
    const ticketCount = await prisma.supportTicket.count({ where: { organizationId: org.id } });
    if (ticketCount === 0) {
      await prisma.supportTicket.create({
        data: {
          organizationId: org.id,
          category: 'HARDWARE',
          priority: 'MEDIUM',
          title: 'PWM Valve Solenoid #4 Calibration Verification',
          description: 'Requesting routine flow verification for nozzle bank 4 on Sprayer SP-01 after 50 operating hours.',
          status: 'OPEN',
        },
      });
    }

    console.log('✓ Milestone 15 Pilot & Commercialization data seeded successfully.');
  }
}
