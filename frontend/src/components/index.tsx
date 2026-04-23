import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, Alert,
} from 'react-native';
import { Color, FontSize, Spacing, BorderRadius } from '../themes/theme';
import { TabKey, TabState, UploadedFile } from '../types';

// ── SectionCard ────────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string; children: React.ReactNode;
  badge?: string; badgeColor?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title, children, badge, badgeColor = Color.Primary,
}) => (
  <View style={sc.card}>
    <View style={sc.header}>
      <Text style={sc.title}>{title}</Text>
      {badge && (
        <View style={[sc.badge, { backgroundColor: badgeColor + '22' }]}>
          <Text style={[sc.badgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      )}
    </View>
    {children}
  </View>
);

const sc = StyleSheet.create({
  card: { backgroundColor: Color.White, borderRadius: BorderRadius.lg, padding: Spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Color.Gray100 },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Color.Black },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
});

// ── TabBar ─────────────────────────────────────────────────────────────────────

export interface TabConfig { key: TabKey; label: string; shortLabel?: string }

interface TabBarProps {
  tabs: TabConfig[]; activeTab: TabKey;
  tabStates: Record<TabKey, TabState>; onTabPress: (k: TabKey) => void;
}

const tabColor = (s: TabState, active: boolean) =>
  active ? Color.Primary : s === TabState.Completed ? Color.Success : Color.Gray400;

const tabIcon = (s: TabState, active: boolean) =>
  active ? '●' : s === TabState.Completed ? '✓' : s === TabState.Locked ? '🔒' : '○';

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, tabStates, onTabPress }) => (
  <View style={tb.wrapper}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tb.scroll}>
      {tabs.map((tab, idx) => {
        const active = tab.key === activeTab;
        const s = tabStates[tab.key];
        const pressable = active || s === TabState.Completed || s === TabState.Active;
        const color = tabColor(s, active);
        return (
          <React.Fragment key={tab.key}>
            <TouchableOpacity
              onPress={() => pressable && onTabPress(tab.key)}
              activeOpacity={pressable ? 0.7 : 1}
              style={[tb.tab, !pressable && tb.locked]}
            >
              <Text style={[tb.icon, { color }]}>{tabIcon(s, active)}</Text>
              <Text style={[tb.tabLabel, { color }, active && tb.tabLabelActive]} numberOfLines={1}>
                {tab.shortLabel ?? tab.label}
              </Text>
              {active && <View style={tb.indicator} />}
            </TouchableOpacity>
            {idx < tabs.length - 1 && (
              <View style={[tb.connector,
                tabStates[tabs[idx + 1].key] !== TabState.Locked && tb.connectorActive]} />
            )}
          </React.Fragment>
        );
      })}
    </ScrollView>
  </View>
);

const tb = StyleSheet.create({
  wrapper: { backgroundColor: Color.White, borderBottomWidth: 1, borderBottomColor: Color.Gray100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  scroll: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, alignItems: 'center' },
  tab: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, minWidth: 64, position: 'relative' },
  locked: { opacity: 0.5 },
  icon: { fontSize: 14, marginBottom: 2 },
  tabLabel: { fontSize: FontSize.xs, fontWeight: '500', textAlign: 'center' },
  tabLabelActive: { fontWeight: '700' },
  indicator: { position: 'absolute', bottom: -Spacing.sm, left: '20%', right: '20%', height: 2.5, backgroundColor: Color.Primary, borderRadius: 2 },
  connector: { width: 12, height: 1, backgroundColor: Color.Gray300, alignSelf: 'center', marginBottom: 10 },
  connectorActive: { backgroundColor: Color.Success },
});

// ── PhoneInput ─────────────────────────────────────────────────────────────────

import CustomInput from './CustomInput/CustomInput';

interface PhoneInputProps {
  label?: string; required?: boolean; value: string;
  onChangeText: (v: string) => void; placeholder?: string;
  maxLength?: number; autoFocus?: boolean; editable?: boolean;
  error?: string; touched?: boolean; onBlur?: () => void;
  isValidated?: boolean; isVerified?: boolean; countryCode?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Mobile Number', required, value, onChangeText, placeholder = 'Enter 10-digit mobile number',
  maxLength = 10, autoFocus, editable = true, error, touched, onBlur,
  isValidated = false, isVerified = false, countryCode = '+91',
}) => {
  const badge = isVerified
    ? { text: '✓ Verified', color: Color.Success }
    : isValidated
    ? { text: 'OTP Sent', color: Color.Warning }
    : null;

  return (
    <View>
      <CustomInput
        label={label} required={required} value={value}
        onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ''))}
        placeholder={placeholder} maxLength={maxLength} autoFocus={autoFocus}
        editable={editable} keyboardType="phone-pad" error={error}
        touched={touched} onBlur={onBlur}
        leftIcon={
          <View style={ph.codeBox}>
            <Text style={ph.codeText}>{countryCode}</Text>
          </View>
        }
      />
      {badge && (
        <View style={[ph.badge, { backgroundColor: badge.color + '22' }]}>
          <Text style={[ph.badgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      )}
    </View>
  );
};

const ph = StyleSheet.create({
  codeBox: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRightWidth: 1, borderRightColor: Color.Border, marginRight: Spacing.sm },
  codeText: { fontSize: FontSize.md, fontWeight: '600', color: Color.Gray700 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, marginTop: -Spacing.sm, marginBottom: Spacing.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
});

// ── FileUpload ─────────────────────────────────────────────────────────────────

const formatSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const genId = () => `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

interface FileUploadProps {
  label?: string; required?: boolean; files: UploadedFile[];
  onAdd: (f: UploadedFile) => void; onRemove: (id: string) => void;
  accept?: 'image' | 'document' | 'any'; maxFiles?: number;
  maxSizeMB?: number; error?: string; touched?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label, required, files, onAdd, onRemove,
  accept = 'any', maxFiles = 5, maxSizeMB = 5, error, touched,
}) => {
  const showError = !!error && !!touched;
  const canAdd = files.length < maxFiles;

  const handlePick = () => {
    if (!canAdd) { Alert.alert('Limit reached', `Max ${maxFiles} files`); return; }
    Alert.alert('Pick File', 'Simulating file pick for demo', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Simulate', onPress: () => onAdd({
          id: genId(), uri: 'https://placehold.co/200x200/png',
          name: `file_${files.length + 1}.jpg`, type: 'image/jpeg', size: 204800,
        }) },
    ]);
  };

  return (
    <View style={fu.container}>
      {label && (
        <View style={fu.labelRow}>
          <Text style={fu.label}>{label}</Text>
          {required && <Text style={fu.star}> *</Text>}
        </View>
      )}
      {canAdd && (
        <TouchableOpacity style={[fu.area, showError && fu.areaErr]} onPress={handlePick} activeOpacity={0.7}>
          <Text style={fu.areaIcon}>📎</Text>
          <Text style={fu.areaText}>{accept === 'image' ? 'Upload Photo' : 'Upload File'}</Text>
          <Text style={fu.areaHint}>Max {maxSizeMB}MB · {maxFiles - files.length} remaining</Text>
        </TouchableOpacity>
      )}
      {files.length > 0 && (
        <View style={fu.list}>
          {files.map((f) => (
            <View key={f.id} style={fu.item}>
              {f.type.startsWith('image/') ? (
                <Image source={{ uri: f.uri }} style={fu.thumb} />
              ) : (
                <View style={fu.fileIcon}><Text>📄</Text></View>
              )}
              <View style={fu.info}>
                <Text style={fu.name} numberOfLines={1}>{f.name}</Text>
                <Text style={fu.size}>{formatSize(f.size)}</Text>
              </View>
              <TouchableOpacity onPress={() => onRemove(f.id)} style={fu.removeBtn}>
                <Text style={fu.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {showError && <Text style={fu.error}>{error}</Text>}
    </View>
  );
};

const fu = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  labelRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Gray700 },
  star: { fontSize: FontSize.sm, color: Color.Error },
  area: { borderWidth: 2, borderColor: Color.Border, borderStyle: 'dashed', borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', backgroundColor: Color.Gray50, gap: 4 },
  areaErr: { borderColor: Color.Error, backgroundColor: Color.ErrorLight },
  areaIcon: { fontSize: 28 },
  areaText: { fontSize: FontSize.md, fontWeight: '600', color: Color.Primary },
  areaHint: { fontSize: FontSize.xs, color: Color.Gray500 },
  list: { marginTop: Spacing.md, gap: Spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, backgroundColor: Color.Gray50, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Color.Gray200, gap: Spacing.sm },
  thumb: { width: 44, height: 44, borderRadius: BorderRadius.sm },
  fileIcon: { width: 44, height: 44, borderRadius: BorderRadius.sm, backgroundColor: Color.Gray200, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Black },
  size: { fontSize: FontSize.xs, color: Color.Gray500 },
  removeBtn: { width: 24, height: 24, borderRadius: BorderRadius.full, backgroundColor: Color.Gray200, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 11, color: Color.Gray600 },
  error: { fontSize: FontSize.xs, color: Color.Error, marginTop: 4 },
});
