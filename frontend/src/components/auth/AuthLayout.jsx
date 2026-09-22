export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}