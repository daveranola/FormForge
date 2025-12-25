'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

type Field = {
  id: number;
  key: string;
  label: string;
  type: string;
  required: boolean;
  orderIndex: number;
};

type FieldManagerProps = {
  formId: number;
  initialFields: Field[];
};

export function FieldManager({ formId, initialFields }: FieldManagerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasTouchedKey, setHasTouchedKey] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    label: "",
    type: "text",
    required: false,
    orderIndex: 0,
  });
  const router = useRouter();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "key") {
      setHasTouchedKey(true);
    }
    if (name === "label" && !hasTouchedKey) {
      const generated = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setFormData((prev) => ({ ...prev, key: generated }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`/api/forms/${formId}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          orderIndex: Number(formData.orderIndex) || 0,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Failed to create field.");
        return;
      }

      setFormData({
        key: "",
        label: "",
        type: "text",
        required: false,
        orderIndex: 0,
      });
      setHasTouchedKey(false);
      setMessage("Field created.");
      router.refresh();
    } catch (error) {
      console.error("Failed to create field", error);
      setMessage("An unexpected error occurred.");
    }
  }

  async function handleDelete(fieldId: number) {
    setMessage(null);
    try {
      const response = await fetch(`/api/forms/${formId}/fields/${fieldId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Failed to delete field.");
        return;
      }

      setMessage("Field deleted.");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete field", error);
      setMessage("An unexpected error occurred.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-l-4 border-blue-500 pl-4">
          <h2 className="text-lg font-semibold">Add a field</h2>
          <p className="text-sm text-gray-600">
            Fields are the questions in your form. Use a short label people recognize.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Question</span>
              <input
                name="label"
                placeholder="Email address"
                value={formData.label}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Answer type</span>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              >
                <option value="text">Short answer</option>
                <option value="textarea">Paragraph</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Dropdown</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                name="required"
                type="checkbox"
                checked={formData.required}
                onChange={handleChange}
              />
              <span className="text-sm font-medium">Required</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium">Order</span>
              <input
                name="orderIndex"
                type="number"
                placeholder="0"
                value={formData.orderIndex}
                onChange={handleChange}
                className="w-20 rounded border px-2 py-1"
              />
            </label>
            <button
              type="button"
              className="text-sm text-blue-600"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              {showAdvanced ? "Hide advanced" : "Advanced"}
            </button>
          </div>

          {showAdvanced && (
            <div className="rounded border bg-gray-50 p-3">
              <label className="space-y-1">
                <span className="text-sm font-medium">Key</span>
                <input
                  name="key"
                  placeholder="email"
                  value={formData.key}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2"
                />
                <span className="text-xs text-gray-500">
                  Used to store answers. Auto-generated from the question.
                </span>
              </label>
            </div>
          )}

          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Add field
          </button>
          {message && <p className="text-sm text-gray-700">{message}</p>}
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Current fields</h2>
        {initialFields.length === 0 ? (
          <p className="text-sm text-gray-600">No fields yet. Add one above.</p>
        ) : (
          <ul className="space-y-3">
            {initialFields.map((field) => (
              <li
                key={field.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{field.label}</div>
                    <div className="text-xs text-gray-500">
                      type: {field.type} - order: {field.orderIndex}
                      {field.required ? " - required" : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(field.id)}
                    className="text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
