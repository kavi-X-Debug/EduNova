/** Pure: apply one key press to the typed text. Exported for tests. */
export function applyKey(value: string, key: string, o: { allowNegative?: boolean; allowDecimal?: boolean; maxLength?: number } = {}): string {
  const max = o.maxLength ?? 8;
  if (key === 'Backspace') return value.slice(0, -1);
  if (key === '-') return o.allowNegative && value === '' ? '-' : value;
  if (key === '.') return o.allowDecimal && !value.includes('.') && value.replace('-', '').length < max ? (value === '' || value === '-' ? `${value}0.` : `${value}.`) : value;
  if (/^[0-9]$/.test(key)) {
    if (value.replace('-', '').length >= max) return value;
    if (value === '0') return key; // no leading zeros
    if (value === '-0') return `-${key}`;
    return value + key;
  }
  return value;
}

