"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authApi.forgot(username);
      setSuccess("Reset code sent! Check your email.");
      setTimeout(
        () => router.push(`/reset-password?username=${encodeURIComponent(username)}`),
        2000
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      if (msg.includes("404")) {
        setError("No account found with that username.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Recover access</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#2b2a27]">Reset your password</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f685f]">
          Enter your username and Rivo will send a reset code to your email.
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

        <button type="submit" className="h-12 w-full rounded-[10px] bg-[#5865f2] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(88,101,242,0.24)] transition hover:bg-[#4c58df] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
          {loading ? "Sending reset code…" : "Send reset code"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/reset-password"
          className="text-sm font-semibold text-[#5865f2] transition hover:text-[#4651d4]"
        >
          Already have a reset code?
        </Link>
      </div>

      <p className="mt-4 text-center text-sm text-[#706a61]">
        Remember your password?{" "}
        <Link href="/login" className="font-bold text-[#5865f2] transition hover:text-[#4651d4]">
          Sign in
        </Link>
      </p>
    </>
  );
}
