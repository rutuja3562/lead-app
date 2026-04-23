import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabBar, TabConfig } from '../../components/index';
import {
  BasicInfoTab, PropertyInfoTab, IncomeInfoTab,
  PhotoUploadTab, DocumentUploadTab, ReferencesTab,
} from '../tabs/index';
import { Color, FontSize, Spacing } from '../../themes/theme';
import { TabKey, TabState } from '../../types';
import { useLeadStore } from '../../store/leadStore';

const TABS: TabConfig[] = [
  { key: TabKey.BasicInfo, label: 'Basic Info', shortLabel: 'Basic' },
  { key: TabKey.PropertyInfo, label: 'Property', shortLabel: 'Property' },
  { key: TabKey.IncomeInfo, label: 'Income', shortLabel: 'Income' },
  { key: TabKey.PhotoUpload, label: 'Photos', shortLabel: 'Photos' },
  { key: TabKey.DocumentUpload, label: 'Documents', shortLabel: 'Docs' },
  { key: TabKey.References, label: 'References', shortLabel: 'Refs' },
];

const TAB_ORDER = [
  TabKey.BasicInfo, TabKey.PropertyInfo, TabKey.IncomeInfo,
  TabKey.PhotoUpload, TabKey.DocumentUpload, TabKey.References,
];

// Pure: get next unlocked tab after current
const getNextTab = (current: TabKey, states: Record<TabKey, TabState>): TabKey | null => {
  const idx = TAB_ORDER.indexOf(current);
  for (let i = idx + 1; i < TAB_ORDER.length; i++) {
    if (states[TAB_ORDER[i]] !== TabState.Locked) return TAB_ORDER[i];
  }
  return null;
};

// Pure: count completed tabs
const countCompleted = (states: Record<TabKey, TabState>): number =>
  Object.values(states).filter((s) => s === TabState.Completed).length;

const ProspectLeadScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useLeadStore();
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.BasicInfo);

  const handleTabPress = (key: TabKey) => {
    if (state.tabCompletion[key] === TabState.Locked) {
      Alert.alert('Tab Locked', 'Please complete the previous sections first.');
      return;
    }
    setActiveTab(key);
  };

  const handleTabSaved = () => {
    const next = getNextTab(activeTab, state.tabCompletion);
    if (next) {
      setActiveTab(next);
    } else {
      Alert.alert(
        '🎉 Application Submitted!',
        'Your lead application has been submitted successfully.',
        [{ text: 'Dashboard', onPress: () => navigation.navigate('Dashboard') }],
      );
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case TabKey.BasicInfo: return <BasicInfoTab onSaved={handleTabSaved} />;
      case TabKey.PropertyInfo: return <PropertyInfoTab onSaved={handleTabSaved} />;
      case TabKey.IncomeInfo: return <IncomeInfoTab onSaved={handleTabSaved} />;
      case TabKey.PhotoUpload: return <PhotoUploadTab onSaved={handleTabSaved} />;
      case TabKey.DocumentUpload: return <DocumentUploadTab onSaved={handleTabSaved} />;
      case TabKey.References: return <ReferencesTab onSaved={handleTabSaved} />;
      default: return null;
    }
  };

  const completed = countCompleted(state.tabCompletion);
  const progress = Math.round((completed / TABS.length) * 100);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <StatusBar style="dark" />
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.title}>Lead Application</Text>
          {state.leadId && <Text style={s.leadId}>ID: {state.leadId.slice(0, 8)}…</Text>}
        </View>
        <View style={s.progressBadge}>
          <Text style={s.progressText}>{progress}%</Text>
        </View>
      </View>
      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progress}%` }]} />
      </View>
      {/* Tab bar */}
      <TabBar tabs={TABS} activeTab={activeTab} tabStates={state.tabCompletion} onTabPress={handleTabPress} />
      {/* Content */}
      <View style={s.content}>{renderTab()}</View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.Background },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Color.White, gap: Spacing.sm },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 22, color: Color.Black },
  titleBlock: { flex: 1 },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Color.Black },
  leadId: { fontSize: FontSize.xs, color: Color.Gray500 },
  progressBadge: { backgroundColor: Color.PrimaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 999 },
  progressText: { fontSize: FontSize.sm, fontWeight: '700', color: Color.Primary },
  progressBar: { height: 3, backgroundColor: Color.Gray100 },
  progressFill: { height: 3, backgroundColor: Color.Primary },
  content: { flex: 1 },
});

export default ProspectLeadScreen;
