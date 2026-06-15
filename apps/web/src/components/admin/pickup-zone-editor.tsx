"use client";

import type { PickupZoneDto } from "@sushifrito/shared";
import type { ReactElement } from "react";
import { useState } from "react";

import { savePickupZone, type PickupZoneDraft } from "@/lib/admin-api";

type ZoneFormState = {
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  sortOrder: string;
};

type PickupZoneEditorProps = {
  onSaved: () => Promise<void>;
  zones: PickupZoneDto[];
};

const emptyZone: ZoneFormState = {
  description: "",
  id: "",
  isActive: true,
  name: "",
  sortOrder: "100",
};

export function PickupZoneEditor({
  onSaved,
  zones,
}: PickupZoneEditorProps): ReactElement {
  const [draft, setDraft] = useState<ZoneFormState>(emptyZone);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (): Promise<void> => {
    setIsSaving(true);
    setStatus(null);

    try {
      await savePickupZone(toZoneDraft(draft));
      await onSaved();
      setStatus("Punto guardado.");
    } catch {
      setStatus("No se pudo guardar el punto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-[#ead8c8] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Puntos de retiro</h2>
          <p className="text-sm text-[#6f5b52]">
            Facultades, campus y zonas del centro.
          </p>
        </div>
        <button
          className="rounded-md border border-[#d9271e] px-3 py-2 text-sm font-black text-[#d9271e]"
          onClick={() => {
            setDraft(emptyZone);
          }}
          type="button"
        >
          Nuevo
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="ID" onChange={patch("id")} value={draft.id} />
        <Field label="Nombre" onChange={patch("name")} value={draft.name} />
        <Field
          label="Orden"
          onChange={patch("sortOrder")}
          value={draft.sortOrder}
        />
      </div>
      <Field
        label="Descripcion"
        onChange={patch("description")}
        value={draft.description}
      />
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
        disabled={isSaving}
        onClick={() => {
          void save();
        }}
        type="button"
      >
        {isSaving ? "Guardando..." : "Guardar punto"}
      </button>
      {status ? <p className="mt-3 text-sm font-bold">{status}</p> : null}

      <div className="mt-5 grid gap-2">
        {zones.map((zone) => (
          <button
            className="rounded-md border border-[#ead8c8] px-3 py-2 text-left text-sm hover:bg-[#fff8f2]"
            key={zone.id}
            onClick={() => {
              setDraft(zoneToForm(zone));
            }}
            type="button"
          >
            <span className="font-black">{zone.name}</span>
            <span className="ml-2 text-[#6f5b52]">
              {zone.isActive ? "Activo" : "Inactivo"} · {zone.blocks.length}{" "}
              bloques
            </span>
          </button>
        ))}
      </div>
    </section>
  );

  function patch(key: keyof ZoneFormState): (value: string) => void {
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

function zoneToForm(zone: PickupZoneDto): ZoneFormState {
  return {
    description: zone.description,
    id: zone.id,
    isActive: zone.isActive,
    name: zone.name,
    sortOrder: String(zone.sortOrder),
  };
}

function toZoneDraft(form: ZoneFormState): PickupZoneDraft {
  return {
    description: form.description,
    id: form.id,
    isActive: form.isActive,
    name: form.name,
    sortOrder: Number.parseInt(form.sortOrder, 10),
  };
}
