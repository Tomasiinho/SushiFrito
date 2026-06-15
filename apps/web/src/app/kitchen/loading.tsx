import type { ReactElement } from "react";

export default function KitchenLoading(): ReactElement {
  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mb-4 h-24 rounded-lg bg-white shadow-sm" />
      <div className="kds-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="min-h-72 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={index}
          >
            <div className="mb-4 h-8 w-1/2 rounded bg-slate-200" />
            <div className="space-y-3">
              <div className="h-5 rounded bg-slate-100" />
              <div className="h-5 rounded bg-slate-100" />
              <div className="h-5 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
