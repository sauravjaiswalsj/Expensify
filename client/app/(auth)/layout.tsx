import Link from "next/link";
import {
  BarChart3,
  CircleDollarSign,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#2b2a27]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-[#dedbd2] bg-[#171712] p-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(23,23,18,0)_0%,rgba(88,101,242,0.22)_100%)]" />
          <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70">
              <CircleDollarSign className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span className="text-[18px] font-bold uppercase tracking-[0.24em]">Rivo</span>
          </Link>

          <div className="relative z-10 mt-auto max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#cbd1ff]">
              <Sparkles className="h-4 w-4" />
              Finance operations, without the chase
            </div>
            <h1 className="text-5xl font-semibold leading-tight tracking-normal">
              Secure access to your Rivo workspace.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/68">
              Manage cards, approvals, receipts, reimbursements, and spend reporting from one calm place.
            </p>
          </div>

          <div className="relative z-10 mt-12 rounded-[14px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur">
            <div className="rounded-[10px] bg-[#fbfcfb] p-4 text-[#2b2a27]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#615b52]">Rivo balance</p>
                  <p className="mt-1 text-3xl font-semibold">$84,260</p>
                </div>
                <BarChart3 className="h-6 w-6 text-[#5865f2]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [WalletCards, "Cards", "36 live"],
                  [ReceiptText, "Receipts", "92% matched"],
                  [ShieldCheck, "Controls", "12 rules"],
                ].map(([Icon, label, value]) => (
                  <div key={label as string} className="rounded-[10px] border border-[#e7e2d8] bg-[#f4f3ef] p-3">
                    <Icon className="h-4 w-4 text-[#5865f2]" />
                    <p className="mt-4 text-xs text-[#716b62]">{label as string}</p>
                    <p className="mt-1 text-sm font-semibold">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 lg:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2b2a27]">
                  <CircleDollarSign className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <span className="text-[18px] font-bold uppercase tracking-[0.24em]">Rivo</span>
              </Link>
              <Link href="/" className="ml-auto text-sm font-semibold text-[#5865f2] transition hover:text-[#4651d4]">
                Back home
              </Link>
            </div>

            <div className="rounded-[14px] border border-[#dedbd2] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(44,38,28,0.12)] sm:p-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
