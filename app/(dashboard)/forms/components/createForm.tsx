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
        <form onSubmit={handleSubmit}>
            <div>
                <input 
                type="text"
                    name="name"
                    placeholder="Form Name"
                    onChange={handleChange}
                 />
                 {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>
            <button>
                Create Form
            </button>
            {message && <p>{message}</p>}
        </form>
    )
}
