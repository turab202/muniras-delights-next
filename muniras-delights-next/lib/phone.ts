export function isValidPhoneNumber(value: string) {
  let normalized = value.trim().replace(/[\s().-]/g, '');
  if (normalized.startsWith('00')) normalized = `+${normalized.slice(2)}`;

  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  if (!/^\d+$/.test(digits) || /^([0-9])\1+$/.test(digits)) return false;

  if (normalized.startsWith('+')) return digits.length >= 8 && digits.length <= 15 && digits[0] !== '0';
  return digits.length === 10 && /^0[79]/.test(digits);
}