'use client';

import { createFormSchema, type CreateFormInput } from "@/app/lib/validation/createForm";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = Partial<Record<keyof CreateFormInput, string>>;

type CreateFormProps = {
  projectId: number;
};

export function CreateForm({ projectId }: CreateFormProps) {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState<CreateFormInput>({
        name: "",
        projectId,
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const result = createFormSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FieldErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof CreateFormInput;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        
        try {
            const response = await fetch('/api/createForm', {
                method: 'POST',
                headers:{'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error || 'Failed to create form.');
                return;
            }
            setMessage('Form created successfully!');
            router.refresh();
        } catch (error) {
            console.error('Failed to create form', error);
            setMessage('An unexpected error occurred.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Form name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="e.g. New employee onboarding"
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
                Create Form
            </button>
            {message && <p className="text-xs text-gray-600">{message}</p>}
        </form>
    )
}
