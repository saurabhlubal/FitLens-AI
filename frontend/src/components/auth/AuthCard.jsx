export default function AuthCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs">

      <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        {subtitle}
      </p>

      <div className="mt-8">
        {children}
      </div>

    </div>
  );
}