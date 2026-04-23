import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Color, FontSize, Spacing, BorderRadius } from '../../themes/theme';

interface Props {
  length?: number; onComplete: (otp: string) => void;
  required?: boolean; onResend?: () => void; resendCooldown?: number;
}

const insertDigit = (digits: string[], i: number, d: string): string[] => {
  const next = [...digits]; next[i] = d; return next;
};

export const OTPInput: React.FC<Props> = ({
  length = 6, onComplete, required, onResend, resendCooldown = 30,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (text: string, i: number) => {
    const d = text.replace(/[^0-9]/g, '').slice(-1);
    const next = insertDigit(digits, i, d);
    setDigits(next);
    if (next.join('').length === length) onComplete(next.join(''));
    if (d && i < length - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyPress = (key: string, i: number) => {
    if (key === 'Backspace') {
      if (!digits[i] && i > 0) {
        inputs.current[i - 1]?.focus();
        setDigits(insertDigit(digits, i - 1, ''));
      } else {
        setDigits(insertDigit(digits, i, ''));
      }
    }
  };

  const handleResend = () => {
    onResend?.(); setCooldown(resendCooldown);
    setDigits(Array(length).fill(''));
    inputs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Enter OTP</Text>
        {required && <Text style={styles.star}> *</Text>}
      </View>
      <View style={styles.row}>
        {digits.map((d, i) => (
          <TextInput key={i} ref={(el: any) => { inputs.current[i] = el; }}
            style={[styles.cell, d ? styles.cellFilled : styles.cellEmpty]}
            value={d} onChangeText={(t) => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="numeric" maxLength={1} textAlign="center"
            autoFocus={i === 0} selectTextOnFocus />
        ))}
      </View>
      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>Didn't receive OTP? </Text>
        {cooldown > 0 ? (
          <Text style={styles.cooldown}>Resend in {cooldown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendBtn}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  labelRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Color.Gray700 },
  star: { fontSize: FontSize.sm, color: Color.Error },
  row: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  cell: { flex: 1, height: 52, borderWidth: 1.5, borderRadius: BorderRadius.md, fontSize: FontSize.xl, fontWeight: '700', color: Color.Black },
  cellEmpty: { borderColor: Color.Border, backgroundColor: Color.White },
  cellFilled: { borderColor: Color.Primary, backgroundColor: Color.PrimaryLight },
  resendRow: { flexDirection: 'row', marginTop: Spacing.sm, alignItems: 'center' },
  resendLabel: { fontSize: FontSize.sm, color: Color.Gray500 },
  resendBtn: { fontSize: FontSize.sm, color: Color.Primary, fontWeight: '600' },
  cooldown: { fontSize: FontSize.sm, color: Color.Gray400 },
});

export default OTPInput;
