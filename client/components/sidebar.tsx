"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
	{
		href: "/dashboard",
		label: "Dashboard",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
		),
	},
	{
		href: "/expenses/add",
		label: "Add Expense",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 4v16m8-8H4"
				/>
			</svg>
		),
	},
];

type SidebarProps = {
	mobileOpen?: boolean;
	onCloseMobile?: () => void;
};

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { username, logout } = useAuth();

	function closeMobileIfNeeded() {
		onCloseMobile?.();
	}

	function handleLogout() {
		logout();
		closeMobileIfNeeded();
		router.push("/login");
	}

	const sidebarContent = (
		<>
			<div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
				<div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
					<svg
						className="w-5 h-5 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<span className="text-white font-bold text-lg">
					Expensify<span className="text-brand-400">.ai</span>
				</span>
			</div>

			<nav className="flex-1 px-3 py-4 space-y-1">
				{NAV.map((item) => {
					const active = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={closeMobileIfNeeded}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
								active
									? "bg-brand-600 text-white"
									: "text-slate-400 hover:text-white hover:bg-slate-800"
							}`}
						>
							{item.icon}
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="px-3 py-4 border-t border-slate-800">
				<div className="flex items-center gap-3 px-3 py-2 mb-1">
					<div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
						{username?.[0]?.toUpperCase() ?? "U"}
					</div>
					<div className="min-w-0">
						<p className="text-white text-sm font-medium truncate">
							{username}
						</p>
						<p className="text-slate-500 text-xs">Free plan</p>
					</div>
				</div>
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					Sign out
				</button>
			</div>
		</>
	);

	return (
		<>
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 md:flex">
				{sidebarContent}
			</aside>

			<div
				className={`fixed inset-0 z-40 md:hidden ${
					mobileOpen ? "" : "pointer-events-none"
				}`}
			>
				<button
					type="button"
					aria-label="Close menu"
					onClick={closeMobileIfNeeded}
					className={`absolute inset-0 bg-slate-900/50 transition-opacity ${
						mobileOpen ? "opacity-100" : "opacity-0"
					}`}
				/>

				<aside
					className={`relative h-full w-72 max-w-[85vw] bg-slate-900 flex flex-col transition-transform duration-200 ${
						mobileOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="flex justify-end p-3 border-b border-slate-800">
						<button
							type="button"
							aria-label="Close menu"
							onClick={closeMobileIfNeeded}
							className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
					{sidebarContent}
				</aside>
			</div>
		</>
	);
}
