import { useState } from 'react';
import { users, roles } from '../data/mockData';
import { UserPlus, Shield, Edit2 } from 'lucide-react';

export default function UsersPage() {
  const [userList] = useState(users);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи и роли</h1>
          <p className="text-gray-500 mt-1">Управление учётными записями и RBAC-политиками</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Добавить пользователя
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Пользователи ({userList.length})
        </button>
        <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Роли и права ({roles.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Подразделение</th>
                <th>Статус</th>
                <th>Последний вход</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(user => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{user.role}</span></td>
                  <td>{user.department}</td>
                  <td><span className={`badge ${user.active ? 'badge-green' : 'badge-gray'}`}>{user.active ? 'Активен' : 'Заблокирован'}</span></td>
                  <td className="text-gray-500">{user.lastLogin}</td>
                  <td>
                    <button className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-3">
          {roles.map(role => (
            <div key={role.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{role.users} польз.</p>
                  <p className="text-xs text-gray-400 font-mono">{role.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Модель RBAC</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Иерархия ролей</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Администратор</strong> — полный доступ</li>
              <li>• <strong>Инженер по ОТ</strong> — управление модулями ОТ</li>
              <li>• <strong>Руководитель</strong> — данные подразделения</li>
              <li>• <strong>HR</strong> — кадры, медосмотры</li>
              <li>• <strong>Аудитор</strong> — только чтение</li>
              <li>• <strong>Работник</strong> — свои данные</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Политики доступа</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Маршрут → набор ролей (many-to-many)</li>
              <li>• Модуль → набор permissions</li>
              <li>• Роль → набор permissions</li>
              <li>• Проверка: user.roles ∩ route.roles ≠ ∅</li>
              <li>• Аудит каждого обращения</li>
              <li>• Rate limiting per user/role</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
