import { dbSchema } from '../data/mockData';
import { Database, Table } from 'lucide-react';

export default function DatabaseSchema() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Схема базы данных</h1>
        <p className="text-gray-500 mt-1">Таблицы ядра АСУ ОТ — PostgreSQL / SQLite</p>
      </div>

      <div className="card bg-green-50 border-green-200">
        <p className="text-sm text-green-800">
          <strong>Миграции:</strong> Alembic для ядра + отдельные миграции модулей в <code className="bg-green-100 px-1 rounded">modules/*/migrations/</code>. 
          Все данные хранятся в <code className="bg-green-100 px-1 rounded">rcs_ot/data/rcs_ot.db</code> (SQLite для MVP) или PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dbSchema.tables.map(table => (
          <div key={table.name} className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Table className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 font-mono">{table.name}</h3>
            </div>
            <div className="space-y-1">
              {table.columns.map((col, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                    col.includes('PK') ? 'bg-yellow-100 text-yellow-800' :
                    col.includes('FK') ? 'bg-blue-100 text-blue-800' :
                    col.includes('PRIMARY') ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>{col}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Связи между таблицами</h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`-- Связи ядра
users ──< user_roles >── roles
roles ──< role_permissions >── permissions
modules ──< routes (module_id)
routes ──< route_permissions >── roles
users ──< audit_log (user_id)
users ── departments (department_id)
departments ── departments (parent_id, self-ref)

-- Миграции модулей (создаются модулями)
-- incidents, trainings, ppe_issuances, 
-- med_exams, sout_workplaces, knowledge_tests, etc.`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ключевые индексы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { table: 'routes', index: 'idx_routes_pattern', desc: 'B-tree по pattern для быстрого поиска маршрутов' },
            { table: 'routes', index: 'idx_routes_module_active', desc: 'Composite по module_id + active' },
            { table: 'audit_log', index: 'idx_audit_timestamp', desc: 'B-tree по timestamp для фильтрации по времени' },
            { table: 'audit_log', index: 'idx_audit_user_action', desc: 'Composite по user_id + action' },
            { table: 'users', index: 'idx_users_username', desc: 'Unique по username' },
            { table: 'settings', index: 'idx_settings_key', desc: 'Unique по key' },
          ].map((idx, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="font-mono text-xs text-blue-700">{idx.index}</p>
              <p className="text-sm text-gray-600 mt-1">{idx.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
