"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FileDown, CheckCheck, Send, Pencil, CloudUpload, Share2, Copy, Check, X } from "lucide-react";

export default function ReportActions({
  reportId,
  status,
  pdfUrl,
  clientEmail,
}: {
  reportId: string;
  status: string;
  pdfUrl?: string | null;
  clientEmail?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState(clientEmail ?? "");
  const [shareLoading, setShareLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

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

  async function savePdf() {
    setLoading("pdf");
    await fetch(`/api/reports/${reportId}/pdf`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  async function sendShareLink() {
    setShareLoading(true);
    setShareError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setShareError(data.error ?? "Failed to create share link.");
      } else {
        const data = await res.json();
        setPortalUrl(data.portalUrl);
      }
    } catch {
      setShareError("Network error. Please try again.");
    } finally {
      setShareLoading(false);
    }
  }

  async function copyPortalUrl() {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openShare() {
    setShareOpen(true);
    setPortalUrl(null);
    setShareError(null);
    setShareEmail(clientEmail ?? "");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 shrink-0">
      {/* Live export — always available */}
      <Link
        href={`/api/reports/${reportId}/pdf`}
        target="_blank"
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
      >
        <FileDown className="w-3.5 h-3.5" />
        Export PDF
      </Link>

      {/* Save to Blob / Download saved */}
      {pdfUrl ? (
        <Link
          href={pdfUrl}
          target="_blank"
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
        >
          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
          Saved PDF
        </Link>
      ) : (
        <button
          onClick={savePdf}
          disabled={loading === "pdf"}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-white/[0.08] disabled:opacity-50 text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          {loading === "pdf" ? "Saving…" : "Save PDF"}
        </button>
      )}

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

      {/* Share with Client */}
      <button
        onClick={shareOpen ? () => setShareOpen(false) : openShare}
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-white/[0.08] text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
      >
        <Share2 className="w-3.5 h-3.5 text-red-400" />
        Share
      </button>
    </div>

    {/* Share panel */}
    {shareOpen && (
      <div className="bg-gray-800 border border-white/[0.10] rounded-xl p-4 w-72 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12.5px] font-semibold text-white">Share with Client</p>
          <button onClick={() => setShareOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {portalUrl ? (
          <div className="space-y-2.5">
            <p className="text-[11.5px] text-gray-500">
              Link sent{shareEmail ? ` to ${shareEmail}` : ""}. Copy the portal URL below.
            </p>
            <div className="flex items-center gap-2 bg-gray-900 border border-white/[0.07] rounded-lg px-3 py-2">
              <p className="text-[11px] text-gray-400 truncate flex-1 font-mono">{portalUrl}</p>
              <button
                onClick={copyPortalUrl}
                className="shrink-0 text-gray-500 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">
                Client email
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-gray-900 border border-white/[0.07] rounded-lg px-3 py-2 text-[12.5px] text-white placeholder:text-gray-700 focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            {shareError && (
              <p className="text-[11.5px] text-[#bf616a]">{shareError}</p>
            )}
            <button
              onClick={sendShareLink}
              disabled={shareLoading || !shareEmail.trim()}
              className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {shareLoading ? "Sending…" : "Send Link"}
            </button>
            <p className="text-[10.5px] text-gray-700 text-center">
              Creates a secure read-only view for the client.
            </p>
          </div>
        )}
      </div>
    )}
  </div>
);
}
