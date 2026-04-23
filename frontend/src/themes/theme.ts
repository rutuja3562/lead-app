import { StyleSheet, Platform } from 'react-native';

export const Color = {
  Primary: '#1A56DB',
  PrimaryLight: '#EBF0FF',
  PrimaryDark: '#1040B0',
  Success: '#057A55',
  SuccessLight: '#F3FAF7',
  Error: '#E02424',
  ErrorLight: '#FDF2F2',
  Warning: '#D97706',
  WarningLight: '#FFFBEB',
  DarkRed: '#C81E1E',
  DarkOrange: '#B45309',
  DarkBlue: '#1A56DB',
  White: '#FFFFFF',
  Black: '#111928',
  Gray50: '#F9FAFB',
  Gray100: '#F3F4F6',
  Gray200: '#E5E7EB',
  Gray300: '#D1D5DB',
  Gray400: '#9CA3AF',
  Gray500: '#6B7280',
  Gray600: '#4B5563',
  Gray700: '#374151',
  Gray800: '#1F2937',
  Background: '#F5F7FB',
  Border: '#E5E7EB',
  Placeholder: '#9CA3AF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Color.Background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Color.Background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Color.White,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Color.White,
    borderTopWidth: 1,
    borderTopColor: Color.Gray100,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  gap: { height: Spacing.lg },
});

export default { Color, Spacing, FontSize, BorderRadius };

// Extra flex helpers used in screens
export const extraStyles = StyleSheet.create({
  flex3: { flex: 3 },
});
