import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { MonitoringConsole } from './MonitoringConsole';

export const dynamic = 'force-dynamic';

export default async function MonitoringPage() {
  const session = await getSession();
  const orgId = session?.organizationId || '';

  const sprayers = await prisma.sprayer.findMany({
    where: { organizationId: orgId },
    include: {
      controlDecisions: { take: 5, orderBy: { timestamp: 'desc' } },
    },
  });

  const fields = await prisma.field.findMany({
    where: { organizationId: orgId },
    include: {
      grids: {
        include: {
          nutrientBudget: true,
          prescriptions: { where: { status: 'ACTIVE' }, take: 1 },
        },
      },
    },
  });

  const mapFields = fields.map((f) => ({
    id: f.id,
    name: f.name,
    boundaryGeoJson: f.boundaryGeoJson,
  }));

  const mapGrids: any[] = [];
  fields.forEach((f) => {
    f.grids.forEach((g) => {
      mapGrids.push({
        id: g.id,
        gridCode: g.gridCode,
        fieldName: f.name,
        fieldId: f.id,
        calculatedArea: g.calculatedArea,
        status: g.status,
        geometryGeoJson: g.geometryGeoJson,
        nutrientBudget: g.nutrientBudget,
        activePrescription: g.prescriptions[0] || null,
      });
    });
  });

  return (
    <AppShell>
      <MonitoringConsole
        sprayers={sprayers}
        grids={mapGrids}
        fields={mapFields}
      />
    </AppShell>
  );
}
