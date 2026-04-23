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

export enum LeadStage {
  QuickLead = 'QuickLead',
  BasicInfo = 'BasicInfo',
  PropertyInfo = 'PropertyInfo',
  IncomeInfo = 'IncomeInfo',
  PhotoUpload = 'PhotoUpload',
  DocumentUpload = 'DocumentUpload',
  References = 'References',
  Submitted = 'Submitted',
}

export enum DocumentType {
  Pan = 'pan',
  Aadhar = 'aadhar',
  BankStatement = 'bank_statement',
  SalarySlip = 'salary_slip',
  ITR = 'itr',
  PropertyDoc = 'property_doc',
  ApplicantPhoto = 'applicant',
  CoApplicantPhoto = 'co_applicant',
  PropertyPhoto = 'property',
}
