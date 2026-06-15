"use client";

import type { PickupBlockDto, PickupZoneDto } from "@sushifrito/shared";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";

import { savePickupBlock, type PickupBlockDraft } from "@/lib/admin-api";

type BlockFormState = {
  end: string;
  id: string;
  isActive: boolean;
  label: string;
  sortOrder: string;
  start: string;
  subtitle: string;
  zone: string;
};

type PickupBlockEditorProps = {
  onSaved: () => Promise<void>;
  zones: PickupZoneDto[];
};

const emptyBlock: BlockFormState = {
  end: "13:00",
  id: "",
  isActive: true,
  label: "",
  sortOrder: "100",
  start: "12:00",
  subtitle: "",
  zone: "",
};

export function PickupBlockEditor({
  onSaved,
  zones,
}: PickupBlockEditorProps): ReactElement {
  const blocks = useMemo(() => zones.flatMap((zone) => zone.blocks), [zones]);
  const [draft, setDraft] = useState<BlockFormState>({
    ...emptyBlock,
    zone: zones[0]?.id ?? "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (): Promise<void> => {
    setIsSaving(true);
    setStatus(null);

    try {
      await savePickupBlock(toBlockDraft(draft));
      await onSaved();
      setStatus("Bloque guardado.");
    } catch {
      setStatus("No se pudo guardar el bloque.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-[#ead8c8] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Horarios</h2>
          <p className="text-sm text-[#6f5b52]">
            Ventanas visibles para retiros programados.
          </p>
        </div>
        <button
          className="rounded-md border border-[#d9271e] px-3 py-2 text-sm font-black text-[#d9271e]"
          onClick={() => {
            setDraft({ ...emptyBlock, zone: zones[0]?.id ?? "" });
          }}
          type="button"
        >
          Nuevo
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="ID" onChange={patch("id")} value={draft.id} />
        <Field label="Titulo" onChange={patch("label")} value={draft.label} />
        <Field
          label="Subtitulo"
          onChange={patch("subtitle")}
          value={draft.subtitle}
        />
        <Field label="Inicio" onChange={patch("start")} value={draft.start} />
        <Field label="Fin" onChange={patch("end")} value={draft.end} />
        <Field
          label="Orden"
          onChange={patch("sortOrder")}
          value={draft.sortOrder}
        />
      </div>
      <label className="mt-3 block text-sm font-black text-[#4b3d37]">
        Punto
        <select
          className="mt-1 w-full rounded-md border border-[#ead8c8] px-3 py-2 font-bold outline-none focus:border-[#d9271e]"
          onChange={(event) => {
            setDraft((current) => ({ ...current, zone: event.target.value }));
          }}
          value={draft.zone}
        >
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm font-bold">
        <input
          checked={draft.isActive}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              isActive: event.target.checked,
            }));
          }}
          type="checkbox"
        />
        Activo
      </label>
      <button
        className="mt-4 rounded-md bg-[#d9271e] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={isSaving || zones.length === 0}
        onClick={() => {
          void save();
        }}
        type="button"
      >
        {isSaving ? "Guardando..." : "Guardar horario"}
      </button>
      {status ? <p className="mt-3 text-sm font-bold">{status}</p> : null}

      <div className="mt-5 grid gap-2">
        {blocks.map((block) => (
          <button
            className="rounded-md border border-[#ead8c8] px-3 py-2 text-left text-sm hover:bg-[#fff8f2]"
            key={block.id}
            onClick={() => {
              setDraft(blockToForm(block));
            }}
            type="button"
          >
            <span className="font-black">{block.label}</span>
            <span className="ml-2 text-[#6f5b52]">
              {block.start}-{block.end} ·{" "}
              {block.isActive ? "Activo" : "Inactivo"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );

  function patch(key: keyof BlockFormState): (value: string) => void {
    return (value) => {
      setDraft((current) => ({ ...current, [key]: value }));
    };
  }
}

function Field({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}): ReactElement {
  return (
    <label className="block text-sm font-black text-[#4b3d37]">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-[#ead8c8] px-3 py-2 font-bold outline-none focus:border-[#d9271e]"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        value={value}
      />
    </label>
  );
}

function blockToForm(block: PickupBlockDto): BlockFormState {
  return {
    end: block.end,
    id: block.id,
    isActive: block.isActive,
    label: block.label,
    sortOrder: String(block.sortOrder),
    start: block.start,
    subtitle: block.subtitle,
    zone: block.zone,
  };
}

function toBlockDraft(form: BlockFormState): PickupBlockDraft {
  return {
    end: form.end,
    id: form.id,
    isActive: form.isActive,
    label: form.label,
    sortOrder: Number.parseInt(form.sortOrder, 10),
    start: form.start,
    subtitle: form.subtitle,
    zone: form.zone,
  };
}
