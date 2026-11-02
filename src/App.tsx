import { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Puzzle, Route as RouteIcon, Users, Shield, FileText, 
  Database, Server, BookOpen, Menu, X, ChevronRight, Activity
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Architecture from './pages/Architecture';
import Modules from './pages/Modules';
import RouteManager from './pages/RouteManager';
import UsersPage from './pages/UsersPage';
import Audit from './pages/Audit';
import DatabaseSchema from './pages/DatabaseSchema';
import Deployment from './pages/Deployment';
import CodeExamples from './pages/CodeExamples';
import ApiDocs from './pages/ApiDocs';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Архитектура', href: '/architecture', icon: BookOpen },
  { name: 'Модули', href: '/modules', icon: Puzzle },
  { name: 'Маршруты', href: '/routes', icon: RouteIcon },
  { name: 'Пользователи', href: '/users', icon: Users },
  { name: 'Аудит', href: '/audit', icon: Shield },
  { name: 'Схема БД', href: '/database', icon: Database },
  { name: 'API', href: '/api', icon: FileText },
  { name: 'Примеры кода', href: '/code', icon: Activity },
  { name: 'Деплой', href: '/deploy', icon: Server },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">АСУ ОТ</h1>
            <p className="text-xs text-gray-500">Охрана труда v1.0</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="px-4 py-4 space-y-1 overflow-y-auto h-[calc(100%-140px)]">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'active' : 'text-gray-600 hover:text-blue-700'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">А</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Администратор</p>
              <p className="text-xs text-gray-500">admin@rcs-ot.local</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="lg:ml-72">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Автоматизированная система управления «Охрана труда»
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-green">● Система активна</span>
            </div>
          </header>
          
          <main className="p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/routes" element={<RouteManager />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/database" element={<DatabaseSchema />} />
              <Route path="/api" element={<ApiDocs />} />
              <Route path="/code" element={<CodeExamples />} />
              <Route path="/deploy" element={<Deployment />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
