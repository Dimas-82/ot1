import { auditLog } from '../data/mockData';
import { Shield, Filter, Download } from 'lucide-react';
import { useState } from 'react';

export default function Audit() {
  const [filter, setFilter] = useState('');
  
  const filteredLog = auditLog.filter(entry => 
    entry.action.toLowerCase().includes(filter.toLowerCase()) ||
    entry.user.toLowerCase().includes(filter.toLowerCase()) ||
    entry.resource.toLowerCase().includes(filter.toLowerCase()) ||
    entry.details.toLowerCase().includes(filter.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'badge-green';
    if (action.includes('DELETED') || action.includes('DISABLED')) return 'badge-red';
    if (action.includes('UPDATED') || action.includes('ENABLED')) return 'badge-yellow';
    if (action.includes('VIEW') || action.includes('LOGIN')) return 'badge-blue';
    return 'badge-gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Журнал аудита</h1>
          <p className="text-gray-500 mt-1">Полный журнал всех действий в системе с привязкой к пользователю</p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
          <Download className="w-4 h-4" /> Экспорт
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Всего записей', value: '156', color: 'bg-blue-50 text-blue-700' },
          { label: 'Сегодня', value: '12', color: 'bg-green-50 text-green-700' },
          { label: 'Изменения маршрутов', value: '8', color: 'bg-amber-50 text-amber-700' },
          { label: 'Входы пользователей', value: '23', color: 'bg-purple-50 text-purple-700' },
        ].map(stat => (
          <div key={stat.label} className={`p-4 rounded-xl ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Фильтр по действию, пользователю, ресурсу..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Время</th>
              <th>Пользователь</th>
              <th>Действие</th>
              <th>Ресурс</th>
              <th>Детали</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLog.map(entry => (
              <tr key={entry.id}>
                <td className="text-xs text-gray-500 font-mono">{entry.timestamp}</td>
                <td className="font-medium">{entry.user}</td>
                <td><span className={`badge ${getActionColor(entry.action)}`}>{entry.action}</span></td>
                <td className="font-mono text-xs">{entry.resource}</td>
                <td className="text-xs text-gray-600 max-w-xs truncate">{entry.details}</td>
                <td className="text-xs text-gray-500 font-mono">{entry.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Политика аудита</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-green-500 mt-0.5" /><span>Все действия администратора логируются</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-green-500 mt-0.5" /><span>Изменения маршрутов и модулей</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-green-500 mt-0.5" /><span>Входы/выходы пользователей</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-green-500 mt-0.5" /><span>Неудачные попытки авторизации</span></li>
          </ul>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-blue-500 mt-0.5" /><span>Хранение: минимум 3 года</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-blue-500 mt-0.5" /><span>Неизменяемость записей (append-only)</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-blue-500 mt-0.5" /><span>IP-адрес и User-Agent фиксируются</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-blue-500 mt-0.5" /><span>Экспорт в CSV/JSON для отчётности</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
