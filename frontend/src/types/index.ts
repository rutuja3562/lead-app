export enum CustomerType {
  Individual = 'Individual',
  NonIndividual = 'Non-individual',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum LeadStatus {
  Hot = 'Hot',
  Warm = 'Warm',
  Cold = 'Cold',
}

export enum TabKey {
  BasicInfo = 'BasicInfo',
  PropertyInfo = 'PropertyInfo',
  IncomeInfo = 'IncomeInfo',
  PhotoUpload = 'PhotoUpload',
  DocumentUpload = 'DocumentUpload',
  References = 'References',
}

export enum TabState {
  Locked = 'Locked',
  Active = 'Active',
  Completed = 'Completed',
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface QuickLeadForm {
  mobileNumber: string;
  customerType: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  loanType: string;
  schemeType: string;
  loanAmount: string;
  propertyType: string;
  propertyLocation: string;
  businessType: string;
  businessGSTIN: string;
  businessName: string;
  leadSource: string;
  leadStatus: string;
}

export interface BasicInfoForm {
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  nationality: string;
  religion: string;
  panNumber: string;
  aadharNumber: string;
  email: string;
  alternateMobile: string;
}

export interface PropertyInfoForm {
  propertyType: string;
  propertyLocation: string;
  propertyArea: string;
  areaUnit: string;
  propertyAge: string;
  marketValue: string;
  distressValue: string;
  ownerName: string;
  ownerContact: string;
  propertyDescription: string;
}

export interface IncomeInfoForm {
  employmentType: string;
  companyName: string;
  designation: string;
  monthlyIncome: string;
  otherIncome: string;
  totalExperience: string;
  currentJobExperience: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface ReferenceForm {
  id: string;
  name: string;
  relation: string;
  mobileNumber: string;
  address: string;
}

export interface UploadedFile {
  id: string;
  uri: string;
  name: string;
  type: string;
  size: number;
  documentType?: string;
}

export interface TabCompletionState {
  [TabKey.BasicInfo]: TabState;
  [TabKey.PropertyInfo]: TabState;
  [TabKey.IncomeInfo]: TabState;
  [TabKey.PhotoUpload]: TabState;
  [TabKey.DocumentUpload]: TabState;
  [TabKey.References]: TabState;
}

export interface LeadContextState {
  leadId: string | null;
  quickLeadDone: boolean;
  tabCompletion: TabCompletionState;
  basicInfo: BasicInfoForm;
  propertyInfo: PropertyInfoForm;
  incomeInfo: IncomeInfoForm;
  photos: UploadedFile[];
  documents: UploadedFile[];
  references: ReferenceForm[];
}
