import Link from "next/link";
import { ArrowLeft, CircleDollarSign, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 py-8 text-[#2b2a27] lg:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2b2a27]">
            <CircleDollarSign className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <span className="text-[18px] font-bold uppercase tracking-[0.24em]">Rivo</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5865f2]">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl py-24">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">About Rivo</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
          We are building a calmer way to manage company spend.
        </h1>
        <p className="mt-6 max-w-3xl text-xl leading-8 text-[#68635b]">
          Rivo brings cards, approvals, reimbursements, receipts, and reporting into one workspace so teams can move quickly without losing financial clarity.
        </p>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            [WalletCards, "Spend should be visible", "Every card, vendor, receipt, and reimbursement should be easy to understand."],
            [ShieldCheck, "Controls should be humane", "Finance policies work best when they guide teams instead of slowing them down."],
            [Sparkles, "Software should reduce follow-up", "Rivo is designed to remove chasing, guessing, and end-of-month cleanup."],
          ].map(([Icon, title, copy]) => (
            <article key={title as string} className="rounded-[10px] border border-[#dedbd2] bg-[#fffcf6] p-6">
              <Icon className="h-6 w-6 text-[#5865f2]" />
              <h2 className="mt-8 text-xl font-semibold">{title as string}</h2>
              <p className="mt-3 text-sm leading-6 text-[#69635a]">{copy as string}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
