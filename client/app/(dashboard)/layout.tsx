"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ExpenseDataProvider } from "@/lib/expense-data-context";
import Sidebar from "@/components/sidebar";

const MOBILE_NAV = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    href: "/expenses/add",
    label: "Add",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 6v12m6-6H6" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Stats",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 17l6-6 4 4 8-8M14 7h7v7" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "AI",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: "var(--accent-cyan)",
              borderTopColor: "transparent",
            }}
          />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Sidebar />

      <main className="min-h-screen min-w-0 flex-1 md:ml-60 relative flex flex-col">
        <div
          className="sticky top-0 z-20 md:hidden flex items-center justify-between px-4 py-3 backdrop-blur"
          style={{
            borderBottom: "1px solid var(--border-primary)",
            backgroundColor: "color-mix(in srgb, var(--bg-primary) 88%, transparent)",
          }}
        >
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold text-white">
              $
            </span>
            <span className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Rivo
            </span>
          </Link>
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
              backgroundColor: "color-mix(in srgb, var(--bg-surface) 82%, transparent)",
            }}
            aria-label="Open profile"
          >
            U
          </Link>
        </div>

        <div className="flex-1 px-3 pb-24 pt-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          <ExpenseDataProvider>
            <div className="page-shell">{children}</div>
          </ExpenseDataProvider>
        </div>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
          style={{
            borderColor: "var(--border-primary)",
            backgroundColor: "color-mix(in srgb, var(--bg-secondary) 94%, transparent)",
          }}
        >
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold"
                style={{
                  color: active ? "var(--accent-cyan)" : "var(--text-muted)",
                  backgroundColor: active ? "color-mix(in srgb, var(--accent-cyan) 10%, transparent)" : "transparent",
                }}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
