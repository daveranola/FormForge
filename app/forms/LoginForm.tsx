'use client';

import { useState, type FormEvent } from "react";
import { LoginFormSchema, type LoginValues } from "@/app/lib/validation/login";

// holds errors for each field
type FieldErrors = Partial<Record<keyof LoginValues, string>>;

export function LoginForm() {  
    const [ errors, setErrors ] = useState<FieldErrors>({});
    const [ message, setMessage ] = useState<string | null>(null);

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
        } catch (error) {
            console.log('Error during login:', error);
            setMessage('An unexpected error occurred.');
        }
    }   

    return (
    <form onSubmit={handleSubmit} noValidate>
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
        
        <button type = 'submit'>Login</button>
        {message && <p className="message">{message}</p>}
    </form>
    );
}