'use server'

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from 'next/server';
import { createFormSchema } from '@/app/lib/validation/createForm';
import { createSupaBaseClient } from '@/app/lib/supabase/server';

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
    const body = await request.json();

    const result = createFormSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: 'Invalid form data', details: result.error.issues },
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

    const project = await prisma.project.findFirst({
        where: {
            id: result.data.projectId,
            ownerId: user.id,
        },
    });

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const baseSlug = slugify(result.data.name) || `form-${Date.now().toString(36)}`;
    let slug = baseSlug;
    const existing = await prisma.form.findFirst({ where: { slug } });
    if (existing) {
        slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    try {
        const form = await prisma.form.create({
            data: {
                name: result.data.name,
                slug,
                projectId: result.data.projectId,
            },
        });

        return NextResponse.json({ form }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}
