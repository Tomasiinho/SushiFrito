"use client";

import type { ProductDto } from "@sushifrito/shared";
import type { ReactElement } from "react";
import { useState } from "react";

import { saveProduct, type ProductDraft } from "@/lib/admin-api";

type ProductFormState = {
  category: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  name: string;
  price: string;
  slug: string;
  sortOrder: string;
};

type ProductEditorProps = {
  onSaved: () => Promise<void>;
  products: ProductDto[];
};

const emptyProduct: ProductFormState = {
  category: "rolls",
  description: "",
  imageUrl: "",
  isAvailable: true,
  name: "",
  price: "0",
  slug: "",
  sortOrder: "200",
};

export function ProductEditor({
  onSaved,
  products,
}: ProductEditorProps): ReactElement {
  const [draft, setDraft] = useState<ProductFormState>(emptyProduct);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (): Promise<void> => {
    setIsSaving(true);
    setStatus(null);

    try {
      await saveProduct(toProductDraft(draft));
      await onSaved();
      setStatus("Producto guardado.");
    } catch {
      setStatus("No se pudo guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-[#ead8c8] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Productos y precios</h2>
          <p className="text-sm text-[#6f5b52]">
            Edita catálogo sin tocar Neon manualmente.
          </p>
        </div>
        <button
          className="rounded-md border border-[#d9271e] px-3 py-2 text-sm font-black text-[#d9271e]"
          onClick={() => {
            setDraft(emptyProduct);
          }}
          type="button"
        >
          Nuevo
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TextField label="Slug" onChange={patch("slug")} value={draft.slug} />
        <TextField label="Nombre" onChange={patch("name")} value={draft.name} />
        <TextField
          label="Categoria"
          onChange={patch("category")}
          value={draft.category}
        />
        <TextField
          label="Precio"
          onChange={patch("price")}
          value={draft.price}
        />
        <TextField
          label="Orden"
          onChange={patch("sortOrder")}
          value={draft.sortOrder}
        />
        <TextField
          label="Imagen URL"
          onChange={patch("imageUrl")}
          value={draft.imageUrl}
        />
      </div>
      <TextArea
        label="Descripcion"
        onChange={patch("description")}
        value={draft.description}
      />
      <label className="mt-3 flex items-center gap-2 text-sm font-bold">
        <input
          checked={draft.isAvailable}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              isAvailable: event.target.checked,
            }));
          }}
          type="checkbox"
        />
        Disponible
      </label>
      <button
        className="mt-4 rounded-md bg-[#d9271e] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={isSaving}
        onClick={() => {
          void save();
        }}
        type="button"
      >
        {isSaving ? "Guardando..." : "Guardar producto"}
      </button>
      {status ? <p className="mt-3 text-sm font-bold">{status}</p> : null}

      <div className="mt-5 grid gap-2">
        {products.map((product) => (
          <button
            className="rounded-md border border-[#ead8c8] px-3 py-2 text-left text-sm hover:bg-[#fff8f2]"
            key={product.id}
            onClick={() => {
              setDraft(productToForm(product));
            }}
            type="button"
          >
            <span className="font-black">{product.name}</span>
            <span className="ml-2 text-[#6f5b52]">
              ${product.price.toLocaleString("es-CL")} · {product.category}
            </span>
          </button>
        ))}
      </div>
    </section>
  );

  function patch(key: keyof ProductFormState): (value: string) => void {
    return (value) => {
      setDraft((current) => ({ ...current, [key]: value }));
    };
  }
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}): ReactElement {
  return (
    <label className="text-sm font-black text-[#4b3d37]">
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

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}): ReactElement {
  return (
    <label className="mt-3 block text-sm font-black text-[#4b3d37]">
      {label}
      <textarea
        className="mt-1 min-h-20 w-full rounded-md border border-[#ead8c8] px-3 py-2 font-bold outline-none focus:border-[#d9271e]"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        value={value}
      />
    </label>
  );
}

function productToForm(product: ProductDto): ProductFormState {
  return {
    category: product.category,
    description: product.description,
    imageUrl: product.imageUrl ?? "",
    isAvailable: product.isAvailable,
    name: product.name,
    price: String(product.price),
    slug: product.slug,
    sortOrder: String(product.sortOrder),
  };
}

function toProductDraft(form: ProductFormState): ProductDraft {
  return {
    category: form.category,
    description: form.description,
    imageUrl: form.imageUrl.trim() ? form.imageUrl : null,
    isAvailable: form.isAvailable,
    name: form.name,
    price: Number.parseInt(form.price, 10),
    slug: form.slug,
    sortOrder: Number.parseInt(form.sortOrder, 10),
  };
}
