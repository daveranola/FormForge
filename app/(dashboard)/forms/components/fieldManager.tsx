'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const FIELD_TYPES = [
  { value: "text", label: "Short answer" },
  { value: "textarea", label: "Paragraph" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Dropdown" },
];

export function FieldManager({ formId, initialFields }: FieldManagerProps) {
  const [message, setMessage] = React.useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [hasTouchedKey, setHasTouchedKey] = React.useState(false);
  const [fields, setFields] = React.useState<Field[]>(initialFields);
  const [editingFieldId, setEditingFieldId] = React.useState<number | null>(null);
  const [editData, setEditData] = React.useState({
    label: "",
    type: "text",
    required: false,
  });
  const [formData, setFormData] = React.useState({
    key: "",
    label: "",
    type: "text",
    required: false,
  });
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  React.useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

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

  function handleEditChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          orderIndex: fields.length,
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
      });
      setHasTouchedKey(false);
      setShowAdvanced(false);
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

  function startEditing(field: Field) {
    setEditingFieldId(field.id);
    setEditData({
      label: field.label,
      type: field.type,
      required: field.required,
    });
  }

  async function saveEdit(fieldId: number) {
    setMessage(null);
    try {
      const response = await fetch(`/api/forms/${formId}/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Failed to update field.");
        return;
      }

      setEditingFieldId(null);
      setMessage("Field updated.");
      router.refresh();
    } catch (error) {
      console.error("Failed to update field", error);
      setMessage("An unexpected error occurred.");
    }
  }

  async function persistOrder(nextFields: Field[]) {
    setMessage("Saving order...");
    try {
      await Promise.all(
        nextFields.map((field, index) =>
          fetch(`/api/forms/${formId}/fields/${field.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderIndex: index }),
          })
        )
      );
      setMessage("Order updated.");
      router.refresh();
    } catch (error) {
      console.error("Failed to update order", error);
      setMessage("Failed to update order.");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setFields((prev) => {
      const oldIndex = prev.findIndex((field) => field.id === active.id);
      const newIndex = prev.findIndex((field) => field.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }
      const nextFields = arrayMove(prev, oldIndex, newIndex).map((field, index) => ({
        ...field,
        orderIndex: index,
      }));
      void persistOrder(nextFields);
      return nextFields;
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Add a question</h2>
          <p className="text-sm text-gray-500">
            Questions appear in the order below. Drag to reorder at any time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Question</span>
              <input
                name="label"
                placeholder="Email address"
                value={formData.label}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Answer type</span>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              >
                {FIELD_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                name="required"
                type="checkbox"
                checked={formData.required}
                onChange={handleChange}
              />
              Required
            </label>
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              {showAdvanced ? "Hide advanced" : "Advanced"}
            </button>
          </div>

          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Key</span>
                <input
                  name="key"
                  placeholder="email"
                  value={formData.key}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
                <span className="text-xs text-gray-500">
                  Used to store answers. Auto-generated from the question.
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add question
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          <span className="text-xs text-gray-500">{fields.length} total</span>
        </div>
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            <p>No questions yet. Add one above.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3">
                {fields.map((field) => (
                  <SortableFieldRow key={field.id} field={field}>
                    {editingFieldId === field.id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <span className="text-xs font-medium text-gray-700">Label</span>
                            <input
                              name="label"
                              value={editData.label}
                              onChange={handleEditChange}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-medium text-gray-700">Type</span>
                            <select
                              name="type"
                              value={editData.type}
                              onChange={handleEditChange}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                            >
                              {FIELD_TYPES.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            name="required"
                            type="checkbox"
                            checked={editData.required}
                            onChange={handleEditChange}
                          />
                          Required
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
                            onClick={() => saveEdit(field.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="text-sm text-gray-600 hover:text-gray-900"
                            onClick={() => setEditingFieldId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-gray-900">{field.label}</div>
                          <div className="text-xs text-gray-500">
                            {field.type}
                            {field.required ? " - required" : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => startEditing(field)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(field.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableFieldRow>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableFieldRow({
  field,
  children,
}: {
  field: Field;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <button
        type="button"
        className="mt-1 h-8 w-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-gray-700"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        |||
      </button>
      {children}
    </li>
  );
}
