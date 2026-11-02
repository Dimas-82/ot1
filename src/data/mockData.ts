export interface Module {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  author: string;
  routes: number;
  permissions: string[];
}

export interface Route {
  id: number;
  method: string;
  pattern: string;
  handler: string;
  module: string;
  roles: string[];
  active: boolean;
  priority: number;
  lastModified: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  department: string;
  active: boolean;
  lastLogin: string;
}

export interface AuditEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
}

export const modules: Module[] = [
  { id: 'safety-incidents', name: 'Инциденты', version: '1.2.0', status: 'active', description: 'Регистрация, расследование и учёт несчастных случаев и инцидентов', author: 'RCS Team', routes: 12, permissions: ['incidents.view', 'incidents.create', 'incidents.edit', 'incidents.delete'] },
  { id: 'trainings', name: 'Инструктажи', version: '1.1.0', status: 'active', description: 'Учёт всех видов инструктажей по охране труда', author: 'RCS Team', routes: 8, permissions: ['trainings.view', 'trainings.create', 'trainings.schedule'] },
  { id: 'ppe', name: 'СИЗ', version: '1.0.0', status: 'active', description: 'Учёт выдачи средств индивидуальной защиты', author: 'RCS Team', routes: 6, permissions: ['ppe.view', 'ppe.issue', 'ppe.report'] },
  { id: 'med-exams', name: 'Медосмотры', version: '0.9.0', status: 'active', description: 'Планирование и учёт медицинских осмотров', author: 'RCS Team', routes: 5, permissions: ['medexams.view', 'medexams.schedule', 'medexams.results'] },
  { id: 'sout', name: 'СОУТ', version: '1.0.0', status: 'inactive', description: 'Специальная оценка условий труда', author: 'RCS Team', routes: 4, permissions: ['sout.view', 'sout.manage'] },
  { id: 'knowledge-check', name: 'Проверка знаний', version: '0.8.0', status: 'active', description: 'Тестирование и проверка знаний по охране труда', author: 'RCS Team', routes: 7, permissions: ['knowledge.view', 'knowledge.test', 'knowledge.results'] },
  { id: 'documents', name: 'Документооборот', version: '1.3.0', status: 'active', description: 'Управление документами по охране труда', author: 'RCS Team', routes: 9, permissions: ['docs.view', 'docs.create', 'docs.approve'] },
  { id: 'notifications', name: 'Уведомления', version: '1.0.0', status: 'active', description: 'Система уведомлений и оповещений', author: 'RCS Core', routes: 3, permissions: ['notifications.view', 'notifications.manage'] },
];

export const routes: Route[] = [
  { id: 1, method: 'GET', pattern: '/api/v1/incidents', handler: 'safety-incidents::IncidentController::list', module: 'Инциденты', roles: ['admin', 'safety-engineer', 'manager'], active: true, priority: 10, lastModified: '2024-01-15' },
  { id: 2, method: 'POST', pattern: '/api/v1/incidents', handler: 'safety-incidents::IncidentController::create', module: 'Инциденты', roles: ['admin', 'safety-engineer'], active: true, priority: 10, lastModified: '2024-01-15' },
  { id: 3, method: 'GET', pattern: '/api/v1/incidents/{id}', handler: 'safety-incidents::IncidentController::get', module: 'Инциденты', roles: ['admin', 'safety-engineer', 'manager'], active: true, priority: 10, lastModified: '2024-01-15' },
  { id: 4, method: 'GET', pattern: '/api/v1/trainings', handler: 'trainings::TrainingController::list', module: 'Инструктажи', roles: ['admin', 'safety-engineer', 'manager'], active: true, priority: 10, lastModified: '2024-01-14' },
  { id: 5, method: 'POST', pattern: '/api/v1/trainings/schedule', handler: 'trainings::TrainingController::schedule', module: 'Инструктажи', roles: ['admin', 'safety-engineer'], active: true, priority: 10, lastModified: '2024-01-14' },
  { id: 6, method: 'GET', pattern: '/api/v1/ppe/stock', handler: 'ppe::PPEController::stock', module: 'СИЗ', roles: ['admin', 'safety-engineer'], active: true, priority: 10, lastModified: '2024-01-13' },
  { id: 7, method: 'POST', pattern: '/api/v1/ppe/issue', handler: 'ppe::PPEController::issue', module: 'СИЗ', roles: ['admin', 'safety-engineer'], active: true, priority: 10, lastModified: '2024-01-13' },
  { id: 8, method: 'GET', pattern: '/api/v1/med-exams/plan', handler: 'med-exams::MedExamController::plan', module: 'Медосмотры', roles: ['admin', 'safety-engineer', 'hr'], active: true, priority: 10, lastModified: '2024-01-12' },
  { id: 9, method: 'GET', pattern: '/api/v1/modules', handler: 'core::ModuleController::list', module: 'Ядро', roles: ['admin'], active: true, priority: 100, lastModified: '2024-01-10' },
  { id: 10, method: 'POST', pattern: '/api/v1/routes', handler: 'core::RouteController::create', module: 'Ядро', roles: ['admin'], active: true, priority: 100, lastModified: '2024-01-10' },
  { id: 11, method: 'GET', pattern: '/api/v1/audit', handler: 'core::AuditController::list', module: 'Ядро', roles: ['admin', 'auditor'], active: true, priority: 100, lastModified: '2024-01-10' },
  { id: 12, method: 'GET', pattern: '/api/v1/sout/workplaces', handler: 'sout::SOUTController::workplaces', module: 'СОУТ', roles: ['admin', 'safety-engineer'], active: false, priority: 10, lastModified: '2024-01-08' },
];

export const users: User[] = [
  { id: 1, username: 'admin', fullName: 'Иванов Алексей Петрович', role: 'Администратор', department: 'ИТ', active: true, lastLogin: '2024-01-15 09:30' },
  { id: 2, username: 'safety.eng', fullName: 'Петрова Мария Сергеевна', role: 'Инженер по ОТ', department: 'Охрана труда', active: true, lastLogin: '2024-01-15 08:45' },
  { id: 3, username: 'dept.head', fullName: 'Сидоров Виктор Николаевич', role: 'Руководитель подразделения', department: 'Производство', active: true, lastLogin: '2024-01-14 17:20' },
  { id: 4, username: 'worker01', fullName: 'Козлов Дмитрий Андреевич', role: 'Работник', department: 'Производство', active: true, lastLogin: '2024-01-14 08:00' },
  { id: 5, username: 'auditor', fullName: 'Новикова Елена Владимировна', role: 'Аудитор', department: 'Контроль качества', active: true, lastLogin: '2024-01-13 14:30' },
  { id: 6, username: 'hr.manager', fullName: 'Белова Ольга Игоревна', role: 'HR-менеджер', department: 'Кадры', active: false, lastLogin: '2024-01-10 11:00' },
];

export const auditLog: AuditEntry[] = [
  { id: 1, timestamp: '2024-01-15 09:30:15', user: 'admin', action: 'ROUTE_CREATED', resource: '/api/v1/incidents', details: 'Создан маршрут GET /api/v1/incidents', ip: '192.168.1.10' },
  { id: 2, timestamp: '2024-01-15 09:28:00', user: 'admin', action: 'MODULE_ENABLED', resource: 'safety-incidents', details: 'Активирован модуль "Инциденты" v1.2.0', ip: '192.168.1.10' },
  { id: 3, timestamp: '2024-01-15 08:45:30', user: 'safety.eng', action: 'INCIDENT_CREATED', resource: 'INC-2024-001', details: 'Зарегистрирован инцидент: падение на лестнице', ip: '192.168.1.25' },
  { id: 4, timestamp: '2024-01-14 17:20:10', user: 'dept.head', action: 'TRAINING_APPROVED', resource: 'TRN-2024-015', details: 'Утверждён план инструктажей на февраль', ip: '192.168.1.30' },
  { id: 5, timestamp: '2024-01-14 16:00:00', user: 'safety.eng', action: 'PPE_ISSUED', resource: 'PPE-2024-042', details: 'Выданы СИЗ: каска, перчатки, очки — Козлову Д.А.', ip: '192.168.1.25' },
  { id: 6, timestamp: '2024-01-14 14:30:00', user: 'admin', action: 'USER_CREATED', resource: 'worker01', details: 'Создан пользователь Козлов Д.А. (работник)', ip: '192.168.1.10' },
  { id: 7, timestamp: '2024-01-14 10:00:00', user: 'admin', action: 'ROUTE_UPDATED', resource: '/api/v1/ppe/issue', details: 'Изменены права доступа для маршрута выдачи СИЗ', ip: '192.168.1.10' },
  { id: 8, timestamp: '2024-01-13 09:00:00', user: 'auditor', action: 'AUDIT_VIEW', resource: 'audit_log', details: 'Просмотр журнала аудита за период 01.01-13.01', ip: '192.168.1.50' },
];

export const dashboardStats = {
  totalIncidents: 23,
  openIncidents: 5,
  trainingsCompleted: 156,
  trainingsPending: 42,
  ppeIssued: 312,
  ppeOverdue: 18,
  medExamsCompleted: 89,
  medExamsDue: 34,
  activeModules: 6,
  totalRoutes: 12,
  activeUsers: 5,
  auditEntries: 156,
};

export const roles = [
  { id: 'admin', name: 'Администратор', description: 'Полный доступ ко всем функциям системы', users: 1 },
  { id: 'safety-engineer', name: 'Инженер по ОТ', description: 'Управление модулями охраны труда, создание отчётов', users: 1 },
  { id: 'manager', name: 'Руководитель подразделения', description: 'Просмотр данных по подразделению, утверждение планов', users: 1 },
  { id: 'worker', name: 'Работник', description: 'Просмотр своих инструктажей, СИЗ, медосмотров', users: 1 },
  { id: 'auditor', name: 'Аудитор', description: 'Просмотр журнала аудита, отчётов без права изменения', users: 1 },
  { id: 'hr', name: 'HR-менеджер', description: 'Управление данными о медосмотрах, кадровые отчёты', users: 1 },
];

export const dbSchema = {
  tables: [
    { name: 'users', columns: ['id SERIAL PK', 'username VARCHAR(100) UNIQUE', 'password_hash VARCHAR(255)', 'full_name VARCHAR(200)', 'email VARCHAR(200)', 'department_id FK', 'is_active BOOLEAN', 'created_at TIMESTAMP', 'updated_at TIMESTAMP'] },
    { name: 'roles', columns: ['id SERIAL PK', 'code VARCHAR(50) UNIQUE', 'name VARCHAR(100)', 'description TEXT', 'created_at TIMESTAMP'] },
    { name: 'permissions', columns: ['id SERIAL PK', 'code VARCHAR(100) UNIQUE', 'name VARCHAR(200)', 'module_id VARCHAR(100)', 'description TEXT'] },
    { name: 'user_roles', columns: ['user_id FK', 'role_id FK', 'PRIMARY KEY (user_id, role_id)'] },
    { name: 'role_permissions', columns: ['role_id FK', 'permission_id FK', 'PRIMARY KEY (role_id, permission_id)'] },
    { name: 'modules', columns: ['id VARCHAR(100) PK', 'name VARCHAR(200)', 'version VARCHAR(20)', 'status VARCHAR(20)', 'manifest JSONB', 'enabled BOOLEAN', 'installed_at TIMESTAMP', 'updated_at TIMESTAMP'] },
    { name: 'routes', columns: ['id SERIAL PK', 'method VARCHAR(10)', 'pattern VARCHAR(500)', 'handler VARCHAR(500)', 'module_id VARCHAR(100) FK', 'active BOOLEAN', 'priority INT', 'created_by FK', 'created_at TIMESTAMP', 'updated_at TIMESTAMP'] },
    { name: 'route_permissions', columns: ['route_id FK', 'role_id FK', 'PRIMARY KEY (route_id, role_id)'] },
    { name: 'settings', columns: ['id SERIAL PK', 'key VARCHAR(200) UNIQUE', 'value JSONB', 'module_id VARCHAR(100)', 'description TEXT', 'updated_at TIMESTAMP'] },
    { name: 'audit_log', columns: ['id SERIAL PK', 'timestamp TIMESTAMP', 'user_id FK', 'action VARCHAR(100)', 'resource VARCHAR(200)', 'details JSONB', 'ip_address VARCHAR(45)', 'user_agent TEXT'] },
    { name: 'jobs', columns: ['id SERIAL PK', 'name VARCHAR(200)', 'cron_expression VARCHAR(100)', 'handler VARCHAR(500)', 'module_id VARCHAR(100)', 'enabled BOOLEAN', 'last_run TIMESTAMP', 'next_run TIMESTAMP', 'status VARCHAR(20)'] },
    { name: 'departments', columns: ['id SERIAL PK', 'name VARCHAR(200)', 'parent_id FK NULL', 'head_user_id FK NULL', 'created_at TIMESTAMP'] },
  ]
};
