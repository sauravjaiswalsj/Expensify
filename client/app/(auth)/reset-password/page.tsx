"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState(searchParams.get("username") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!PASSWORD_REGEX.test(password)) {
      setError("Password must be 8+ chars with uppercase, number, and special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        username,
        password,
        confirmPassword,
        verificationCode: code,
      });
      setSuccess("Password reset successful! Redirecting to login…");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      if (msg.includes("401") || msg.toLowerCase().includes("incorrect")) {
        setError("Invalid reset code.");
      } else if (msg.toLowerCase().includes("expired")) {
        setError("Reset code has expired. Please request a new one.");
      } else if (msg.includes("404")) {
        setError("User not found.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Reset password</h2>
      <p className="text-sm text-slate-500 mb-6">
        Enter your reset code and choose a new password
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Username</label>
          <input
            className="input-field"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Reset code</label>
          <input
            className="input-field text-center tracking-[0.5em] text-lg font-mono"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
          />
        </div>

        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input
              className="input-field pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Min 8 chars · 1 uppercase · 1 number · 1 special character
          </p>
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Back to{" "}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
