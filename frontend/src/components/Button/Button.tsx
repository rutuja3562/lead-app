import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Color, FontSize, Spacing, BorderRadius } from '../../themes/theme';

export enum ButtonVariant { FILLED = 'FILLED', OUTLINE = 'OUTLINE', GHOST = 'GHOST' }
export enum ButtonSize { SMALL = 'SMALL', MEDIUM = 'MEDIUM', LARGE = 'LARGE' }

interface Props {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  customColors?: { text?: string; background?: string; border?: string };
  fullWidth?: boolean;
}

const getColors = (v: ButtonVariant, disabled: boolean, custom?: Props['customColors']) => {
  if (disabled) return { bg: Color.Gray200, text: Color.Gray400, border: Color.Gray200 };
  if (custom) return {
    bg: custom.background ?? (v === ButtonVariant.FILLED ? Color.Primary : 'transparent'),
    text: custom.text ?? Color.White,
    border: custom.border ?? 'transparent',
  };
  switch (v) {
    case ButtonVariant.OUTLINE: return { bg: 'transparent', text: Color.Primary, border: Color.Primary };
    case ButtonVariant.GHOST: return { bg: 'transparent', text: Color.Primary, border: 'transparent' };
    default: return { bg: Color.Primary, text: Color.White, border: Color.Primary };
  }
};

const getPadding = (s: ButtonSize) => {
  switch (s) {
    case ButtonSize.SMALL: return { paddingVertical: 6, paddingHorizontal: 12 };
    case ButtonSize.LARGE: return { paddingVertical: 16, paddingHorizontal: 24 };
    default: return { paddingVertical: 12, paddingHorizontal: 20 };
  }
};

export const Button: React.FC<Props> = ({
  title, onPress, variant = ButtonVariant.FILLED, size = ButtonSize.MEDIUM,
  disabled = false, loading = false, icon, customColors, fullWidth = true,
}) => {
  const c = getColors(variant, disabled, customColors);
  const p = getPadding(size);
  const fontSize = size === ButtonSize.SMALL ? FontSize.sm : size === ButtonSize.LARGE ? FontSize.lg : FontSize.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.base, { backgroundColor: c.bg, borderColor: c.border, ...p },
        fullWidth && styles.full]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={c.text} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          {title && <Text style={[styles.text, { color: c.text, fontSize }]}>{title}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderWidth: 1.5, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  full: { width: '100%' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontWeight: '600' },
  iconWrap: { marginRight: 2 },
});

export default Button;
