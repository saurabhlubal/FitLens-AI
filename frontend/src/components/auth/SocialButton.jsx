export default function SocialButton({
  icon,
  text,
}) {
  return (
    <button
      className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 shadow-xs"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

