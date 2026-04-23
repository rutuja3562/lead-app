import { ValidationRule } from '../types';

// ── Pure validators ────────────────────────────────────────────────────────────

export const isRequired = (v: string): boolean =>
  v !== null && v !== undefined && v.trim().length > 0;

export const meetsMinLength = (v: string, min: number): boolean =>
  v.trim().length >= min;

export const meetsMaxLength = (v: string, max: number): boolean =>
  v.trim().length <= max;

export const matchesPattern = (v: string, p: RegExp): boolean => p.test(v);

export const isValidMobile = (v: string): boolean => /^[6-9]\d{9}$/.test(v);
export const isValidPAN = (v: string): boolean =>
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase());
export const isValidAadhar = (v: string): boolean => /^\d{12}$/.test(v);
export const isValidEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isValidGSTIN = (v: string): boolean =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    v.toUpperCase(),
  );
export const isValidPincode = (v: string): boolean =>
  /^[1-9][0-9]{5}$/.test(v);
export const isValidIFSC = (v: string): boolean =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase());

// ── Field validator ────────────────────────────────────────────────────────────

export const validateField = (value: string, rules: ValidationRule[]): string => {
  for (const rule of rules) {
    if (rule.required && !isRequired(value))
      return rule.message ?? 'This field is required';
    if (value && rule.minLength && !meetsMinLength(value, rule.minLength))
      return rule.message ?? `Minimum ${rule.minLength} characters required`;
    if (value && rule.maxLength && !meetsMaxLength(value, rule.maxLength))
      return rule.message ?? `Maximum ${rule.maxLength} characters allowed`;
    if (value && rule.pattern && !matchesPattern(value, rule.pattern))
      return rule.message ?? 'Invalid format';
  }
  return '';
};

// ── Form validator ─────────────────────────────────────────────────────────────

export type FieldRules<T> = Partial<Record<keyof T, ValidationRule[]>>;
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type TouchedFields<T> = Partial<Record<keyof T, boolean>>;

export const validateForm = <T extends Record<string, any>>(
  form: T,
  rules: FieldRules<T>,
): FormErrors<T> => {
  const errors: FormErrors<T> = {};
  for (const key in rules) {
    const error = validateField(String(form[key] ?? ''), rules[key] ?? []);
    if (error) errors[key as keyof T] = error;
  }
  return errors;
};

export const hasErrors = <T>(errors: FormErrors<T>): boolean =>
  Object.values(errors).some((e) => !!e);

export const isFormValid = <T extends Record<string, any>>(
  form: T,
  rules: FieldRules<T>,
): boolean => !hasErrors(validateForm(form, rules));

export const markTouched = <T>(
  touched: TouchedFields<T>,
  key: keyof T,
): TouchedFields<T> => ({ ...touched, [key]: true });

export const markAllTouched = <T>(form: T): TouchedFields<T> => {
  const touched: TouchedFields<T> = {};
  for (const key in form) touched[key as keyof T] = true;
  return touched;
};
