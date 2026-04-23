import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Color, FontSize, Spacing, BorderRadius } from '../../themes/theme';

interface Props extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const CustomInput: React.FC<Props> = ({
  label, required, error, touched, onChangeText, onBlur,
  helperText, leftIcon, editable = true, style, ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const showError = !!error && !!touched;

  const borderColor = showError ? Color.Error : focused ? Color.Primary : Color.Border;
  const bg = !editable ? Color.Gray100 : showError ? Color.ErrorLight : Color.White;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.star}> *</Text>}
        </View>
      )}
      <View style={[styles.inputWrap, { borderColor, backgroundColor: bg },
        focused && !showError && styles.focused]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          {...rest}
          editable={editable}
          style={[styles.input, !editable && { color: Color.Gray500 }, style]}
          placeholderTextColor={Color.Placeholder}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
        />
      </View>
      {showError && <Text style={styles.error}>{error}</Text>}
      {!showError && helperText && <Text style={styles.helper}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  labelRow: { flexDirection: 'row', marginBottom: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Gray700 },
  star: { fontSize: FontSize.sm, color: Color.Error },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  focused: {
    shadowColor: Color.Primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  input: { flex: 1, fontSize: FontSize.md, color: Color.Black, paddingVertical: Spacing.sm },
  leftIcon: { marginRight: Spacing.sm },
  error: { fontSize: FontSize.xs, color: Color.Error, marginTop: 4 },
  helper: { fontSize: FontSize.xs, color: Color.Gray500, marginTop: 4 },
});

export default CustomInput;
