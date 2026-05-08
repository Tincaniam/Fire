"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FileDown, CheckCheck, Send } from "lucide-react";

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
    <div className="flex items-center gap-2">
      <Link
        href={`/api/reports/${reportId}/pdf`}
        target="_blank"
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
      >
        <FileDown className="w-4 h-4" />
        Export PDF
      </Link>

      {status === "DRAFT" && (
        <button
          onClick={() => updateStatus("COMPLETE")}
          disabled={loading === "COMPLETE"}
          className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          {loading === "COMPLETE" ? "…" : "Mark Complete"}
        </button>
      )}

      {status === "COMPLETE" && (
        <button
          onClick={() => updateStatus("SUBMITTED")}
          disabled={loading === "SUBMITTED"}
          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          {loading === "SUBMITTED" ? "…" : "Mark Submitted"}
        </button>
      )}
    </div>
  );
}
