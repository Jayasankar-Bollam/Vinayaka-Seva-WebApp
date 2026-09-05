// client/src/components/SelectWithOther.jsx
import { useState } from 'react';

/**
 * A dropdown that reveals a free-text input when "Other" is selected.
 * Emits values shaped like: { value: 'Cash' } or { value: 'Other', customValue: 'Cheque' }
 * — matching exactly what our backend otherField() schema expects.
 */
export default function SelectWithOther({ label, options, value, onChange }) {
  const [showCustom, setShowCustom] = useState(value?.value === 'Other');

  function handleSelectChange(e) {
    const selected = e.target.value;
    setShowCustom(selected === 'Other');
    onChange(selected === 'Other' ? { value: 'Other', customValue: '' } : { value: selected });
  }

  function handleCustomChange(e) {
    onChange({ value: 'Other', customValue: e.target.value });
  }

  return (
    <div className="flex flex-col gap-1 mb-3">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className="border rounded-md px-3 py-2 text-sm"
        value={value?.value || ''}
        onChange={handleSelectChange}
      >
        <option value="" disabled>
          Select {label?.toLowerCase()}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>

      {showCustom && (
        <input
          type="text"
          className="border rounded-md px-3 py-2 text-sm"
          placeholder={`Enter custom ${label?.toLowerCase()}`}
          value={value?.customValue || ''}
          onChange={handleCustomChange}
        />
      )}
    </div>
  );
}