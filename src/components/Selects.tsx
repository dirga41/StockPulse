type Option = { id: number; label: string };

export function Select({
  name,
  label,
  options,
  defaultValue,
  placeholder = "Pilih...",
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: number | string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} required className="input">
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
