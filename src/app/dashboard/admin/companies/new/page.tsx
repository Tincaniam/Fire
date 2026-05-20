"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    primaryColor: "#5e81ac",
    accentColor: "#88c0d0",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to create company");
      setLoading(false);
      return;
    }

    const company = await res.json();
    router.push(`/dashboard/admin/companies/${company.id}`);
  }

  return (
    <div className="max-w-lg mx-auto py-1 space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-white tracking-tight">New Company</h1>
        <p className="text-gray-500 text-[13px] mt-0.5">
          Create a company account and configure its branding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-amber-400 bg-amber-950/40 border border-amber-700/40 text-[13px] px-4 py-2.5 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-[13px] text-gray-400 font-medium">Company name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme Fire Protection"
            className="w-full bg-gray-900/60 border border-white/[0.08] text-white text-[14px] px-3.5 py-2.5 rounded-lg outline-none focus:border-white/20 placeholder:text-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] text-gray-400 font-medium">Primary color</label>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-white/[0.08] rounded-lg px-3.5 py-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-[13px] text-gray-300 font-mono">{form.primaryColor}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-gray-400 font-medium">Accent color</label>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-white/[0.08] rounded-lg px-3.5 py-2">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-[13px] text-gray-300 font-mono">{form.accentColor}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            {loading ? "Creating…" : "Create Company"}
          </button>
        </div>
      </form>
    </div>
  );
}
