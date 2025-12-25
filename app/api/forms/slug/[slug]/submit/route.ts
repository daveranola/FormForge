import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import { createSubmissionSchema } from "@/app/lib/validation/createSubmission";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const result = createSubmissionSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid submission data", details: result.error.issues },
      { status: 400 }
    );
  }

  const form = await prisma.form.findFirst({
    where: { slug },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        formId: form.id,
        answersJson: result.data.answersJson as Prisma.InputJsonValue,
        metadataJson:
          result.data.metadataJson === undefined
            ? undefined
            : ((result.data.metadataJson ?? Prisma.JsonNull) as Prisma.InputJsonValue),
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
  }
}
