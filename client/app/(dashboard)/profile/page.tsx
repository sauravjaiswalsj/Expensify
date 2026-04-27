"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type ProfileForm = {
  displayName: string;
  email: string;
  role: string;
  bio: string;
};

export default function ProfilePage() {
  const { username, profile, updateProfile } = useAuth();
  const [form, setForm] = useState<ProfileForm>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <section
        className="surface-panel overflow-hidden p-0"
        style={{
          background:
            "linear-gradient(140deg, color-mix(in srgb, var(--bg-secondary) 96%, transparent), color-mix(in srgb, var(--bg-surface) 88%, transparent))",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-cyan) 28%, var(--border-primary))",
                color: "var(--accent-cyan)",
                backgroundColor: "color-mix(in srgb, var(--accent-cyan) 10%, transparent)",
              }}
            >
              <UserRound className="h-3.5 w-3.5" />
              Profile settings
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
              Rivo profile
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Keep the identity, role, and contact details for your Rivo workspace current.
            </p>
          </div>

          <div
            className="border-t p-6 sm:p-8 lg:border-l lg:border-t-0"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold"
                style={{ background: "var(--hero-gradient)", color: "#ffffff" }}
              >
                {form.displayName?.[0]?.toUpperCase() ?? username?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {form.displayName || username || "Guest User"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  @{username || "user"}
                </p>
                <p
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    color: "var(--accent-green)",
                    backgroundColor: "color-mix(in srgb, var(--accent-green) 12%, transparent)",
                  }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Active workspace member
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} className="surface-panel space-y-5 p-6 sm:p-7">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Account details
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              These details personalize how Rivo presents your workspace account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Display name</label>
              <input
                className="input-field"
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Role label</label>
              <input
                className="input-field"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              className="input-field min-h-[140px] resize-none"
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary px-6">
              Save profile
            </button>
            {saved && (
              <span className="text-sm font-medium" style={{ color: "var(--accent-green)" }}>
                Profile updated
              </span>
            )}
          </div>
        </form>

        <section className="space-y-6">
          <div className="surface-panel p-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Rivo identity
            </h2>
            <div
              className="mt-5 rounded-2xl border p-5"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "color-mix(in srgb, var(--bg-surface) 78%, transparent)",
              }}
            >
              <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {form.displayName || username}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {form.email || "No email added"}
              </p>
              <p
                className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{
                  color: "var(--accent-cyan)",
                  backgroundColor: "color-mix(in srgb, var(--accent-cyan) 12%, transparent)",
                }}
              >
                {form.role || "Member"}
              </p>
              <p className="mt-4 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {form.bio}
              </p>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Workspace access
            </h2>
            <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div
                className="flex items-start gap-3 rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 74%, transparent)",
                }}
              >
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--accent-cyan)" }} />
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Contact identity</p>
                  <p className="mt-1">Your email and display name help keep Rivo notifications and workspace context clear.</p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 74%, transparent)",
                }}
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--accent-green)" }} />
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Role visibility</p>
                  <p className="mt-1">Your role label appears beside your workspace profile, making account ownership easier to scan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
