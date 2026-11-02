import { useEffect, useRef } from 'react';

const mermaidDiagram = `graph TB
    subgraph "Веб-интерфейс (Jinja2 + HTMX + Alpine.js)"
        UI_DASH["Дашборд"]
        UI_ADMIN["Админ-панель"]
        UI_MODULES["Управление модулями"]
        UI_ROUTES["Route Manager"]
        UI_USERS["Пользователи / Роли"]
        UI_AUDIT["Журнал аудита"]
    end

    subgraph "Ядро АСУ ОТ (FastAPI)"
        MW["Middleware Chain"]
        AUTH["Auth / RBAC"]
        DI["DI Container"]
        EB["Event Bus"]
        ML["Module Loader"]
        RR["Route Resolver"]
        CACHE["Cache Layer"]
        SCHED["Scheduler"]
        NOTIFY["Notification Service"]
        FS["File Storage"]
    end

    subgraph "Модули предметной области"
        M_INC["Инциденты"]
        M_TRN["Инструктажи"]
        M_PPE["СИЗ"]
        M_MED["Медосмотры"]
        M_SOUT["СОУТ"]
        M_KC["Проверка знаний"]
        M_DOC["Документооборот"]
    end

    subgraph "Инфраструктура"
        DB[("PostgreSQL / SQLite")]
        REDIS[("Redis / In-Memory")]
        FILES["rcs_ot/uploads/"]
        LOGS["rcs_ot/logs/"]
    end

    UI_DASH --> MW
    UI_ADMIN --> MW
    UI_MODULES --> MW
    UI_ROUTES --> MW
    UI_USERS --> MW
    UI_AUDIT --> MW

    MW --> AUTH
    AUTH --> DI
    DI --> ML
    DI --> RR
    DI --> EB
    DI --> CACHE
    DI --> SCHED
    DI --> NOTIFY
    DI --> FS

    ML --> M_INC
    ML --> M_TRN
    ML --> M_PPE
    ML --> M_MED
    ML --> M_SOUT
    ML --> M_KC
    ML --> M_DOC

    RR --> DB
    EB --> DB
    ML --> DB
    CACHE --> REDIS
    FS --> FILES
    SCHED --> LOGS
    NOTIFY --> LOGS

    style MW fill:#3b82f6,color:#fff
    style AUTH fill:#1e40af,color:#fff
    style DI fill:#059669,color:#fff
    style EB fill:#7c3aed,color:#fff
    style ML fill:#d97706,color:#fff
    style RR fill:#dc2626,color:#fff
    style DB fill:#1e293b,color:#fff
    style REDIS fill:#dc2626,color:#fff`;

export default function Architecture() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (containerRef.current) {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'default',
          flowchart: { useMaxWidth: true, htmlLabels: true },
          securityLevel: 'loose'
        });
        containerRef.current.innerHTML = '';
        const { svg } = await mermaid.render('arch-diagram', mermaidDiagram);
        containerRef.current.innerHTML = svg;
      }
    };
    renderMermaid();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Архитектура системы</h1>
        <p className="text-gray-500 mt-1">Модульная архитектура АСУ «Охрана труда» с динамической маршрутизацией</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Диаграмма компонентов</h3>
        <div ref={containerRef} className="overflow-x-auto flex justify-center" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Слои архитектуры</h3>
          <div className="space-y-3">
            {[
              { layer: 'Presentation', desc: 'Jinja2-шаблоны + HTMX + Alpine.js. Серверный рендеринг, минимум JS.', color: 'border-blue-500 bg-blue-50' },
              { layer: 'Application', desc: 'FastAPI роутеры, middleware-цепочка, валидация Pydantic.', color: 'border-green-500 bg-green-50' },
              { layer: 'Domain', desc: 'Бизнес-логика модулей, сущности, value objects, domain events.', color: 'border-purple-500 bg-purple-50' },
              { layer: 'Infrastructure', desc: 'SQLAlchemy, Redis, файловое хранилище, SMTP, внешние API.', color: 'border-amber-500 bg-amber-50' },
            ].map((s) => (
              <div key={s.layer} className={`p-4 rounded-lg border-l-4 ${s.color}`}>
                <h4 className="font-semibold text-gray-900">{s.layer}</h4>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ключевые решения</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Модульность:</strong> Каждый модуль — отдельный пакет с module.json и контрактом IModule</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Динамическая маршрутизация:</strong> Маршруты в БД, hot-reload без рестарта</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Event Bus:</strong> Слабосвязанное взаимодействие модулей через события</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>DI-контейнер:</strong> Нет глобальных синглтонов, всё через инъекции</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Без Node.js на сервере:</strong> Jinja2 + HTMX, статика предсобрана</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Всё в rcs_ot/:</strong> БД, логи, загрузки — только внутри корня проекта</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>RBAC + Аудит:</strong> Полный контроль доступа и журнал действий</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Middleware-цепочка</h3>
        <div className="flex flex-wrap items-center gap-2">
          {['Request', '→', 'CORS', '→', 'Rate Limit', '→', 'Auth', '→', 'RBAC', '→', 'Validation', '→', 'Audit', '→', 'Route Resolver', '→', 'Handler'].map((item, i) => (
            <span key={i} className={item === '→' ? 'text-gray-400 text-lg' : 'px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200'}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Точки расширения</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">🔌 Event Bus</h4>
            <p className="text-sm text-gray-600">user.login, incident.created, training.completed, ppe.issued, medexam.scheduled</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">🧩 UI-слоты</h4>
            <p className="text-sm text-gray-600">Меню, виджеты дашборда, вкладки профилей, кнопки действий</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">💉 DI-контейнер</h4>
            <p className="text-sm text-gray-600">Регистрация сервисов, фабрики, scope (singleton/request/transient)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
