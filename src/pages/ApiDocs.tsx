import { useState } from 'react';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  module: string;
  roles: string[];
  requestBody?: string;
  responseBody?: string;
}

const endpoints: Endpoint[] = [
  { method: 'POST', path: '/api/v1/auth/login', description: 'Аутентификация пользователя', module: 'Ядро', roles: ['public'], requestBody: '{"username": "string", "password": "string"}', responseBody: '{"access_token": "jwt...", "user": {...}}' },
  { method: 'POST', path: '/api/v1/auth/logout', description: 'Завершение сессии', module: 'Ядро', roles: ['authenticated'] },
  { method: 'GET', path: '/api/v1/users', description: 'Список пользователей', module: 'Ядро', roles: ['admin'], responseBody: '{"users": [...], "total": 42}' },
  { method: 'POST', path: '/api/v1/users', description: 'Создание пользователя', module: 'Ядро', roles: ['admin'], requestBody: '{"username": "string", "full_name": "string", "role_ids": [...]}' },
  { method: 'GET', path: '/api/v1/modules', description: 'Список модулей', module: 'Ядро', roles: ['admin'], responseBody: '{"modules": [...]}' },
  { method: 'POST', path: '/api/v1/modules/{id}/enable', description: 'Включение модуля', module: 'Ядро', roles: ['admin'] },
  { method: 'POST', path: '/api/v1/modules/{id}/disable', description: 'Отключение модуля', module: 'Ядро', roles: ['admin'] },
  { method: 'GET', path: '/api/v1/routes', description: 'Список маршрутов', module: 'Ядро', roles: ['admin'], responseBody: '{"routes": [...]}' },
  { method: 'POST', path: '/api/v1/routes', description: 'Создание маршрута', module: 'Ядро', roles: ['admin'], requestBody: '{"method": "GET", "pattern": "/api/v1/...", "handler": "module::ctrl::action", ...}' },
  { method: 'PUT', path: '/api/v1/routes/{id}', description: 'Обновление маршрута', module: 'Ядро', roles: ['admin'] },
  { method: 'DELETE', path: '/api/v1/routes/{id}', description: 'Удаление маршрута', module: 'Ядро', roles: ['admin'] },
  { method: 'GET', path: '/api/v1/audit', description: 'Журнал аудита', module: 'Ядро', roles: ['admin', 'auditor'], responseBody: '{"entries": [...], "total": 156}' },
  { method: 'GET', path: '/api/v1/settings', description: 'Настройки системы', module: 'Ядро', roles: ['admin'] },
  { method: 'PUT', path: '/api/v1/settings', description: 'Обновление настроек', module: 'Ядро', roles: ['admin'] },
  { method: 'GET', path: '/api/v1/incidents', description: 'Список инцидентов', module: 'Инциденты', roles: ['admin', 'safety-engineer', 'manager'], responseBody: '{"incidents": [...], "total": 23}' },
  { method: 'POST', path: '/api/v1/incidents', description: 'Регистрация инцидента', module: 'Инциденты', roles: ['admin', 'safety-engineer'], requestBody: '{"type": "incident", "date": "...", "location": "...", "description": "...", "involved": [...]}' },
  { method: 'GET', path: '/api/v1/incidents/{id}', description: 'Детали инцидента', module: 'Инциденты', roles: ['admin', 'safety-engineer', 'manager'] },
  { method: 'POST', path: '/api/v1/incidents/{id}/investigate', description: 'Начать расследование', module: 'Инциденты', roles: ['admin', 'safety-engineer'] },
  { method: 'GET', path: '/api/v1/trainings', description: 'Список инструктажей', module: 'Инструктажи', roles: ['admin', 'safety-engineer', 'manager'] },
  { method: 'POST', path: '/api/v1/trainings/schedule', description: 'Планирование инструктажа', module: 'Инструктажи', roles: ['admin', 'safety-engineer'] },
  { method: 'GET', path: '/api/v1/ppe/stock', description: 'Остатки СИЗ на складе', module: 'СИЗ', roles: ['admin', 'safety-engineer'] },
  { method: 'POST', path: '/api/v1/ppe/issue', description: 'Выдача СИЗ работнику', module: 'СИЗ', roles: ['admin', 'safety-engineer'] },
  { method: 'GET', path: '/api/v1/med-exams/plan', description: 'План медосмотров', module: 'Медосмотры', roles: ['admin', 'safety-engineer', 'hr'] },
  { method: 'POST', path: '/api/v1/med-exams/schedule', description: 'Запись на медосмотр', module: 'Медосмотры', roles: ['admin', 'safety-engineer', 'hr'] },
];

export default function ApiDocs() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);
  const [filterModule, setFilterModule] = useState('all');

  const modules = ['all', ...new Set(endpoints.map(e => e.module))];
  const filtered = filterModule === 'all' ? endpoints : endpoints.filter(e => e.module === filterModule);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-amber-100 text-amber-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">REST API</h1>
        <p className="text-gray-500 mt-1">Документация API ядра и модулей — OpenAPI 3.0</p>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Base URL:</strong> <code className="bg-blue-100 px-1 rounded">https://ot.example.com/api/v1</code> | 
          <strong> Формат:</strong> JSON | 
          <strong> Авторизация:</strong> Bearer JWT | 
          <strong> OpenAPI:</strong> <code className="bg-blue-100 px-1 rounded">/api/v1/openapi.json</code>
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Модуль:</span>
          {modules.map(m => (
            <button
              key={m}
              onClick={() => setFilterModule(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterModule === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {m === 'all' ? 'Все' : m}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">{filtered.length} endpoints</span>
      </div>

      <div className="space-y-2">
        {filtered.map((ep, i) => (
          <div key={i} className="card !p-0 overflow-hidden">
            <button
              onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMethodColor(ep.method)}`}>{ep.method}</span>
              <code className="text-sm font-mono text-gray-800 flex-1">{ep.path}</code>
              <span className="text-xs text-gray-500 hidden sm:inline">{ep.module}</span>
              {expandedEndpoint === i ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            
            {expandedEndpoint === i && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                <p className="text-sm text-gray-700">{ep.description}</p>
                <div className="flex flex-wrap gap-1">
                  {ep.roles.map(r => (
                    <span key={r} className="badge badge-blue text-xs">{r}</span>
                  ))}
                </div>
                {ep.requestBody && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Request Body</p>
                    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{ep.requestBody}</pre>
                  </div>
                )}
                {ep.responseBody && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Response</p>
                    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{ep.responseBody}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Единый формат ошибок</h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`// Формат ответа при ошибке (RFC 7807)
{
  "type": "https://ot.example.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Invalid request body",
  "errors": [
    {"field": "pattern", "message": "Invalid URL pattern format"},
    {"field": "handler", "message": "Handler not found in module"}
  ],
  "trace_id": "abc-123-def"
}

// HTTP-статусы:
// 200 OK — успешный запрос
// 201 Created — ресурс создан
// 400 Bad Request — невалидные данные
// 401 Unauthorized — не аутентифицирован
// 403 Forbidden — нет прав
// 404 Not Found — ресурс не найден
// 409 Conflict — конфликт (дубликат)
// 422 Unprocessable — ошибка валидации
// 429 Too Many Requests — rate limit
// 500 Internal Error — внутренняя ошибка`}
          </pre>
        </div>
      </div>
    </div>
  );
}
