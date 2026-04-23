import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import CustomInput from '../../components/CustomInput/CustomInput';
import { Button, ButtonVariant } from '../../components/Button/Button';
import { OTPInput } from '../../components/OTPInput/OTPInput';
import RadioGroup from '../../components/RadioButton/RadioButton';
import Dropdown from '../../components/Dropdown/Dropdown';
import { SectionCard, PhoneInput } from '../../components/index';
import { Color, Spacing, FontSize, BorderRadius, globalStyles } from '../../themes/theme';
import { QuickLeadForm, CustomerType, Gender, LeadStatus, DropdownOption } from '../../types';
import {
  validateField, validateForm, markTouched, markAllTouched,
  hasErrors, TouchedFields, FormErrors,
} from '../../utils/validation';
import { quickLeadRules, quickLeadNonIndividualRules } from '../../utils/formRules';
import { useLeadStore } from '../../store/leadStore';
import * as api from '../../services/api';
import { RootStackParamList } from '../../navigation/types';

const LOAN_TYPES: DropdownOption[] = [
  { label: 'Home Loan', value: 'home_loan' },
  { label: 'Loan Against Property', value: 'lap' },
  { label: 'Business Loan', value: 'business_loan' },
  { label: 'Personal Loan', value: 'personal_loan' },
];
const SCHEME_TYPES: DropdownOption[] = [
  { label: 'Fixed Rate', value: 'fixed' },
  { label: 'Floating Rate', value: 'floating' },
  { label: 'Hybrid Scheme', value: 'hybrid' },
];
const PROPERTY_TYPES: DropdownOption[] = [
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Industrial', value: 'industrial' },
  { label: 'Plot / Land', value: 'plot' },
];
const PROPERTY_LOCATIONS: DropdownOption[] = [
  { label: 'Urban', value: 'urban' },
  { label: 'Semi-Urban', value: 'semi_urban' },
  { label: 'Rural', value: 'rural' },
];
const LEAD_SOURCES: DropdownOption[] = [
  { label: 'Direct Walk-in', value: 'walk_in' },
  { label: 'DSA', value: 'dsa' },
  { label: 'Online', value: 'online' },
  { label: 'Reference', value: 'reference' },
  { label: 'Bank Employee', value: 'employee' },
];
const BUSINESS_TYPES: DropdownOption[] = [
  { label: 'Proprietorship', value: 'proprietorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Pvt. Ltd.', value: 'pvt_ltd' },
  { label: 'Public Ltd.', value: 'pub_ltd' },
];
const STATES: DropdownOption[] = [
  { label: 'Maharashtra', value: 'MH' }, { label: 'Gujarat', value: 'GJ' },
  { label: 'Karnataka', value: 'KA' }, { label: 'Tamil Nadu', value: 'TN' },
  { label: 'Delhi', value: 'DL' }, { label: 'Rajasthan', value: 'RJ' },
  { label: 'Uttar Pradesh', value: 'UP' }, { label: 'West Bengal', value: 'WB' },
];

const initialForm: QuickLeadForm = {
  mobileNumber: '', customerType: '', firstName: '', middleName: '', lastName: '',
  gender: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  loanType: '', schemeType: '', loanAmount: '', propertyType: '', propertyLocation: '',
  businessType: '', businessGSTIN: '', businessName: '', leadSource: '', leadStatus: '',
};

const STATUS_CONFIG = [
  { status: LeadStatus.Hot, emoji: '🔥', color: Color.DarkRed },
  { status: LeadStatus.Warm, emoji: '☀️', color: Color.DarkOrange },
  { status: LeadStatus.Cold, emoji: '❄️', color: Color.DarkBlue },
];

const QuickLeadScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setLeadId, setQuickLeadDone } = useLeadStore();

  const [form, setForm] = useState<QuickLeadForm>(initialForm);
  const [touched, setTouched] = useState<TouchedFields<QuickLeadForm>>({});
  const [errors, setErrors] = useState<FormErrors<QuickLeadForm>>({});
  const [isPhoneValidated, setIsPhoneValidated] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [saving, setSaving] = useState(false);

  const rules = form.customerType === CustomerType.NonIndividual
    ? quickLeadNonIndividualRules : quickLeadRules;

  const handleChange = useCallback((key: keyof QuickLeadForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      const error = validateField(value, rules[key] ?? []);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  }, [touched, rules]);

  const handleBlur = useCallback((key: keyof QuickLeadForm) => {
    setTouched((prev) => markTouched(prev, key));
    const error = validateField(String(form[key] ?? ''), rules[key] ?? []);
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, [form, rules]);

  const handleVerifyNumber = async () => {
    setVerifyingPhone(true);
    const res = await api.sendOtp('+91', Number(form.mobileNumber));
    setVerifyingPhone(false);
    if (res.success) {
      setIsPhoneValidated(true);
    } else {
      setErrors((p) => ({ ...p, mobileNumber: res.message ?? 'Failed to send OTP' }));
      setTouched((p) => ({ ...p, mobileNumber: true }));
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    const res = await api.verifyOtp('+91', Number(form.mobileNumber), Number(otp));
    setVerifyingOtp(false);
    if (res.success && res.data?.verified) setIsPhoneVerified(true);
    else Alert.alert('Invalid OTP', 'Please check and try again.');
  };

  const handleContinue = async () => {
    const allTouched = markAllTouched(form);
    setTouched(allTouched);
    const formErrors = validateForm(form, rules);
    setErrors(formErrors);
    if (hasErrors(formErrors)) {
      Alert.alert('Incomplete Form', 'Please fill all required fields.');
      return;
    }
    setSaving(true);
    const res = await api.createQuickLead({ ...form, countryCode: '+91' });
    setSaving(false);
    if (res.success && res.data) {
      setLeadId(res.data.leadId);
      setQuickLeadDone();
      navigation.navigate('ProspectLead');
    } else {
      Alert.alert('Error', res.message ?? 'Failed to create lead.');
    }
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    await api.createQuickLead({ ...form, countryCode: '+91', isDraft: true });
    setSaving(false);
    Alert.alert('Saved', 'Lead saved as draft.');
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="dark" />
      <View style={globalStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={s.title}>Quick Lead</Text>
          </View>

          {/* Customer Information */}
          <SectionCard title="Customer Information">
            <PhoneInput
              label="Mobile Number" required value={form.mobileNumber}
              onChangeText={(v) => handleChange('mobileNumber', v)}
              onBlur={() => handleBlur('mobileNumber')}
              error={errors.mobileNumber} touched={!!touched.mobileNumber}
              editable={!isPhoneValidated} isValidated={isPhoneValidated}
              isVerified={isPhoneVerified} autoFocus
            />
            {isPhoneValidated && !isPhoneVerified && (
              <OTPInput onComplete={setOtp} required onResend={() => api.resendOtp('+91', Number(form.mobileNumber))} />
            )}
            {isPhoneVerified && (
              <>
                <RadioGroup label="Customer Type" required value={form.customerType}
                  onChange={(v) => handleChange('customerType', v)}
                  options={[{ label: 'Individual', value: CustomerType.Individual }, { label: 'Non-Individual', value: CustomerType.NonIndividual }]}
                  error={errors.customerType} touched={!!touched.customerType} />
                <View style={globalStyles.row}>
                  <View style={globalStyles.flex2}>
                    <CustomInput label="First Name" required value={form.firstName}
                      onChangeText={(v) => handleChange('firstName', v)}
                      onBlur={() => handleBlur('firstName')}
                      error={errors.firstName} touched={!!touched.firstName} placeholder="First name" maxLength={50} />
                  </View>
                  <View style={globalStyles.flex1}>
                    <CustomInput label="Middle" value={form.middleName}
                      onChangeText={(v) => handleChange('middleName', v)} placeholder="Middle" maxLength={50} />
                  </View>
                  <View style={globalStyles.flex2}>
                    <CustomInput label="Last Name" required value={form.lastName}
                      onChangeText={(v) => handleChange('lastName', v)}
                      onBlur={() => handleBlur('lastName')}
                      error={errors.lastName} touched={!!touched.lastName} placeholder="Last name" maxLength={50} />
                  </View>
                </View>
                <RadioGroup label="Gender" required value={form.gender}
                  onChange={(v) => handleChange('gender', v)}
                  options={[{ label: 'Male', value: Gender.Male }, { label: 'Female', value: Gender.Female }, { label: 'Other', value: Gender.Other }]}
                  error={errors.gender} touched={!!touched.gender} />
              </>
            )}
          </SectionCard>

          {isPhoneVerified && (
            <>
              <View style={globalStyles.gap} />
              <SectionCard title="Address Information">
                <CustomInput label="Address Line 1" required value={form.addressLine1}
                  onChangeText={(v) => handleChange('addressLine1', v)}
                  onBlur={() => handleBlur('addressLine1')}
                  error={errors.addressLine1} touched={!!touched.addressLine1}
                  placeholder="Street, Society, Building" maxLength={200} />
                <CustomInput label="Address Line 2" value={form.addressLine2}
                  onChangeText={(v) => handleChange('addressLine2', v)} placeholder="Landmark (optional)" />
                <View style={globalStyles.row}>
                  <View style={globalStyles.flex1}>
                    <CustomInput label="City" required value={form.city}
                      onChangeText={(v) => handleChange('city', v)}
                      onBlur={() => handleBlur('city')}
                      error={errors.city} touched={!!touched.city} placeholder="City" />
                  </View>
                  <View style={globalStyles.flex1}>
                    <CustomInput label="Pincode" required value={form.pincode}
                      onChangeText={(v) => handleChange('pincode', v)}
                      onBlur={() => handleBlur('pincode')}
                      error={errors.pincode} touched={!!touched.pincode}
                      placeholder="6-digit PIN" keyboardType="numeric" maxLength={6} />
                  </View>
                </View>
                <Dropdown label="State" required selectedValue={form.state} options={STATES}
                  onSelect={(v) => handleChange('state', v)} error={errors.state} touched={!!touched.state} searchable />
              </SectionCard>

              <View style={globalStyles.gap} />
              <SectionCard title="Loan Information">
                <Dropdown label="Loan Type" required selectedValue={form.loanType} options={LOAN_TYPES}
                  onSelect={(v) => handleChange('loanType', v)} error={errors.loanType} touched={!!touched.loanType} />
                <Dropdown label="Type of Scheme" required selectedValue={form.schemeType} options={SCHEME_TYPES}
                  onSelect={(v) => handleChange('schemeType', v)} error={errors.schemeType} touched={!!touched.schemeType} />
                <CustomInput label="Loan Amount (₹)" required value={form.loanAmount}
                  onChangeText={(v) => handleChange('loanAmount', v)}
                  onBlur={() => handleBlur('loanAmount')}
                  error={errors.loanAmount} touched={!!touched.loanAmount}
                  placeholder="Enter loan amount" keyboardType="numeric" maxLength={10} />
              </SectionCard>

              <View style={globalStyles.gap} />
              <SectionCard title="Property Information">
                <Dropdown label="Property Type" required selectedValue={form.propertyType} options={PROPERTY_TYPES}
                  onSelect={(v) => handleChange('propertyType', v)} error={errors.propertyType} touched={!!touched.propertyType} />
                <Dropdown label="Property Location" required selectedValue={form.propertyLocation} options={PROPERTY_LOCATIONS}
                  onSelect={(v) => handleChange('propertyLocation', v)} error={errors.propertyLocation} touched={!!touched.propertyLocation} />
              </SectionCard>

              {form.customerType === CustomerType.NonIndividual && (
                <>
                  <View style={globalStyles.gap} />
                  <SectionCard title="Business Information">
                    <Dropdown label="Business Type" required selectedValue={form.businessType} options={BUSINESS_TYPES}
                      onSelect={(v) => handleChange('businessType', v)} error={errors.businessType} touched={!!touched.businessType} />
                    <CustomInput label="Business GSTIN" required value={form.businessGSTIN}
                      onChangeText={(v) => handleChange('businessGSTIN', v.toUpperCase())}
                      onBlur={() => handleBlur('businessGSTIN')}
                      error={errors.businessGSTIN} touched={!!touched.businessGSTIN}
                      placeholder="e.g. 27AAPFU0939F1ZV" maxLength={15} autoCapitalize="characters" />
                    <CustomInput label="Business Name" required value={form.businessName}
                      onChangeText={(v) => handleChange('businessName', v)}
                      onBlur={() => handleBlur('businessName')}
                      error={errors.businessName} touched={!!touched.businessName}
                      placeholder="Registered business name"
                      editable={form.businessGSTIN.length !== 15} />
                  </SectionCard>
                </>
              )}

              <View style={globalStyles.gap} />
              <SectionCard title="Lead Information">
                <Dropdown label="Lead Source" required selectedValue={form.leadSource} options={LEAD_SOURCES}
                  onSelect={(v) => handleChange('leadSource', v)} error={errors.leadSource} touched={!!touched.leadSource} />
                <View style={s.labelRow}>
                  <Text style={s.fieldLabel}>Lead Status</Text>
                  <Text style={s.required}> *</Text>
                </View>
                <View style={s.statusRow}>
                  {STATUS_CONFIG.map(({ status, emoji, color }) => (
                    <TouchableOpacity key={status} onPress={() => handleChange('leadStatus', status)}
                      style={[s.statusBtn, { borderColor: color },
                        form.leadStatus === status && { backgroundColor: color + '20' }]}>
                      <Text>{emoji}</Text>
                      <Text style={[s.statusLabel, { color }]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.leadStatus && touched.leadStatus && <Text style={s.errorText}>{errors.leadStatus}</Text>}
              </SectionCard>
            </>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom bar */}
        {!isPhoneValidated && (
          <View style={globalStyles.footer}>
            <Button title="Send OTP" onPress={handleVerifyNumber}
              disabled={form.mobileNumber.length !== 10} loading={verifyingPhone} />
          </View>
        )}
        {isPhoneValidated && !isPhoneVerified && (
          <View style={globalStyles.footer}>
            <Button title="Verify OTP" onPress={handleVerifyOtp}
              disabled={otp.length !== 6} loading={verifyingOtp} />
          </View>
        )}
        {isPhoneVerified && (
          <View style={[globalStyles.footer, globalStyles.row]}>
            <View style={globalStyles.flex2}>
              <Button title="Save Draft" variant={ButtonVariant.OUTLINE}
                onPress={handleSaveAsDraft} loading={saving} />
            </View>
            <View style={{ flex: 3 }}>
              <Button title="Continue →" onPress={handleContinue} loading={saving} />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 22, color: Color.Black },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Color.Black },
  labelRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Gray700 },
  required: { fontSize: FontSize.sm, color: Color.Error },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, borderWidth: 1.5, borderRadius: BorderRadius.md, gap: 4 },
  statusLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  errorText: { fontSize: FontSize.xs, color: Color.Error, marginTop: 4 },
});

export default QuickLeadScreen;
