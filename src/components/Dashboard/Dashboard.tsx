import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { transactions as transactionApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from './StatCard';
import { TransactionChart } from './TransactionChart';
import { RecentTransactions } from './RecentTransactions';

type Period = 'daily' | 'weekly' | 'monthly';

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: any[];
}

export function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('daily');
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, period]);

  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date(today);

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(today.getMonth() - 1);
    }

    return startDate.toISOString().split('T')[0];
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const startDate = getDateRange();

      // Fetch all transactions (our API currently doesn't filter by date, so we filter in JS)
      // Optimization: Update API to support date filtering later
      const { data } = await transactionApi.getAll();

      const transactions = data.filter((t: any) => t.transaction_date >= startDate);

      const income = transactions
        ?.filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

      const expense = transactions
        ?.filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        transactions: transactions || [],
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Ringkasan keuangan Dyfhaa Print</p>
        </div>
        <div className="flex space-x-2">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Pemasukan"
              value={formatCurrency(stats.totalIncome)}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Total Pengeluaran"
              value={formatCurrency(stats.totalExpense)}
              icon={TrendingDown}
              color="red"
            />
            <StatCard
              title="Saldo"
              value={formatCurrency(stats.balance)}
              icon={Wallet}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionChart transactions={stats.transactions} />
            <RecentTransactions transactions={stats.transactions.slice(0, 10)} />
          </div>
        </>
      )}
    </div>
  );
}
