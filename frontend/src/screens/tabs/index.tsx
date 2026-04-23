import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import CustomInput from '../../components/CustomInput/CustomInput';
import { Button } from '../../components/Button/Button';
import Dropdown from '../../components/Dropdown/Dropdown';
import RadioGroup from '../../components/RadioButton/RadioButton';
import { SectionCard, FileUpload } from '../../components/index';
import { Color, Spacing, FontSize, BorderRadius, globalStyles } from '../../themes/theme';
import {
  BasicInfoForm, PropertyInfoForm, IncomeInfoForm, ReferenceForm,
  TabKey, UploadedFile, DropdownOption, Gender,
} from '../../types';
import {
  validateField, validateForm, markTouched, markAllTouched,
  hasErrors, TouchedFields, FormErrors,
} from '../../utils/validation';
import {
  basicInfoRules, propertyInfoRules, incomeInfoRules, referenceRules,
} from '../../utils/formRules';
import { useLeadStore } from '../../store/leadStore';
import * as api from '../../services/api';

// ── Shared static options ──────────────────────────────────────────────────────

const SALUTATIONS: DropdownOption[] = [{ label: 'Mr.', value: 'Mr' }, { label: 'Mrs.', value: 'Mrs' }, { label: 'Ms.', value: 'Ms' }, { label: 'Dr.', value: 'Dr' }];
const MARITAL: DropdownOption[] = [{ label: 'Single', value: 'single' }, { label: 'Married', value: 'married' }, { label: 'Divorced', value: 'divorced' }, { label: 'Widowed', value: 'widowed' }];
const NATIONALITY: DropdownOption[] = [{ label: 'Indian', value: 'indian' }, { label: 'NRI', value: 'nri' }, { label: 'Other', value: 'other' }];
const RELIGION: DropdownOption[] = [{ label: 'Hindu', value: 'hindu' }, { label: 'Muslim', value: 'muslim' }, { label: 'Christian', value: 'christian' }, { label: 'Sikh', value: 'sikh' }, { label: 'Jain', value: 'jain' }, { label: 'Other', value: 'other' }];
const PROPERTY_TYPES: DropdownOption[] = [{ label: 'Residential Apartment', value: 'res_apt' }, { label: 'Independent House', value: 'ind_house' }, { label: 'Villa', value: 'villa' }, { label: 'Plot / Land', value: 'plot' }, { label: 'Commercial Shop', value: 'comm_shop' }, { label: 'Industrial', value: 'industrial' }];
const AREA_UNITS: DropdownOption[] = [{ label: 'Sq. Ft.', value: 'sqft' }, { label: 'Sq. Mt.', value: 'sqmt' }, { label: 'Acres', value: 'acres' }, { label: 'Guntha', value: 'guntha' }];
const LOCATION: DropdownOption[] = [{ label: 'Urban', value: 'urban' }, { label: 'Semi-Urban', value: 'semi_urban' }, { label: 'Rural', value: 'rural' }];
const EMPLOYMENT: DropdownOption[] = [{ label: 'Salaried', value: 'salaried' }, { label: 'Self Employed Professional', value: 'sep' }, { label: 'Self Employed Business', value: 'seb' }, { label: 'Retired', value: 'retired' }, { label: 'Agriculturist', value: 'agri' }];
const BANKS: DropdownOption[] = [{ label: 'SBI', value: 'SBI' }, { label: 'HDFC Bank', value: 'HDFC' }, { label: 'ICICI Bank', value: 'ICICI' }, { label: 'Axis Bank', value: 'AXIS' }, { label: 'Kotak Mahindra', value: 'KOTAK' }, { label: 'Bank of Baroda', value: 'BOB' }, { label: 'Other', value: 'other' }];
const RELATIONS: DropdownOption[] = [{ label: 'Friend', value: 'friend' }, { label: 'Colleague', value: 'colleague' }, { label: 'Neighbour', value: 'neighbour' }, { label: 'Relative', value: 'relative' }, { label: 'Business Associate', value: 'business' }, { label: 'Other', value: 'other' }];

interface TabProps { onSaved: () => void }

// ── useFormState hook ─────────────────────────────────────────────────────────

function useFormState<T extends Record<string, any>>(initial: T, rules: any) {
  const [form, setForm] = useState<T>(initial);
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const handleChange = useCallback((key: keyof T, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if ((touched as any)[key]) {
      const error = validateField(value, rules[key] ?? []);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  }, [touched, rules]);

  const handleBlur = useCallback((key: keyof T) => {
    setTouched((prev) => markTouched(prev, key));
    const error = validateField(String((form as any)[key] ?? ''), rules[key] ?? []);
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, [form, rules]);

  const validateAll = () => {
    setTouched(markAllTouched(form));
    const errs = validateForm(form, rules);
    setErrors(errs);
    return !hasErrors(errs);
  };

  return { form, touched, errors, handleChange, handleBlur, validateAll };
}

// ── BasicInfoTab ───────────────────────────────────────────────────────────────

const initBasic: BasicInfoForm = { salutation: '', firstName: '', middleName: '', lastName: '', dob: '', gender: '', maritalStatus: '', fatherName: '', motherName: '', spouseName: '', nationality: '', religion: '', panNumber: '', aadharNumber: '', email: '', alternateMobile: '' };

export const BasicInfoTab: React.FC<TabProps> = ({ onSaved }) => {
  const { state, updateBasicInfo, completeTab } = useLeadStore();
  const { form, touched, errors, handleChange, handleBlur, validateAll } = useFormState(
    state.basicInfo.firstName ? state.basicInfo : initBasic, basicInfoRules,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!validateAll()) { Alert.alert('Incomplete', 'Please fill all required fields.'); return; }
    setSaving(true);
    try {
      if (state.leadId) await api.saveBasicInfo(state.leadId, form);
      updateBasicInfo(form); completeTab(TabKey.BasicInfo); onSaved();
    } finally { setSaving(false); }
  };

  return (
    <View style={ts.screen}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={ts.scroll}>
        <SectionCard title="Personal Details">
          <Dropdown label="Salutation" required selectedValue={form.salutation} options={SALUTATIONS}
            onSelect={(v) => handleChange('salutation', v)} error={errors.salutation} touched={!!touched.salutation} />
          <View style={globalStyles.row}>
            <View style={globalStyles.flex2}>
              <CustomInput label="First Name" required value={form.firstName}
                onChangeText={(v) => handleChange('firstName', v)} onBlur={() => handleBlur('firstName')}
                error={errors.firstName} touched={!!touched.firstName} placeholder="First name" maxLength={50} />
            </View>
            <View style={globalStyles.flex1}>
              <CustomInput label="Middle" value={form.middleName}
                onChangeText={(v) => handleChange('middleName', v)} placeholder="Middle" maxLength={50} />
            </View>
            <View style={globalStyles.flex2}>
              <CustomInput label="Last Name" required value={form.lastName}
                onChangeText={(v) => handleChange('lastName', v)} onBlur={() => handleBlur('lastName')}
                error={errors.lastName} touched={!!touched.lastName} placeholder="Last name" maxLength={50} />
            </View>
          </View>
          <CustomInput label="Date of Birth" required value={form.dob}
            onChangeText={(v) => handleChange('dob', v)} onBlur={() => handleBlur('dob')}
            error={errors.dob} touched={!!touched.dob} placeholder="DD/MM/YYYY" maxLength={10} keyboardType="numeric" helperText="Format: DD/MM/YYYY" />
          <RadioGroup label="Gender" required value={form.gender}
            onChange={(v) => handleChange('gender', v)}
            options={[{ label: 'Male', value: Gender.Male }, { label: 'Female', value: Gender.Female }, { label: 'Other', value: Gender.Other }]}
            error={errors.gender} touched={!!touched.gender} />
          <Dropdown label="Marital Status" required selectedValue={form.maritalStatus} options={MARITAL}
            onSelect={(v) => handleChange('maritalStatus', v)} error={errors.maritalStatus} touched={!!touched.maritalStatus} />
          {form.maritalStatus === 'married' && (
            <CustomInput label="Spouse Name" value={form.spouseName}
              onChangeText={(v) => handleChange('spouseName', v)} placeholder="Spouse's full name" />
          )}
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Family Details">
          <CustomInput label="Father's Name" required value={form.fatherName}
            onChangeText={(v) => handleChange('fatherName', v)} onBlur={() => handleBlur('fatherName')}
            error={errors.fatherName} touched={!!touched.fatherName} placeholder="Father's full name" />
          <CustomInput label="Mother's Name" value={form.motherName}
            onChangeText={(v) => handleChange('motherName', v)} placeholder="Mother's full name" />
          <Dropdown label="Nationality" required selectedValue={form.nationality} options={NATIONALITY}
            onSelect={(v) => handleChange('nationality', v)} error={errors.nationality} touched={!!touched.nationality} />
          <Dropdown label="Religion" selectedValue={form.religion} options={RELIGION}
            onSelect={(v) => handleChange('religion', v)} />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="KYC Details">
          <CustomInput label="PAN Number" required value={form.panNumber}
            onChangeText={(v) => handleChange('panNumber', v.toUpperCase())} onBlur={() => handleBlur('panNumber')}
            error={errors.panNumber} touched={!!touched.panNumber} placeholder="e.g. ABCDE1234F" maxLength={10} autoCapitalize="characters" />
          <CustomInput label="Aadhar Number" required value={form.aadharNumber}
            onChangeText={(v) => handleChange('aadharNumber', v)} onBlur={() => handleBlur('aadharNumber')}
            error={errors.aadharNumber} touched={!!touched.aadharNumber} placeholder="12-digit Aadhar" maxLength={12} keyboardType="numeric" />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Contact Details">
          <CustomInput label="Email" required value={form.email}
            onChangeText={(v) => handleChange('email', v)} onBlur={() => handleBlur('email')}
            error={errors.email} touched={!!touched.email} placeholder="email@example.com"
            keyboardType="email-address" autoCapitalize="none" />
          <CustomInput label="Alternate Mobile" value={form.alternateMobile}
            onChangeText={(v) => handleChange('alternateMobile', v)} placeholder="10-digit number"
            keyboardType="phone-pad" maxLength={10} />
        </SectionCard>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Button title={saving ? 'Saving…' : 'Save & Continue →'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

// ── PropertyInfoTab ────────────────────────────────────────────────────────────

const initProperty: PropertyInfoForm = { propertyType: '', propertyLocation: '', propertyArea: '', areaUnit: '', propertyAge: '', marketValue: '', distressValue: '', ownerName: '', ownerContact: '', propertyDescription: '' };

export const PropertyInfoTab: React.FC<TabProps> = ({ onSaved }) => {
  const { state, updatePropertyInfo, completeTab } = useLeadStore();
  const { form, touched, errors, handleChange, handleBlur, validateAll } = useFormState(
    state.propertyInfo.propertyType ? state.propertyInfo : initProperty, propertyInfoRules,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!validateAll()) { Alert.alert('Incomplete', 'Please fill all required fields.'); return; }
    setSaving(true);
    try {
      if (state.leadId) await api.savePropertyInfo(state.leadId, form);
      updatePropertyInfo(form); completeTab(TabKey.PropertyInfo); onSaved();
    } finally { setSaving(false); }
  };

  return (
    <View style={ts.screen}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={ts.scroll}>
        <SectionCard title="Property Details">
          <Dropdown label="Property Type" required selectedValue={form.propertyType} options={PROPERTY_TYPES}
            onSelect={(v) => handleChange('propertyType', v)} error={errors.propertyType} touched={!!touched.propertyType} />
          <Dropdown label="Property Location" required selectedValue={form.propertyLocation} options={LOCATION}
            onSelect={(v) => handleChange('propertyLocation', v)} error={errors.propertyLocation} touched={!!touched.propertyLocation} />
          <View style={globalStyles.row}>
            <View style={globalStyles.flex2}>
              <CustomInput label="Property Area" required value={form.propertyArea}
                onChangeText={(v) => handleChange('propertyArea', v)} onBlur={() => handleBlur('propertyArea')}
                error={errors.propertyArea} touched={!!touched.propertyArea} placeholder="Area" keyboardType="numeric" />
            </View>
            <View style={globalStyles.flex1}>
              <Dropdown label="Unit" required selectedValue={form.areaUnit} options={AREA_UNITS}
                onSelect={(v) => handleChange('areaUnit', v)} error={errors.areaUnit} touched={!!touched.areaUnit} />
            </View>
          </View>
          <CustomInput label="Property Age (Years)" value={form.propertyAge}
            onChangeText={(v) => handleChange('propertyAge', v)} placeholder="e.g. 5" keyboardType="numeric" maxLength={3} />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Valuation">
          <CustomInput label="Market Value (₹)" required value={form.marketValue}
            onChangeText={(v) => handleChange('marketValue', v)} onBlur={() => handleBlur('marketValue')}
            error={errors.marketValue} touched={!!touched.marketValue} placeholder="Market value" keyboardType="numeric" maxLength={12} />
          <CustomInput label="Distress Value (₹)" value={form.distressValue}
            onChangeText={(v) => handleChange('distressValue', v)} placeholder="Distress value" keyboardType="numeric" maxLength={12} />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Owner Details">
          <CustomInput label="Owner Name" required value={form.ownerName}
            onChangeText={(v) => handleChange('ownerName', v)} onBlur={() => handleBlur('ownerName')}
            error={errors.ownerName} touched={!!touched.ownerName} placeholder="Owner's full name" />
          <CustomInput label="Owner Contact" required value={form.ownerContact}
            onChangeText={(v) => handleChange('ownerContact', v)} onBlur={() => handleBlur('ownerContact')}
            error={errors.ownerContact} touched={!!touched.ownerContact} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} />
          <CustomInput label="Description" value={form.propertyDescription}
            onChangeText={(v) => handleChange('propertyDescription', v)} placeholder="Brief description…" maxLength={500} multiline numberOfLines={3} />
        </SectionCard>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Button title={saving ? 'Saving…' : 'Save & Continue →'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

// ── IncomeInfoTab ──────────────────────────────────────────────────────────────

const initIncome: IncomeInfoForm = { employmentType: '', companyName: '', designation: '', monthlyIncome: '', otherIncome: '', totalExperience: '', currentJobExperience: '', bankName: '', accountNumber: '', ifscCode: '' };

export const IncomeInfoTab: React.FC<TabProps> = ({ onSaved }) => {
  const { state, updateIncomeInfo, completeTab } = useLeadStore();
  const { form, touched, errors, handleChange, handleBlur, validateAll } = useFormState(
    state.incomeInfo.employmentType ? state.incomeInfo : initIncome, incomeInfoRules,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!validateAll()) { Alert.alert('Incomplete', 'Please fill all required fields.'); return; }
    setSaving(true);
    try {
      if (state.leadId) await api.saveIncomeInfo(state.leadId, form);
      updateIncomeInfo(form); completeTab(TabKey.IncomeInfo); onSaved();
    } finally { setSaving(false); }
  };

  const isSalaried = form.employmentType === 'salaried';

  return (
    <View style={ts.screen}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={ts.scroll}>
        <SectionCard title="Employment Details">
          <Dropdown label="Employment Type" required selectedValue={form.employmentType} options={EMPLOYMENT}
            onSelect={(v) => handleChange('employmentType', v)} error={errors.employmentType} touched={!!touched.employmentType} />
          <CustomInput label={isSalaried ? 'Employer Name' : 'Business Name'} required value={form.companyName}
            onChangeText={(v) => handleChange('companyName', v)} onBlur={() => handleBlur('companyName')}
            error={errors.companyName} touched={!!touched.companyName} placeholder="Enter name" />
          {isSalaried && (
            <CustomInput label="Designation" value={form.designation}
              onChangeText={(v) => handleChange('designation', v)} placeholder="e.g. Software Engineer" />
          )}
          <View style={globalStyles.row}>
            <View style={globalStyles.flex1}>
              <CustomInput label="Total Exp (Yrs)" value={form.totalExperience}
                onChangeText={(v) => handleChange('totalExperience', v)} placeholder="Years" keyboardType="numeric" maxLength={2} />
            </View>
            {isSalaried && (
              <View style={globalStyles.flex1}>
                <CustomInput label="Current Job (Yrs)" value={form.currentJobExperience}
                  onChangeText={(v) => handleChange('currentJobExperience', v)} placeholder="Years" keyboardType="numeric" maxLength={2} />
              </View>
            )}
          </View>
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Income Details">
          <CustomInput label="Monthly Income (₹)" required value={form.monthlyIncome}
            onChangeText={(v) => handleChange('monthlyIncome', v)} onBlur={() => handleBlur('monthlyIncome')}
            error={errors.monthlyIncome} touched={!!touched.monthlyIncome} placeholder="Net monthly income" keyboardType="numeric" maxLength={10} />
          <CustomInput label="Other Income (₹)" value={form.otherIncome}
            onChangeText={(v) => handleChange('otherIncome', v)} placeholder="Rental, agriculture, etc." keyboardType="numeric" maxLength={10} />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Banking Details">
          <Dropdown label="Bank Name" required selectedValue={form.bankName} options={BANKS}
            onSelect={(v) => handleChange('bankName', v)} error={errors.bankName} touched={!!touched.bankName} searchable />
          <CustomInput label="Account Number" required value={form.accountNumber}
            onChangeText={(v) => handleChange('accountNumber', v)} onBlur={() => handleBlur('accountNumber')}
            error={errors.accountNumber} touched={!!touched.accountNumber} placeholder="Account number" keyboardType="numeric" maxLength={18} />
          <CustomInput label="IFSC Code" required value={form.ifscCode}
            onChangeText={(v) => handleChange('ifscCode', v.toUpperCase())} onBlur={() => handleBlur('ifscCode')}
            error={errors.ifscCode} touched={!!touched.ifscCode} placeholder="e.g. SBIN0001234" maxLength={11} autoCapitalize="characters" />
        </SectionCard>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Button title={saving ? 'Saving…' : 'Save & Continue →'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

// ── PhotoUploadTab ─────────────────────────────────────────────────────────────

export const PhotoUploadTab: React.FC<TabProps> = ({ onSaved }) => {
  const { state, addPhoto, removePhoto, completeTab } = useLeadStore();
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const applicantPhotos = state.photos.filter((f) => f.documentType === 'applicant');
  const coPhotos = state.photos.filter((f) => f.documentType === 'co_applicant');
  const propPhotos = state.photos.filter((f) => f.documentType === 'property');

  const handleSave = async () => {
    setTouched(true);
    if (applicantPhotos.length === 0) { Alert.alert('Required', 'Please upload at least one applicant photo.'); return; }
    setSaving(true);
    try { completeTab(TabKey.PhotoUpload); onSaved(); }
    finally { setSaving(false); }
  };

  return (
    <View style={ts.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ts.scroll}>
        <SectionCard title="Applicant Photo">
          <Text style={ts.hint}>Upload a clear, recent passport-size photo.</Text>
          <FileUpload label="Applicant Photo" required files={applicantPhotos}
            onAdd={(f) => addPhoto({ ...f, documentType: 'applicant' })} onRemove={removePhoto}
            accept="image" maxFiles={1} maxSizeMB={5}
            error={touched && applicantPhotos.length === 0 ? 'Applicant photo is required' : undefined}
            touched={touched} />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Co-Applicant Photos">
          <Text style={ts.hint}>Upload photos of all co-applicants (if any).</Text>
          <FileUpload files={coPhotos} onAdd={(f) => addPhoto({ ...f, documentType: 'co_applicant' })}
            onRemove={removePhoto} accept="image" maxFiles={4} maxSizeMB={5} />
        </SectionCard>
        <View style={globalStyles.gap} />
        <SectionCard title="Property Photos">
          <Text style={ts.hint}>Upload photos of the property from all sides.</Text>
          <FileUpload files={propPhotos} onAdd={(f) => addPhoto({ ...f, documentType: 'property' })}
            onRemove={removePhoto} accept="image" maxFiles={10} maxSizeMB={5} />
        </SectionCard>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Text style={ts.counter}>{state.photos.length} photo{state.photos.length !== 1 ? 's' : ''} uploaded</Text>
        <Button title={saving ? 'Saving…' : 'Save & Continue →'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

// ── DocumentUploadTab ──────────────────────────────────────────────────────────

const DOC_SECTIONS = [
  { key: 'pan', title: 'PAN Card', hint: 'Upload clear copy of PAN card.', required: true, maxFiles: 1 },
  { key: 'aadhar', title: 'Aadhar Card', hint: 'Upload both sides of Aadhar card.', required: true, maxFiles: 2 },
  { key: 'bank_statement', title: 'Bank Statement', hint: 'Last 6 months bank statement.', required: true, maxFiles: 3 },
  { key: 'salary_slip', title: 'Salary Slips', hint: 'Last 3 months salary slips.', required: false, maxFiles: 3 },
  { key: 'itr', title: 'ITR (Last 2 Years)', hint: 'Upload last 2 years ITR.', required: false, maxFiles: 4 },
  { key: 'property_doc', title: 'Property Documents', hint: 'Upload sale deed / agreement.', required: true, maxFiles: 10 },
];

export const DocumentUploadTab: React.FC<TabProps> = ({ onSaved }) => {
  const { state, addDocument, removeDocument, completeTab } = useLeadStore();
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const getDocsFor = (key: string) => state.documents.filter((d) => d.documentType === key);

  const handleSave = async () => {
    setTouched(true);
    const missing = DOC_SECTIONS.filter((s) => s.required && getDocsFor(s.key).length === 0).map((s) => s.title);
    if (missing.length > 0) { Alert.alert('Missing Documents', `Please upload:\n${missing.map((m) => `• ${m}`).join('\n')}`); return; }
    setSaving(true);
    try { completeTab(TabKey.DocumentUpload); onSaved(); }
    finally { setSaving(false); }
  };

  return (
    <View style={ts.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ts.scroll}>
        {DOC_SECTIONS.map((sec, i) => {
          const docs = getDocsFor(sec.key);
          const missing = touched && sec.required && docs.length === 0;
          return (
            <React.Fragment key={sec.key}>
              <SectionCard title={sec.title}
                badge={sec.required ? 'Required' : 'Optional'}
                badgeColor={sec.required ? Color.Error : Color.Gray500}>
                <Text style={ts.hint}>{sec.hint}</Text>
                <FileUpload required={sec.required} files={docs}
                  onAdd={(f) => addDocument({ ...f, documentType: sec.key })} onRemove={removeDocument}
                  maxFiles={sec.maxFiles} maxSizeMB={10}
                  error={missing ? `${sec.title} is required` : undefined} touched={touched} />
              </SectionCard>
              {i < DOC_SECTIONS.length - 1 && <View style={globalStyles.gap} />}
            </React.Fragment>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Text style={ts.counter}>{state.documents.length} document{state.documents.length !== 1 ? 's' : ''} uploaded</Text>
        <Button title={saving ? 'Saving…' : 'Save & Continue →'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

// ── ReferencesTab ──────────────────────────────────────────────────────────────

const newRef = (id: string): ReferenceForm => ({ id, name: '', relation: '', mobileNumber: '', address: '' });
const MIN_REFS = 2;

interface RefState { form: ReferenceForm; touched: TouchedFields<ReferenceForm>; errors: FormErrors<ReferenceForm> }

export const ReferencesTab: React.FC<TabProps> = ({ onSaved }) => {
  const { state, addReference, updateReference, completeTab } = useLeadStore();
  const [refStates, setRefStates] = useState<RefState[]>(() =>
    state.references.length > 0
      ? state.references.map((r) => ({ form: r, touched: {}, errors: {} }))
      : [{ form: newRef('ref_1'), touched: {}, errors: {} }, { form: newRef('ref_2'), touched: {}, errors: {} }],
  );
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((idx: number, key: keyof ReferenceForm, value: string) => {
    setRefStates((prev) => prev.map((rs, i) => {
      if (i !== idx) return rs;
      const updForm = { ...rs.form, [key]: value };
      const error = rs.touched[key] ? validateField(value, referenceRules[key] ?? []) : '';
      return { ...rs, form: updForm, errors: { ...rs.errors, [key]: error } };
    }));
  }, []);

  const handleBlur = useCallback((idx: number, key: keyof ReferenceForm) => {
    setRefStates((prev) => prev.map((rs, i) => {
      if (i !== idx) return rs;
      const error = validateField(String((rs.form as any)[key] ?? ''), referenceRules[key] ?? []);
      return { ...rs, touched: { ...rs.touched, [key]: true }, errors: { ...rs.errors, [key]: error } };
    }));
  }, []);

  const handleRemove = (idx: number) => {
    if (refStates.length <= MIN_REFS) return;
    setRefStates((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const updated = refStates.map((rs) => ({
      ...rs, touched: markAllTouched(rs.form), errors: validateForm(rs.form, referenceRules),
    }));
    setRefStates(updated);
    if (updated.some((rs) => hasErrors(rs.errors))) { Alert.alert('Incomplete', 'Please fill all required fields in all references.'); return; }
    setSaving(true);
    try {
      const forms = refStates.map((rs) => rs.form);
      if (state.leadId) await api.saveReferences(state.leadId, forms);
      forms.forEach((f) => {
        if (state.references.find((r) => r.id === f.id)) updateReference(f.id, f);
        else addReference(f);
      });
      completeTab(TabKey.References); onSaved();
    } finally { setSaving(false); }
  };

  return (
    <View style={ts.screen}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={ts.scroll}>
        <Text style={ts.info}>Minimum {MIN_REFS} references required. References must not be applicants or co-applicants.</Text>
        {refStates.map((rs, idx) => (
          <React.Fragment key={rs.form.id}>
            <SectionCard title={`Reference ${idx + 1}`}>
              <CustomInput label="Full Name" required value={rs.form.name}
                onChangeText={(v) => handleChange(idx, 'name', v)} onBlur={() => handleBlur(idx, 'name')}
                error={rs.errors.name} touched={!!rs.touched.name} placeholder="Reference's full name" />
              <Dropdown label="Relation" required selectedValue={rs.form.relation} options={RELATIONS}
                onSelect={(v) => handleChange(idx, 'relation', v)} error={rs.errors.relation} touched={!!rs.touched.relation} />
              <CustomInput label="Mobile Number" required value={rs.form.mobileNumber}
                onChangeText={(v) => handleChange(idx, 'mobileNumber', v)} onBlur={() => handleBlur(idx, 'mobileNumber')}
                error={rs.errors.mobileNumber} touched={!!rs.touched.mobileNumber} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} />
              <CustomInput label="Address" required value={rs.form.address}
                onChangeText={(v) => handleChange(idx, 'address', v)} onBlur={() => handleBlur(idx, 'address')}
                error={rs.errors.address} touched={!!rs.touched.address} placeholder="Full address" maxLength={300} multiline numberOfLines={2} />
              {refStates.length > MIN_REFS && (
                <TouchableOpacity onPress={() => handleRemove(idx)}>
                  <Text style={ts.removeText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </SectionCard>
            <View style={globalStyles.gap} />
          </React.Fragment>
        ))}
        {refStates.length < 5 && (
          <TouchableOpacity style={ts.addBtn}
            onPress={() => setRefStates((p) => [...p, { form: newRef(`ref_${Date.now()}`), touched: {}, errors: {} }])}>
            <Text style={ts.addBtnText}>+ Add Another Reference</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Button title={saving ? 'Submitting…' : 'Submit Application'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
};

// ── Shared styles ──────────────────────────────────────────────────────────────

const ts = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.Background },
  scroll: { padding: Spacing.lg },
  hint: { fontSize: FontSize.sm, color: Color.Gray500, marginBottom: Spacing.md, lineHeight: 18 },
  counter: { fontSize: FontSize.sm, color: Color.Gray500, textAlign: 'center', marginBottom: Spacing.sm },
  info: { fontSize: FontSize.sm, color: Color.Gray600, backgroundColor: Color.PrimaryLight, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, lineHeight: 18 },
  removeText: { fontSize: FontSize.sm, color: Color.Error, fontWeight: '600', marginTop: Spacing.sm },
  addBtn: { borderWidth: 2, borderStyle: 'dashed', borderColor: Color.Primary, borderRadius: BorderRadius.md, padding: Spacing.lg, alignItems: 'center' },
  addBtnText: { fontSize: FontSize.md, color: Color.Primary, fontWeight: '600' },
});
