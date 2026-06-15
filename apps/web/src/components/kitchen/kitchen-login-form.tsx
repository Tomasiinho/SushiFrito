"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

export function KitchenLoginForm(): ReactElement {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/kitchen/login", {
        body: JSON.stringify({ password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        setError("Password incorrecto.");
        return;
      }

      router.replace("/kitchen");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="w-full max-w-[420px] rounded-lg border border-[#ead8c8] bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="mb-6">
        <p className="text-sm font-black text-[#b1261f] uppercase">
          Acceso operacional
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#1d1713]">
          SushiFrito cocina
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6f5b52]">
          Entra para ver pedidos, pausar alta demanda y editar la operacion.
        </p>
      </div>

      <label
        className="text-sm font-black text-[#4b3d37] uppercase"
        htmlFor="kitchen-password"
      >
        Password
      </label>
      <input
        autoComplete="current-password"
        className="mt-2 w-full rounded-md border border-[#ead8c8] px-4 py-3 text-base font-bold text-[#1d1713] outline-none focus:border-[#b1261f] focus:ring-2 focus:ring-[#f3b0a9]"
        id="kitchen-password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
        type="password"
        value={password}
      />

      {error ? (
        <p className="mt-3 rounded-md bg-[#fff0ee] px-3 py-2 text-sm font-bold text-[#b1261f]">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 w-full rounded-md bg-[#d9271e] px-4 py-3 text-base font-black text-white disabled:opacity-60"
        disabled={isSubmitting || password.trim().length === 0}
        type="submit"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
