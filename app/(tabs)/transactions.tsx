import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { TransactionRepository, Transaction } from '../../lib/TransactionRepository';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fs = {
    title: width < 360 ? 20 : 24,
    body: width < 360 ? 13 : 15,
    small: width < 360 ? 11 : 12,
  };

  const loadData = async () => {
    try {
      const data = await TransactionRepository.getTransactions();
      setTransactions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await TransactionRepository.deleteTransaction(id);
          loadData();
        }
      }
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return { name: 'fast-food', color: '#FF6B6B', bg: '#FFECEC' };
      case 'Salary': return { name: 'briefcase', color: '#4ECDC4', bg: '#E0F7FA' };
      case 'Bills': return { name: 'receipt', color: '#45B7D1', bg: '#E1F5FE' };
      default: return { name: 'cart', color: '#96CEB4', bg: '#E8F5E9' };
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.amount > 0;
    const { name, color, bg } = getCategoryIcon(item.category);

    return (
      <TouchableOpacity
        style={[styles.transactionItem, isDark ? styles.itemDark : styles.itemLight]}
        onPress={() => router.push({ pathname: '/transaction-detail', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2D3748' : bg }]}>
          <Ionicons name={name as any} size={18} color={color} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.body }]}>
            {item.title}
          </Text>
          <Text style={[styles.transactionDate, { fontSize: fs.small }]}>{item.date}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.transactionAmount, { color: isIncome ? '#48BB78' : '#F56565', fontSize: fs.body }]}>
            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id!)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#F56565" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.title }]}>
          All Transactions
        </Text>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#A0AEC0" />
            <Text style={[styles.emptyText, { fontSize: fs.body }]}>No transactions yet.</Text>
            <Text style={[styles.emptySubText, { fontSize: fs.small }]}>Tap the + button to add your first one.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#F7FAFC' },
  containerDark: { backgroundColor: '#1A202C' },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { fontWeight: 'bold' },
  textLight: { color: '#2D3748' },
  textDark: { color: '#F7FAFC' },
  listContent: { padding: 16, paddingBottom: 30, flexGrow: 1 },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 14, marginBottom: 10
  },
  itemLight: { backgroundColor: '#FFF' },
  itemDark: { backgroundColor: '#2D3748' },
  iconContainer: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  transactionDetails: { flex: 1 },
  transactionTitle: { fontWeight: 'bold', marginBottom: 3 },
  transactionDate: { color: '#A0AEC0' },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  transactionAmount: { fontWeight: 'bold', marginRight: 12 },
  deleteButton: { padding: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#A0AEC0', fontWeight: '600', marginTop: 12 },
  emptySubText: { color: '#A0AEC0', marginTop: 4, textAlign: 'center' },
});
