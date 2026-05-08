"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const SERVICE_TYPES = [
  "FIRE_EXTINGUISHER",
  "SPRINKLER",
  "FIRE_ALARM",
  "SUPPRESSION_SYSTEM",
  "BACKFLOW",
  "OTHER",
] as const;

const schema = z.object({
  siteId: z.string().min(1, "Site required"),
  technicianId: z.string().min(1, "Technician required"),
  inspectionDate: z.string().min(1, "Date required"),
  serviceType: z.enum(SERVICE_TYPES),
  notes: z.string().optional(),
  lineItems: z.array(
    z.object({
      label: z.string().min(1, "Label required"),
      result: z.enum(["PASS", "FAIL", "NA"]),
      notes: z.string().optional(),
    })
  ),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_ITEMS: Array<{ label: string; result: "PASS" | "FAIL" | "NA"; notes: string }> = [
  { label: "Extinguisher present and accessible", result: "PASS", notes: "" },
  { label: "Correct type for hazard", result: "PASS", notes: "" },
  { label: "Pressure gauge in operable range", result: "PASS", notes: "" },
  { label: "Pull pin intact and tamper seal present", result: "PASS", notes: "" },
  { label: "No corrosion, dents, or damage", result: "PASS", notes: "" },
  { label: "Label / inspection tag current", result: "PASS", notes: "" },
];

export default function NewReportForm({
  sites,
  users,
  currentUserId,
  defaultSiteId,
}: {
  sites: { id: string; name: string; clientName: string }[];
  users: { id: string; name: string }[];
  currentUserId: string;
  defaultSiteId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteId: defaultSiteId ?? "",
      technicianId: currentUserId,
      inspectionDate: new Date().toISOString().split("T")[0],
      serviceType: "FIRE_EXTINGUISHER",
      lineItems: DEFAULT_ITEMS,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      const report = await res.json();
      router.push(`/dashboard/reports/${report.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Report Details
        </h2>

        <Field label="Site *" error={errors.siteId?.message}>
          <select {...register("siteId")} className={selectClass}>
            <option value="">— Select site —</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.clientName} / {s.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Service Type *" error={errors.serviceType?.message}>
            <select {...register("serviceType")} className={selectClass}>
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Inspection Date *" error={errors.inspectionDate?.message}>
            <input type="date" {...register("inspectionDate")} className={inputClass} />
          </Field>
        </div>

        <Field label="Technician *" error={errors.technicianId?.message}>
          <select {...register("technicianId")} className={selectClass}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Notes" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="General notes about this inspection…"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Inspection checklist */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Checklist Items
          </h2>
          <button
            type="button"
            onClick={() => append({ label: "", result: "PASS", notes: "" })}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
          >
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <input
                  {...register(`lineItems.${i}.label`)}
                  placeholder="Inspection item"
                  className={inputClass}
                />
                {errors.lineItems?.[i]?.label && (
                  <p className="text-xs text-red-400">
                    {errors.lineItems[i]?.label?.message}
                  </p>
                )}
              </div>
              <select
                {...register(`lineItems.${i}.result`)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="NA">N/A</option>
              </select>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-600 hover:text-red-400 mt-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Saving…" : "Save Report"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent";

const selectClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent";

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
