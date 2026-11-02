import { useState } from 'react';
import { modules } from '../data/mockData';
import { Puzzle, Power, PowerOff, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function Modules() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleList, setModuleList] = useState(modules);

  const toggleModule = (id: string) => {
    setModuleList(prev => prev.map(m => 
      m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' as const : 'active' as const } : m
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Реестр модулей</h1>
          <p className="text-gray-500 mt-1">Управление модулями системы — установка, активация, отключение</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Puzzle className="w-4 h-4" />
          Установить модуль
        </button>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Модульная архитектура</p>
            <p className="text-sm text-blue-700 mt-1">
              Каждый модуль — отдельный пакет в <code className="bg-blue-100 px-1 rounded">rcs_ot/modules/</code> с манифестом <code className="bg-blue-100 px-1 rounded">module.json</code> и реализацией контракта <code className="bg-blue-100 px-1 rounded">IModule</code>. 
              Подключение/отключение происходит через этот интерфейс без изменения кода ядра.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {moduleList.map((module) => (
          <div key={module.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Puzzle className={`w-5 h-5 ${module.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <span className="text-xs text-gray-400">v{module.version}</span>
                    <span className={`badge ${module.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {module.status === 'active' ? 'Активен' : 'Выключен'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`p-2 rounded-lg transition-colors ${module.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  title={module.status === 'active' ? 'Отключить' : 'Включить'}
                >
                  {module.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  {expandedModule === module.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedModule === module.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Информация</p>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">ID:</dt><dd className="font-mono text-gray-700">{module.id}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Версия:</dt><dd className="text-gray-700">{module.version}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Автор:</dt><dd className="text-gray-700">{module.author}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Маршрутов:</dt><dd className="text-gray-700">{module.routes}</dd></div>
                  </dl>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Права доступа</p>
                  <div className="flex flex-wrap gap-2">
                    {module.permissions.map(p => (
                      <span key={p} className="badge badge-blue font-mono text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Контракт IModule</h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`class IModule(Protocol):
    """Контракт модуля АСУ ОТ"""
    
    def register(self, container: DIContainer) -> None:
        """Регистрация сервисов в DI-контейнере"""
        
    def boot(self) -> None:
        """Инициализация при запуске"""
        
    def routes(self) -> list[RouteDefinition]:
        """Возвращает список маршрутов модуля"""
        
    def menu(self) -> list[MenuItem]:
        """Пункты меню для UI"""
        
    def permissions(self) -> list[Permission]:
        """Права доступа модуля"""
        
    def migrations(self) -> list[Migration]:
        """Миграции БД модуля"""
        
    def shutdown(self) -> None:
        """Корректное завершение работы"""`}
          </pre>
        </div>
      </div>
    </div>
  );
}
