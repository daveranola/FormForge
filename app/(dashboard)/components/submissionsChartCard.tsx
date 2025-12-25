'use client';

import { SubmissionsChart } from "./submissionsChart";

type SubmissionsChartCardProps = {
  data: { label: string; count: number }[];
  total: number;
};

export function SubmissionsChartCard({ data, total }: SubmissionsChartCardProps) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Submissions trend</div>
          <div className="text-base font-semibold">Last 7 days</div>
        </div>
        <div className="text-xs text-gray-500">{total} total</div>
      </div>
      <SubmissionsChart data={data} />
    </div>
  );
}
