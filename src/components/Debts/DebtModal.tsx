import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { debts as debtApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Debt {
  id: string;
  type: 'debt' | 'receivable';
  person_name: string;
  total_amount: number;
  paid_amount: number;
  description: string;
  due_date: string | null;
  status: 'pending' | 'partial' | 'paid';
}

interface DebtModalProps {
  debt: Debt | null;
  onClose: () => void;
}

export function DebtModal({ debt, onClose }: DebtModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: debt?.type || 'debt' as 'debt' | 'receivable',
    person_name: debt?.person_name || '',
    total_amount: debt?.total_amount.toString() || '',
    paid_amount: debt?.paid_amount.toString() || '0',
    description: debt?.description || '',
    due_date: debt?.due_date || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const total = parseFloat(formData.total_amount) || 0;
    const paid = parseFloat(formData.paid_amount) || 0;

    if (paid > total) {
      setFormData((prev) => ({ ...prev, paid_amount: total.toString() }));
    }
  }, [formData.total_amount, formData.paid_amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const total = parseFloat(formData.total_amount);
      const paid = parseFloat(formData.paid_amount);

      let status: 'pending' | 'partial' | 'paid' = 'pending';
      if (paid >= total) {
        status = 'paid';
      } else if (paid > 0) {
        status = 'partial';
      }

      const data = {
        type: formData.type,
        person_name: formData.person_name,
        total_amount: total,
        paid_amount: paid,
        description: formData.description,
        due_date: formData.due_date || null,
        status,
      };

      if (debt) {
        await debtApi.update(debt.id, data);
        toast.success('Data berhasil diperbarui');
      } else {
        await debtApi.create(data);
        toast.success('Data berhasil ditambahkan');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {debt ? 'Edit Data' : 'Tambah Hutang/Piutang'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe
            </label>
            <div className="flex space-x-2">
              {(['debt', 'receivable'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${formData.type === type
                    ? type === 'debt'
                      ? 'bg-red-600 text-white'
                      : 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {type === 'debt' ? 'Hutang' : 'Piutang'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama {formData.type === 'debt' ? 'Kreditur' : 'Debitur'}
            </label>
            <input
              type="text"
              value={formData.person_name}
              onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nama orang/perusahaan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Jumlah (Rp)
            </label>
            <input
              type="number"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Dibayar (Rp)
            </label>
            <input
              type="number"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jatuh Tempo (Opsional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Catatan tambahan..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
