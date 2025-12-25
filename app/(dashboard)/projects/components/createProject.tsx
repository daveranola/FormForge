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
            const response = await fetch('/api/project', {
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
        <form onSubmit={handleSubmit}>
            <div>
                <input 
                type="text"
                    name="name"
                    placeholder="Project Name"
                    onChange={handleChange}
                 />
                 {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>
            <button>
                Create Project
            </button>
            {message && <p>{message}</p>}
        </form>
    )
}
