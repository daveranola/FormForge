'use client';

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
    <form onSubmit={handleSubmit} noValidate>
        <div>
            <input 
            type="text" 
            name="name" 
            placeholder="Name" 
            onChange={handleChange} 
            />
            {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div>
            <input 
            type="text" 
            name="email" 
            placeholder="Email" 
            onChange={handleChange} 
            />
            {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div>
            <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            />
            {errors.password && <p className="error">{errors.password}</p>}
        </div>
        
        <button type = 'submit'>Sign Up</button>
        {message && <p className="message">{message}</p>}
    </form>
    );
}
