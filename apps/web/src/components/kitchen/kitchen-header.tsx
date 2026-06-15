import { Activity, Clock3, Pause, Play, Radio, TimerReset } from "lucide-react";
import type { ComponentType, ReactElement } from "react";

import type { KitchenSummaryDto } from "@/types/kitchen";

interface KitchenHeaderProps {
  summary: KitchenSummaryDto | null;
  connectionLabel: string;
  isSyncing: boolean;
  pausePending: boolean;
  onTogglePause: () => void;
}

export function KitchenHeader({
  summary,
  connectionLabel,
  isSyncing,
  pausePending,
  onTogglePause
}: KitchenHeaderProps): ReactElement {
  const paused = summary?.paused ?? false;
  const queueCount = summary?.queueCount ?? 0;
  const averageWait = summary?.averageWaitMinutes ?? 0;
  const PauseIcon = paused ? Play : Pause;
  const criticalCount = summary?.byPriority.red ?? 0;
  const scheduledHidden = summary?.scheduledHidden ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-[#34231b] bg-[#201711] px-4 py-3 text-[#fff7e8] shadow-[0_10px_30px_rgb(32_23_17_/_0.16)]">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-lg bg-[#e22b1f] text-white">
            <Activity className="size-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#ffb84d]">SushiFrito KDS</p>
            <h1 className="text-3xl font-black leading-none">
              Operacion cocina
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Metric
            Icon={TimerReset}
            label="Cola"
            tone="neutral"
            value={queueCount.toString()}
          />
          <Metric
            Icon={Clock3}
            label="Promedio"
            tone="neutral"
            value={`${String(Math.round(averageWait))} min`}
          />
          <Metric
            Icon={Activity}
            label="Criticos"
            tone={criticalCount > 0 ? "danger" : "neutral"}
            value={criticalCount.toString()}
          />
          <Metric
            Icon={Radio}
            label={isSyncing ? "Sync" : connectionLabel}
            tone={paused ? "warning" : "success"}
            value={paused ? "Pausa" : "Activo"}
          />
          {scheduledHidden > 0 ? (
            <Metric
              Icon={Clock3}
              label="Programados"
              tone="warning"
              value={scheduledHidden.toString()}
            />
          ) : null}
          <button
            className="inline-flex h-14 items-center gap-2 rounded-lg bg-[#e22b1f] px-5 text-base font-black text-white transition hover:bg-[#c51f15] disabled:cursor-not-allowed disabled:bg-[#8f6f67]"
            disabled={pausePending}
            onClick={onTogglePause}
            type="button"
          >
            <PauseIcon className="size-4" />
            {paused ? "Reanudar" : "Pausa alta demanda"}
          </button>
        </div>
      </div>
    </header>
  );
}

interface MetricProps {
  label: string;
  value: string;
  Icon: ComponentType<{ className?: string }>;
  tone: "danger" | "neutral" | "success" | "warning";
}

const metricToneClassName: Record<MetricProps["tone"], string> = {
  danger: "border-[#ff6b5e] bg-[#451711] text-[#ffe2dc]",
  neutral: "border-[#4c3a31] bg-[#2b1f18] text-[#fff7e8]",
  success: "border-[#4d7c49] bg-[#21351f] text-[#e6ffd8]",
  warning: "border-[#c88a2b] bg-[#402a12] text-[#ffe3ae]",
};

function Metric({ Icon, label, tone, value }: MetricProps): ReactElement {
  return (
    <div
      className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 ${metricToneClassName[tone]}`}
    >
      <Icon className="size-5 shrink-0" />
      <div>
        <p className="text-xs font-bold">{label}</p>
        <p className="text-2xl font-black leading-none">{value}</p>
      </div>
    </div>
  );
}
