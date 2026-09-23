export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mb-5">

      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
      />

    </div>
  );
}