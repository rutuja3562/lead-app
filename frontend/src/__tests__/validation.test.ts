import {
  isRequired, meetsMinLength, meetsMaxLength, isValidMobile,
  isValidPAN, isValidAadhar, isValidEmail, isValidGSTIN,
  isValidPincode, isValidIFSC, validateField, validateForm,
  hasErrors, isFormValid, markTouched, markAllTouched,
} from '../utils/validation';

describe('isRequired', () => {
  it('returns false for empty string', () => expect(isRequired('')).toBe(false));
  it('returns false for whitespace', () => expect(isRequired('   ')).toBe(false));
  it('returns true for valid string', () => expect(isRequired('John')).toBe(true));
});

describe('meetsMinLength', () => {
  it('returns false when too short', () => expect(meetsMinLength('ab', 3)).toBe(false));
  it('returns true at exactly min', () => expect(meetsMinLength('abc', 3)).toBe(true));
  it('returns true when longer', () => expect(meetsMinLength('abcd', 3)).toBe(true));
});

describe('meetsMaxLength', () => {
  it('returns false when too long', () => expect(meetsMaxLength('abcdef', 5)).toBe(false));
  it('returns true at exactly max', () => expect(meetsMaxLength('abcde', 5)).toBe(true));
  it('returns true when shorter', () => expect(meetsMaxLength('abc', 5)).toBe(true));
});

describe('isValidMobile', () => {
  it('accepts valid mobile starting with 9', () => expect(isValidMobile('9876543210')).toBe(true));
  it('accepts valid mobile starting with 6', () => expect(isValidMobile('6543219870')).toBe(true));
  it('rejects mobile starting with 5', () => expect(isValidMobile('5123456789')).toBe(false));
  it('rejects mobile with less than 10 digits', () => expect(isValidMobile('987654321')).toBe(false));
  it('rejects mobile with letters', () => expect(isValidMobile('9876543abc')).toBe(false));
});

describe('isValidPAN', () => {
  it('accepts valid PAN', () => expect(isValidPAN('ABCDE1234F')).toBe(true));
  it('is case-insensitive', () => expect(isValidPAN('abcde1234f')).toBe(true));
  it('rejects wrong format', () => expect(isValidPAN('ABCDE12345')).toBe(false));
});

describe('isValidAadhar', () => {
  it('accepts valid 12-digit', () => expect(isValidAadhar('123456789012')).toBe(true));
  it('rejects 11-digit', () => expect(isValidAadhar('12345678901')).toBe(false));
  it('rejects with letters', () => expect(isValidAadhar('12345678901a')).toBe(false));
});

describe('isValidEmail', () => {
  it('accepts valid email', () => expect(isValidEmail('user@example.com')).toBe(true));
  it('rejects email without @', () => expect(isValidEmail('userexample.com')).toBe(false));
  it('rejects email without domain', () => expect(isValidEmail('user@')).toBe(false));
});

describe('isValidGSTIN', () => {
  it('accepts valid GSTIN', () => expect(isValidGSTIN('27AAPFU0939F1ZV')).toBe(true));
  it('is case-insensitive', () => expect(isValidGSTIN('27aapfu0939f1zv')).toBe(true));
  it('rejects short GSTIN', () => expect(isValidGSTIN('27AAPFU0939F1Z')).toBe(false));
});

describe('isValidPincode', () => {
  it('accepts valid pincode', () => expect(isValidPincode('400001')).toBe(true));
  it('rejects starting with 0', () => expect(isValidPincode('012345')).toBe(false));
  it('rejects 5-digit', () => expect(isValidPincode('40000')).toBe(false));
});

describe('isValidIFSC', () => {
  it('accepts valid IFSC', () => expect(isValidIFSC('SBIN0001234')).toBe(true));
  it('is case-insensitive', () => expect(isValidIFSC('sbin0001234')).toBe(true));
  it('rejects invalid IFSC', () => expect(isValidIFSC('SBIN1001234')).toBe(false));
});

describe('validateField', () => {
  it('returns error for empty required field', () =>
    expect(validateField('', [{ required: true, message: 'Required' }])).toBe('Required'));
  it('returns empty for valid required field', () =>
    expect(validateField('John', [{ required: true }])).toBe(''));
  it('returns minLength error', () =>
    expect(validateField('ab', [{ minLength: 3, message: 'Min 3' }])).toBe('Min 3'));
  it('returns maxLength error', () =>
    expect(validateField('abcdef', [{ maxLength: 5, message: 'Max 5' }])).toBe('Max 5'));
  it('returns pattern error', () =>
    expect(validateField('abc123', [{ pattern: /^[a-z]+$/, message: 'Letters only' }])).toBe('Letters only'));
  it('stops at first failed rule', () =>
    expect(validateField('', [{ required: true, message: 'Required' }, { minLength: 5, message: 'Too short' }])).toBe('Required'));
});

describe('validateForm', () => {
  it('returns errors for invalid fields', () => {
    const errors = validateForm(
      { name: '', phone: '123' },
      { name: [{ required: true, message: 'Name required' }], phone: [{ pattern: /^[6-9]\d{9}$/, message: 'Invalid phone' }] },
    );
    expect(errors.name).toBe('Name required');
    expect(errors.phone).toBe('Invalid phone');
  });
  it('returns no errors for valid form', () => {
    const errors = validateForm({ name: 'Alice' }, { name: [{ required: true }] });
    expect(errors.name).toBe('');
  });
});

describe('hasErrors', () => {
  it('returns true when errors present', () => expect(hasErrors({ name: 'Required' })).toBe(true));
  it('returns false when all empty', () => expect(hasErrors({ name: '' })).toBe(false));
  it('returns false for empty object', () => expect(hasErrors({})).toBe(false));
});

describe('isFormValid', () => {
  it('returns true for valid form', () =>
    expect(isFormValid({ name: 'Alice' }, { name: [{ required: true }] })).toBe(true));
  it('returns false for invalid form', () =>
    expect(isFormValid({ name: '' }, { name: [{ required: true }] })).toBe(false));
});

describe('markTouched', () => {
  it('marks a field as touched without mutating original', () => {
    const orig = { firstName: false as boolean | undefined };
    const updated = markTouched(orig, 'firstName');
    expect(updated.firstName).toBe(true);
    expect(orig.firstName).toBe(false);
  });
});

describe('markAllTouched', () => {
  it('marks all fields as touched', () => {
    const touched = markAllTouched({ a: 'val', b: '', c: '123' });
    expect(touched.a).toBe(true);
    expect(touched.b).toBe(true);
    expect(touched.c).toBe(true);
  });
  it('does not mutate original', () => {
    const form = { x: '1' };
    markAllTouched(form);
    expect(form).toEqual({ x: '1' });
  });
});
