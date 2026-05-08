"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Plus, X } from "lucide-react";
import type { Deficiency, Severity } from "@prisma/client";

const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: "bg-gray-800 text-gray-300",
  MODERATE: "bg-yellow-900 text-yellow-300",
  HIGH: "bg-orange-900 text-orange-300",
  CRITICAL: "bg-red-900 text-red-300",
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
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-gray-300">
            Deficiencies
            {open.length > 0 && (
              <span className="ml-2 bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {open.length}
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
        >
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm ? "Cancel" : "Add Deficiency"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-5 py-4 border-b border-gray-800 space-y-3 bg-gray-800/30">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the deficiency…"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <div className="flex gap-3">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
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
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              onClick={addDeficiency}
              disabled={loading || !description.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? "…" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Open deficiencies */}
      {deficiencies.length === 0 && !showForm ? (
        <div className="px-5 py-8 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No deficiencies recorded.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {open.map((d) => (
            <DeficiencyRow
              key={d.id}
              deficiency={d}
              onToggle={toggleResolved}
            />
          ))}
          {resolved.length > 0 && (
            <>
              <div className="px-5 py-2 bg-gray-800/20">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Resolved ({resolved.length})
                </p>
              </div>
              {resolved.map((d) => (
                <DeficiencyRow
                  key={d.id}
                  deficiency={d}
                  onToggle={toggleResolved}
                />
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
  return (
    <div
      className={`flex items-start gap-3 px-5 py-3 ${
        d.resolved ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={() => onToggle(d.id, !d.resolved)}
        className={`mt-0.5 w-4 h-4 shrink-0 rounded border transition-colors ${
          d.resolved
            ? "bg-green-600 border-green-600"
            : "border-gray-600 hover:border-green-500"
        }`}
        title={d.resolved ? "Mark unresolved" : "Mark resolved"}
      >
        {d.resolved && <CheckCircle className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            d.resolved ? "line-through text-gray-500" : "text-white"
          }`}
        >
          {d.description}
        </p>
        {d.notes && <p className="text-xs text-gray-500 mt-0.5">{d.notes}</p>}
      </div>
      <span
        className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[d.severity]}`}
      >
        {d.severity.charAt(0) + d.severity.slice(1).toLowerCase()}
      </span>
    </div>
  );
}
