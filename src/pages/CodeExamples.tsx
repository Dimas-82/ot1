import { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const examples = [
  {
    id: 'module-loader',
    title: 'ModuleLoader — загрузчик модулей',
    description: 'Сканирует директорию modules/, читает module.json, регистрирует модули в DI-контейнере',
    code: `class ModuleLoader:
    """Загрузчик модулей АСУ ОТ"""
    
    def __init__(self, modules_path: Path, container: DIContainer):
        self.modules_path = modules_path
        self.container = container
        self.registry: dict[str, ModuleInfo] = {}
    
    def discover(self) -> list[ModuleInfo]:
        """Обнаружение модулей в директории"""
        modules = []
        for module_dir in self.modules_path.iterdir():
            manifest_path = module_dir / "module.json"
            if not manifest_path.exists():
                continue
            
            manifest = json.loads(manifest_path.read_text())
            module_info = ModuleInfo.from_manifest(manifest, module_dir)
            
            # Проверка совместимости с ядром
            if not self._check_compatibility(module_info):
                logger.warning(
                    f"Module {module_info.id} incompatible, skipping"
                )
                continue
            
            modules.append(module_info)
        
        return sorted(modules, key=lambda m: m.priority)
    
    def load_all(self) -> None:
        """Загрузка и инициализация всех модулей"""
        modules = self.discover()
        
        for module_info in modules:
            if not module_info.enabled:
                continue
            
            try:
                # Динамический импорт модуля
                module_class = self._import_module(module_info)
                instance = module_class()
                
                # Регистрация в DI
                instance.register(self.container)
                
                # Запуск
                instance.boot()
                
                # Регистрация маршрутов
                for route_def in instance.routes():
                    self.container.get(IRouteRegistry).add(route_def)
                
                # Регистрация в реестре
                self.registry[module_info.id] = module_info
                self.container.get(IEventBus).emit(
                    "module.loaded", {"module_id": module_info.id}
                )
                
                logger.info(f"Module loaded: {module_info.id} v{module_info.version}")
                
            except Exception as e:
                logger.error(f"Failed to load module {module_info.id}: {e}")
                self.container.get(IEventBus).emit(
                    "module.load_failed", 
                    {"module_id": module_info.id, "error": str(e)}
                )
    
    def _import_module(self, info: ModuleInfo) -> type[IModule]:
        """Динамический импорт класса модуля"""
        spec = importlib.util.spec_from_file_location(
            info.id, info.path / "module.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return getattr(module, info.entry_point)
    
    def _check_compatibility(self, info: ModuleInfo) -> bool:
        """Проверка совместимости версии модуля с ядром"""
        core_version = self.container.get("core.version")
        return semver.match(core_version, info.requires_core)`
  },
  {
    id: 'route-resolver',
    title: 'RouteResolver — разрешение маршрутов из БД',
    description: 'Читает маршруты из БД, кэширует, поддерживает hot-reload',
    code: `class RouteResolver:
    """Разрешение маршрутов из БД с hot-reload"""
    
    def __init__(self, db: Session, cache: ICache, event_bus: IEventBus):
        self.db = db
        self.cache = cache
        self.event_bus = event_bus
        self._routes: list[RouteEntry] = []
        self._last_loaded: datetime | None = None
        
        # Подписка на события изменения маршрутов
        event_bus.on("route.changed", self._on_route_changed)
    
    def load_from_db(self) -> None:
        """Загрузка маршрутов из БД"""
        rows = self.db.query(Route).filter(
            Route.active == True
        ).order_by(Route.priority.desc()).all()
        
        self._routes = [
            RouteEntry(
                id=r.id,
                method=r.method,
                pattern=r.pattern,
                handler=r.handler,
                module_id=r.module_id,
                required_roles=self._get_route_roles(r.id),
                priority=r.priority,
            )
            for r in rows
        ]
        
        self._last_loaded = datetime.utcnow()
        
        # Обновление кэша
        self.cache.set("routes:all", self._routes, ttl=3600)
        logger.info(f"Loaded {len(self._routes)} routes from DB")
    
    def resolve(self, method: str, path: str) -> RouteEntry | None:
        """Поиск подходящего маршрута"""
        # Сначала проверяем кэш
        cached = self.cache.get(f"routes:match:{method}:{path}")
        if cached:
            return cached
        
        for route in self._routes:
            if route.method != method:
                continue
            if self._match_pattern(route.pattern, path):
                self.cache.set(
                    f"routes:match:{method}:{path}", 
                    route, ttl=300
                )
                return route
        
        return None
    
    def _match_pattern(self, pattern: str, path: str) -> bool:
        """Сопоставление URL-шаблона с путём"""
        # /api/v1/incidents/{id} → regex
        regex = re.sub(r'\\{(\\w+)\\}', r'(?P<\\1>[^/]+)', pattern)
        return bool(re.fullmatch(regex, path))
    
    def _on_route_changed(self, event: Event) -> None:
        """Hot-reload при изменении маршрута"""
        logger.info("Route changed, reloading...")
        self.cache.delete_pattern("routes:*")
        self.load_from_db()
    
    def _get_route_roles(self, route_id: int) -> list[str]:
        """Получение ролей для маршрута"""
        return [
            rp.role.code for rp in 
            self.db.query(Role).join(RoutePermission).filter(
                RoutePermission.route_id == route_id
            ).all()
        ]`
  },
  {
    id: 'module-manifest',
    title: 'Манифест модуля safety-incidents (module.json)',
    description: 'Пример манифеста модуля «Инциденты»',
    code: `{
  "id": "safety-incidents",
  "name": "Инциденты",
  "version": "1.2.0",
  "description": "Регистрация, расследование и учёт несчастных случаев",
  "author": "RCS Team",
  "entry_point": "SafetyIncidentsModule",
  "requires_core": ">=1.0.0",
  "dependencies": ["notifications", "documents"],
  "permissions": [
    {"code": "incidents.view", "name": "Просмотр инцидентов"},
    {"code": "incidents.create", "name": "Регистрация инцидентов"},
    {"code": "incidents.edit", "name": "Редактирование инцидентов"},
    {"code": "incidents.delete", "name": "Удаление инцидентов"},
    {"code": "incidents.investigate", "name": "Проведение расследования"}
  ],
  "routes": [
    {"method": "GET", "pattern": "/api/v1/incidents", "handler": "list"},
    {"method": "POST", "pattern": "/api/v1/incidents", "handler": "create"},
    {"method": "GET", "pattern": "/api/v1/incidents/{id}", "handler": "get"},
    {"method": "PUT", "pattern": "/api/v1/incidents/{id}", "handler": "update"},
    {"method": "POST", "pattern": "/api/v1/incidents/{id}/investigate", "handler": "investigate"}
  ],
  "menu": [
    {"label": "Инциденты", "icon": "alert-triangle", "order": 10}
  ],
  "migrations": "migrations/",
  "settings": {
    "notification_enabled": true,
    "auto_assign_investigator": true,
    "investigation_deadline_days": 15
  }
}`
  },
  {
    id: 'event-bus',
    title: 'Event Bus — шина событий',
    description: 'Слабосвязанное взаимодействие между модулями',
    code: `class EventBus:
    """Шина событий для слабосвязанного взаимодействия модулей"""
    
    def __init__(self):
        self._handlers: dict[str, list[Callable]] = {}
        self._history: list[EventRecord] = []
    
    def on(self, event_name: str, handler: Callable) -> None:
        """Подписка на событие"""
        if event_name not in self._handlers:
            self._handlers[event_name] = []
        self._handlers[event_name].append(handler)
    
    def off(self, event_name: str, handler: Callable) -> None:
        """Отписка от события"""
        if event_name in self._handlers:
            self._handlers[event_name] = [
                h for h in self._handlers[event_name] if h != handler
            ]
    
    async def emit(self, event_name: str, payload: dict) -> None:
        """Генерация события"""
        event = Event(name=event_name, payload=payload, timestamp=utcnow())
        
        # Запись в историю
        self._history.append(EventRecord(
            name=event_name,
            payload=payload,
            timestamp=event.timestamp,
        ))
        
        # Вызов обработчиков
        handlers = self._handlers.get(event_name, [])
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                logger.error(
                    f"Event handler error: {event_name} -> {e}"
                )
    
    # Примеры событий:
    # "user.login"           — пользователь вошёл
    # "user.logout"          — пользователь вышел
    # "incident.created"     — создан инцидент
    # "incident.investigated" — расследование завершено
    # "training.completed"   — инструктаж пройден
    # "training.scheduled"   — инструктаж запланирован
    # "ppe.issued"           — выданы СИЗ
    # "medexam.scheduled"    — медосмотр запланирован
    # "module.loaded"        — модуль загружен
    # "module.enabled"       — модуль включён
    # "route.changed"        — маршрут изменён
    # "settings.changed"     — настройки изменены`
  },
  {
    id: 'admin-route-form',
    title: 'API создания маршрута администратором',
    description: 'FastAPI endpoint + Pydantic-схема для Route Manager',
    code: `# === Pydantic-схемы ===

class RouteCreateDTO(BaseModel):
    method: HTTPMethod
    pattern: str = Field(..., regex=r'^/[\\w/{}.*-]+$')
    handler: str = Field(..., regex=r'^[\\w-]+::\\w+::\\w+$')
    module_id: str
    required_roles: list[str]
    active: bool = True
    priority: int = 10

class RouteResponseDTO(BaseModel):
    id: int
    method: str
    pattern: str
    handler: str
    module_id: str
    required_roles: list[str]
    active: bool
    priority: int
    created_at: datetime
    updated_at: datetime

# === FastAPI endpoint ===

@router.post("/api/v1/routes", response_model=RouteResponseDTO)
async def create_route(
    dto: RouteCreateDTO,
    current_user: User = Depends(require_role("admin")),
    route_service: RouteService = Depends(get_route_service),
    audit: AuditService = Depends(get_audit_service),
):
    """Создание нового маршрута (только администратор)"""
    
    # Валидация: обработчик должен ссылаться на существующий модуль
    module = await route_service.get_module(dto.module_id)
    if not module:
        raise HTTPException(404, f"Module {dto.module_id} not found")
    
    # Проверка уникальности pattern+method
    existing = await route_service.find_route(dto.method, dto.pattern)
    if existing:
        raise HTTPException(409, "Route already exists")
    
    # Создание
    route = await route_service.create_route(dto)
    
    # Аудит
    await audit.log(
        action="ROUTE_CREATED",
        resource=dto.pattern,
        details={"method": dto.method, "handler": dto.handler},
        user=current_user,
    )
    
    # Hot-reload: уведомляем RouteResolver
    await event_bus.emit("route.changed", {"route_id": route.id})
    
    return route`
  },
  {
    id: 'add-module-scenario',
    title: 'Сценарий: Добавление нового модуля',
    description: 'Пошаговая инструкция подключения модуля без изменения ядра',
    code: `# === Сценарий добавления модуля «СОУТ» ===

# Шаг 1: Создание структуры модуля
mkdir -p rcs_ot/modules/sout/migrations

# Шаг 2: Создание манифеста
cat > rcs_ot/modules/sout/module.json << 'EOF'
{
  "id": "sout",
  "name": "СОУТ",
  "version": "1.0.0",
  "entry_point": "SOUTModule",
  "requires_core": ">=1.0.0",
  "permissions": [
    {"code": "sout.view", "name": "Просмотр данных СОУТ"},
    {"code": "sout.manage", "name": "Управление СОУТ"}
  ]
}
EOF

# Шаг 3: Реализация контракта IModule
cat > rcs_ot/modules/sout/module.py << 'PYEOF'
class SOUTModule:
    def register(self, container):
        container.register(SOUTService, SOUTServiceImpl)
        container.register(SOUTRepository, SOUTRepoImpl)
    
    def boot(self):
        logger.info("SOUT module booted")
    
    def routes(self):
        return [
            RouteDef("GET", "/api/v1/sout/workplaces", "list"),
            RouteDef("POST", "/api/v1/sout/workplaces", "create"),
            RouteDef("GET", "/api/v1/sout/results", "results"),
        ]
    
    def menu(self):
        return [MenuItem("СОУТ", "clipboard-check", order=50)]
    
    def permissions(self):
        return [Permission("sout.view"), Permission("sout.manage")]
    
    def migrations(self):
        return [Migration("001_create_workplaces")]
    
    def shutdown(self):
        pass
PYEOF

# Шаг 4: Установка через веб-админку ИЛИ CLI
python3 -m app.cli modules install sout

# Шаг 5: Активация через веб-админку ИЛИ CLI
python3 -m app.cli modules enable sout

# Готово! Модуль загружен без изменения кода ядра.`
  }
];

export default function CodeExamples() {
  const [activeExample, setActiveExample] = useState(examples[0].id);
  const [copied, setCopied] = useState(false);
  
  const current = examples.find(e => e.id === activeExample)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Примеры кода</h1>
        <p className="text-gray-500 mt-1">Ключевые компоненты ядра и сценарии использования</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {examples.map(ex => (
          <button
            key={ex.id}
            onClick={() => setActiveExample(ex.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeExample === ex.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {ex.title.split('—')[0].trim()}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{current.title}</h3>
            <p className="text-sm text-gray-500">{current.description}</p>
          </div>
          <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="code-block bg-gray-900 rounded-lg overflow-hidden">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto max-h-[600px]">
            {current.code}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Сценарий: Изменение маршрута с hot-reload</h3>
        <div className="space-y-3">
          {[
            { step: 1, text: 'Администратор открывает Route Manager в веб-интерфейсе' },
            { step: 2, text: 'Выбирает маршрут, изменяет URL-шаблон или права доступа' },
            { step: 3, text: 'Нажимает «Сохранить» — данные записываются в БД (таблица routes)' },
            { step: 4, text: 'Ядро генерирует событие route.changed через Event Bus' },
            { step: 5, text: 'RouteResolver подписан на route.changed — перечитывает маршруты из БД' },
            { step: 6, text: 'Кэш маршрутов обновляется — изменения вступают в силу без рестарта' },
            { step: 7, text: 'Запись об изменении попадает в журнал аудита' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</span>
              <p className="text-sm text-gray-700 pt-0.5">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
