import { getDb } from './database';

export interface Transaction {
  id?: number;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export const TransactionRepository = {
  async addTransaction(transaction: Transaction): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO transactions (title, amount, date, category) VALUES (?, ?, ?, ?)',
      [transaction.title, transaction.amount, transaction.date, transaction.category]
    );
  },

  async getTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    const allRows = await db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
    return allRows;
  },

  async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC LIMIT ?', [limit]);
    return rows;
  },

  async getTransactionById(id: number): Promise<Transaction | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    return row || null;
  },

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<void> {
    const db = await getDb();
    const current = await this.getTransactionById(id);
    if (!current) throw new Error('Transaction not found');

    const updated = { ...current, ...transaction };
    await db.runAsync(
      'UPDATE transactions SET title = ?, amount = ?, date = ?, category = ? WHERE id = ?',
      [updated.title, updated.amount, updated.date, updated.category, id]
    );
  },

  async deleteTransaction(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },
  
  async getBalanceSummary(): Promise<{ income: number; expenses: number; total: number }> {
    const transactions = await this.getTransactions();
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      if (t.amount > 0) {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount);
      }
    });
    
    return {
      income,
      expenses,
      total: income - expenses,
    };
  }
};
