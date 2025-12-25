'use client';

import { createProjectSchema, type CreateProjectInput } from "@/app/lib/validation/createProject"
import { useState } from "react"
import { useRouter } from 'next/navigation'

type FieldErrors = Partial<Record<keyof CreateProjectInput, string>>;

export function CreateProject() {
    const [ errors, setErrors ] = useState<FieldErrors>({});
    const [ message, setMessage ] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState<CreateProjectInput>({
        name: ""
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
        const result = createProjectSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FieldErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof CreateProjectInput;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        
        try {
            const response = await fetch('/api/createProject', {
                method: 'POST',
                headers:{'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error || 'Failed to create project.');
                return;
            }
            setMessage('Project created successfully!');
            router.push(`/projects/${data.project.id}`);
        } catch (error) {
            console.error('Failed to create project', error);
            setMessage('An unexpected error occurred.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Project name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="e.g. Customer feedback"
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
                Create Project
            </button>
            {message && <p className="text-xs text-gray-600">{message}</p>}
        </form>
    )
}
