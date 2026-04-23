import { Injectable } from '@nestjs/common';

export interface DropdownOption {
  label: string;
  value: string;
}

const MASTERS: Record<string, DropdownOption[]> = {
  productType: [
    { label: 'Home Loan', value: 'home_loan' },
    { label: 'Loan Against Property', value: 'lap' },
    { label: 'Business Loan', value: 'business_loan' },
    { label: 'Personal Loan', value: 'personal_loan' },
    { label: 'Construction Loan', value: 'construction' },
  ],
  productSubType: [
    { label: 'Fixed Rate', value: 'fixed' },
    { label: 'Floating Rate', value: 'floating' },
    { label: 'Hybrid Scheme', value: 'hybrid' },
    { label: 'Step-Up Scheme', value: 'step_up' },
  ],
  propertyType: [
    { label: 'Residential Apartment', value: 'res_apt' },
    { label: 'Independent House', value: 'ind_house' },
    { label: 'Villa', value: 'villa' },
    { label: 'Plot / Land', value: 'plot' },
    { label: 'Commercial Shop', value: 'comm_shop' },
    { label: 'Commercial Office', value: 'comm_office' },
    { label: 'Industrial', value: 'industrial' },
  ],
  locality: [
    { label: 'Urban', value: 'urban' },
    { label: 'Semi-Urban', value: 'semi_urban' },
    { label: 'Rural', value: 'rural' },
  ],
  source: [
    { label: 'Direct Walk-in', value: 'walk_in' },
    { label: 'DSA', value: 'dsa' },
    { label: 'Online', value: 'online' },
    { label: 'Reference', value: 'reference' },
    { label: 'Bank Employee', value: 'employee' },
  ],
  businessType: [
    { label: 'Proprietorship', value: 'proprietorship' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Private Limited', value: 'pvt_ltd' },
    { label: 'Public Limited', value: 'pub_ltd' },
    { label: 'LLP', value: 'llp' },
    { label: 'Trust / NGO', value: 'trust' },
  ],
  salutation: [
    { label: 'Mr.', value: 'Mr' },
    { label: 'Mrs.', value: 'Mrs' },
    { label: 'Ms.', value: 'Ms' },
    { label: 'Dr.', value: 'Dr' },
  ],
  maritalStatus: [
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Divorced', value: 'divorced' },
    { label: 'Widowed', value: 'widowed' },
  ],
  nationality: [
    { label: 'Indian', value: 'indian' },
    { label: 'NRI', value: 'nri' },
    { label: 'Other', value: 'other' },
  ],
  religion: [
    { label: 'Hindu', value: 'hindu' },
    { label: 'Muslim', value: 'muslim' },
    { label: 'Christian', value: 'christian' },
    { label: 'Sikh', value: 'sikh' },
    { label: 'Jain', value: 'jain' },
    { label: 'Buddhist', value: 'buddhist' },
    { label: 'Other', value: 'other' },
  ],
  employmentType: [
    { label: 'Salaried', value: 'salaried' },
    { label: 'Self Employed Professional', value: 'sep' },
    { label: 'Self Employed Business', value: 'seb' },
    { label: 'Retired', value: 'retired' },
    { label: 'Agriculturist', value: 'agri' },
  ],
  areaUnit: [
    { label: 'Sq. Ft.', value: 'sqft' },
    { label: 'Sq. Mt.', value: 'sqmt' },
    { label: 'Sq. Yd.', value: 'sqyd' },
    { label: 'Acres', value: 'acres' },
    { label: 'Guntha', value: 'guntha' },
  ],
  bankName: [
    { label: 'State Bank of India', value: 'SBI' },
    { label: 'HDFC Bank', value: 'HDFC' },
    { label: 'ICICI Bank', value: 'ICICI' },
    { label: 'Axis Bank', value: 'AXIS' },
    { label: 'Kotak Mahindra Bank', value: 'KOTAK' },
    { label: 'Bank of Baroda', value: 'BOB' },
    { label: 'Punjab National Bank', value: 'PNB' },
    { label: 'Canara Bank', value: 'CANARA' },
    { label: 'Union Bank', value: 'UNION' },
    { label: 'Other', value: 'other' },
  ],
  relation: [
    { label: 'Friend', value: 'friend' },
    { label: 'Colleague', value: 'colleague' },
    { label: 'Neighbour', value: 'neighbour' },
    { label: 'Relative', value: 'relative' },
    { label: 'Business Associate', value: 'business' },
    { label: 'Other', value: 'other' },
  ],
  documentType: [
    { label: 'PAN Card', value: 'pan' },
    { label: 'Aadhar Card', value: 'aadhar' },
    { label: 'Bank Statement', value: 'bank_statement' },
    { label: 'Salary Slip', value: 'salary_slip' },
    { label: 'Income Tax Return', value: 'itr' },
    { label: 'Property Document', value: 'property_doc' },
    { label: 'Form 16', value: 'form_16' },
    { label: 'Electricity Bill', value: 'electricity_bill' },
  ],
  state: [
    { label: 'Andhra Pradesh', value: 'AP' },
    { label: 'Maharashtra', value: 'MH' },
    { label: 'Karnataka', value: 'KA' },
    { label: 'Tamil Nadu', value: 'TN' },
    { label: 'Gujarat', value: 'GJ' },
    { label: 'Rajasthan', value: 'RJ' },
    { label: 'Uttar Pradesh', value: 'UP' },
    { label: 'Delhi', value: 'DL' },
    { label: 'West Bengal', value: 'WB' },
    { label: 'Telangana', value: 'TG' },
    { label: 'Kerala', value: 'KL' },
    { label: 'Punjab', value: 'PB' },
    { label: 'Madhya Pradesh', value: 'MP' },
    { label: 'Haryana', value: 'HR' },
  ],
};

@Injectable()
export class MastersService {
  getMasters(): Record<string, DropdownOption[]> {
    return MASTERS;
  }

  getMasterByKey(key: string): DropdownOption[] {
    return MASTERS[key] ?? [];
  }
}
