"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ExpenseDataProvider } from "@/lib/expense-data-context";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login?reason=session-expired");
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
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main className="min-h-screen flex-1 md:ml-60 relative flex flex-col">
        {/* Mobile menu button (only visible on mobile) */}
        <div className="md:hidden p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <ExpenseDataProvider>
            <div className="page-shell">{children}</div>
          </ExpenseDataProvider>
        </div>
      </main>
    </div>
  );
}
