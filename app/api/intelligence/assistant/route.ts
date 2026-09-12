// SOIL IQ - AI Farm Assistant API Route
// Answers natural language questions through grounded database tool retrieval.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { AssistantService } from '@/lib/domain/assistantService';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let orgId = session?.organizationId;

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) return NextResponse.json({ error: 'No org found' }, { status: 404 });
      orgId = firstOrg.id;
    }

    const body = await request.json();
    const query = body.query || '';

    if (!query.trim()) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
    }

    const response = await AssistantService.handleQuery(orgId, query);

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Assistant error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
