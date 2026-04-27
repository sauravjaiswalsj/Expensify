"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
	{
		href: "/dashboard",
		label: "Dashboard",
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
					d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
				/>
			</svg>
		),
	},
	{
		href: "/expenses/add",
		label: "Add Expense",
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
					d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		),
	},
	{
		href: "/analytics",
		label: "Analytics",
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
					d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
				/>
			</svg>
		),
	},
];

const BOTTOM_NAV = [
	{
		key: "support",
		label: "Support",
		href: "mailto:support@expensify.ai",
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
					d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
	const { logout, username } = useAuth();

	function closeMobileIfNeeded() {
		onCloseMobile?.();
	}

	function handleLogout() {
		logout();
		closeMobileIfNeeded();
		router.push("/login");
	}

	const displayName = username || "test";
	const avatarInitial = displayName[0]?.toUpperCase() ?? "T";

	const sidebarContent = (
		<>
			{/* Brand */}
			<div className="px-6 py-6">
				<h1 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--sidebar-brand-text)" }}>
					<span className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500 text-white text-xs">
						$
					</span>
					Expensify<span style={{ color: "var(--sidebar-brand)" }}>.ai</span>
				</h1>
			</div>

			{/* Main nav */}
			<nav className="flex-1 px-3 py-2 space-y-1">
				{NAV.map((item) => {
					const active =
						pathname === item.href ||
						(item.href !== "/dashboard" && pathname.startsWith(item.href));
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={closeMobileIfNeeded}
							className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-0.5"
							style={{
								color: active ? "var(--sidebar-active-text)" : "var(--sidebar-inactive-text)",
								backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
							}}
						>
							{/* Active indicator */}
							{active && (
								<span
									className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
									style={{ backgroundColor: "var(--sidebar-active-text)" }}
								/>
							)}
							<span className={active ? "" : "group-hover:opacity-80"}>
								{item.icon}
							</span>
							<span className={active ? "" : "group-hover:opacity-80"}>
								{item.label}
							</span>
						</Link>
					);
				})}
			</nav>

			{/* Bottom section */}
			<div className="px-3 py-4 flex flex-col gap-1" style={{ borderTop: "1px solid var(--border-primary)" }}>
				{BOTTOM_NAV.map((item) => (
					<a
						key={item.key}
						href={item.href}
						className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-0.5"
						style={{ color: "var(--sidebar-inactive-text)" }}
						onClick={closeMobileIfNeeded}
					>
						<span className="group-hover:opacity-80">{item.icon}</span>
						<span className="group-hover:opacity-80">{item.label}</span>
					</a>
				))}
				
				{/* User Profile */}
				<div className="mt-2 mb-1 px-3 py-2 flex items-center gap-3">
					<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white flex-shrink-0">
						{avatarInitial}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold truncate leading-tight" style={{ color: "var(--text-primary)" }}>
							{displayName}
						</p>
						<p className="text-xs truncate leading-tight mt-0.5" style={{ color: "var(--text-muted)" }}>
							Free plan
						</p>
					</div>
				</div>

				<button
					onClick={handleLogout}
					className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-0.5"
					style={{ color: "var(--sidebar-inactive-text)" }}
				>
					<svg className="w-5 h-5 group-hover:opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					<span className="group-hover:opacity-80">Sign out</span>
				</button>
			</div>
		</>
	);

	return (
		<>
			{/* Desktop sidebar */}
			<aside
				className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col md:flex"
				style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--border-primary)" }}
			>
				{sidebarContent}
			</aside>

			{/* Mobile sidebar */}
			<div
				className={`fixed inset-0 z-40 md:hidden ${
					mobileOpen ? "" : "pointer-events-none"
				}`}
			>
				<button
					type="button"
					aria-label="Close menu"
					onClick={closeMobileIfNeeded}
					className={`absolute inset-0 transition-opacity ${
						mobileOpen ? "opacity-100" : "opacity-0"
					}`}
					style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
				/>

				<aside
					className={`relative h-full w-72 max-w-[85vw] flex flex-col transition-transform duration-200`}
					style={{ backgroundColor: "var(--sidebar-bg)" }}
				>
					<div className="flex justify-end p-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
						<button
							type="button"
							aria-label="Close menu"
							onClick={closeMobileIfNeeded}
							className="rounded-lg p-2 transition-colors"
							style={{ color: "var(--text-secondary)" }}
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					{sidebarContent}
				</aside>
			</div>
		</>
	);
}
