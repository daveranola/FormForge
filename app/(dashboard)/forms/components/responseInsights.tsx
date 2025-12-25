'use client';

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BreakdownItem = {
  label: string;
  count: number;
};

type FieldInsight = {
  id: number;
  label: string;
  type: string;
  total: number;
  answered: number;
  average?: number | null;
  breakdown?: BreakdownItem[];
  responses?: string[];
};

type ResponseInsightsProps = {
  insights: FieldInsight[];
};

export function ResponseInsights({ insights }: ResponseInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-600">No fields available for insights yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {insights.map((insight) => (
        <div key={insight.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">{insight.label}</div>
              <div className="text-xs text-gray-500">Type: {insight.type}</div>
            </div>
            <div className="text-right text-xs text-gray-500">
              {insight.answered}/{insight.total} answered
            </div>
          </div>

          {insight.breakdown && insight.breakdown.length > 0 ? (
            <div className="mt-3 h-48">
              <ResponsiveContainer>
                <BarChart data={insight.breakdown} margin={{ left: -12, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDistributionPanel
              average={insight.average}
              responses={insight.responses ?? []}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function NoDistributionPanel({
  average,
  responses,
}: {
  average?: number | null;
  responses: string[];
}) {
  const pageSize = 5;
  const [pageIndex, setPageIndex] = React.useState(0);
  React.useEffect(() => {
    setPageIndex(0);
  }, [responses]);
  const totalPages = Math.max(1, Math.ceil(responses.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages - 1);
  const start = clampedPageIndex * pageSize;
  const end = Math.min(start + pageSize, responses.length);
  const pageItems = responses.slice(start, end);

  return (
    <div className="mt-3 space-y-3 text-sm text-gray-700">
      {typeof average === "number" && (
        <div className="text-xs text-gray-500">Average: {average.toFixed(2)}</div>
      )}
      {responses.length === 0 ? (
        <div className="text-sm text-gray-500">No responses yet.</div>
      ) : (
        <>
          <ul className="space-y-2">
            {pageItems.map((response, index) => (
              <li
                key={`${start}-${index}`}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1"
              >
                {response}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              className="rounded-md border border-gray-200 px-2 py-1 disabled:opacity-50"
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={clampedPageIndex === 0}
            >
              Prev
            </button>
            <span>
              {start + 1}-{end} of {responses.length}
            </span>
            <button
              type="button"
              className="rounded-md border border-gray-200 px-2 py-1 disabled:opacity-50"
              onClick={() =>
                setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={clampedPageIndex >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
