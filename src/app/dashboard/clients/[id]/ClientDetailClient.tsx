"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, ClipboardList, Pencil, Check, X, Trash2, ChevronRight } from "lucide-react";

type Site = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  _count: { reports: number };
};

type Client = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  sites: Site[];
};

const inputCls =
  "w-full bg-gray-800/80 border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40 transition-colors";
const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

export default function ClientDetailClient({ client }: { client: Client }) {
  const router = useRouter();

  // Client edit state
  const [editingClient, setEditingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState({
    name: client.name,
    contact: client.contact ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    notes: client.notes ?? "",
  });
  const [savingClient, setSavingClient] = useState(false);

  // Site edit state
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [siteDraft, setSiteDraft] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });
  const [savingSite, setSavingSite] = useState(false);

  // Site delete state
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  function startEditClient() {
    setClientDraft({
      name: client.name,
      contact: client.contact ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
    });
    setEditingClient(true);
  }

  function startEditSite(site: Site) {
    setSiteDraft({
      name: site.name,
      address: site.address,
      city: site.city ?? "",
      state: site.state ?? "",
      zip: site.zip ?? "",
      notes: site.notes ?? "",
    });
    setEditingSiteId(site.id);
  }

  async function saveClient() {
    setSavingClient(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientDraft),
    });
    setSavingClient(false);
    setEditingClient(false);
    router.refresh();
  }

  async function saveSite(siteId: string) {
    setSavingSite(true);
    await fetch(`/api/sites/${siteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteDraft),
    });
    setSavingSite(false);
    setEditingSiteId(null);
    router.refresh();
  }

  async function deleteSite() {
    if (!deletingSite || deleteConfirmText !== deletingSite.name) return;
    setDeleting(true);
    await fetch(`/api/sites/${deletingSite.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeletingSite(null);
    setDeleteConfirmText("");
    router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Delete confirmation modal */}
      {deletingSite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white">Delete Site</h2>
                <p className="text-[12.5px] text-gray-400 mt-0.5">
                  This will permanently delete{" "}
                  <span className="text-white font-medium">{deletingSite.name}</span>{" "}
                  and all its reports. This cannot be undone.
                </p>
              </div>
            </div>
            <div>
              <label className={labelCls}>
                Type{" "}
                <span className="text-white font-medium">{deletingSite.name}</span>{" "}
                to confirm
              </label>
              <input
                className={inputCls}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deletingSite.name}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDeletingSite(null);
                  setDeleteConfirmText("");
                }}
                className="flex-1 text-[12.5px] font-medium text-gray-400 hover:text-white border border-white/[0.08] bg-gray-800/60 hover:bg-gray-800 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteSite}
                disabled={deleteConfirmText !== deletingSite.name || deleting}
                className="flex-1 text-[12.5px] font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed py-2 rounded-lg transition-all"
              >
                {deleting ? "Deleting…" : "Delete Site"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">
            <Link href="/dashboard/clients" className="hover:text-red-400">
              Clients
            </Link>
            {" / "}
            {editingClient ? clientDraft.name || client.name : client.name}
          </p>
          {editingClient ? (
            <input
              className={inputCls + " text-[20px] font-bold mb-2 max-w-sm"}
              value={clientDraft.name}
              onChange={(e) =>
                setClientDraft((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Client name"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          )}
          {!editingClient && client.address && (
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {client.address}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editingClient ? (
            <>
              <button
                onClick={() => setEditingClient(false)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-white border border-white/[0.08] bg-gray-800/60 hover:bg-gray-800 px-3 py-2 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={saveClient}
                disabled={savingClient}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-2 rounded-lg transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                {savingClient ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditClient}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-white border border-white/[0.08] bg-gray-800/60 hover:bg-gray-800 px-3 py-2 rounded-lg transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <Link
                href={`/dashboard/clients/${client.id}/sites/new`}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Site
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Contact info */}
      {editingClient ? (
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Contact</label>
              <input
                className={inputCls}
                value={clientDraft.contact}
                onChange={(e) =>
                  setClientDraft((p) => ({ ...p, contact: e.target.value }))
                }
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={inputCls}
                value={clientDraft.email}
                onChange={(e) =>
                  setClientDraft((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={inputCls}
                value={clientDraft.phone}
                onChange={(e) =>
                  setClientDraft((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="555-0100"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={clientDraft.address}
              onChange={(e) =>
                setClientDraft((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="Street address"
            />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              className={inputCls + " resize-none"}
              rows={2}
              value={clientDraft.notes}
              onChange={(e) =>
                setClientDraft((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Internal notes…"
            />
          </div>
        </div>
      ) : (
        (client.contact || client.email || client.phone) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-wrap gap-6 text-sm">
            {client.contact && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Contact</p>
                <p className="text-white">{client.contact}</p>
              </div>
            )}
            {client.email && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Email</p>
                <a
                  href={`mailto:${client.email}`}
                  className="text-red-400 hover:text-red-300"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Phone</p>
                <a
                  href={`tel:${client.phone}`}
                  className="text-red-400 hover:text-red-300"
                >
                  {client.phone}
                </a>
              </div>
            )}
          </div>
        )
      )}

      {/* Sites */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Sites ({client.sites.length})
        </h2>
        {client.sites.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-8 text-center">
            <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No sites yet.</p>
            <Link
              href={`/dashboard/clients/${client.id}/sites/new`}
              className="text-red-400 hover:text-red-300 text-sm mt-1 inline-block"
            >
              Add the first site →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {client.sites.map((site) =>
              editingSiteId === site.id ? (
                <div
                  key={site.id}
                  className="bg-gray-900 border border-red-500/20 rounded-xl p-5 space-y-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3">
                      <label className={labelCls}>Site Name</label>
                      <input
                        className={inputCls}
                        value={siteDraft.name}
                        onChange={(e) =>
                          setSiteDraft((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Site name"
                        autoFocus
                      />
                    </div>
                    <div className="col-span-3">
                      <label className={labelCls}>Address</label>
                      <input
                        className={inputCls}
                        value={siteDraft.address}
                        onChange={(e) =>
                          setSiteDraft((p) => ({
                            ...p,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input
                        className={inputCls}
                        value={siteDraft.city}
                        onChange={(e) =>
                          setSiteDraft((p) => ({ ...p, city: e.target.value }))
                        }
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>State</label>
                      <input
                        className={inputCls}
                        value={siteDraft.state}
                        onChange={(e) =>
                          setSiteDraft((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        placeholder="OR"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Zip</label>
                      <input
                        className={inputCls}
                        value={siteDraft.zip}
                        onChange={(e) =>
                          setSiteDraft((p) => ({ ...p, zip: e.target.value }))
                        }
                        placeholder="97204"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className={labelCls}>Notes</label>
                      <textarea
                        className={inputCls + " resize-none"}
                        rows={2}
                        value={siteDraft.notes}
                        onChange={(e) =>
                          setSiteDraft((p) => ({
                            ...p,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Internal notes…"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditingSiteId(null)}
                      className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-white border border-white/[0.08] bg-gray-800/60 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={() => saveSite(site.id)}
                      disabled={savingSite}
                      className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {savingSite ? "Saving…" : "Save Site"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={site.id}
                  className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 hover:border-gray-700 transition-colors group"
                >
                  <Link
                    href={`/dashboard/clients/${client.id}/sites/${site.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">
                      {site.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {site.address}
                      {site.city ? `, ${site.city}` : ""}
                      {site.state ? ` ${site.state}` : ""}
                      {" · "}
                      <span className="inline-flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        {site._count.reports} report
                        {site._count.reports !== 1 ? "s" : ""}
                      </span>
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditSite(site)}
                      className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeletingSite(site);
                        setDeleteConfirmText("");
                      }}
                      className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-500/[0.08] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    <Link
                      href={`/dashboard/reports/new?siteId=${site.id}`}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 pr-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      New Report
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
