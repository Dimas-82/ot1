import { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { User, UserRole, Module, Route, Incident, Training, PPEIssuance, MedExam, AuditEntry, Notification } from './types';

// ============ LOGIN PAGE ============
function LoginPage() {
  const { store } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = store.login(username, password);
    if (!user) {
      setError('Неверный логин или пароль, либо пользователь заблокирован');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">АСУ «Охрана труда»</h1>
          <p className="text-blue-200 mt-2">Автоматизированная система управления</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Вход в систему</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Войти
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Демо-аккаунты:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-mono bg-gray-200 px-1 rounded">admin / admin123</span> — Администратор</p>
              <p><span className="font-mono bg-gray-200 px-1 rounded">safety / safety123</span> — Инженер по ОТ</p>
              <p><span className="font-mono bg-gray-200 px-1 rounded">manager / manager123</span> — Руководитель</p>
              <p><span className="font-mono bg-gray-200 px-1 rounded">worker / worker123</span> — Работник</p>
              <p><span className="font-mono bg-gray-200 px-1 rounded">auditor / audit123</span> — Аудитор</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ LAYOUT ============
function Layout({ children }: { children: React.ReactNode }) {
  const { data, store } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = data.currentUser;
  if (!user) return null;

  const unreadCount = data.notifications.filter(n => !n.read && (n.userId === null || n.userId === user.id)).length;

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: '📊', roles: ['admin', 'safety-engineer', 'manager', 'worker', 'auditor', 'hr'] },
    { id: 'incidents', label: 'Инциденты', icon: '⚠️', roles: ['admin', 'safety-engineer', 'manager'] },
    { id: 'trainings', label: 'Инструктажи', icon: '📋', roles: ['admin', 'safety-engineer', 'manager'] },
    { id: 'ppe', label: 'СИЗ', icon: '🦺', roles: ['admin', 'safety-engineer'] },
    { id: 'medexams', label: 'Медосмотры', icon: '🏥', roles: ['admin', 'safety-engineer', 'hr'] },
    { id: 'modules', label: 'Модули', icon: '🧩', roles: ['admin'] },
    { id: 'routes', label: 'Маршруты', icon: '🔀', roles: ['admin'] },
    { id: 'users', label: 'Пользователи', icon: '👥', roles: ['admin'] },
    { id: 'audit', label: 'Аудит', icon: '📝', roles: ['admin', 'auditor'] },
    { id: 'settings', label: 'Настройки', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">АСУ ОТ</h1>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-140px)]">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">{user.fullName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
            </div>
            <button onClick={() => store.logout()} className="p-1.5 rounded hover:bg-gray-200 text-gray-500" title="Выйти">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900 flex-1">
            {menuItems.find(m => m.id === currentPage)?.label || 'Дашборд'}
          </h2>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 relative"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Уведомления</h3>
                  <button onClick={() => store.markAllNotificationsRead()} className="text-xs text-blue-600 hover:underline">Прочитать все</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {data.notifications.slice(0, 10).map(n => (
                    <div key={n.id} onClick={() => store.markNotificationRead(n.id)} className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('ru-RU')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-6">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'incidents' && <IncidentsPage />}
          {currentPage === 'trainings' && <TrainingsPage />}
          {currentPage === 'ppe' && <PPEPage />}
          {currentPage === 'medexams' && <MedExamsPage />}
          {currentPage === 'modules' && <ModulesPage />}
          {currentPage === 'routes' && <RoutesPage />}
          {currentPage === 'users' && <UsersPage />}
          {currentPage === 'audit' && <AuditPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardPage() {
  const { data } = useStore();
  const user = data.currentUser!;

  const stats = [
    { label: 'Открытые инциденты', value: data.incidents.filter(i => i.status !== 'closed').length, icon: '⚠️', color: 'bg-red-100' },
    { label: 'Запланировано инструктажей', value: data.trainings.filter(t => t.status === 'scheduled').length, icon: '📋', color: 'bg-blue-100' },
    { label: 'Выдано СИЗ', value: data.ppeIssuances.length, icon: '🦺', color: 'bg-green-100' },
    { label: 'Медосмотры (просрочено)', value: data.medExams.filter(m => m.status === 'overdue').length, icon: '🏥', color: 'bg-purple-100' },
    { label: 'Активные модули', value: data.modules.filter(m => m.status === 'active').length, icon: '🧩', color: 'bg-indigo-100' },
    { label: 'Маршруты API', value: data.routes.filter(r => r.active).length, icon: '🔀', color: 'bg-cyan-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать, {user.fullName.split(' ')[1] || user.fullName}!</h1>
        <p className="text-gray-500 mt-1">Обзор состояния системы охраны труда</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние инциденты</h3>
          <div className="space-y-3">
            {data.incidents.slice(-3).reverse().map(inc => (
              <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  inc.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  inc.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>{inc.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{inc.number}</p>
                  <p className="text-xs text-gray-600 truncate">{inc.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{inc.date} • {inc.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ближайшие события</h3>
          <div className="space-y-3">
            {data.trainings.filter(t => t.status === 'scheduled').slice(0, 3).map(tr => (
              <div key={tr.id} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tr.title}</p>
                  <p className="text-xs text-gray-600">{tr.date} • {tr.instructor}</p>
                  <p className="text-xs text-gray-400">{tr.participants.length} участников</p>
                </div>
              </div>
            ))}
            {data.medExams.filter(m => m.status === 'scheduled' || m.status === 'overdue').slice(0, 2).map(me => (
              <div key={me.id} className={`flex items-start gap-3 p-3 rounded-lg ${me.status === 'overdue' ? 'bg-red-50' : 'bg-purple-50'}`}>
                <span className="text-2xl">🏥</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{me.workerName}</p>
                  <p className="text-xs text-gray-600">{me.scheduledDate} • {me.type === 'preliminary' ? 'Предварительный' : 'Периодический'}</p>
                  {me.status === 'overdue' && <p className="text-xs text-red-600 font-medium">Просрочен!</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ INCIDENTS PAGE ============
function IncidentsPage() {
  const { data, store } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'incident' as Incident['type'], date: '', time: '', location: '', department: '', description: '', involved: [] as string[], severity: 'medium' as Incident['severity'], investigator: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.createIncident({ ...formData, status: 'registered', involved: formData.involved.filter(Boolean) });
    setShowForm(false);
    setFormData({ type: 'incident', date: '', time: '', location: '', department: '', description: '', involved: [], severity: 'medium', investigator: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Инциденты</h1>
        {(data.currentUser?.role === 'admin' || data.currentUser?.role === 'safety-engineer') && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Регистрация инцидента</button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Регистрация нового инцидента</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as Incident['type']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="incident">Инцидент</option>
                <option value="accident">Несчастный случай</option>
                <option value="near_miss">Предпосылка (near-miss)</option>
                <option value="dangerous_condition">Опасное условие</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тяжесть</label>
              <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as Incident['severity']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="low">Низкая</option>
                <option value="medium">Средняя</option>
                <option value="high">Высокая</option>
                <option value="critical">Критическая</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
              <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Место</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} required />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Зарегистрировать</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Номер</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Место</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тяжесть</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.incidents.map(inc => (
              <tr key={inc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{inc.number}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{getTypeName(inc.type)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{inc.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{inc.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    inc.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    inc.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>{inc.severity}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    inc.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                    inc.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    inc.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{getStatusName(inc.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ TRAININGS PAGE ============
function TrainingsPage() {
  const { data, store } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'introductory' as Training['type'], title: '', date: '', instructor: '', participants: [] as string[], department: '', duration: 60, notes: '', status: 'scheduled' as Training['status'] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.createTraining({ ...formData, participants: formData.participants.filter(Boolean) });
    setShowForm(false);
    setFormData({ type: 'introductory', title: '', date: '', instructor: '', participants: [], department: '', duration: 60, notes: '', status: 'scheduled' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Инструктажи</h1>
        {(data.currentUser?.role === 'admin' || data.currentUser?.role === 'safety-engineer') && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Запланировать</button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Планирование инструктажа</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип инструктажа</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as Training['type']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="introductory">Вводный</option>
                <option value="primary">Первичный</option>
                <option value="repeat">Повторный</option>
                <option value="unscheduled">Внеплановый</option>
                <option value="targeted">Целевой</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тема</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Инструктор</label>
              <input type="text" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Длительность (мин)</label>
              <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Участники (через запятую)</label>
              <input type="text" value={formData.participants.join(', ')} onChange={e => setFormData({...formData, participants: e.target.value.split(',').map(s => s.trim())})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Запланировать</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тема</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Инструктор</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Участники</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.trainings.map(tr => (
              <tr key={tr.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{getTrainingType(tr.type)}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{tr.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tr.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tr.instructor}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tr.participants.length} чел.</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    tr.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    tr.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{tr.status === 'scheduled' ? 'Запланирован' : tr.status === 'completed' ? 'Проведён' : 'Отменён'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ PPE PAGE ============
function PPEPage() {
  const { data, store } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', workerId: 0, workerName: '', items: [{ name: '', quantity: 1, size: '' }], department: '', issuedBy: '', nextReplacement: '', notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.createPPEIssuance(formData);
    setShowForm(false);
    setFormData({ date: '', workerId: 0, workerName: '', items: [{ name: '', quantity: 1, size: '' }], department: '', issuedBy: '', nextReplacement: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Выдача СИЗ</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Выдать СИЗ</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Выдача средств индивидуальной защиты</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата выдачи</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Работник</label>
              <select value={formData.workerId} onChange={e => {
                const w = data.users.find(u => u.id === parseInt(e.target.value));
                setFormData({...formData, workerId: parseInt(e.target.value), workerName: w?.fullName || ''});
              }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value={0}>Выберите работника</option>
                {data.users.filter(u => u.role === 'worker' || u.role === 'manager').map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Выдал</label>
              <input type="text" value={formData.issuedBy} onChange={e => setFormData({...formData, issuedBy: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Следующая замена</label>
              <input type="date" value={formData.nextReplacement} onChange={e => setFormData({...formData, nextReplacement: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Предметы СИЗ</label>
              {formData.items.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" placeholder="Наименование" value={item.name} onChange={e => {
                    const items = [...formData.items]; items[i].name = e.target.value; setFormData({...formData, items});
                  }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                  <input type="number" placeholder="Кол-во" value={item.quantity} onChange={e => {
                    const items = [...formData.items]; items[i].quantity = parseInt(e.target.value); setFormData({...formData, items});
                  }} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" min={1} required />
                  <input type="text" placeholder="Размер" value={item.size} onChange={e => {
                    const items = [...formData.items]; items[i].size = e.target.value; setFormData({...formData, items});
                  }} className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
              ))}
              <button type="button" onClick={() => setFormData({...formData, items: [...formData.items, { name: '', quantity: 1, size: '' }]})} className="text-sm text-blue-600 hover:underline">+ Добавить предмет</button>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Выдать</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {data.ppeIssuances.map(issuance => (
          <div key={issuance.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">{issuance.workerName}</p>
                <p className="text-sm text-gray-500">{issuance.department} • {issuance.date}</p>
              </div>
              <span className="text-xs text-gray-400">Замена: {issuance.nextReplacement}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {issuance.items.map((item, i) => (
                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                  {item.name} × {item.quantity} ({item.size})
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Выдал: {issuance.issuedBy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MED EXAMS PAGE ============
function MedExamsPage() {
  const { data, store } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ workerId: 0, workerName: '', type: 'periodic' as MedExam['type'], scheduledDate: '', doctor: '', department: '', status: 'scheduled' as MedExam['status'], completedDate: null as string | null, result: null as MedExam['result'], notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.createMedExam(formData);
    setShowForm(false);
    setFormData({ workerId: 0, workerName: '', type: 'periodic', scheduledDate: '', doctor: '', department: '', status: 'scheduled', completedDate: null, result: null, notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Медицинские осмотры</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Запланировать</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Планирование медосмотра</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Работник</label>
              <select value={formData.workerId} onChange={e => {
                const w = data.users.find(u => u.id === parseInt(e.target.value));
                setFormData({...formData, workerId: parseInt(e.target.value), workerName: w?.fullName || ''});
              }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value={0}>Выберите работника</option>
                {data.users.filter(u => u.role === 'worker' || u.role === 'manager').map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип осмотра</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as MedExam['type']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="preliminary">Предварительный</option>
                <option value="periodic">Периодический</option>
                <option value="pre-shift">Предсменный</option>
                <option value="extra">Внеочередной</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Врач</label>
              <input type="text" value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Запланировать</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Работник</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Врач</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Результат</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.medExams.map(me => (
              <tr key={me.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{me.workerName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{me.type === 'preliminary' ? 'Предварит.' : me.type === 'periodic' ? 'Периодич.' : me.type === 'pre-shift' ? 'Предсм.' : 'Внеоч.'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{me.scheduledDate}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{me.doctor || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{me.result === 'fit' ? 'Годен' : me.result === 'unfit' ? 'Не годен' : me.result === 'restrictions' ? 'Ограничения' : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    me.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    me.status === 'completed' ? 'bg-green-100 text-green-800' :
                    me.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{me.status === 'scheduled' ? 'Запланирован' : me.status === 'completed' ? 'Пройден' : me.status === 'overdue' ? 'Просрочен' : 'Отменён'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ MODULES PAGE ============
function ModulesPage() {
  const { data, store } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Реестр модулей</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Модульная архитектура:</strong> Каждый модуль — отдельный пакет с манифестом <code className="bg-blue-100 px-1 rounded">module.json</code>. 
          Включение/отключение через этот интерфейс без изменения кода ядра. Все изменения записываются в журнал аудита.
        </p>
      </div>

      <div className="space-y-3">
        {data.modules.map(module => (
          <div key={module.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${module.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>🧩</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <span className="text-xs text-gray-400">v{module.version}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${module.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {module.status === 'active' ? '● Активен' : '○ Выключен'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
                </div>
              </div>
              <button
                onClick={() => store.toggleModule(module.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${module.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {module.status === 'active' ? 'Отключить' : 'Включить'}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {module.permissions.map(p => (
                <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ ROUTES PAGE ============
function RoutesPage() {
  const { data, store } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ method: 'GET' as Route['method'], pattern: '', handler: '', moduleId: '', requiredRoles: [] as UserRole[], active: true, priority: 10 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      store.updateRoute(editingId, formData);
    } else {
      store.createRoute(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ method: 'GET', pattern: '', handler: '', moduleId: '', requiredRoles: [], active: true, priority: 10 });
  };

  const handleEdit = (route: Route) => {
    setFormData({ method: route.method, pattern: route.pattern, handler: route.handler, moduleId: route.moduleId, requiredRoles: route.requiredRoles, active: route.active, priority: route.priority });
    setEditingId(route.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Route Manager</h1>
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ method: 'GET', pattern: '', handler: '', moduleId: '', requiredRoles: [], active: true, priority: 10 }); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Добавить маршрут</button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Динамическая маршрутизация:</strong> Маршруты хранятся в БД. При изменении — hot-reload без рестарта. 
          Все изменения записываются в журнал аудита.
        </p>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold mb-4">{editingId ? 'Редактировать маршрут' : 'Новый маршрут'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTTP метод</label>
              <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value as Route['method']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL-шаблон</label>
              <input type="text" value={formData.pattern} onChange={e => setFormData({...formData, pattern: e.target.value})} placeholder="/api/v1/incidents/{id}" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Обработчик</label>
              <input type="text" value={formData.handler} onChange={e => setFormData({...formData, handler: e.target.value})} placeholder="module::Controller::action" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Модуль</label>
              <select value={formData.moduleId} onChange={e => setFormData({...formData, moduleId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="">Выберите модуль</option>
                <option value="core">Ядро</option>
                {data.modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded" />
                <span className="text-sm text-gray-700">Активен</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Роли (через запятую)</label>
              <input type="text" value={formData.requiredRoles.join(', ')} onChange={e => setFormData({...formData, requiredRoles: e.target.value.split(',').map(s => s.trim()) as UserRole[]})} placeholder="admin, safety-engineer" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editingId ? 'Сохранить' : 'Создать'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Метод</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Обработчик</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Модуль</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.routes.map(route => (
              <tr key={route.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    route.method === 'GET' ? 'bg-green-100 text-green-800' :
                    route.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    route.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                    route.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{route.method}</span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-700">{route.pattern}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{route.handler}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{data.modules.find(m => m.id === route.moduleId)?.name || route.moduleId}</td>
                <td className="px-4 py-3">
                  <button onClick={() => store.updateRoute(route.id, { active: !route.active })}>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium cursor-pointer ${route.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {route.active ? '● Активен' : '○ Выключен'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(route)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 text-xs">✏️</button>
                    <button onClick={() => store.deleteRoute(route.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600 text-xs">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ USERS PAGE ============
function UsersPage() {
  const { data, store } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '', role: 'worker' as UserRole, department: '', active: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.createUser(formData);
    setShowForm(false);
    setFormData({ username: '', password: '', fullName: '', email: '', role: 'worker', department: '', active: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Добавить</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Новый пользователь</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
              <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="admin">Администратор</option>
                <option value="safety-engineer">Инженер по ОТ</option>
                <option value="manager">Руководитель</option>
                <option value="worker">Работник</option>
                <option value="auditor">Аудитор</option>
                <option value="hr">HR-менеджер</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Создать</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Подразделение</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Последний вход</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">{getRoleName(user.role)}</span></td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                <td className="px-4 py-3">
                  <button onClick={() => store.updateUser(user.id, { active: !user.active })}>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium cursor-pointer ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {user.active ? '● Активен' : '○ Заблокирован'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('ru-RU') : '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => store.updateUser(user.id, { active: !user.active })} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 text-xs">
                    {user.active ? '🔒' : '🔓'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ AUDIT PAGE ============
function AuditPage() {
  const { data } = useStore();
  const [filter, setFilter] = useState('');

  const filtered = data.auditLog.filter(entry =>
    entry.action.toLowerCase().includes(filter.toLowerCase()) ||
    entry.username.toLowerCase().includes(filter.toLowerCase()) ||
    entry.resource.toLowerCase().includes(filter.toLowerCase()) ||
    entry.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Журнал аудита</h1>
        <p className="text-gray-500 mt-1">Все действия в системе с привязкой к пользователю</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{data.auditLog.length}</p>
          <p className="text-sm text-blue-600">Всего записей</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{data.auditLog.filter(e => e.action.includes('CREATED')).length}</p>
          <p className="text-sm text-green-600">Создано</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-700">{data.auditLog.filter(e => e.action.includes('UPDATED') || e.action.includes('CHANGED')).length}</p>
          <p className="text-sm text-amber-600">Изменено</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-700">{data.auditLog.filter(e => e.action.includes('LOGIN') || e.action.includes('LOGOUT')).length}</p>
          <p className="text-sm text-purple-600">Входы/выходы</p>
        </div>
      </div>

      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Фильтр по действию, пользователю, ресурсу..."
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">📝</p>
            <p>Записи аудита появятся после выполнения действий в системе</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действие</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ресурс</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Детали</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.slice(0, 50).map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{new Date(entry.timestamp).toLocaleString('ru-RU')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.username}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      entry.action.includes('CREATED') ? 'bg-green-100 text-green-800' :
                      entry.action.includes('DELETED') ? 'bg-red-100 text-red-800' :
                      entry.action.includes('UPDATED') || entry.action.includes('CHANGED') ? 'bg-amber-100 text-amber-800' :
                      entry.action.includes('LOGIN') || entry.action.includes('LOGOUT') ? 'bg-blue-100 text-blue-800' :
                      entry.action.includes('ENABLED') ? 'bg-green-100 text-green-800' :
                      entry.action.includes('DISABLED') ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{entry.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{entry.resource}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{entry.details}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{entry.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============ SETTINGS PAGE ============
function SettingsPage() {
  const { data, store } = useStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const categories = [...new Set(data.settings.map(s => s.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
        <p className="text-gray-500 mt-1">Конфигурация ядра и модулей</p>
      </div>

      {categories.map(cat => (
        <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{cat}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.settings.filter(s => s.category === cat).map(setting => (
              <div key={setting.key} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{setting.description}</p>
                  <p className="text-xs text-gray-500 font-mono">{setting.key}</p>
                </div>
                {editingKey === setting.key ? (
                  <div className="flex items-center gap-2">
                    <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-48" />
                    <button onClick={() => { store.updateSetting(setting.key, editValue); setEditingKey(null); }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">OK</button>
                    <button onClick={() => setEditingKey(null)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">{setting.value}</span>
                    <button onClick={() => { setEditingKey(setting.key); setEditValue(setting.value); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-xs">✏️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Управление данными</h3>
        <div className="flex gap-3">
          <button onClick={() => { if (confirm('Сбросить все данные к начальным?')) store.reset(); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-200">
            Сбросить все данные
          </button>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'asu_ot_backup.json'; a.click();
          }} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 border border-blue-200">
            Экспорт данных (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ HELPERS ============
function getRoleName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    'admin': 'Администратор',
    'safety-engineer': 'Инженер по ОТ',
    'manager': 'Руководитель',
    'worker': 'Работник',
    'auditor': 'Аудитор',
    'hr': 'HR-менеджер',
  };
  return names[role] || role;
}

function getTypeName(type: Incident['type']): string {
  const names: Record<Incident['type'], string> = {
    'incident': 'Инцидент',
    'accident': 'Несчастный случай',
    'near_miss': 'Предпосылка',
    'dangerous_condition': 'Опасное условие',
  };
  return names[type] || type;
}

function getStatusName(status: Incident['status']): string {
  const names: Record<Incident['status'], string> = {
    'registered': 'Зарегистрирован',
    'investigating': 'Расследование',
    'completed': 'Завершён',
    'closed': 'Закрыт',
  };
  return names[status] || status;
}

function getTrainingType(type: Training['type']): string {
  const names: Record<Training['type'], string> = {
    'introductory': 'Вводный',
    'primary': 'Первичный',
    'repeat': 'Повторный',
    'unscheduled': 'Внеплановый',
    'targeted': 'Целевой',
  };
  return names[type] || type;
}

// ============ MAIN APP ============
export default function App() {
  const { data } = useStore();

  if (!data.currentUser) {
    return <LoginPage />;
  }

  return <Layout><DashboardPage /></Layout>;
}
