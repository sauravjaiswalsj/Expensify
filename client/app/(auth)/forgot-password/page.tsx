"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      <h2 className="text-[22px] font-bold text-slate-900 mb-1">Forgot password</h2>
      <p className="text-sm text-slate-500 mb-6">
        Enter your username and we&apos;ll send a reset code to your email
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
          <input
            className="w-full px-4 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors" disabled={loading}>
          {loading ? "Sending reset code…" : "Send reset code"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/reset-password"
          className="text-sm text-sky-600 hover:text-sky-700 font-medium"
        >
          Already have a reset code?
        </Link>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link href="/login" className="text-sky-600 hover:text-sky-700 font-bold">
          Sign in
        </Link>
      </p>
    </>
  );
}
