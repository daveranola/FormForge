'use server'

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from 'next/server';
import { createProjectSchema } from '@/app/lib/validation/createProject';
import { createSupaBaseClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
    const body = await request.json();

    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: 'Invalid project data', details: result.error.issues },
            { status: 400 }
        );
    }

    const supabase = createSupaBaseClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    try {
        const project = await prisma.project.create({
            data: {
                name: result.data.name,
                ownerId: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ project }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
