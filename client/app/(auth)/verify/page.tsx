"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, User } from "lucide-react";
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
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Verify Rivo</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#2b2a27]">Confirm your email</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f685f]">
          Enter the 6-digit code sent to your email to activate your Rivo workspace.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] border border-[#f1c7c2] bg-[#fff1ef] px-4 py-3 text-sm text-[#b42318]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-[10px] border border-[#b7dfcc] bg-[#effaf4] px-4 py-3 text-sm text-[#087f5b]">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Username</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
          <input
            className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Verification code</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
          <input
            className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-center font-mono text-lg tracking-[0.45em] text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
          />
          </div>
        </div>

        <button type="submit" className="h-12 w-full rounded-[10px] bg-[#5865f2] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(88,101,242,0.24)] transition hover:bg-[#4c58df] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
          {loading ? "Verifying…" : "Verify email"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-sm font-semibold text-[#5865f2] transition hover:text-[#4651d4] disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend verification code"}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-[#706a61]">
        Back to{" "}
        <Link href="/login" className="font-bold text-[#5865f2] transition hover:text-[#4651d4]">
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
