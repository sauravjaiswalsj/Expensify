import Link from "next/link";
import { ArrowLeft, CircleDollarSign } from "lucide-react";

const sections = [
  ["Information we collect", "Rivo may collect account details, profile information, expense records, transaction metadata, and technical information needed to operate the product."],
  ["How we use information", "We use information to provide the service, secure accounts, improve product quality, support users, and communicate important updates."],
  ["Data protection", "We design Rivo with access controls, encryption-minded practices, and operational safeguards appropriate for financial workflows."],
  ["Your choices", "You can update account information, request support, and manage product communications where those controls are available."],
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 py-8 text-[#2b2a27] lg:px-8">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
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

      <section className="mx-auto max-w-5xl py-24">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5865f2]">Privacy Policy</p>
        <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
          Privacy at Rivo
        </h1>
        <p className="mt-6 max-w-3xl text-xl leading-8 text-[#68635b]">
          This page summarizes how Rivo thinks about data for the expense management experience. Replace this draft with reviewed legal language before production use.
        </p>

        <div className="mt-14 divide-y divide-[#dedbd2] rounded-[10px] border border-[#dedbd2] bg-[#fffcf6]">
          {sections.map(([title, copy]) => (
            <section key={title} className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-[#69635a]">{copy}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
