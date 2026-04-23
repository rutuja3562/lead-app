import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LeadProvider } from './src/store/leadStore';
import QuickLeadScreen from './src/screens/QuickLead/QuickLeadScreen';
import ProspectLeadScreen from './src/screens/ProspectLead/ProspectLeadScreen';
import { Color, FontSize, Spacing, BorderRadius } from './src/themes/theme';

type RootStackParamList = {
  Dashboard: undefined;
  QuickLead: undefined;
  ProspectLead: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const DashboardScreen = ({ navigation }: any) => (
  <View style={dash.screen}>
    <StatusBar style="dark" />
    <Text style={dash.emoji}>🏠</Text>
    <Text style={dash.title}>Lead Manager</Text>
    <Text style={dash.sub}>Manage loan applications end-to-end</Text>
    <TouchableOpacity style={dash.btn} onPress={() => navigation.navigate('QuickLead')} activeOpacity={0.8}>
      <Text style={dash.btnText}>+ New Lead</Text>
    </TouchableOpacity>
  </View>
);

const dash = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.Background, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingHorizontal: 32 },
  emoji: { fontSize: 64 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Color.Black, textAlign: 'center' },
  sub: { fontSize: FontSize.md, color: Color.Gray500, textAlign: 'center' },
  btn: { backgroundColor: Color.Primary, paddingHorizontal: 40, paddingVertical: 16, borderRadius: BorderRadius.lg, marginTop: Spacing.md },
  btnText: { color: Color.White, fontSize: FontSize.lg, fontWeight: '700' },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <LeadProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="QuickLead" component={QuickLeadScreen} />
            <Stack.Screen name="ProspectLead" component={ProspectLeadScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LeadProvider>
    </SafeAreaProvider>
  );
}
