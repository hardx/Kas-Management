import { useEffect, useState } from "react";
import { Download, Filter, FileText, Search } from "lucide-react";
import { transactions as transactionApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Shared/Pagination";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
  created_at?: string;
  categories?: {
    name: string;
    color: string;
  };
  balance?: number;
}

export function GeneralLedger() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  }, [user]);

  useEffect(() => {
    if (user && startDate && endDate) {
      loadTransactions();
    }
  }, [user, startDate, endDate]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await transactionApi.getAll();

      // Filter by date client-side since API returns all
      const filtered = data
        .filter((t: any) => {
          const date = t.transaction_date.split("T")[0];
          return date >= startDate && date <= endDate;
        })
        .sort(
          (a: any, b: any) =>
            new Date(a.transaction_date).getTime() -
            new Date(b.transaction_date).getTime()
        );

      setTransactions(filtered || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRunningBalance = () => {
    let balance = 0;
    return transactions.map((t) => {
      if (t.type === "income") {
        balance += Number(t.amount);
      } else {
        balance -= Number(t.amount);
      }
      return { ...t, balance };
    });
  };

  const ledgerData = calculateRunningBalance();

  // Filter by search term
  const filteredLedgerData = ledgerData.filter(
    (t) =>
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
    paginate,
  } = usePagination(filteredLedgerData.length);

  const displayedData = paginate(filteredLedgerData);

  const exportToCSV = () => {
    const headers = [
      "Tanggal",
      "Kategori",
      "Deskripsi",
      "Debit",
      "Kredit",
      "Saldo",
    ];
    const rows = filteredLedgerData.map((t) => [
      t.transaction_date,
      t.categories?.name || "-",
      t.description || "-",
      t.type === "income" ? t.amount : 0,
      t.type === "expense" ? t.amount : 0,
      t.balance,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jurnal-besar-${startDate}-${endDate}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jurnal Besar</h1>
          <p className="text-gray-600 mt-1">
            Catatan lengkap semua transaksi keuangan
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredLedgerData.length === 0}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mt-6 md:mt-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Debit</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Kredit</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Saldo Akhir</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Deskripsi
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Debit (Rp)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Kredit (Rp)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Saldo (Rp)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        Tidak ada transaksi ditemukan
                      </td>
                    </tr>
                  ) : (
                    displayedData.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: `${transaction.categories?.color}20`,
                              color: transaction.categories?.color,
                            }}
                          >
                            {transaction.categories?.name || "Tanpa Kategori"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {transaction.description || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {transaction.type === "income"
                            ? formatCurrency(transaction.amount)
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          {transaction.type === "expense"
                            ? formatCurrency(transaction.amount)
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-600">
                          {formatCurrency(transaction.balance!)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredLedgerData.length}
            />
          </>
        )}
      </div>
    </div>
  );
}
