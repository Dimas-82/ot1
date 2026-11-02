import { useState } from 'react';
import { routes as initialRoutes } from '../data/mockData';
import { Route as RouteIcon, Plus, Edit2, Trash2, RefreshCw, Search, X } from 'lucide-react';

interface RouteFormData {
  method: string;
  pattern: string;
  handler: string;
  module: string;
  roles: string[];
  active: boolean;
  priority: number;
}

export default function RouteManager() {
  const [routeList, setRouteList] = useState(initialRoutes);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingRoute, setEditingRoute] = useState<number | null>(null);
  const [formData, setFormData] = useState<RouteFormData>({
    method: 'GET', pattern: '', handler: '', module: '', roles: [], active: true, priority: 10
  });

  const filteredRoutes = routeList.filter(r => 
    r.pattern.toLowerCase().includes(search.toLowerCase()) ||
    r.handler.toLowerCase().includes(search.toLowerCase()) ||
    r.module.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoute !== null) {
      setRouteList(prev => prev.map(r => r.id === editingRoute ? { ...r, ...formData, lastModified: new Date().toISOString().split('T')[0] } : r));
    } else {
      const newRoute = { id: Math.max(...routeList.map(r => r.id)) + 1, ...formData, lastModified: new Date().toISOString().split('T')[0] };
      setRouteList(prev => [...prev, newRoute]);
    }
    setShowForm(false);
    setEditingRoute(null);
    setFormData({ method: 'GET', pattern: '', handler: '', module: '', roles: [], active: true, priority: 10 });
  };

  const handleEdit = (id: number) => {
    const route = routeList.find(r => r.id === id);
    if (route) {
      setFormData({ method: route.method, pattern: route.pattern, handler: route.handler, module: route.module, roles: route.roles, active: route.active, priority: route.priority });
      setEditingRoute(id);
      setShowForm(true);
    }
  };

  const handleDelete = (id: number) => {
    setRouteList(prev => prev.filter(r => r.id !== id));
  };

  const toggleActive = (id: number) => {
    setRouteList(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Manager</h1>
          <p className="text-gray-500 mt-1">Динамическая маршрутизация — CRUD маршрутов с hot-reload</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Hot Reload
          </button>
          <button 
            onClick={() => { setShowForm(true); setEditingRoute(null); setFormData({ method: 'GET', pattern: '', handler: '', module: '', roles: [], active: true, priority: 10 }); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Добавить маршрут
          </button>
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Принцип:</strong> Маршруты хранятся в БД (таблица <code className="bg-amber-100 px-1 rounded">routes</code>). 
          Администратор создаёт/изменяет маршруты через этот интерфейс. При сохранении — hot-reload без рестарта процесса. 
          Все изменения записываются в журнал аудита.
        </p>
      </div>

      {showForm && (
        <div className="card border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editingRoute ? 'Редактировать маршрут' : 'Новый маршрут'}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-200"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTTP метод</label>
              <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL-шаблон</label>
              <input type="text" value={formData.pattern} onChange={e => setFormData({...formData, pattern: e.target.value})} placeholder="/api/v1/incidents/{id}" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Обработчик (module::controller::action)</label>
              <input type="text" value={formData.handler} onChange={e => setFormData({...formData, handler: e.target.value})} placeholder="safety-incidents::IncidentController::get" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Модуль</label>
              <input type="text" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})} placeholder="Инциденты" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Активен</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                {editingRoute ? 'Сохранить' : 'Создать маршрут'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по маршруту, обработчику, модулю..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Метод</th>
              <th>URL-шаблон</th>
              <th>Обработчик</th>
              <th>Модуль</th>
              <th>Статус</th>
              <th>Приоритет</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map(route => (
              <tr key={route.id}>
                <td>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    route.method === 'GET' ? 'bg-green-100 text-green-800' :
                    route.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    route.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                    route.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{route.method}</span>
                </td>
                <td className="font-mono text-xs">{route.pattern}</td>
                <td className="font-mono text-xs text-gray-500">{route.handler}</td>
                <td>{route.module}</td>
                <td>
                  <button onClick={() => toggleActive(route.id)}>
                    <span className={`badge ${route.active ? 'badge-green' : 'badge-gray'} cursor-pointer`}>
                      {route.active ? '● Активен' : '○ Выключен'}
                    </span>
                  </button>
                </td>
                <td>{route.priority}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(route.id)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(route.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">Показано {filteredRoutes.length} из {routeList.length} маршрутов</p>
    </div>
  );
}
