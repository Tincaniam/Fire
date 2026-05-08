"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(1, "Site name required"),
  address: z.string().min(1, "Address required"),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, clientId }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(`/dashboard/clients/${clientId}`);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-xs text-gray-500 mb-1">
          <Link href="/dashboard/clients" className="hover:text-red-400">Clients</Link>
          {" / "}
          <Link href={`/dashboard/clients/${clientId}`} className="hover:text-red-400">Client</Link>
          {" / New Site"}
        </p>
        <h1 className="text-2xl font-bold text-white">New Site</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5"
      >
        <Field label="Site Name *" error={errors.name?.message}>
          <input {...register("name")} placeholder="Main Building" className={inputClass} />
        </Field>
        <Field label="Street Address *" error={errors.address?.message}>
          <input {...register("address")} placeholder="123 Main St" className={inputClass} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="City" error={errors.city?.message}>
            <input {...register("city")} placeholder="Portland" className={inputClass} />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <input {...register("state")} placeholder="OR" className={inputClass} />
          </Field>
          <Field label="ZIP" error={errors.zip?.message}>
            <input {...register("zip")} placeholder="97201" className={inputClass} />
          </Field>
        </div>
        <Field label="Notes" error={errors.notes?.message}>
          <textarea {...register("notes")} rows={3} placeholder="Access codes, hazards, notes…" className={inputClass} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Saving…" : "Save Site"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
