'use client';

import { useMemo, useState } from "react";
import { FieldManager } from "@/app/(dashboard)/forms/components/fieldManager";
import { ResponseInsights } from "@/app/(dashboard)/forms/components/responseInsights";

type Field = {
  id: number;
  key: string;
  label: string;
  type: string;
  required: boolean;
  orderIndex: number;
  options?: unknown | null;
};

type SubmissionRow = {
  id: number;
  submittedAt: string;
  answers: Record<string, unknown>;
};

type FieldInsight = {
  id: number;
  label: string;
  type: string;
  total: number;
  answered: number;
  average?: number | null;
  breakdown?: { label: string; count: number }[];
  responses?: string[];
};

type FormTabsProps = {
  formId: number;
  fields: Field[];
  insights: FieldInsight[];
  submissions: SubmissionRow[];
  totalSubmissions: number;
};

export function FormTabs({
  formId,
  fields,
  insights,
  submissions,
  totalSubmissions,
}: FormTabsProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "responses">("questions");
  const latestSubmission = useMemo(() => submissions[0]?.submittedAt ?? null, [submissions]);

  function formatRelative(dateString: string | null) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={
            activeTab === "questions"
              ? "rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900"
              : "rounded-xl px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          }
        >
          Questions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("responses")}
          className={
            activeTab === "responses"
              ? "rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900"
              : "rounded-xl px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          }
        >
          Responses
        </button>
      </div>

      {activeTab === "questions" ? (
        <FieldManager formId={formId} initialFields={fields} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">Total submissions</div>
              <div className="text-3xl font-semibold tracking-tight">{totalSubmissions}</div>
              <div className="text-xs text-gray-400">All time</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">Latest submission</div>
              <div className="text-sm font-medium text-gray-900">
                {formatRelative(latestSubmission)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Response insights</h2>
            {totalSubmissions === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                <p>No submissions yet.</p>
                <p>Share your form link to start collecting responses.</p>
              </div>
            ) : (
              <ResponseInsights insights={insights} />
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Recent submissions</h2>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                <p>No submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="text-xs text-gray-500">
                      Submitted{" "}
                      <time dateTime={submission.submittedAt}>
                        {formatRelative(submission.submittedAt)}
                      </time>
                    </div>
                    <dl className="mt-3 space-y-1">
                      {fields.map((field) => (
                        <div key={field.id} className="flex gap-3 text-sm">
                          <dt className="w-40 font-medium text-gray-700">{field.label}</dt>
                          <dd className="flex-1 text-gray-900">
                            {String(submission.answers[field.key] ?? "") || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
