export default function SocialButton({
  icon,
  text,
}) {
  return (
    <button
      className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-800 py-3 text-white transition hover:bg-slate-700"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}