"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FileDown, CheckCheck, Send, Pencil } from "lucide-react";

export default function ReportActions({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={`/api/reports/${reportId}/pdf`}
        target="_blank"
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
      >
        <FileDown className="w-3.5 h-3.5" />
        Export PDF
      </Link>

      {status === "DRAFT" && (
        <Link
          href={`/dashboard/reports/${reportId}/edit`}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Draft
        </Link>
      )}

      {status === "DRAFT" && (
        <button
          onClick={() => updateStatus("COMPLETE")}
          disabled={loading === "COMPLETE"}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all shadow-[0_1px_8px_rgba(16,185,129,0.2)]"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          {loading === "COMPLETE" ? "Saving…" : "Mark Complete"}
        </button>
      )}

      {status === "COMPLETE" && (
        <button
          onClick={() => updateStatus("SUBMITTED")}
          disabled={loading === "SUBMITTED"}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all shadow-[0_1px_8px_rgba(59,130,246,0.2)]"
        >
          <Send className="w-3.5 h-3.5" />
          {loading === "SUBMITTED" ? "Saving…" : "Mark Submitted"}
        </button>
      )}
    </div>
  );
}
