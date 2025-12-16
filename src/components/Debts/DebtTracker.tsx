import { useEffect, useState } from "react";
import { Plus, DollarSign, AlertCircle, Search } from "lucide-react";
import toast from "react-hot-toast";
import { debts as debtApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { DebtModal } from "./DebtModal";
import { DebtCard } from "./DebtCard";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Shared/Pagination";

interface Debt {
  id: string;
  type: "debt" | "receivable";
  person_name: string;
  total_amount: number;
  paid_amount: number;
  description: string;
  due_date: string | null;
  status: "pending" | "partial" | "paid";
  created_at: string;
}

export function DebtTracker() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadDebts();
    }
  }, [user]);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const { data } = await debtApi.getAll();
      setDebts(data || []);
    } catch (error) {
      console.error("Error loading debts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      await debtApi.delete(id);
      toast.success("Data berhasil dihapus");
      loadDebts();
    } catch (error) {
      console.error("Error deleting debt:", error);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDebt(null);
    loadDebts();
  };

  const filteredDebts = debts.filter(
    (d) =>
      d.person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const debtList = filteredDebts.filter((d) => d.type === "debt");
  const receivableList = filteredDebts.filter((d) => d.type === "receivable");

  const totalDebt = debtList
    .filter((d) => d.status !== "paid")
    .reduce(
      (sum, d) => sum + Number(d.total_amount) - Number(d.paid_amount),
      0
    );

  const totalReceivable = receivableList
    .filter((d) => d.status !== "paid")
    .reduce(
      (sum, d) => sum + Number(d.total_amount) - Number(d.paid_amount),
      0
    );

  // Pagination for Debt List
  const {
    currentPage: debtPage,
    setCurrentPage: setDebtPage,
    totalPages: debtTotalPages,
    startIndex: debtStartIndex,
    endIndex: debtEndIndex,
    paginate: paginateDebt,
  } = usePagination(debtList.length);

  // Pagination for Receivable List
  const {
    currentPage: receivablePage,
    setCurrentPage: setReceivablePage,
    totalPages: receivableTotalPages,
    startIndex: receivableStartIndex,
    endIndex: receivableEndIndex,
    paginate: paginateReceivable,
  } = usePagination(receivableList.length);

  const displayedDebt = paginateDebt(debtList);
  const displayedReceivable = paginateReceivable(receivableList);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hutang & Piutang</h1>
          <p className="text-gray-600 mt-1">
            Kelola catatan hutang dan piutang usaha
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Data</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Hutang</p>
              <h3 className="text-3xl font-bold mt-2">
                {formatCurrency(totalDebt)}
              </h3>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Piutang
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {formatCurrency(totalReceivable)}
              </h3>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Daftar Hutang
            </h2>
            <div className="space-y-3 flex-1">
              {displayedDebt.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Tidak ada hutang
                </p>
              ) : (
                displayedDebt.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
            <Pagination
              currentPage={debtPage}
              totalPages={debtTotalPages}
              onPageChange={setDebtPage}
              startIndex={debtStartIndex}
              endIndex={debtEndIndex}
              totalItems={debtList.length}
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-green-600 mb-4">
              Daftar Piutang
            </h2>
            <div className="space-y-3 flex-1">
              {displayedReceivable.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Tidak ada piutang
                </p>
              ) : (
                displayedReceivable.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
            <Pagination
              currentPage={receivablePage}
              totalPages={receivableTotalPages}
              onPageChange={setReceivablePage}
              startIndex={receivableStartIndex}
              endIndex={receivableEndIndex}
              totalItems={receivableList.length}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <DebtModal debt={editingDebt} onClose={handleModalClose} />
      )}
    </div>
  );
}
