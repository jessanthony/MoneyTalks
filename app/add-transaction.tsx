import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TransactionRepository } from '../lib/TransactionRepository';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function AddTransactionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const fs = {
    title: width < 360 ? 18 : 22,
    body: width < 360 ? 13 : 15,
    small: width < 360 ? 11 : 13,
  };

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Food');

  const categories = ['Food', 'Salary', 'Bills', 'Shopping', 'Other'];

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const finalAmount = type === 'expense' ? -parsedAmount : parsedAmount;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    try {
      await TransactionRepository.addTransaction({ title: title.trim(), amount: finalAmount, date, category });
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={26} color={isDark ? '#FFF' : '#2D3748'} />
            </TouchableOpacity>
            <Text style={[styles.screenTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.title }]}>
              Add Transaction
            </Text>
            <View style={{ width: 26 }} />
          </View>

          {/* Type Selector */}
          <View style={[styles.typeSelector, isDark ? styles.typeSelectorDark : styles.typeSelectorLight]}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
              onPress={() => setType('expense')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeText, { fontSize: fs.body }, type === 'expense' && styles.typeTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
              onPress={() => setType('income')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeText, { fontSize: fs.body }, type === 'income' && styles.typeTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.labelLight, { fontSize: fs.small }]}>
              Title
            </Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { fontSize: fs.body }]}
              placeholder="e.g. Grocery Shop"
              placeholderTextColor="#A0AEC0"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          {/* Amount Input */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.labelLight, { fontSize: fs.small }]}>
              Amount (₱)
            </Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { fontSize: fs.body }]}
              placeholder="0.00"
              placeholderTextColor="#A0AEC0"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              returnKeyType="done"
            />
          </View>

          {/* Category Picker */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.labelLight, { fontSize: fs.small }]}>
              Category
            </Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBadge,
                    category === cat
                      ? styles.categoryBadgeActive
                      : (isDark ? styles.categoryBadgeDark : styles.categoryBadgeLight)
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryText,
                    { fontSize: fs.small },
                    category === cat ? styles.categoryTextActive : (isDark ? styles.textDark : styles.labelLight)
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
            <Text style={[styles.saveButtonText, { fontSize: fs.body }]}>Save Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  containerLight: { backgroundColor: '#F7FAFC' },
  containerDark: { backgroundColor: '#1A202C' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  screenHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24
  },
  screenTitle: { fontWeight: 'bold' },
  textLight: { color: '#2D3748' },
  textDark: { color: '#F7FAFC' },
  labelLight: { color: '#4A5568' },
  typeSelector: {
    flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 24
  },
  typeSelectorLight: { backgroundColor: '#E2E8F0' },
  typeSelectorDark: { backgroundColor: '#2D3748' },
  typeButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  typeButtonActiveExpense: { backgroundColor: '#F56565' },
  typeButtonActiveIncome: { backgroundColor: '#48BB78' },
  typeText: { fontWeight: '600', color: '#A0AEC0' },
  typeTextActive: { color: '#FFF' },
  formGroup: { marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8 },
  input: {
    padding: 14, borderRadius: 12
  },
  inputLight: { backgroundColor: '#FFF', color: '#2D3748', borderWidth: 1, borderColor: '#E2E8F0' },
  inputDark: { backgroundColor: '#2D3748', color: '#F7FAFC', borderWidth: 1, borderColor: '#4A5568' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryBadgeLight: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  categoryBadgeDark: { backgroundColor: '#2D3748', borderColor: '#4A5568' },
  categoryBadgeActive: { backgroundColor: '#38A169', borderColor: '#38A169' },
  categoryText: { fontWeight: '500' },
  categoryTextActive: { color: '#FFF', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#38A169', padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 10
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold' },
});
