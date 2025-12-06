import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary, NavItem } from './types';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import BusinessReport from './components/BusinessReport';
import { LayoutDashboard, PlusCircle, FileBarChart, Store } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-entry' | 'report'>('dashboard');

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('shopflow_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('shopflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Derived State: Financial Summary
  const summary: FinancialSummary = useMemo(() => {
    const s = {
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      totalIncome: 0,
      netProfit: 0,
      balance: 0,
    };

    transactions.forEach((t) => {
      if (t.type === TransactionType.SALE) s.totalSales += t.amount;
      else if (t.type === TransactionType.PURCHASE) s.totalPurchases += t.amount;
      else if (t.type === TransactionType.EXPENSE) s.totalExpenses += t.amount;
      else if (t.type === TransactionType.INCOME) s.totalIncome += t.amount;
    });

    s.netProfit = (s.totalSales + s.totalIncome) - (s.totalPurchases + s.totalExpenses);
    // Balance is same as net profit for simple cash basis, but conceptually can include initial capital.
    // We'll treat it as simple cash flow for this app.
    s.balance = s.netProfit; 

    return s;
  }, [transactions]);

  // Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setTransactions((prev) => [transaction, ...prev]);
    setCurrentView('dashboard');
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Navigation Items
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'new-entry', label: 'New Entry', icon: <PlusCircle size={20} /> },
    { id: 'report', label: 'Final Report', icon: <FileBarChart size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Store size={24} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
                ShopFlow
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentView === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-slate-500 mt-1">Overview of your shop's performance</p>
              </div>
              <button 
                onClick={() => setCurrentView('new-entry')}
                className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm items-center gap-2"
              >
                <PlusCircle size={18} />
                Add Transaction
              </button>
            </div>
            
            <SummaryCards summary={summary} />
            <TransactionHistory transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
        )}

        {currentView === 'new-entry' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">New Transaction</h2>
                <p className="text-slate-500 mt-1">Record a sale, purchase, expense, or income.</p>
              </div>
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              onCancel={() => setCurrentView('dashboard')} 
            />
          </div>
        )}

        {currentView === 'report' && (
          <div className="animate-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Final Report</h2>
                <p className="text-slate-500 mt-1">Detailed breakdown and AI-powered insights.</p>
            </div>
            <BusinessReport transactions={transactions} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl w-full transition-colors ${
                currentView === item.id
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;