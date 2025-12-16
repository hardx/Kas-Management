import { useMemo } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  transaction_date: string;
}

interface TransactionChartProps {
  transactions: Transaction[];
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const chartData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const date = t.transaction_date;
      if (!acc[date]) {
        acc[date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[date].income += Number(t.amount);
      } else {
        acc[date].expense += Number(t.amount);
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7);
  }, [transactions]);

  const maxValue = Math.max(
    ...chartData.flatMap(([, { income, expense }]) => [income, expense]),
    100
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Grafik Transaksi</h3>

      <div className="space-y-4">
        {chartData.map(([date, { income, expense }]) => (
          <div key={date} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{formatDate(date)}</span>
              <div className="flex space-x-4">
                <span className="text-green-600">{formatCurrency(income)}</span>
                <span className="text-red-600">{formatCurrency(expense)}</span>
              </div>
            </div>
            <div className="flex space-x-2 h-8">
              <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-lg transition-all"
                  style={{ width: `${(income / maxValue) * 100}%` }}
                ></div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-lg transition-all"
                  style={{ width: `${(expense / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Pemasukan</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}
