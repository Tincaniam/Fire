"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  contact: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      const client = await res.json();
      router.push(`/dashboard/clients/${client.id}`);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">New Client</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5"
      >
        <Field label="Business Name *" error={errors.name?.message}>
          <input {...register("name")} placeholder="Acme Fire Protection" className={inputClass} />
        </Field>
        <Field label="Primary Contact" error={errors.contact?.message}>
          <input {...register("contact")} placeholder="Jane Smith" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" error={errors.email?.message}>
            <input {...register("email")} type="email" placeholder="jane@acme.com" className={inputClass} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input {...register("phone")} placeholder="503-555-1234" className={inputClass} />
          </Field>
        </div>
        <Field label="Address" error={errors.address?.message}>
          <input {...register("address")} placeholder="123 Main St, Portland OR 97201" className={inputClass} />
        </Field>
        <Field label="Notes" error={errors.notes?.message}>
          <textarea {...register("notes")} rows={3} placeholder="Any notes…" className={inputClass} />
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
            {loading ? "Saving…" : "Save Client"}
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
