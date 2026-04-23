import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Color, FontSize, Spacing, BorderRadius } from '../../themes/theme';

interface RadioOption { label: string; value: string }
interface Props {
  label?: string; required?: boolean; options: RadioOption[];
  value?: string; onChange: (v: string) => void;
  error?: string; touched?: boolean; horizontal?: boolean;
}

export const RadioGroup: React.FC<Props> = ({
  label, required, options, value, onChange, error, touched, horizontal = true,
}) => {
  const showError = !!error && !!touched;
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.star}> *</Text>}
        </View>
      )}
      <View style={[styles.opts, !horizontal && styles.optsCol]}>
        {options.map((opt) => {
          const sel = value === opt.value;
          return (
            <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)}
              style={[styles.opt, sel && styles.optSel, showError && !sel && styles.optErr]}
              activeOpacity={0.7}>
              <View style={[styles.radio, sel && styles.radioSel]}>
                {sel && <View style={styles.dot} />}
              </View>
              <Text style={[styles.optText, sel && styles.optTextSel]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {showError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  labelRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Gray700 },
  star: { fontSize: FontSize.sm, color: Color.Error },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optsCol: { flexDirection: 'column' },
  opt: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md, borderWidth: 1.5, borderColor: Color.Border,
    borderRadius: BorderRadius.md, backgroundColor: Color.White, gap: 8, flex: 1, minWidth: 100,
  },
  optSel: { borderColor: Color.Primary, backgroundColor: Color.PrimaryLight },
  optErr: { borderColor: Color.Error },
  optText: { fontSize: FontSize.sm, color: Color.Gray700 },
  optTextSel: { color: Color.Primary, fontWeight: '600' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Color.Gray400, alignItems: 'center', justifyContent: 'center' },
  radioSel: { borderColor: Color.Primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Color.Primary },
  error: { fontSize: FontSize.xs, color: Color.Error, marginTop: 4 },
});

export default RadioGroup;
