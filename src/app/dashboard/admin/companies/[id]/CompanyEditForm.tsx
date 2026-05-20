"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Upload } from "lucide-react";

type User = { id: string; name: string | null; email: string; role: string };
type Company = {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  users: User[];
  _count: { clients: number };
};

export default function CompanyEditForm({
  company,
  isSuperAdmin,
}: {
  company: Company;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: company.name,
    primaryColor: company.primaryColor,
    accentColor: company.accentColor,
    logoUrl: company.logoUrl ?? "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logoUrl);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "TECHNICIAN" });
  const [addingUser, setAddingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(company.users);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch(`/api/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        logoUrl: form.logoUrl || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to save");
    } else {
      setSuccess(true);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError(null);

    const fd = new FormData();
    fd.append("logo", file);

    const res = await fetch(`/api/companies/${company.id}/logo`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Upload failed");
    } else {
      const data = await res.json();
      setLogoPreview(data.logoUrl);
      setForm((f) => ({ ...f, logoUrl: data.logoUrl }));
    }
    setUploadingLogo(false);
    // reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddingUser(true);
    setUserError(null);

    const res = await fetch(`/api/companies/${company.id}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUserError(data?.error ?? "Failed to add user");
    } else {
      const created = await res.json();
      setUsers((u) => [...u, created]);
      setNewUser({ name: "", email: "", password: "", role: "TECHNICIAN" });
    }
    setAddingUser(false);
  }

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    COMPANY_ADMIN: "Admin",
    TECHNICIAN: "Technician",
  };

  return (
    <div className="max-w-2xl mx-auto py-1 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-white tracking-tight">{company.name}</h1>
        <p className="text-gray-500 text-[13px] mt-0.5">
          {users.length} user{users.length !== 1 ? "s" : ""} &middot;{" "}
          {company._count.clients} client{company._count.clients !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Branding form */}
      <section className="bg-gray-900/50 border border-white/[0.07] rounded-xl p-5 space-y-4">
        <h2 className="text-[14px] font-semibold text-white">Branding</h2>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <p className="text-amber-400 bg-amber-950/40 border border-amber-700/40 text-[13px] px-4 py-2.5 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-emerald-400 bg-emerald-950/40 border border-emerald-700/40 text-[13px] px-4 py-2.5 rounded-lg">
              Saved successfully.
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-[13px] text-gray-400 font-medium">Company name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-900/60 border border-white/[0.08] text-white text-[14px] px-3.5 py-2.5 rounded-lg outline-none focus:border-white/20"
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

          {/* Logo upload */}
          <div className="space-y-2">
            <label className="text-[13px] text-gray-400 font-medium">Company logo</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-800 border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-gray-600 text-[10px] text-center leading-tight px-1">
                    No logo
                  </span>
                )}
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingLogo ? "Uploading…" : "Upload logo"}
                </button>
                <p className="text-gray-600 text-[11px] mt-1.5">PNG, JPG, SVG, WebP · max 2 MB</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border border-white/[0.05] rounded-lg p-3 flex items-center gap-3 bg-gray-950/40">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
              style={{ backgroundColor: form.primaryColor }}
            >
              {logoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="" className="w-full h-full object-contain" />
              )}
            </div>
            <span className="font-semibold text-[13px] text-white">{form.name || "Company Name"}</span>
            <div className="ml-auto flex gap-1.5">
              <div
                className="w-5 h-5 rounded-full border border-white/10"
                style={{ backgroundColor: form.primaryColor }}
              />
              <div
                className="w-5 h-5 rounded-full border border-white/10"
                style={{ backgroundColor: form.accentColor }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            {saving ? "Saving…" : "Save Branding"}
          </button>
        </form>
      </section>

      {/* Users section */}
      <section className="bg-gray-900/50 border border-white/[0.07] rounded-xl p-5 space-y-4">
        <h2 className="text-[14px] font-semibold text-white">Users</h2>

        {users.length === 0 ? (
          <p className="text-gray-500 text-[13px]">No users yet.</p>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-800/40"
              >
                <div>
                  <p className="text-white text-[13px] font-medium">{u.name ?? u.email}</p>
                  <p className="text-gray-500 text-[12px]">{u.email}</p>
                </div>
                <span className="text-[11px] font-medium text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md">
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add user form */}
        <form onSubmit={handleAddUser} className="border-t border-white/[0.05] pt-4 space-y-3">
          <p className="text-[13px] font-medium text-gray-300 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add user
          </p>
          {userError && (
            <p className="text-amber-400 bg-amber-950/40 border border-amber-700/40 text-[13px] px-3 py-2 rounded-lg">
              {userError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Full name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="bg-gray-900/60 border border-white/[0.08] text-white text-[13px] px-3 py-2 rounded-lg outline-none focus:border-white/20 placeholder:text-gray-600"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="bg-gray-900/60 border border-white/[0.08] text-white text-[13px] px-3 py-2 rounded-lg outline-none focus:border-white/20 placeholder:text-gray-600"
            />
            <input
              required
              type="password"
              placeholder="Password (min 8 chars)"
              minLength={8}
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="bg-gray-900/60 border border-white/[0.08] text-white text-[13px] px-3 py-2 rounded-lg outline-none focus:border-white/20 placeholder:text-gray-600"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="bg-gray-900/60 border border-white/[0.08] text-white text-[13px] px-3 py-2 rounded-lg outline-none focus:border-white/20"
            >
              <option value="TECHNICIAN">Technician</option>
              <option value="COMPANY_ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={addingUser}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {addingUser ? "Adding…" : "Add User"}
          </button>
        </form>
      </section>

      {isSuperAdmin && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/admin/companies")}
            className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to companies
          </button>
        </div>
      )}
    </div>
  );
}
