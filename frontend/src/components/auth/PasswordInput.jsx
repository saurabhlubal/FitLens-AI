import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-5">

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">

        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 pr-12 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

      </div>

    </div>
  );
}