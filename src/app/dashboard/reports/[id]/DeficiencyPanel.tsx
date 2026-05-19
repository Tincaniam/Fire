"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Plus, X, Check } from "lucide-react";
import type { Deficiency, Severity } from "@prisma/client";

const SEVERITY_CONFIG: Record<
  Severity,
  { bg: string; text: string; dot: string; label: string }
> = {
  LOW: { bg: "bg-gray-800/70", text: "text-gray-400", dot: "bg-gray-500", label: "Low" },
  MODERATE: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500", label: "Moderate" },
  HIGH: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500", label: "High" },
  CRITICAL: { bg: "bg-[#bf616a]/15", text: "text-[#bf616a]", dot: "bg-[#bf616a]", label: "Critical" },
};

export default function DeficiencyPanel({
  reportId,
  deficiencies: initial,
}: {
  reportId: string;
  deficiencies: Deficiency[];
}) {
  const router = useRouter();
  const [deficiencies, setDeficiencies] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("MODERATE");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const open = deficiencies.filter((d) => !d.resolved);
  const resolved = deficiencies.filter((d) => d.resolved);

  async function addDeficiency() {
    if (!description.trim()) return;
    setLoading(true);
    const res = await fetch("/api/deficiencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, description, severity, notes }),
    });
    if (res.ok) {
      const def = await res.json();
      setDeficiencies((prev) => [...prev, def]);
      setDescription("");
      setNotes("");
      setSeverity("MODERATE");
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function toggleResolved(id: string, resolved: boolean) {
    const res = await fetch(`/api/deficiencies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeficiencies((prev) => prev.map((d) => (d.id === id ? updated : d)));
      router.refresh();
    }
  }

  return (
    <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-[13.5px] font-semibold text-white">
            Deficiencies
          </h2>
          {open.length > 0 && (
            <span className="bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
              {open.length} open
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-white border border-white/[0.08] hover:border-white/[0.15] px-3 py-1.5 rounded-lg transition-all"
        >
          {showForm ? (
            <><X className="w-3 h-3" /> Cancel</>
          ) : (
            <><Plus className="w-3 h-3" /> Add Deficiency</>
          )}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02] space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the deficiency…"
            rows={2}
            className="w-full bg-gray-800/60 border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600/30 transition-all resize-none"
          />
          <div className="flex gap-2.5">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="bg-gray-800/60 border border-white/[0.09] rounded-xl px-3 py-2 text-white text-[13px] focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all"
            >
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              className="flex-1 bg-gray-800/60 border border-white/[0.09] rounded-xl px-3.5 py-2 text-white placeholder-gray-600 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all"
            />
            <button
              onClick={addDeficiency}
              disabled={loading || !description.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all"
            >
              {loading ? "…" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {deficiencies.length === 0 && !showForm ? (
        <div className="px-5 py-10 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2.5" />
          <p className="text-[13px] text-gray-500">No deficiencies recorded.</p>
        </div>
      ) : (
        <div>
          {/* Open */}
          {open.map((d) => (
            <DeficiencyRow key={d.id} deficiency={d} onToggle={toggleResolved} />
          ))}

          {/* Resolved section */}
          {resolved.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-white/[0.02] border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                  Resolved ({resolved.length})
                </p>
              </div>
              {resolved.map((d) => (
                <DeficiencyRow key={d.id} deficiency={d} onToggle={toggleResolved} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DeficiencyRow({
  deficiency: d,
  onToggle,
}: {
  deficiency: Deficiency;
  onToggle: (id: string, resolved: boolean) => void;
}) {
  const sc = SEVERITY_CONFIG[d.severity];
  return (
    <div
      className={`flex items-start gap-3.5 px-5 py-3.5 border-t border-white/[0.04] transition-opacity ${
        d.resolved ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={() => onToggle(d.id, !d.resolved)}
        className={`mt-0.5 w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
          d.resolved
            ? "bg-emerald-600 border-emerald-600"
            : "border-gray-600 hover:border-emerald-500"
        }`}
        title={d.resolved ? "Mark unresolved" : "Mark resolved"}
      >
        {d.resolved && <Check className="w-2.5 h-2.5 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] leading-snug ${
            d.resolved ? "line-through text-gray-500" : "text-white"
          }`}
        >
          {d.description}
        </p>
        {d.notes && (
          <p className="text-[11.5px] text-gray-500 mt-0.5">{d.notes}</p>
        )}
      </div>
      <span
        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
          sc.bg
        } ${sc.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
        {sc.label}
      </span>
    </div>
  );
}
