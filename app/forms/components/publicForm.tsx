'use client';

import { useState } from "react";

type FieldOption = { label: string; value: string };

type Field = {
  id: number;
  key: string;
  label: string;
  type: string;
  required: boolean;
  options: unknown | null;
};

type PublicFormProps = {
  slug: string;
  fields: Field[];
};

function normalizeOptions(options: unknown): FieldOption[] {
  if (Array.isArray(options)) {
    return options
      .map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        if (
          item &&
          typeof item === "object" &&
          "label" in item &&
          "value" in item
        ) {
          return {
            label: String((item as { label: unknown }).label),
            value: String((item as { value: unknown }).value),
          };
        }
        return null;
      })
      .filter((item): item is FieldOption => Boolean(item));
  }
  return [];
}

export function PublicForm({ slug, fields }: PublicFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  function handleChange(key: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`/api/forms/slug/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answersJson: answers }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Failed to submit.");
        return;
      }

      setMessage("Thanks! Your response was submitted.");
      setAnswers({});
    } catch (error) {
      console.error("Failed to submit form", error);
      setMessage("An unexpected error occurred.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const value = answers[field.key] ?? "";
        const required = field.required;

        if (field.type === "textarea") {
          return (
            <label key={field.id} className="block space-y-1">
              <span>{field.label}</span>
              <textarea
                required={required}
                value={String(value)}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </label>
          );
        }

        if (field.type === "select") {
          const options = normalizeOptions(field.options);
          return (
            <label key={field.id} className="block space-y-1">
              <span>{field.label}</span>
              <select
                required={required}
                value={String(value)}
                onChange={(e) => handleChange(field.key, e.target.value)}
              >
                <option value="">Select</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleChange(field.key, e.target.checked)}
              />
              <span>{field.label}</span>
            </label>
          );
        }

        const inputType = ["email", "number"].includes(field.type)
          ? field.type
          : "text";

        return (
          <label key={field.id} className="block space-y-1">
            <span>{field.label}</span>
            <input
              type={inputType}
              required={required}
              value={String(value)}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </label>
        );
      })}

      <button type="submit">Submit</button>
      {message && <p>{message}</p>}
    </form>
  );
}
