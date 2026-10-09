export default function Divider({ text = "OR" }) {
  return (
    <div className="my-6 flex items-center">

      <div className="h-px flex-1 bg-slate-200" />

      <span className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {text}
      </span>

      <div className="h-px flex-1 bg-slate-200" />

    </div>
  );
}

