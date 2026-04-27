"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, KeyRound, LockKeyhole, User } from "lucide-react";
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
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Set new credentials</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#2b2a27]">Create a new password</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f685f]">
          Use your reset code to secure your Rivo workspace.
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
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Reset code</label>
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

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">New password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
            <input
              className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-[#8a8379] transition hover:text-[#5865f2]"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-[#8a8379]">
            Min 8 chars, 1 uppercase, 1 number, and 1 special character.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Confirm new password</label>
          <input
            className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-4 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="h-12 w-full rounded-[10px] bg-[#5865f2] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(88,101,242,0.24)] transition hover:bg-[#4c58df] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#706a61]">
        Back to{" "}
        <Link href="/login" className="font-bold text-[#5865f2] transition hover:text-[#4651d4]">
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
