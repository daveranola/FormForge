import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { SignupFormSchema } from "@/app/lib/validation/signup";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    const parsed = SignupFormSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid signup data." },
            { status: 400 }
        );
    }

    const supabase = createSupaBaseClient();
        
    const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: { name: parsed.data.name },
        },
    })

    if (error) {
        return NextResponse.json(
            { error: error.message || "Signup failed." },
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
            },
            message: "Signup successful!",
        },
        { status: 201 }
    );
}
