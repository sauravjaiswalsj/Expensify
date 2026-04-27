import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  HomeIcon,
  Landmark,
  ListChecks,
  Menu,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

const sidebarItems = [
  [HomeIcon, "Home"],
  [ListChecks, "Approvals"],
  [ReceiptText, "Transactions"],
  [Send, "Payments"],
  [CreditCard, "Cards"],
  [Landmark, "Accounts"],
];

const accounts = [
  ["Team cards", "$18,420.32"],
  ["Reimbursements", "$8,104.00"],
  ["Operating account", "$214,860.18"],
  ["Reserved budget", "$92,300.00"],
];

const features = [
  {
    title: "Spend controls that feel calm",
    copy: "Set rules for cards, teams, vendors, and approvals without turning finance into a bottleneck.",
    icon: ShieldCheck,
  },
  {
    title: "Receipts that find their match",
    copy: "Rivo keeps receipts, notes, and categories connected to the right transaction from day one.",
    icon: ReceiptText,
  },
  {
    title: "Close-ready reporting",
    copy: "See budgets, exceptions, and recurring spend in one place before month-end becomes a scramble.",
    icon: BarChart3,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f3ef] text-[#2b2a27]">
      <header className="relative z-30">
        <nav className="mx-auto flex h-[84px] max-w-[1880px] items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Rivo home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2b2a27]">
              <CircleDollarSign className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span className="text-[18px] font-bold uppercase tracking-[0.24em]">Rivo</span>
          </Link>

          <div className="hidden items-center gap-12 text-[16px] text-[#2f2d2a] lg:flex">
            <div className="group relative">
              <button className="inline-flex items-center gap-1.5 transition hover:text-[#5865f2]">
                Product
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-1/2 top-9 w-[260px] -translate-x-1/2 rounded-[10px] border border-[#dedbd2] bg-[#fffdf8] p-2 text-left opacity-0 shadow-[0_22px_60px_rgba(44,38,28,0.16)] transition group-hover:visible group-hover:opacity-100">
                <Link href="/" className="flex gap-3 rounded-[8px] p-3 transition hover:bg-[#f1eee6]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#eef0ff] text-[#5865f2]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-[#2b2a27]">Rivo</span>
                    <span className="mt-1 block text-sm leading-5 text-[#706a61]">
                      Cards, approvals, receipts, and reporting in one workspace.
                    </span>
                  </span>
                </Link>
              </div>
            </div>
            <Link href="/about" className="transition hover:text-[#5865f2]">
              About
            </Link>
            <Link href="/privacy-policy" className="transition hover:text-[#5865f2]">
              Privacy Policy
            </Link>
          </div>

          <div className="hidden items-center gap-8 text-[16px] sm:flex">
            <Link href="/login" className="font-medium transition hover:text-[#5865f2]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#5865f2] px-6 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(88,101,242,0.28)] transition hover:bg-[#4c58df]"
            >
              Open account
            </Link>
          </div>

          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8d6cf] lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      <section className="relative min-h-[calc(100vh-84px)] px-4 pt-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ddd8ce] bg-[#fffdf8]/80 px-4 py-2 text-sm font-semibold text-[#686158]">
            <Sparkles className="h-4 w-4 text-[#5865f2]" />
            Rivo for modern expense operations
          </div>
          <h1 className="max-w-5xl text-[52px] font-semibold leading-[0.96] tracking-normal text-[#2f2e2a] sm:text-[76px] lg:text-[88px]">
            Company spend, finally easy to steer.
          </h1>
          <p className="mt-6 max-w-[640px] text-[21px] leading-[1.32] text-[#68635b]">
            Rivo gives teams smart cards, clean approvals, receipt matching, and live spend visibility without the month-end chase.
          </p>

          <div className="mt-11 flex w-full max-w-[620px] flex-col items-center justify-center gap-3 sm:flex-row">
            <form className="flex h-12 w-full flex-1 items-center rounded-full border border-[#cbc9c4] bg-[#e9e8e8] p-1 shadow-inner">
              <label htmlFor="email" className="sr-only">
                Enter your email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your work email"
                className="min-w-0 flex-1 bg-transparent px-5 text-[16px] text-[#2b2a27] outline-none placeholder:text-[#67625a]"
              />
              <Link
                href="/signup"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#5865f2] px-6 text-[16px] font-semibold text-white transition hover:bg-[#4c58df]"
              >
                Open account
              </Link>
            </form>
            <Link
              href="/login"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[#d0cec8] bg-[#e9e8e8] px-6 text-[16px] text-[#2f2d2a] transition hover:bg-[#dfded9]"
            >
              Launch demo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[47%] bg-[linear-gradient(180deg,rgba(244,243,239,0)_0%,#eee9df_58%,#e6dfd1_100%)]" />
        <div className="pointer-events-none absolute bottom-16 right-8 hidden rounded-full bg-white/60 px-7 py-4 text-lg font-medium text-[#b8b2aa] shadow-sm xl:block">
          Receipt intelligence
        </div>
        <div className="pointer-events-none absolute bottom-40 left-10 hidden rounded-full bg-white/60 px-7 py-4 text-lg font-medium text-[#b8b2aa] shadow-sm xl:block">
          Policy controls
        </div>

        <div className="relative z-10 mx-auto mt-16 w-full max-w-[1348px]">
          <div className="mx-auto h-[56px] w-[88%] rounded-t-[28px] bg-[#15151d] shadow-[0_-6px_24px_rgba(30,28,24,0.2)]" />
          <div className="relative mx-auto -mt-8 overflow-hidden rounded-t-[22px] border-[14px] border-[#171721] bg-[#f8faf8] shadow-[0_28px_90px_rgba(40,34,24,0.25)]">
            <div className="grid min-h-[510px] grid-cols-[210px_1fr] bg-[#fbfcfb]">
              <aside className="hidden border-r border-[#e8ece9] bg-[#f5f7f5] p-5 md:block">
                <div className="mb-10 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865f2] text-white">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#585651]">Rivo</p>
                    <p className="text-xs text-[#9a968e]">Finance workspace</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {sidebarItems.map(([Icon, label], index) => (
                    <div
                      key={label as string}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                        index === 0 ? "bg-[#eef0f4] font-semibold text-[#242321]" : "text-[#5e5a54]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label as string}
                    </div>
                  ))}
                </div>
              </aside>

              <div className="min-w-0">
                <div className="flex h-16 items-center gap-5 border-b border-[#e9ece9] px-6">
                  <div className="flex h-10 max-w-[600px] flex-1 items-center gap-3 rounded-lg border border-[#e5e8e5] bg-white px-4 text-sm text-[#a09c95]">
                    <Search className="h-4 w-4" />
                    Search spend, vendors, cards
                  </div>
                  <button className="hidden h-10 items-center gap-2 rounded-full border border-[#e6e9e6] bg-white px-5 text-sm font-semibold text-[#5865f2] sm:flex">
                    Move Money
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <Bell className="h-5 w-5 text-[#8e8980]" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ede8ff] text-sm font-bold text-[#5865f2]">
                    R
                  </div>
                </div>

                <div className="p-6 sm:p-9">
                  <h2 className="text-[34px] font-medium tracking-normal text-[#292824]">Good morning, Rivo team</h2>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {["Send", "Approve", "Create card", "Reimburse", "Upload receipt", "Export report"].map((action, index) => (
                      <button
                        key={action}
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          index === 0 ? "bg-[#5865f2] text-white" : "bg-[#eff1ef] text-[#56534d]"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.98fr]">
                    <section className="rounded-xl border border-[#e6e9e6] bg-white p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-[#68635b]">Rivo balance</p>
                          <p className="mt-2 text-[32px] font-medium text-[#292824]">$5,216,471.18</p>
                          <p className="mt-2 text-sm text-[#807b73]">Live spend trend</p>
                        </div>
                        <BarChart3 className="h-6 w-6 text-[#5865f2]" />
                      </div>
                      <div className="mt-8 h-36 overflow-hidden rounded-lg bg-[#f7f8ff]">
                        <svg viewBox="0 0 520 160" className="h-full w-full" preserveAspectRatio="none">
                          <path d="M0 118 C35 82, 48 92, 62 74 S93 98, 110 52 S142 132, 170 112 S210 132, 235 109 S270 136, 310 116 S356 126, 380 104 S405 136, 442 102 S492 132, 520 78 L520 160 L0 160 Z" fill="#dfe4ff" />
                          <path d="M0 118 C35 82, 48 92, 62 74 S93 98, 110 52 S142 132, 170 112 S210 132, 235 109 S270 136, 310 116 S356 126, 380 104 S405 136, 442 102 S492 132, 520 78" fill="none" stroke="#7d8bff" strokeWidth="3" />
                        </svg>
                      </div>
                    </section>

                    <section className="rounded-xl border border-[#e6e9e6] bg-white p-6">
                      <div className="mb-7 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[#55524c]">Rivo accounts</h3>
                        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f1ef] text-xl text-[#77726b]">
                          +
                        </button>
                      </div>
                      <div className="space-y-5">
                        {accounts.map(([name, amount]) => (
                          <div key={name} className="flex items-center justify-between gap-4 text-sm">
                            <span className="font-medium text-[#716c64]">{name}</span>
                            <span className="text-[#77726b]">{amount}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-7 left-1/2 hidden w-[72%] -translate-x-1/2 rounded-lg bg-[#171712] px-8 py-4 text-center text-sm text-white shadow-xl lg:block">
            Rivo turns receipts, approvals, reimbursements, and reporting into one clear operating rhythm.
          </div>
        </div>
      </section>

      <section className="border-y border-[#dedbd2] bg-[#fffcf6] px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Built around Rivo</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-[#2f2e2a] sm:text-5xl">
              A finance workspace your team can actually live in.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="rounded-[10px] border border-[#dedbd2] bg-[#f6f2ea] p-5">
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-[#5865f2]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#2f2e2a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#69635a]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#171712] px-6 py-20 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#aeb8ff]">
              <Zap className="h-4 w-4" />
              Rivo starts simple
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Replace expense chaos with a workspace that keeps moving.
            </h2>
          </div>
          <Link
            href="/signup"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#171712] transition hover:bg-[#eee9df]"
          >
            Open Rivo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
