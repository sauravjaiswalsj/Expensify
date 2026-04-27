"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,20}$/;

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!USERNAME_REGEX.test(form.username)) {
      newErrors.username =
        "4–20 characters, letters, numbers, dots, underscores, hyphens only";
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!PASSWORD_REGEX.test(form.password)) {
      newErrors.password =
        "Min 8 chars with uppercase, number, and special character";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);

    try {
      await authApi.signup({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      router.push(`/verify?username=${encodeURIComponent(form.username)}&sent=1`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";

      // If backend created the user but failed after that (e.g. email send),
      // try resend to recover and continue verification flow.
      if (err instanceof ApiError && err.status === 500) {
        try {
          await authApi.resend(form.username);
          router.push(
            `/verify?username=${encodeURIComponent(form.username)}&resent=1`
          );
          return;
        } catch {
          // fall through to normal error handling
        }
      }

      if (msg.includes("409") || msg.toLowerCase().includes("exists")) {
        setApiError("Username or email already exists.");
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Join Rivo</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#2b2a27]">Create your workspace</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f685f]">
          Start with secure access for cards, approvals, receipts, and spend reporting.
        </p>
      </div>

      {apiError && (
        <div className="mb-4 rounded-[10px] border border-[#f1c7c2] bg-[#fff1ef] px-4 py-3 text-sm text-[#b42318]">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">First name</label>
            <input
              className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-4 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
              type="text"
              placeholder="Ava"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              autoComplete="given-name"
            />
            {errors.firstName && <p className="mt-1 text-xs text-[#b42318]">{errors.firstName}</p>}
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Last name</label>
            <input
              className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-4 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
              type="text"
              placeholder="Patel"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              autoComplete="family-name"
            />
            {errors.lastName && <p className="mt-1 text-xs text-[#b42318]">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Username</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
          <input
            className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
            type="text"
            placeholder="ava_patel"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            autoComplete="username"
          />
          </div>
          {errors.username && <p className="mt-1 text-xs text-[#b42318]">{errors.username}</p>}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Work email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
          <input
            className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
            type="email"
            placeholder="ava@company.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
          </div>
          {errors.email && <p className="mt-1 text-xs text-[#b42318]">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a948b]" />
            <input
              className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-11 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
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
          {errors.password && <p className="mt-1 text-xs text-[#b42318]">{errors.password}</p>}
          <p className="mt-1 text-xs text-[#8a8379]">
            Min 8 chars, 1 uppercase, 1 number, and 1 special character.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#716b62]">Confirm password</label>
          <input
            className="h-12 w-full rounded-[10px] border border-[#d9d5cc] bg-white px-4 text-sm text-[#2b2a27] outline-none transition placeholder:text-[#9a948b] focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/10"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[#b42318]">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="h-12 w-full rounded-[10px] bg-[#5865f2] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(88,101,242,0.24)] transition hover:bg-[#4c58df] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
          {loading ? "Creating workspace…" : "Create Rivo workspace"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#706a61]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[#5865f2] transition hover:text-[#4651d4]">
          Sign in
        </Link>
      </p>
    </>
  );
}
