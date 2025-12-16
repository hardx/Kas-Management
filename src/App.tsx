import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TransactionList } from './components/Transactions/TransactionList';
import { CategoryManager } from './components/Categories/CategoryManager';
import { DebtTracker } from './components/Debts/DebtTracker';
import { GeneralLedger } from './components/Ledger/GeneralLedger';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionList />;
      case 'categories':
        return <CategoryManager />;
      case 'debts':
        return <DebtTracker />;
      case 'ledger':
        return <GeneralLedger />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-64 p-8">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
