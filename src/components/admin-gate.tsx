"use client";

import { useState, useEffect } from "react";

const ADMIN_CODE = "746251";
const STORAGE_KEY = "admin_auth";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "true") setAuthenticated(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
    } else {
      setError(true);
    }
  }

  if (authenticated) return <>{children}</>;

  return (
    <div className="max-w-sm mx-auto mt-20 animate-fade-in">
      <div className="card-dark p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-light border border-surface-border flex items-center justify-center">
            <svg
              className="w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Acesso Admin
          </h2>
          <p className="text-muted text-xs mt-1">
            Insira o código de acesso
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="Código de acesso"
            className="input-admin w-full text-center tracking-[0.3em] text-lg"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm text-center">Código incorreto</p>
          )}
          <button
            type="submit"
            className="btn-admin w-full py-3 font-semibold text-sm uppercase tracking-wide"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
