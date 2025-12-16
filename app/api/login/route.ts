import { NextResponse } from "next/server";
import { LoginFormSchema } from "@/app/lib/validation/login";
import { createSupaBaseClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = LoginFormSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid login data." },
            { status: 400 }
        );
    }

    const supabase = createSupaBaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    })

    if (error) {
        return NextResponse.json(
            {error: error.message || "Login failed." },
            { status: 400 }
        );
    }

    const user = data.user;

    return NextResponse.json(
        {
            user: {
                id: user?.id,
                email: user?.email,
                name: user?.user_metadata?.name || null,
            }
        }
    );
}