import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { TransactionRepository, Transaction } from '../lib/TransactionRepository';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const fs = {
    title: width < 360 ? 18 : 22,
    body: width < 360 ? 13 : 15,
    large: width < 360 ? 20 : 24,
    small: width < 360 ? 11 : 13,
  };

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      if (id) {
        const data = await TransactionRepository.getTransactionById(Number(id));
        if (data) {
          setTransaction(data);
          setEditTitle(data.title);
          setEditAmount(Math.abs(data.amount).toString());
        }
      }
    };
    fetchTransaction();
  }, [id]);

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editAmount.trim()) {
      Alert.alert('Error', 'Fields cannot be empty');
      return;
    }
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const finalAmount = transaction!.amount > 0 ? parsedAmount : -parsedAmount;
    try {
      await TransactionRepository.updateTransaction(Number(id), { title: editTitle.trim(), amount: finalAmount });
      setTransaction(prev => prev ? { ...prev, title: editTitle.trim(), amount: finalAmount } : null);
      setIsEditing(false);
      Alert.alert('Success', 'Transaction updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  if (!transaction) {
    return (
      <SafeAreaView
        style={[styles.safeArea, isDark ? styles.containerDark : styles.containerLight]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.centered}>
          <Ionicons name="hourglass-outline" size={32} color="#A0AEC0" />
          <Text style={[{ color: '#A0AEC0', marginTop: 10, fontSize: fs.body }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.amount > 0;

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
          {/* Screen Header */}
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#2D3748'} />
            </TouchableOpacity>
            <Text style={[styles.screenTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.title }]}>
              Transaction Detail
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Main Card */}
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            {/* ID Row */}
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { fontSize: fs.small }]}>Transaction ID</Text>
              <View style={styles.idBadge}>
                <Text style={[styles.idText, { fontSize: fs.small }]}>#{transaction.id}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Date */}
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { fontSize: fs.small }]}>Date</Text>
              <Text style={[styles.cardValue, isDark ? styles.textDark : styles.textLight, { fontSize: fs.body }]}>
                {transaction.date}
              </Text>
            </View>

            {/* Category */}
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { fontSize: fs.small }]}>Category</Text>
              <View style={styles.categoryBadge}>
                <Text style={[styles.categoryText, { fontSize: fs.small }]}>{transaction.category}</Text>
              </View>
            </View>

            {/* Type */}
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { fontSize: fs.small }]}>Type</Text>
              <Text style={[{ color: isIncome ? '#48BB78' : '#F56565', fontWeight: 'bold', fontSize: fs.body }]}>
                {isIncome ? '↓ Income' : '↑ Expense'}
              </Text>
            </View>

            <View style={styles.divider} />

            {isEditing ? (
              <View>
                <Text style={[styles.editLabel, { fontSize: fs.small }]}>Title</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { fontSize: fs.body }]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  returnKeyType="next"
                />
                <Text style={[styles.editLabel, { fontSize: fs.small, marginTop: 12 }]}>Amount (₱)</Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { fontSize: fs.body }]}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)} activeOpacity={0.8}>
                    <Text style={[styles.buttonText, { fontSize: fs.body }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} activeOpacity={0.8}>
                    <Text style={[styles.buttonText, { fontSize: fs.body }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {/* Title */}
                <View style={styles.cardRow}>
                  <Text style={[styles.cardLabel, { fontSize: fs.small }]}>Title</Text>
                  <Text style={[styles.cardValue, isDark ? styles.textDark : styles.textLight, { fontSize: fs.body, flex: 1, textAlign: 'right' }]}>
                    {transaction.title}
                  </Text>
                </View>

                {/* Amount */}
                <View style={[styles.amountRow]}>
                  <Text style={[styles.cardLabel, { fontSize: fs.small }]}>Amount</Text>
                  <Text style={[{
                    fontSize: fs.large, fontWeight: 'bold',
                    color: isIncome ? '#48BB78' : '#F56565'
                  }]}>
                    {isIncome ? '+' : '-'}₱{Math.abs(transaction.amount).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)} activeOpacity={0.85}>
                  <Ionicons name="pencil" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, { fontSize: fs.body }]}>Edit Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  containerLight: { backgroundColor: '#F7FAFC' },
  containerDark: { backgroundColor: '#1A202C' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  screenHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20
  },
  screenTitle: { fontWeight: 'bold' },
  textLight: { color: '#2D3748' },
  textDark: { color: '#F7FAFC' },
  card: {
    borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3
  },
  cardLight: { backgroundColor: '#FFF' },
  cardDark: { backgroundColor: '#2D3748' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 4 },
  cardLabel: { color: '#A0AEC0', fontWeight: '500' },
  cardValue: { fontWeight: '500' },
  idBadge: {
    backgroundColor: 'rgba(160, 174, 192, 0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8
  },
  idText: { color: '#A0AEC0', fontWeight: '600' },
  categoryBadge: {
    backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12
  },
  categoryText: { color: '#4A5568', fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(160, 174, 192, 0.2)', marginVertical: 8 },
  editLabel: { color: '#A0AEC0', fontWeight: '500', marginBottom: 6 },
  input: { padding: 13, borderRadius: 12, marginBottom: 4 },
  inputLight: { backgroundColor: '#F7FAFC', color: '#2D3748', borderWidth: 1, borderColor: '#E2E8F0' },
  inputDark: { backgroundColor: '#1A202C', color: '#F7FAFC', borderWidth: 1, borderColor: '#4A5568' },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: {
    flex: 1, backgroundColor: '#A0AEC0',
    padding: 14, borderRadius: 12, alignItems: 'center'
  },
  saveButton: {
    flex: 1, backgroundColor: '#38A169',
    padding: 14, borderRadius: 12, alignItems: 'center'
  },
  editButton: {
    backgroundColor: '#3182CE', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    padding: 14, borderRadius: 12, marginTop: 8
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});
