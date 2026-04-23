import { FieldRules } from '../utils/validation';
import {
  QuickLeadForm,
  BasicInfoForm,
  PropertyInfoForm,
  IncomeInfoForm,
  ReferenceForm,
} from '../types';

export const quickLeadRules: FieldRules<QuickLeadForm> = {
  mobileNumber: [
    { required: true, message: 'Mobile number is required' },
    { pattern: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
  ],
  customerType: [{ required: true, message: 'Customer type is required' }],
  firstName: [
    { required: true, message: 'First name is required' },
    { minLength: 2, message: 'Minimum 2 characters' },
    { maxLength: 50, message: 'Maximum 50 characters' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Only letters allowed' },
  ],
  lastName: [
    { required: true, message: 'Last name is required' },
    { minLength: 2, message: 'Minimum 2 characters' },
    { maxLength: 50, message: 'Maximum 50 characters' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Only letters allowed' },
  ],
  gender: [{ required: true, message: 'Gender is required' }],
  addressLine1: [
    { required: true, message: 'Address is required' },
    { minLength: 10, message: 'Enter a complete address' },
  ],
  city: [{ required: true, message: 'City is required' }],
  state: [{ required: true, message: 'State is required' }],
  pincode: [
    { required: true, message: 'Pincode is required' },
    { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pincode' },
  ],
  loanType: [{ required: true, message: 'Loan type is required' }],
  schemeType: [{ required: true, message: 'Scheme type is required' }],
  loanAmount: [
    { required: true, message: 'Loan amount is required' },
    { pattern: /^\d+$/, message: 'Enter a valid amount' },
  ],
  propertyType: [{ required: true, message: 'Property type is required' }],
  propertyLocation: [{ required: true, message: 'Property location is required' }],
  leadSource: [{ required: true, message: 'Lead source is required' }],
  leadStatus: [{ required: true, message: 'Lead status is required' }],
};

export const quickLeadNonIndividualRules: FieldRules<QuickLeadForm> = {
  ...quickLeadRules,
  businessType: [{ required: true, message: 'Business type is required' }],
  businessGSTIN: [
    { required: true, message: 'GSTIN is required' },
    {
      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      message: 'Enter a valid GSTIN',
    },
  ],
  businessName: [{ required: true, message: 'Business name is required' }],
};

export const basicInfoRules: FieldRules<BasicInfoForm> = {
  salutation: [{ required: true, message: 'Salutation is required' }],
  firstName: [
    { required: true, message: 'First name is required' },
    { minLength: 2, message: 'Minimum 2 characters' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Only letters allowed' },
  ],
  lastName: [
    { required: true, message: 'Last name is required' },
    { minLength: 2, message: 'Minimum 2 characters' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Only letters allowed' },
  ],
  dob: [{ required: true, message: 'Date of birth is required' }],
  gender: [{ required: true, message: 'Gender is required' }],
  maritalStatus: [{ required: true, message: 'Marital status is required' }],
  fatherName: [{ required: true, message: "Father's name is required" }],
  nationality: [{ required: true, message: 'Nationality is required' }],
  panNumber: [
    { required: true, message: 'PAN number is required' },
    { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN (e.g. ABCDE1234F)' },
  ],
  aadharNumber: [
    { required: true, message: 'Aadhar number is required' },
    { pattern: /^\d{12}$/, message: 'Must be 12 digits' },
  ],
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
  ],
};

export const propertyInfoRules: FieldRules<PropertyInfoForm> = {
  propertyType: [{ required: true, message: 'Property type is required' }],
  propertyLocation: [{ required: true, message: 'Property location is required' }],
  propertyArea: [
    { required: true, message: 'Property area is required' },
    { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid number' },
  ],
  areaUnit: [{ required: true, message: 'Area unit is required' }],
  marketValue: [
    { required: true, message: 'Market value is required' },
    { pattern: /^\d+$/, message: 'Enter a valid amount' },
  ],
  ownerName: [{ required: true, message: "Owner's name is required" }],
  ownerContact: [
    { required: true, message: "Owner's contact is required" },
    { pattern: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit number' },
  ],
};

export const incomeInfoRules: FieldRules<IncomeInfoForm> = {
  employmentType: [{ required: true, message: 'Employment type is required' }],
  companyName: [{ required: true, message: 'Company name is required' }],
  monthlyIncome: [
    { required: true, message: 'Monthly income is required' },
    { pattern: /^\d+$/, message: 'Enter a valid amount' },
  ],
  bankName: [{ required: true, message: 'Bank name is required' }],
  accountNumber: [
    { required: true, message: 'Account number is required' },
    { minLength: 9, message: 'Invalid account number' },
    { maxLength: 18, message: 'Invalid account number' },
  ],
  ifscCode: [
    { required: true, message: 'IFSC code is required' },
    { pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC (e.g. SBIN0001234)' },
  ],
};

export const referenceRules: FieldRules<ReferenceForm> = {
  name: [{ required: true, message: 'Name is required' }],
  relation: [{ required: true, message: 'Relation is required' }],
  mobileNumber: [
    { required: true, message: 'Mobile number is required' },
    { pattern: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit number' },
  ],
  address: [{ required: true, message: 'Address is required' }],
};
