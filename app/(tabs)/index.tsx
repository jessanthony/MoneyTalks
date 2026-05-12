import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { TransactionRepository, Transaction } from '../../lib/TransactionRepository';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width, fontScale } = useWindowDimensions();

  const [balance, setBalance] = useState({ income: 0, expenses: 0, total: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const loadData = async () => {
    try {
      const summary = await TransactionRepository.getBalanceSummary();
      setBalance(summary);
      const recent = await TransactionRepository.getRecentTransactions(4);
      setRecentTransactions(recent);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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

  // Responsive font sizes based on screen width
  const fs = {
    title: width < 360 ? 20 : 24,
    balance: width < 360 ? 28 : 36,
    section: width < 360 ? 14 : 16,
    body: width < 360 ? 13 : 15,
    small: width < 360 ? 11 : 12,
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.appTitle, { fontSize: fs.title }]}>Money Talks</Text>
              <Text style={[styles.appSubtitle, { fontSize: fs.small }]}>your money, your rules</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => Alert.alert('Notifications', 'The Notifications feature is coming soon!')}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFF" style={{ marginRight: 18 }} />
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => Alert.alert('Settings', 'The Settings feature is coming soon!')}
              >
                <Ionicons name="settings-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={[styles.balanceLabel, { fontSize: fs.small }]}>TOTAL BALANCE</Text>
            <Text style={[styles.balanceAmount, { fontSize: fs.balance }]}>{formatCurrency(balance.total)}</Text>
            <Text style={[styles.updatedText, { fontSize: fs.small }]}>Updated just now</Text>

            <View style={styles.incomeExpenseContainer}>
              <View style={styles.incomeBox}>
                <Text style={[styles.incomeExpenseLabel, { fontSize: fs.small }]}>Income</Text>
                <Text style={[styles.incomeAmount, { fontSize: fs.body }]}>{formatCurrency(balance.income)} ↓</Text>
              </View>
              <View style={styles.expenseBox}>
                <Text style={[styles.incomeExpenseLabel, { fontSize: fs.small }]}>Expenses</Text>
                <Text style={[styles.expenseAmount, { fontSize: fs.body }]}>{formatCurrency(balance.expenses)} ↑</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.content, isDark ? styles.contentDark : styles.contentLight]}>
          {/* Search */}
          <View style={[styles.searchContainer, isDark ? styles.searchDark : styles.searchLight]}>
            <Ionicons name="search" size={18} color="#A0AEC0" />
            <TextInput
              style={[styles.searchInput, isDark ? styles.textDark : styles.textLight, { fontSize: fs.body }]}
              placeholder="Search transactions..."
              placeholderTextColor="#A0AEC0"
            />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.section }]}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <ActionItem
              icon="pie-chart"
              label="Budgets"
              isDark={isDark}
              onPress={() => Alert.alert('Budgets', 'The Budgets feature is coming soon!')}
              fontSize={fs.small}
            />
            <ActionItem
              icon="wallet"
              label="Savings"
              isDark={isDark}
              onPress={() => Alert.alert('Savings', 'The Savings feature is coming soon!')}
              fontSize={fs.small}
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.recentHeader}>
            <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.section }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => router.push('/transactions')}
            >
              <Text style={[styles.seeAll, { fontSize: fs.body }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 && (
            <View style={[styles.emptyCard, isDark ? styles.itemDark : styles.itemLight]}>
              <Ionicons name="receipt-outline" size={32} color="#A0AEC0" />
              <Text style={[styles.emptyText, { fontSize: fs.body }]}>No transactions yet</Text>
              <Text style={[styles.emptySubText, { fontSize: fs.small }]}>
                Tap the + button to add your first one
              </Text>
            </View>
          )}

          {recentTransactions.map((t) => {
            const isIncome = t.amount > 0;
            const { name, color, bg } = getCategoryIcon(t.category);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.transactionItem, isDark ? styles.itemDark : styles.itemLight]}
                onPress={() => router.push({ pathname: '/transaction-detail', params: { id: t.id } })}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2D3748' : bg }]}>
                  <Ionicons name={name as any} size={18} color={color} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionTitle, isDark ? styles.textDark : styles.textLight, { fontSize: fs.body }]}>
                    {t.title}
                  </Text>
                  <Text style={[styles.transactionDate, { fontSize: fs.small }]}>{t.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: isIncome ? '#48BB78' : '#F56565', fontSize: fs.body }]}>
                  {isIncome ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ActionItem = ({
  icon, label, isDark, onPress, fontSize
}: {
  icon: any, label: string, isDark: boolean, onPress?: () => void, fontSize: number
}) => (
  <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={onPress}>
    <View style={[styles.actionIcon, isDark ? styles.itemDark : styles.itemLight]}>
      <Ionicons name={icon} size={24} color={isDark ? '#A0AEC0' : '#4A5568'} />
    </View>
    <Text style={[styles.actionLabel, isDark ? styles.textDark : styles.textLight, { fontSize }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  containerLight: { backgroundColor: '#F7FAFC' },
  containerDark: { backgroundColor: '#1A202C' },
  header: {
    padding: 20,
    paddingTop: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerLight: { backgroundColor: '#38A169' },
  headerDark: { backgroundColor: '#22543D' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  appTitle: { fontWeight: 'bold', color: '#FFF', fontStyle: 'italic' },
  appSubtitle: { color: '#E2E8F0', fontStyle: 'italic' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
  },
  balanceLabel: { color: '#E2E8F0', fontWeight: 'bold', letterSpacing: 0.5 },
  balanceAmount: { color: '#FFF', fontWeight: 'bold', marginVertical: 4 },
  updatedText: { color: '#E2E8F0', marginBottom: 16 },
  incomeExpenseContainer: { flexDirection: 'row', gap: 12 },
  incomeBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10 },
  expenseBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10 },
  incomeExpenseLabel: { color: '#E2E8F0' },
  incomeAmount: { color: '#FFF', fontWeight: 'bold', marginTop: 4 },
  expenseAmount: { color: '#FFF', fontWeight: 'bold', marginTop: 4 },
  content: { padding: 16 },
  contentLight: { backgroundColor: '#F7FAFC' },
  contentDark: { backgroundColor: '#1A202C' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 14, marginBottom: 22, marginTop: 4
  },
  searchLight: { backgroundColor: '#FFF' },
  searchDark: { backgroundColor: '#2D3748' },
  searchInput: { marginLeft: 10, flex: 1 },
  textLight: { color: '#2D3748' },
  textDark: { color: '#F7FAFC' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 14 },
  quickActionsContainer: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 28
  },
  actionItem: { alignItems: 'center', minWidth: 70 },
  actionIcon: {
    width: 60, height: 60, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8
  },
  itemLight: { backgroundColor: '#FFF' },
  itemDark: { backgroundColor: '#2D3748' },
  actionLabel: { fontWeight: '500' },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { color: '#48BB78', fontWeight: 'bold' },
  emptyCard: {
    borderRadius: 15, padding: 30,
    alignItems: 'center', marginBottom: 10
  },
  emptyText: { color: '#A0AEC0', fontWeight: '600', marginTop: 10 },
  emptySubText: { color: '#A0AEC0', marginTop: 4, textAlign: 'center' },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 14, marginBottom: 10
  },
  iconContainer: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  transactionDetails: { flex: 1 },
  transactionTitle: { fontWeight: 'bold', marginBottom: 3 },
  transactionDate: { color: '#A0AEC0' },
  transactionAmount: { fontWeight: 'bold' },
});
