// SOIL IQ - Deterministic Comprehensive Seed Script
// Milestones 1, 2, and 3: Multi-tenant Org, RBAC, Farms, Fields, 8 Crops, Growth Stages,
// 5 Fertilizers, Spatial Grids, Soil Profiles, Nutrient Budgets, Applications, Prescriptions, Fleet, and Logs.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SOIL IQ deterministic seed...');

  // 1. Clean existing database
  await prisma.auditLog.deleteMany();
  await prisma.farmActivity.deleteMany();
  await prisma.controlDecision.deleteMany();
  await prisma.telemetryEvent.deleteMany();
  await prisma.sprayer.deleteMany();
  await prisma.prescriptionVersion.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.fertilizerApplication.deleteMany();
  await prisma.gridNutrientBudget.deleteMany();
  await prisma.soilProfile.deleteMany();
  await prisma.grid.deleteMany();
  await prisma.field.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.agronomicRule.deleteMany();
  await prisma.cropGrowthStage.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.fertilizer.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Green Valley Agriculture',
      slug: 'green-valley-ag',
      plan: 'ENTERPRISE',
      timezone: 'America/Chicago',
    },
  });
  console.log(`Created Organization: ${org.name}`);

  // 3. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@soiliq.ag',
      name: 'Rajdeep Mukherjee (Owner)',
      passwordHash,
      memberships: {
        create: {
          organizationId: org.id,
          role: 'OWNER',
        },
      },
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@soiliq.ag',
      name: 'Alex Vance (Chief Operator)',
      passwordHash,
      memberships: {
        create: {
          organizationId: org.id,
          role: 'OPERATOR',
        },
      },
    },
  });
  console.log(`Created Admin: ${adminUser.email}, Operator: ${operatorUser.email}`);

  // 4. Create 8 Crops with structured growth stages
  const cropsData = [
    {
      name: 'Rice',
      scientificName: 'Oryza sativa',
      category: 'CEREAL',
      description: 'Paddy crop with high nitrogen and moisture requirements during tillering.',
      targetYieldTonsHa: 5.8,
      stages: [
        'Nursery',
        'Vegetative',
        'Tillering',
        'Panicle Initiation',
        'Flowering',
        'Grain Filling',
        'Maturity',
      ],
      rules: { baseN: 120, baseP: 45, baseK: 80 },
    },
    {
      name: 'Tomato',
      scientificName: 'Solanum lycopersicum',
      category: 'VEGETABLE',
      description: 'High-value horticultural crop with sustained potassium and phosphorus demand.',
      targetYieldTonsHa: 45.0,
      stages: [
        'Seedling',
        'Vegetative',
        'Flowering',
        'Fruit Set',
        'Fruit Development',
        'Ripening',
      ],
      rules: { baseN: 130, baseP: 60, baseK: 125 },
    },
    {
      name: 'Maize',
      scientificName: 'Zea mays',
      category: 'CEREAL',
      description: 'High biomass grain crop with peak nitrogen uptake during rapid vegetative growth.',
      targetYieldTonsHa: 8.5,
      stages: [
        'Emergence',
        'Early Vegetative',
        'Rapid Growth',
        'Tasseling',
        'Silking',
        'Dough',
        'Maturity',
      ],
      rules: { baseN: 145, baseP: 55, baseK: 95 },
    },
    {
      name: 'Cotton',
      scientificName: 'Gossypium hirsutum',
      category: 'CASH_CROP',
      description: 'Deep-rooted fiber crop sensitive to excess nitrogen causing vegetative rank growth.',
      targetYieldTonsHa: 2.8,
      stages: [
        'Seedling',
        'Squaring',
        'Flowering',
        'Boll Development',
        'Open Boll',
      ],
      rules: { baseN: 100, baseP: 40, baseK: 80 },
    },
    {
      name: 'Groundnut',
      scientificName: 'Arachis hypogaea',
      category: 'LEGUME',
      description: 'Nitrogen-fixing legume requiring balanced phosphorus and calcium/potassium.',
      targetYieldTonsHa: 2.4,
      stages: [
        'Emergence',
        'Vegetative',
        'Flowering',
        'Pegging',
        'Pod Formation',
        'Maturity',
      ],
      rules: { baseN: 30, baseP: 45, baseK: 50 },
    },
    {
      name: 'Wheat',
      scientificName: 'Triticum aestivum',
      category: 'CEREAL',
      description: 'Cool-season cereal requiring split nitrogen applications at crown root initiation.',
      targetYieldTonsHa: 4.8,
      stages: [
        'Seedling',
        'Vegetative',
        'Tillering',
        'Heading',
        'Flowering',
        'Grain Filling',
        'Maturity',
      ],
      rules: { baseN: 110, baseP: 40, baseK: 60 },
    },
    {
      name: 'Potato',
      scientificName: 'Solanum tuberosum',
      category: 'VEGETABLE',
      description: 'Tuber crop requiring high potassium for starch synthesis and tuber bulking.',
      targetYieldTonsHa: 28.0,
      stages: [
        'Sprout',
        'Vegetative',
        'Tuber Initiation',
        'Tuber Bulking',
        'Maturation',
      ],
      rules: { baseN: 125, baseP: 50, baseK: 140 },
    },
    {
      name: 'Sugarcane',
      scientificName: 'Saccharum officinarum',
      category: 'CASH_CROP',
      description: 'Long-duration perennial crop with heavy nitrogen and potassium nutrient removal.',
      targetYieldTonsHa: 85.0,
      stages: [
        'Germination',
        'Tillering',
        'Grand Growth',
        'Ripening',
      ],
      rules: { baseN: 180, baseP: 70, baseK: 160 },
    },
  ];

  const createdCrops: Record<string, any> = {};

  for (const c of cropsData) {
    const crop = await prisma.crop.create({
      data: {
        organizationId: org.id,
        name: c.name,
        scientificName: c.scientificName,
        category: c.category,
        description: c.description,
        targetYieldTonsHa: c.targetYieldTonsHa,
        growthStages: {
          create: c.stages.map((stageName, idx) => ({
            stageName,
            stageOrder: idx + 1,
            durationDays: 18,
            nDemandRatio: idx === 1 || idx === 2 ? 0.35 : 0.15,
            pDemandRatio: 0.2,
            kDemandRatio: idx >= 3 ? 0.35 : 0.15,
          })),
        },
        agronomicRules: {
          create: {
            ruleCode: `${c.name.toUpperCase()}_BASE_RULES`,
            ruleVersion: 'v1.0-prototype',
            source: 'PROTOTYPE',
            baseReqNPerHa: c.rules.baseN,
            baseReqPPerHa: c.rules.baseP,
            baseReqKPerHa: c.rules.baseK,
            notes: `Prototype agronomic nutrient response curve for ${c.name}.`,
          },
        },
      },
      include: { growthStages: true, agronomicRules: true },
    });
    createdCrops[c.name] = crop;
  }
  console.log('Seeded 8 structured crops and growth stages.');

  // 5. Seed Fertilizers with Elemental N-P-K Percentages
  const fertilizersData = [
    {
      name: 'Urea (46-0-0)',
      formulation: '46-0-0',
      description: 'High-concentration dry granular nitrogen fertilizer.',
      physicalForm: 'GRANULAR',
      nPercent: 46.0,
      pPercent: 0.0,
      kPercent: 0.0,
      densityKgPerL: 1.0,
      defaultUnit: 'kg',
    },
    {
      name: 'DAP (18-46-0)',
      formulation: '18-46-0',
      description: 'Diammonium phosphate standard granular source for starter phosphorus.',
      physicalForm: 'GRANULAR',
      nPercent: 18.0,
      pPercent: 20.0, // 46% P2O5 * 0.4364 = 20.07% elemental P
      kPercent: 0.0,
      densityKgPerL: 1.0,
      defaultUnit: 'kg',
    },
    {
      name: 'MOP (0-0-60)',
      formulation: '0-0-60',
      description: 'Muriate of potash (potassium chloride) high-analysis potassium source.',
      physicalForm: 'GRANULAR',
      nPercent: 0.0,
      pPercent: 0.0,
      kPercent: 49.8, // 60% K2O * 0.8302 = 49.8% elemental K
      densityKgPerL: 1.0,
      defaultUnit: 'kg',
    },
    {
      name: 'NPK 19-19-19 Complete',
      formulation: '19-19-19',
      description: 'Fully water-soluble balanced compound fertilizer for fertigation and foliar spray.',
      physicalForm: 'LIQUID',
      nPercent: 19.0,
      pPercent: 8.3, // 19% P2O5 * 0.4364 = 8.3% elemental P
      kPercent: 15.8, // 19% K2O * 0.8302 = 15.8% elemental K
      densityKgPerL: 1.25,
      defaultUnit: 'L',
    },
    {
      name: 'NPK 20-20-20 Pro',
      formulation: '20-20-20',
      description: 'High-analysis balanced multi-nutrient fertilizer formulation.',
      physicalForm: 'POWDER',
      nPercent: 20.0,
      pPercent: 8.7,
      kPercent: 16.6,
      densityKgPerL: 1.0,
      defaultUnit: 'kg',
    },
  ];

  const createdFertilizers: Record<string, any> = {};
  for (const f of fertilizersData) {
    const fert = await prisma.fertilizer.create({
      data: {
        organizationId: org.id,
        name: f.name,
        formulation: f.formulation,
        description: f.description,
        physicalForm: f.physicalForm,
        nPercent: f.nPercent,
        pPercent: f.pPercent,
        kPercent: f.kPercent,
        densityKgPerL: f.densityKgPerL,
        defaultUnit: f.defaultUnit,
      },
    });
    createdFertilizers[f.formulation] = fert;
  }
  console.log('Seeded 5 fertilizer formulations with pure elemental percentages.');

  // 6. Create Primary Farm: "Green Valley Farm" (10 acres / 4.05 ha)
  const farm = await prisma.farm.create({
    data: {
      organizationId: org.id,
      name: 'Green Valley Farm',
      description: 'Precision trial research farm showcasing multi-crop spatial grid management.',
      declaredArea: 10.0,
      calculatedArea: 4.05,
      areaUnit: 'acre',
      latitude: 41.5868,
      longitude: -93.625,
      locationLabel: 'Story County, Iowa',
      status: 'ACTIVE',
    },
  });
  console.log(`Created Farm: ${farm.name}`);

  // Also create a secondary farm: "Farm Alpha"
  await prisma.farm.create({
    data: {
      organizationId: org.id,
      name: 'Farm Alpha - Midwest Hub',
      description: 'Large-scale commercial production acreage.',
      declaredArea: 120.0,
      calculatedArea: 48.5,
      areaUnit: 'hectare',
      latitude: 42.0308,
      longitude: -93.6319,
      locationLabel: 'Ames, Iowa',
      status: 'ACTIVE',
    },
  });

  // 7. Create 5 Fields inside Green Valley Farm (each ~2 acres / 0.81 ha with different crops)
  const baseLat = 41.5868;
  const baseLon = -93.625;
  const latOffsetPerField = 0.0022;

  const fieldsConfig = [
    {
      name: 'North Field 01 - Rice Trial',
      crop: createdCrops['Rice'],
      stage: 'Tillering',
      soilType: 'CLAY_LOAM',
      irrigation: 'FLOOD',
    },
    {
      name: 'Central Field 02 - Tomato Horticulture',
      crop: createdCrops['Tomato'],
      stage: 'Flowering',
      soilType: 'SANDY_LOAM',
      irrigation: 'DRIP',
    },
    {
      name: 'East Field 03 - Maize Production',
      crop: createdCrops['Maize'],
      stage: 'Rapid Growth',
      soilType: 'SILT_LOAM',
      irrigation: 'SPRINKLER',
    },
    {
      name: 'South Field 04 - Cotton Plots',
      crop: createdCrops['Cotton'],
      stage: 'Squaring',
      soilType: 'LOAM',
      irrigation: 'DRIP',
    },
    {
      name: 'West Field 05 - Groundnut Rotation',
      crop: createdCrops['Groundnut'],
      stage: 'Pegging',
      soilType: 'SANDY_LOAM',
      irrigation: 'RAINFED',
    },
  ];

  let totalGridsCreated = 0;

  for (let fIdx = 0; fIdx < fieldsConfig.length; fIdx++) {
    const fConf = fieldsConfig[fIdx];
    const fieldLatMin = baseLat + fIdx * latOffsetPerField;
    const fieldLatMax = fieldLatMin + 0.0018;
    const fieldLonMin = baseLon;
    const fieldLonMax = baseLon + 0.0045;

    const fieldPolygon = [
      [Number(fieldLonMin.toFixed(6)), Number(fieldLatMin.toFixed(6))],
      [Number(fieldLonMax.toFixed(6)), Number(fieldLatMin.toFixed(6))],
      [Number(fieldLonMax.toFixed(6)), Number(fieldLatMax.toFixed(6))],
      [Number(fieldLonMin.toFixed(6)), Number(fieldLatMax.toFixed(6))],
      [Number(fieldLonMin.toFixed(6)), Number(fieldLatMin.toFixed(6))],
    ];

    const field = await prisma.field.create({
      data: {
        organizationId: org.id,
        farmId: farm.id,
        name: fConf.name,
        boundaryGeoJson: JSON.stringify({
          type: 'Polygon',
          coordinates: [fieldPolygon],
        }),
        declaredArea: 2.0,
        calculatedArea: 0.81,
        areaUnit: 'acre',
        cropId: fConf.crop.id,
        cropVariety: 'Agronomic Hybrid v2',
        plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        growthStage: fConf.stage,
        irrigationMethod: fConf.irrigation,
        soilType: fConf.soilType,
        status: 'ACTIVE',
      },
    });

    // Subdivide each field into 4 distinct spatial grids (2 rows x 2 cols = 4 grids per field = 20 grids total!)
    const rows = 2;
    const cols = 2;
    const latStep = (fieldLatMax - fieldLatMin) / rows;
    const lonStep = (fieldLonMax - fieldLonMin) / cols;

    let gridCounter = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cLonMin = fieldLonMin + c * lonStep;
        const cLonMax = cLonMin + lonStep;
        const cLatMin = fieldLatMin + r * latStep;
        const cLatMax = cLatMin + latStep;

        const gridPolygon = [
          [Number(cLonMin.toFixed(6)), Number(cLatMin.toFixed(6))],
          [Number(cLonMax.toFixed(6)), Number(cLatMin.toFixed(6))],
          [Number(cLonMax.toFixed(6)), Number(cLatMax.toFixed(6))],
          [Number(cLonMin.toFixed(6)), Number(cLatMax.toFixed(6))],
          [Number(cLonMin.toFixed(6)), Number(cLatMin.toFixed(6))],
        ];

        const gridCode = `F0${fIdx + 1}-G00${gridCounter}`;

        // Heterogeneous status simulation
        let gridStatus = 'OPTIMAL';
        let isBlocked = false;
        let blockReason: string | null = null;
        let consumedRatio = 0.35;

        if (fIdx === 0 && gridCounter === 3) {
          // One caution grid
          gridStatus = 'CAUTION';
          consumedRatio = 0.88;
        } else if (fIdx === 1 && gridCounter === 4) {
          // One excess risk grid
          gridStatus = 'EXCESS_RISK';
          consumedRatio = 1.05;
        } else if (fIdx === 2 && gridCounter === 1) {
          // One blocked buffer grid
          gridStatus = 'BLOCKED';
          isBlocked = true;
          blockReason = 'Riparian environmental buffer zone adjacent to drainage canal.';
        }

        const grid = await prisma.grid.create({
          data: {
            organizationId: org.id,
            fieldId: field.id,
            gridCode,
            rowIndex: r,
            colIndex: c,
            geometryGeoJson: JSON.stringify({
              type: 'Polygon',
              coordinates: [gridPolygon],
            }),
            calculatedArea: 0.2, // ~0.5 acres per grid
            status: gridStatus,
            isActive: true,
            isBlocked,
            blockReason,
          },
        });

        totalGridsCreated++;

        // Soil Profile (Simulate realistic variations)
        const soilN = 30 + (gridCounter * 12 + fIdx * 8) % 35;
        const soilP = 15 + (gridCounter * 7 + fIdx * 5) % 25;
        const soilK = 110 + (gridCounter * 20 + fIdx * 15) % 60;

        await prisma.soilProfile.create({
          data: {
            gridId: grid.id,
            sampleDate: new Date(Date.now() - (15 + fIdx * 10) * 24 * 60 * 60 * 1000),
            depthCm: 15,
            source: 'SOIL_TEST',
            confidence: 0.88,
            ph: Number((6.2 + (gridCounter % 3) * 0.3).toFixed(1)),
            organicCarbonPct: Number((1.1 + (gridCounter % 4) * 0.2).toFixed(1)),
            moisturePct: 24.5,
            ecDsm: 0.85,
            availableNPpm: soilN,
            availablePPpm: soilP,
            availableKPpm: soilK,
            notes: 'Laboratory ICP-OES composite core sample.',
          },
        });

        // Grid Nutrient Budget
        const baseN = fConf.crop.agronomicRules[0]?.baseReqNPerHa || 110.0;
        const baseP = fConf.crop.agronomicRules[0]?.baseReqPPerHa || 45.0;
        const baseK = fConf.crop.agronomicRules[0]?.baseReqKPerHa || 75.0;

        const consumedN = Number((baseN * consumedRatio).toFixed(1));
        const consumedP = Number((baseP * consumedRatio).toFixed(1));
        const consumedK = Number((baseK * consumedRatio).toFixed(1));

        const remainingN = Math.max(0, Number((baseN - consumedN).toFixed(1)));
        const remainingP = Math.max(0, Number((baseP - consumedP).toFixed(1)));
        const remainingK = Math.max(0, Number((baseK - consumedK).toFixed(1)));

        const excessN = Math.max(0, Number((consumedN - baseN).toFixed(1)));
        const excessP = Math.max(0, Number((consumedP - baseP).toFixed(1)));
        const excessK = Math.max(0, Number((consumedK - baseK).toFixed(1)));

        await prisma.gridNutrientBudget.create({
          data: {
            gridId: grid.id,
            recommendedN: baseN,
            recommendedP: baseP,
            recommendedK: baseK,
            minRecommendedRate: 35.0,
            targetRecommendedRate: 42.0,
            maxRecommendedRate: 50.0,
            consumedN,
            consumedP,
            consumedK,
            remainingN,
            remainingP,
            remainingK,
            excessN,
            excessP,
            excessK,
          },
        });

        // Seed an application history record for grids that have consumed nutrients
        if (consumedN > 0) {
          const fert = createdFertilizers['19-19-19'];
          await prisma.fertilizerApplication.create({
            data: {
              organizationId: org.id,
              farmId: farm.id,
              fieldId: field.id,
              gridId: grid.id,
              fertilizerId: fert.id,
              appliedByUserId: operatorUser.id,
              applicationMethod: 'SPRAY',
              quantity: 25.0,
              unit: 'L',
              quantityKg: 31.25,
              contributedN: 5.94,
              contributedP: 2.59,
              contributedK: 4.94,
              notes: 'Early season baseline vegetative application.',
              applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Active Prescription (Prototype prescription)
        const rxReasons = [
          `Crop is in ${fConf.stage} growth stage.`,
          `Soil test indicates available N of ${soilN} ppm.`,
          `Nutrient ledger records ${consumedN} kg/ha N consumed out of ${baseN} kg/ha target.`,
          `Environmental condition favorable for foliar spray application.`,
        ];

        const rxTrace = {
          step1_cropDemand: { N: baseN, P: baseP, K: baseK },
          step2_soilCredits: { N: soilN * 0.9, P: soilP * 0.8, K: soilK * 0.9 },
          step3_consumedHistory: { N: consumedN, P: consumedP, K: consumedK },
          step4_remainingReq: { N: remainingN, P: remainingP, K: remainingK },
          step5_productRecommendation: {
            targetRate: 42.0,
            range: '38.0 - 46.0 kg/ha',
          },
        };

        const rx = await prisma.prescription.create({
          data: {
            organizationId: org.id,
            fieldId: field.id,
            gridId: grid.id,
            code: `RX-2026-${gridCode}-V1`,
            versionNumber: 1,
            status: gridStatus === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
            confidenceLevel: 'HIGH',
            confidenceScore: 0.88,
            isSimulation: false,
            estimatedReqN: remainingN,
            estimatedReqP: remainingP,
            estimatedReqK: remainingK,
            targetRateKgHa: 42.0,
            minRateKgHa: 38.0,
            maxRateKgHa: 46.0,
            explanationText: rxReasons.join('\n• '),
            reasonsJson: JSON.stringify(rxReasons),
            calculationTraceJson: JSON.stringify(rxTrace),
            environmentalRisk: 'LOW',
            environmentalAction: 'PROCEED',
            environmentalReason: 'Wind speed 8 km/h, zero precipitation probability.',
            approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            approvedByUserId: adminUser.id,
            items: {
              create: {
                fertilizerId: createdFertilizers['19-19-19'].id,
                recommendedRateKgHa: 42.0,
                sequenceOrder: 1,
              },
            },
            versions: {
              create: {
                versionNumber: 1,
                status: 'ACTIVE',
                targetRateKgHa: 42.0,
                minRateKgHa: 38.0,
                maxRateKgHa: 46.0,
                confidenceScore: 0.88,
                changeReason: 'Initial baseline agronomist approved prescription.',
                snapshotJson: JSON.stringify(rxTrace),
              },
            },
          },
        });

        gridCounter++;
      }
    }
  }

  console.log(`Created 5 Fields and ${totalGridsCreated} discrete spatial grids with soil profiles, budgets, and prescriptions.`);

  // 8. Create Fleet Sprayers
  const sprayer1 = await prisma.sprayer.create({
    data: {
      organizationId: org.id,
      name: 'Alpha-Spray 01',
      model: 'John Deere 412R High-Clearance',
      status: 'ONLINE',
      operatingMode: 'AUTOMATIC',
      latitude: baseLat + 0.0008,
      longitude: baseLon + 0.0012,
      headingDeg: 88.5,
      speedKmh: 14.2,
      currentGridCode: 'F01-G001',
      tankCapacityL: 4500.0,
      currentTankLevelL: 3450.0,
      flowRateLpm: 46.5,
      applicationRateLpha: 42.0,
      activeFertilizerName: 'NPK 19-19-19 Complete',
    },
  });

  const sprayer2 = await prisma.sprayer.create({
    data: {
      organizationId: org.id,
      name: 'Titan-Glide 02',
      model: 'RoGator RG1300 Tier 4F',
      status: 'ONLINE',
      operatingMode: 'AUTOMATIC',
      latitude: baseLat + 0.0028,
      longitude: baseLon + 0.0022,
      headingDeg: 268.0,
      speedKmh: 12.0,
      currentGridCode: 'F02-G002',
      tankCapacityL: 5000.0,
      currentTankLevelL: 4100.0,
      flowRateLpm: 44.0,
      applicationRateLpha: 40.5,
      activeFertilizerName: 'Urea (46-0-0) Dissolved',
    },
  });
  console.log(`Created 2 Sprayers: ${sprayer1.name}, ${sprayer2.name}`);

  // 9. Seed Telemetry and Control Decision History
  await prisma.controlDecision.create({
    data: {
      sprayerId: sprayer1.id,
      decision: 'CONTINUE',
      reason: 'Application rate (42.0 L/ha) precisely tracks prescription target within tolerance.',
      targetRate: 42.0,
      actualRate: 42.0,
      isAutomatic: true,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  await prisma.controlDecision.create({
    data: {
      sprayerId: sprayer1.id,
      decision: 'REDUCE',
      reason: 'Slight ground speed reduction detected. PWM valve dialed down 8% to prevent localized over-dosing.',
      targetRate: 42.0,
      actualRate: 45.2,
      isAutomatic: true,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
  });

  // 10. Farm Activity Log
  const activities = [
    {
      actorName: 'Rajdeep Mukherjee',
      action: 'INITIALIZED',
      entityType: 'FARM',
      entityName: 'Green Valley Farm',
      description: 'Initialized 10-acre multi-crop precision farm with 5 spatial fields.',
    },
    {
      actorName: 'Agronomy Engine',
      action: 'PRESCRIPTIONS_GENERATED',
      entityType: 'PRESCRIPTION',
      entityName: 'RX-2026',
      description: 'Generated 20 grid-specific prototype prescriptions based on soil tests.',
    },
    {
      actorName: 'Alex Vance',
      action: 'DISPATCH',
      entityType: 'SPRAYER',
      entityName: 'Alpha-Spray 01',
      description: 'Dispatched John Deere 412R for scheduled NPK application on Field 01.',
    },
  ];

  for (const act of activities) {
    await prisma.farmActivity.create({
      data: {
        organizationId: org.id,
        farmId: farm.id,
        actorName: act.actorName,
        action: act.action,
        entityType: act.entityType,
        entityName: act.entityName,
        description: act.description,
      },
    });
  }

  // 11. Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entityType: 'ORGANIZATION',
      entityId: org.id,
      metadataJson: JSON.stringify({ totalGrids: totalGridsCreated, fieldsCount: 5 }),
    },
  });

  console.log('✅ Deterministic seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
