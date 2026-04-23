import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { Color, FontSize, Spacing, BorderRadius } from '../../themes/theme';
import { DropdownOption } from '../../types';

interface Props {
  label?: string;
  required?: boolean;
  selectedValue?: string;
  options: DropdownOption[];
  onSelect: (v: string) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  searchable?: boolean;
}

const filterOptions = (opts: DropdownOption[], q: string) =>
  !q.trim() ? opts : opts.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));

const getLabel = (opts: DropdownOption[], val?: string, ph = 'Select') =>
  val ? (opts.find((o) => o.value === val)?.label ?? ph) : ph;

export const Dropdown: React.FC<Props> = ({
  label, required, selectedValue, options, onSelect,
  placeholder = 'Select an option', error, touched, searchable = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [q, setQ] = useState('');
  const showError = !!error && !!touched;

  const handleSelect = (v: string) => { onSelect(v); setVisible(false); setQ(''); };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.star}> *</Text>}
        </View>
      )}
      <TouchableOpacity
        style={[styles.trigger, showError && styles.triggerErr]}
        onPress={() => setVisible(true)} activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !selectedValue && styles.ph]}>
          {getLabel(options, selectedValue, placeholder)}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {showError && <Text style={styles.error}>{error}</Text>}

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label ?? 'Select'}</Text>
              <TouchableOpacity onPress={() => { setVisible(false); setQ(''); }}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            {searchable && (
              <TextInput style={styles.search} placeholder="Search…" value={q}
                onChangeText={setQ} placeholderTextColor={Color.Placeholder} />
            )}
            <FlatList
              data={filterOptions(options, q)}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const sel = selectedValue === item.value;
                return (
                  <TouchableOpacity
                    style={[styles.option, sel && styles.optionSel]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[styles.optionText, sel && styles.optionTextSel]}>{item.label}</Text>
                    {sel && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              ListEmptyComponent={() => (
                <View style={styles.empty}><Text style={styles.emptyText}>No options found</Text></View>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  labelRow: { flexDirection: 'row', marginBottom: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Gray700 },
  star: { fontSize: FontSize.sm, color: Color.Error },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: Color.Border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Color.White, minHeight: 48,
  },
  triggerErr: { borderColor: Color.Error, backgroundColor: Color.ErrorLight },
  triggerText: { fontSize: FontSize.md, color: Color.Black, flex: 1 },
  ph: { color: Color.Placeholder },
  chevron: { fontSize: 14, color: Color.Gray500 },
  error: { fontSize: FontSize.xs, color: Color.Error, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Color.White, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Color.Gray100 },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Color.Black },
  close: { fontSize: 18, color: Color.Gray500, padding: 4 },
  search: { margin: Spacing.md, borderWidth: 1, borderColor: Color.Border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Color.Black },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  optionSel: { backgroundColor: Color.PrimaryLight },
  optionText: { fontSize: FontSize.md, color: Color.Black },
  optionTextSel: { color: Color.Primary, fontWeight: '600' },
  check: { color: Color.Primary, fontWeight: '700', fontSize: 16 },
  sep: { height: 1, backgroundColor: Color.Gray100 },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { color: Color.Gray500, fontSize: FontSize.md },
});

export default Dropdown;
