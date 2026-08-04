export default function Divider({ text = "OR" }) {
  return (
    <div className="my-6 flex items-center">

      <div className="h-px flex-1 bg-white/10" />

      <span className="px-4 text-sm text-slate-400">
        {text}
      </span>

      <div className="h-px flex-1 bg-white/10" />

    </div>
  );
}