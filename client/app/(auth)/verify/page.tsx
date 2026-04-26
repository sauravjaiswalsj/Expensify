"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { Suspense } from "react";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState(searchParams.get("username") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (searchParams.get("resent") === "1") {
      setSuccess("Account created. We re-sent your verification code.");
      return;
    }

    if (searchParams.get("sent") === "1") {
      setSuccess("Verification code sent. Check your email inbox.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.verify({ username, verificationCode: code });
      setSuccess("Email verified! Redirecting to login…");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      if (msg.includes("401") || msg.toLowerCase().includes("incorrect")) {
        setError("Invalid verification code.");
      } else if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setError("Account is already verified. You can sign in now.");
      } else if (msg.toLowerCase().includes("expired")) {
        setError("Verification code has expired. Please request a new one.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!username) {
      setError("Please enter your username first.");
      return;
    }
    setError("");
    setResending(true);

    try {
      await authApi.resend(username);
      setSuccess("A new verification code has been sent to your email.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend";
      setError(msg);
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Verify your email</h2>
      <p className="text-sm text-slate-500 mb-6">
        Enter the 6-digit code sent to your email address
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
          <label className="label">Verification code</label>
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

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Verifying…" : "Verify email"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend verification code"}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Back to{" "}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
