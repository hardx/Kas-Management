import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, Search } from "lucide-react";
import toast from "react-hot-toast";
import { categories as categoryApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { CategoryModal } from "./CategoryModal";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Shared/Pagination";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

export function CategoryManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      await categoryApi.delete(id);
      toast.success("Kategori berhasil dihapus");
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const incomeCategories = filteredCategories.filter(
    (c) => c.type === "income"
  );
  const expenseCategories = filteredCategories.filter(
    (c) => c.type === "expense"
  );

  // Pagination for Income
  const {
    currentPage: incomePage,
    setCurrentPage: setIncomePage,
    totalPages: incomeTotalPages,
    startIndex: incomeStartIndex,
    endIndex: incomeEndIndex,
    paginate: paginateIncome,
  } = usePagination(incomeCategories.length);

  // Pagination for Expense
  const {
    currentPage: expensePage,
    setCurrentPage: setExpensePage,
    totalPages: expenseTotalPages,
    startIndex: expenseStartIndex,
    endIndex: expenseEndIndex,
    paginate: paginateExpense,
  } = usePagination(expenseCategories.length);

  const displayedIncome = paginateIncome(incomeCategories);
  const displayedExpense = paginateExpense(expenseCategories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori</h1>
          <p className="text-gray-600 mt-1">
            Kelola kategori pemasukan dan pengeluaran
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Kategori Pemasukan
            </h2>
            <div className="space-y-3 flex-1">
              {displayedIncome.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Belum ada kategori
                </p>
              ) : (
                displayedIncome.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination
              currentPage={incomePage}
              totalPages={incomeTotalPages}
              onPageChange={setIncomePage}
              startIndex={incomeStartIndex}
              endIndex={incomeEndIndex}
              totalItems={incomeCategories.length}
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Kategori Pengeluaran
            </h2>
            <div className="space-y-3 flex-1">
              {displayedExpense.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Belum ada kategori
                </p>
              ) : (
                displayedExpense.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination
              currentPage={expensePage}
              totalPages={expenseTotalPages}
              onPageChange={setExpensePage}
              startIndex={expenseStartIndex}
              endIndex={expenseEndIndex}
              totalItems={expenseCategories.length}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <CategoryModal category={editingCategory} onClose={handleModalClose} />
      )}
    </div>
  );
}
