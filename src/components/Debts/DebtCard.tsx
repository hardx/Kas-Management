import { Pencil, Trash2, Calendar } from 'lucide-react';

interface Debt {
  id: string;
  type: 'debt' | 'receivable';
  person_name: string;
  total_amount: number;
  paid_amount: number;
  description: string;
  due_date: string | null;
  status: 'pending' | 'partial' | 'paid';
  created_at: string;
}

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export function DebtCard({ debt, onEdit, onDelete }: DebtCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
  const percentage = (Number(debt.paid_amount) / Number(debt.total_amount)) * 100;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    pending: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{debt.person_name}</h3>
          <p className="text-sm text-gray-500">{debt.description || '-'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(debt)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(debt.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(debt.total_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Dibayar:</span>
          <span className="font-semibold text-green-600">{formatCurrency(debt.paid_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sisa:</span>
          <span className="font-semibold text-red-600">{formatCurrency(remaining)}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${debt.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'
              }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[debt.status]}`}>
          {statusLabels[debt.status]}
        </span>
        {debt.due_date && (
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(debt.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
