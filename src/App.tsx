import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  PlusCircle, 
  Package, 
  TrendingUp, 
  History,
  Beef,
  Menu,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/sections/Login';
import Signup from '@/sections/Signup';
import CostEntry from '@/sections/CostEntry';
import StockTracker from '@/sections/StockTracker';
import PnLDashboard from '@/sections/PnLDashboard';
import ExpenseHistory from '@/sections/ExpenseHistory';
import { useToast } from '@/hooks/use-toast';

type Tab = 'entry' | 'stock' | 'pnl' | 'history';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('entry');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'entry', label: 'Add Cost', icon: PlusCircle },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'pnl', label: 'P&L', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'entry':
        return <CostEntry />;
      case 'stock':
        return <StockTracker />;
      case 'pnl':
        return <PnLDashboard />;
      case 'history':
        return <ExpenseHistory />;
      default:
        return <CostEntry />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-700 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Beef className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Meataholic</h1>
              <p className="text-xs text-red-200">Cost Tracker</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`gap-2 ${activeTab === tab.id ? 'bg-white text-red-700' : 'text-white hover:bg-red-600'}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
            <div className="w-px h-6 bg-red-500 mx-2" />
            <div className="flex items-center gap-2 text-sm text-red-100">
              <User className="h-4 w-4" />
              <span className="max-w-[100px] truncate">
                {currentUser?.displayName || currentUser?.email?.split('@')[0]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-red-600 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-red-600">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-red-700 border-red-600 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-red-600">
                  <div className="flex items-center gap-2">
                    <Beef className="h-6 w-6 text-white" />
                    <span className="text-white font-bold">Menu</span>
                  </div>
                </div>
                
                {/* User Info */}
                <div className="p-4 border-b border-red-600">
                  <div className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5" />
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-red-200 truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="flex flex-col p-2 gap-1 flex-1">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`justify-start gap-3 text-white hover:bg-red-600 ${
                        activeTab === tab.id ? 'bg-red-800' : ''
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </Button>
                  ))}
                </nav>

                {/* Logout Button */}
                <div className="p-2 border-t border-red-600">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-white hover:bg-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 sticky bottom-0 z-50">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'text-red-700 bg-red-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
