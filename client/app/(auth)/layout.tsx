export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1e30] via-[#053857] to-[#05111b] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#0284c7] mb-3">
            <svg
              className="w-[22px] h-[22px] text-white"
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
          <h1 className="text-[26px] font-bold text-white tracking-tight">
            Expensify<span className="text-[#0284c7]">.ai</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Smart expense tracking, simplified
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
