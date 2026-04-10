interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function Checkbox({ label, checked, onChange, id }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s/g, '-');
  return (
    <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
      />
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  );
}
