import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminConsumersPage from './pages/AdminConsumersPage';
import AdminBillsPage from './pages/AdminBillsPage';
import AdminTariffsPage from './pages/AdminTariffsPage';
import ConsumerDashboardPage from './pages/ConsumerDashboardPage';
import ConsumerBillsPage from './pages/ConsumerBillsPage';
import { Loader2, Zap } from 'lucide-react';

function App() {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20 mb-4 animate-pulse">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Initializing PowerGridHQ...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render view by role and view id
  const renderView = () => {
    if (isAdmin) {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboardPage onNavigate={(view) => setCurrentView(view)} />;
        case 'consumers':
          return (
            <AdminConsumersPage
              onSelectConsumerForBill={(consumer) => {
                setCurrentView('bills');
              }}
            />
          );
        case 'bills':
          return <AdminBillsPage />;
        case 'tariffs':
          return <AdminTariffsPage />;
        default:
          return <AdminDashboardPage onNavigate={(view) => setCurrentView(view)} />;
      }
    } else {
      switch (currentView) {
        case 'dashboard':
          return <ConsumerDashboardPage onNavigate={(view) => setCurrentView(view)} />;
        case 'bills':
          return <ConsumerBillsPage />;
        default:
          return <ConsumerDashboardPage onNavigate={(view) => setCurrentView(view)} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
