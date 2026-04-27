"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react";
import { AUTH_EXPIRED_STORAGE_KEY, authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionExpired =
      params.get("reason") === "session-expired" ||
      window.sessionStorage.getItem(AUTH_EXPIRED_STORAGE_KEY) === "true";

    if (sessionExpired) {
      setError("Your session has expired. Please sign in again.");
      window.sessionStorage.removeItem(AUTH_EXPIRED_STORAGE_KEY);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      login(res.token, username);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("403") || msg.toLowerCase().includes("not verified")) {
        setError(
          "Account not verified. Please check your email for the verification code."
        );
      } else if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
        setError("Invalid username or password.");
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
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Rivo access</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#2b2a27]">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f685f]">
          Sign in to review spend, approvals, and reporting.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] border border-[#f1c7c2] bg-[#fff1ef] px-4 py-3 text-sm text-[#b42318]">
          {error}
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
            autoComplete="username"
          />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
            <input
              className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#5865f2] transition hover:text-[#4651d4]"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" className="h-12 w-full rounded-[10px] bg-[#5865f2] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(88,101,242,0.24)] transition hover:bg-[#4c58df] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#706a61]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-[#5865f2] transition hover:text-[#4651d4]">
          Create one
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-[#706a61]">
        Need to verify your account?{" "}
        <Link href="/verify" className="font-bold text-[#5865f2] transition hover:text-[#4651d4]">
          Verify email
        </Link>
      </p>
    </>
  );
}
