"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const QUICK_ACTIONS = [
  {
    href: "/expenses/add",
    label: "Add Expense",
    description: "Record a new transaction",
    color: "bg-brand-500",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

const STATS = [
  {
    label: "Total Expenses",
    value: "—",
    sub: "All time",
    icon: (
      <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    bg: "bg-brand-50",
  },
  {
    label: "This Month",
    value: "—",
    sub: "Current month",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    bg: "bg-emerald-50",
  },
  {
    label: "Categories",
    value: "—",
    sub: "Tracked",
    icon: (
      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    bg: "bg-violet-50",
  },
  {
    label: "Transactions",
    value: "—",
    sub: "Total count",
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bg: "bg-amber-50",
  },
];

export default function DashboardPage() {
  const { username } = useAuth();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Good day, <span className="text-brand-600">{username}</span> 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Here&apos;s an overview of your finances
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group"
            >
              <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                  {action.label}
                </p>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="card p-6 border-dashed border-2 border-slate-200 bg-slate-50/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              More features coming soon
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Expense history, charts, budget goals, and CSV export are in development.
              Start by adding your first expense!
            </p>
            <Link
              href="/expenses/add"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-600 font-medium hover:text-brand-700"
            >
              Add your first expense
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
