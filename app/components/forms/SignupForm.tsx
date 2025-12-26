'use client';

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SignupFormSchema, type SignupValues } from "@/app/lib/validation/signup";

// holds errors for each field
type FieldErrors = Partial<Record<keyof SignupValues, string>>;

export function SignupForm() {  
    const [ errors, setErrors ] = useState<FieldErrors>({});
    const [ message, setMessage ] = useState<string | null>(null);

    const [ form, setForm ] = useState<SignupValues>({
        name: '',
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
        const result = SignupFormSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: FieldErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof SignupValues;
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
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error || 'Signup failed.');
                return;
            }
            setMessage('Signup successful!');
        } catch (error) {
            console.log('Error during signup:', error);
            setMessage('An unexpected error occurred.');
        }
    }   

    return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
                Name
            </label>
            <input
            id="name"
            type="text"
            name="name"
            placeholder="Your name"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>
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
            placeholder="Create a password"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>
        
        <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
            Create account
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link className="font-medium text-gray-900 hover:underline" href="/auth/login">
                Log in
            </Link>
        </p>
    </form>
    );
}
