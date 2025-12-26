'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoginFormSchema, type LoginValues } from "@/app/lib/validation/login";

// holds errors for each field
type FieldErrors = Partial<Record<keyof LoginValues, string>>;

export function LoginForm() {  
    const [ errors, setErrors ] = useState<FieldErrors>({});
    const [ message, setMessage ] = useState<string | null>(null);
    const router = useRouter();

    const [ form, setForm ] = useState<LoginValues>({
        email: '',
        password: ''
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const result = LoginFormSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: FieldErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof LoginValues;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }

        // clear errors
        setErrors({});

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error || 'Login failed.');
                return;
            }
            setMessage('Login successful!');
            router.push('/dashboard');
        } catch (error) {
            console.log('Error during login:', error);
            setMessage('An unexpected error occurred.');
        }
    }   

    return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
            </label>
            <input
            id="email"
            type="email"
            name="email"
            placeholder="you@company.com"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
            </label>
            <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>
        
        <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
            Log in
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <p className="text-center text-xs text-gray-500">
            New here?{" "}
            <Link className="font-medium text-gray-900 hover:underline" href="/auth/signup">
                Create an account
            </Link>
        </p>
    </form>
    );
}
