import { User, Module, Route, AuditEntry, Incident, Training, PPEIssuance, MedExam, Notification, SystemSetting, UserRole } from './types';

// Хранилище данных с localStorage
const STORAGE_KEY = 'asu_ot_data';

interface AppData {
  users: User[];
  modules: Module[];
  routes: Route[];
  auditLog: AuditEntry[];
  incidents: Incident[];
  trainings: Training[];
  ppeIssuances: PPEIssuance[];
  medExams: MedExam[];
  notifications: Notification[];
  settings: SystemSetting[];
  currentUser: User | null;
  nextIds: {
    user: number;
    route: number;
    audit: number;
    incident: number;
    training: number;
    ppe: number;
    medExam: number;
    notification: number;
  };
}

const defaultData: AppData = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', fullName: 'Иванов Алексей Петрович', email: 'admin@rcs-ot.local', role: 'admin', department: 'ИТ', active: true, createdAt: '2024-01-01', lastLogin: null },
    { id: 2, username: 'safety', password: 'safety123', fullName: 'Петрова Мария Сергеевна', email: 'safety@rcs-ot.local', role: 'safety-engineer', department: 'Охрана труда', active: true, createdAt: '2024-01-01', lastLogin: null },
    { id: 3, username: 'manager', password: 'manager123', fullName: 'Сидоров Виктор Николаевич', email: 'manager@rcs-ot.local', role: 'manager', department: 'Производство', active: true, createdAt: '2024-01-01', lastLogin: null },
    { id: 4, username: 'worker', password: 'worker123', fullName: 'Козлов Дмитрий Андреевич', email: 'worker@rcs-ot.local', role: 'worker', department: 'Производство', active: true, createdAt: '2024-01-01', lastLogin: null },
    { id: 5, username: 'auditor', password: 'audit123', fullName: 'Новикова Елена Владимировна', email: 'auditor@rcs-ot.local', role: 'auditor', department: 'Контроль качества', active: true, createdAt: '2024-01-01', lastLogin: null },
  ],
  modules: [
    { id: 'safety-incidents', name: 'Инциденты', version: '1.2.0', status: 'active', description: 'Регистрация, расследование и учёт несчастных случаев', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: '2024-01-01', permissions: ['incidents.view', 'incidents.create', 'incidents.edit', 'incidents.delete', 'incidents.investigate'], settings: { autoAssign: true, deadlineDays: 15 } },
    { id: 'trainings', name: 'Инструктажи', version: '1.1.0', status: 'active', description: 'Учёт всех видов инструктажей по охране труда', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: '2024-01-01', permissions: ['trainings.view', 'trainings.create', 'trainings.schedule', 'trainings.approve'], settings: { reminderDays: 7 } },
    { id: 'ppe', name: 'СИЗ', version: '1.0.0', status: 'active', description: 'Учёт выдачи средств индивидуальной защиты', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: '2024-01-01', permissions: ['ppe.view', 'ppe.issue', 'ppe.stock', 'ppe.report'], settings: { stockAlert: 10 } },
    { id: 'med-exams', name: 'Медосмотры', version: '0.9.0', status: 'active', description: 'Планирование и учёт медицинских осмотров', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: '2024-01-01', permissions: ['medexams.view', 'medexams.schedule', 'medexams.results'], settings: { reminderDays: 14 } },
    { id: 'sout', name: 'СОУТ', version: '1.0.0', status: 'inactive', description: 'Специальная оценка условий труда', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: null, permissions: ['sout.view', 'sout.manage'], settings: {} },
    { id: 'knowledge-check', name: 'Проверка знаний', version: '0.8.0', status: 'active', description: 'Тестирование и проверка знаний по охране труда', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: '2024-01-01', permissions: ['knowledge.view', 'knowledge.test', 'knowledge.results'], settings: { passScore: 80 } },
    { id: 'documents', name: 'Документооборот', version: '1.3.0', status: 'active', description: 'Управление документами по охране труда', author: 'RCS Team', installedAt: '2024-01-01', enabledAt: '2024-01-01', permissions: ['docs.view', 'docs.create', 'docs.approve'], settings: {} },
  ],
  routes: [
    { id: 1, method: 'GET', pattern: '/api/v1/incidents', handler: 'safety-incidents::IncidentController::list', moduleId: 'safety-incidents', requiredRoles: ['admin', 'safety-engineer', 'manager'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 2, method: 'POST', pattern: '/api/v1/incidents', handler: 'safety-incidents::IncidentController::create', moduleId: 'safety-incidents', requiredRoles: ['admin', 'safety-engineer'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 3, method: 'GET', pattern: '/api/v1/incidents/{id}', handler: 'safety-incidents::IncidentController::get', moduleId: 'safety-incidents', requiredRoles: ['admin', 'safety-engineer', 'manager'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 4, method: 'GET', pattern: '/api/v1/trainings', handler: 'trainings::TrainingController::list', moduleId: 'trainings', requiredRoles: ['admin', 'safety-engineer', 'manager'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 5, method: 'POST', pattern: '/api/v1/trainings/schedule', handler: 'trainings::TrainingController::schedule', moduleId: 'trainings', requiredRoles: ['admin', 'safety-engineer'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 6, method: 'GET', pattern: '/api/v1/ppe/stock', handler: 'ppe::PPEController::stock', moduleId: 'ppe', requiredRoles: ['admin', 'safety-engineer'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 7, method: 'POST', pattern: '/api/v1/ppe/issue', handler: 'ppe::PPEController::issue', moduleId: 'ppe', requiredRoles: ['admin', 'safety-engineer'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 8, method: 'GET', pattern: '/api/v1/med-exams/plan', handler: 'med-exams::MedExamController::plan', moduleId: 'med-exams', requiredRoles: ['admin', 'safety-engineer', 'hr'], active: true, priority: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 9, method: 'GET', pattern: '/api/v1/modules', handler: 'core::ModuleController::list', moduleId: 'core', requiredRoles: ['admin'], active: true, priority: 100, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
    { id: 10, method: 'POST', pattern: '/api/v1/routes', handler: 'core::RouteController::create', moduleId: 'core', requiredRoles: ['admin'], active: true, priority: 100, createdAt: '2024-01-01', updatedAt: '2024-01-01', createdBy: 1 },
  ],
  auditLog: [],
  incidents: [
    { id: 1, number: 'INC-2024-001', type: 'incident', date: '2024-01-10', time: '14:30', location: 'Цех №3, лестница Б', department: 'Производство', description: 'Падение работника на лестнице. Пострадавший: Козлов Д.А.', involved: ['Козлов Д.А.'], severity: 'medium', status: 'investigating', investigator: 'Петрова М.С.', createdAt: '2024-01-10', createdBy: 2 },
    { id: 2, number: 'INC-2024-002', type: 'near_miss', date: '2024-01-12', time: '09:15', location: 'Склад ГСМ', department: 'Логистика', description: 'Разлив масла. Угроза скольжения.', involved: [], severity: 'low', status: 'completed', investigator: 'Петрова М.С.', createdAt: '2024-01-12', createdBy: 2 },
    { id: 3, number: 'INC-2024-003', type: 'dangerous_condition', date: '2024-01-14', time: '11:00', location: 'Цех №1, станок ЧПУ-5', department: 'Производство', description: 'Неисправность защитного кожуха.', involved: [], severity: 'high', status: 'registered', investigator: '', createdAt: '2024-01-14', createdBy: 3 },
  ],
  trainings: [
    { id: 1, type: 'introductory', title: 'Вводный инструктаж для новых сотрудников', date: '2024-01-15', instructor: 'Петрова М.С.', participants: ['Козлов Д.А.', 'Морозов И.В.'], department: 'Производство', status: 'completed', duration: 120, notes: 'Все ознакомлены', createdAt: '2024-01-10', createdBy: 2 },
    { id: 2, type: 'repeat', title: 'Повторный инструктаж по электробезопасности', date: '2024-02-01', instructor: 'Петрова М.С.', participants: ['Сидоров В.Н.', 'Козлов Д.А.'], department: 'Производство', status: 'scheduled', duration: 60, notes: '', createdAt: '2024-01-12', createdBy: 2 },
    { id: 3, type: 'targeted', title: 'Целевой инструктаж перед работой на высоте', date: '2024-01-20', instructor: 'Петрова М.С.', participants: ['Козлов Д.А.'], department: 'Производство', status: 'scheduled', duration: 45, notes: 'Работы на кровле', createdAt: '2024-01-14', createdBy: 2 },
  ],
  ppeIssuances: [
    { id: 1, date: '2024-01-15', workerId: 4, workerName: 'Козлов Дмитрий Андреевич', items: [{ name: 'Каска защитная', quantity: 1, size: 'M' }, { name: 'Перчатки диэлектрические', quantity: 2, size: 'L' }, { name: 'Очки защитные', quantity: 1, size: 'Универсальный' }], department: 'Производство', issuedBy: 'Петрова М.С.', nextReplacement: '2024-07-15', notes: '', createdAt: '2024-01-15' },
    { id: 2, date: '2024-01-10', workerId: 3, workerName: 'Сидоров Виктор Николаевич', items: [{ name: 'Респиратор FFP2', quantity: 5, size: 'Универсальный' }, { name: 'Костюм защитный', quantity: 1, size: 'XL' }], department: 'Производство', issuedBy: 'Петрова М.С.', nextReplacement: '2024-04-10', notes: '', createdAt: '2024-01-10' },
  ],
  medExams: [
    { id: 1, workerId: 4, workerName: 'Козлов Дмитрий Андреевич', type: 'preliminary', scheduledDate: '2024-01-20', completedDate: null, result: null, doctor: 'Д-р Смирнов', department: 'Производство', status: 'scheduled', notes: '', createdAt: '2024-01-10' },
    { id: 2, workerId: 3, workerName: 'Сидоров Виктор Николаевич', type: 'periodic', scheduledDate: '2024-01-05', completedDate: '2024-01-05', result: 'fit', doctor: 'Д-р Смирнов', department: 'Производство', status: 'completed', notes: 'Годен без ограничений', createdAt: '2024-01-01' },
    { id: 3, workerId: 4, workerName: 'Козлов Дмитрий Андреевич', type: 'periodic', scheduledDate: '2023-12-15', completedDate: null, result: null, doctor: '', department: 'Производство', status: 'overdue', notes: 'Просрочен!', createdAt: '2023-11-01' },
  ],
  notifications: [
    { id: 1, type: 'warning', title: 'Просроченный медосмотр', message: 'У работника Козлов Д.А. просрочен периодический медосмотр', read: false, createdAt: '2024-01-15', userId: 2 },
    { id: 2, type: 'info', title: 'Новый инцидент', message: 'Зарегистрирован инцидент INC-2024-003: неисправность защитного кожуха', read: false, createdAt: '2024-01-14', userId: 2 },
    { id: 3, type: 'success', title: 'Инструктаж завершён', message: 'Вводный инструктаж от 15.01.2024 успешно проведён', read: true, createdAt: '2024-01-15', userId: null },
  ],
  settings: [
    { key: 'company_name', value: 'ООО "Промышленная Безопасность"', description: 'Название организации', category: 'Общие' },
    { key: 'timezone', value: 'Europe/Moscow', description: 'Часовой пояс', category: 'Общие' },
    { key: 'session_timeout', value: '30', description: 'Таймаут сессии (минуты)', category: 'Безопасность' },
    { key: 'password_min_length', value: '8', description: 'Минимальная длина пароля', category: 'Безопасность' },
    { key: 'max_login_attempts', value: '5', description: 'Максимум попыток входа', category: 'Безопасность' },
    { key: 'audit_retention_days', value: '1095', description: 'Хранение аудита (дни)', category: 'Аудит' },
    { key: 'notification_email', value: 'ot@example.com', description: 'Email для уведомлений', category: 'Уведомления' },
    { key: 'incident_deadline_days', value: '15', description: 'Срок расследования инцидента (дни)', category: 'Модули' },
  ],
  currentUser: null,
  nextIds: { user: 6, route: 11, audit: 1, incident: 4, training: 4, ppe: 3, medExam: 4, notification: 4 },
};

class Store {
  private data: AppData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch {
        this.data = { ...defaultData };
      }
    } else {
      this.data = { ...defaultData };
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getData(): AppData {
    return this.data;
  }

  // Auth
  login(username: string, password: string): User | null {
    const user = this.data.users.find(u => u.username === username && u.password === password && u.active);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.data.currentUser = user;
      this.addAuditEntry(user.id, user.username, 'USER_LOGIN', 'auth', `Пользователь ${user.fullName} вошёл в систему`);
      this.save();
      return user;
    }
    return null;
  }

  logout() {
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'USER_LOGOUT', 'auth', `Пользователь вышел из системы`);
    }
    this.data.currentUser = null;
    this.save();
  }

  getCurrentUser(): User | null {
    return this.data.currentUser;
  }

  // Audit
  addAuditEntry(userId: number, username: string, action: string, resource: string, details: string) {
    const entry: AuditEntry = {
      id: this.data.nextIds.audit++,
      timestamp: new Date().toISOString(),
      userId,
      username,
      action,
      resource,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 100),
    };
    this.data.auditLog.unshift(entry);
    this.save();
  }

  getAuditLog(): AuditEntry[] {
    return this.data.auditLog;
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User {
    const newUser: User = {
      ...user,
      id: this.data.nextIds.user++,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };
    this.data.users.push(newUser);
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'USER_CREATED', `user:${newUser.username}`, `Создан пользователь ${newUser.fullName}`);
    }
    this.save();
    return newUser;
  }

  updateUser(id: number, updates: Partial<User>) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      if (this.data.currentUser) {
        this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'USER_UPDATED', `user:${user.username}`, `Обновлён пользователь ${user.fullName}`);
      }
      this.save();
    }
  }

  // Modules
  getModules(): Module[] {
    return this.data.modules;
  }

  toggleModule(id: string) {
    const module = this.data.modules.find(m => m.id === id);
    if (module) {
      if (module.status === 'active') {
        module.status = 'inactive';
        module.enabledAt = null;
        if (this.data.currentUser) {
          this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'MODULE_DISABLED', `module:${id}`, `Отключён модуль "${module.name}"`);
        }
      } else {
        module.status = 'active';
        module.enabledAt = new Date().toISOString().split('T')[0];
        if (this.data.currentUser) {
          this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'MODULE_ENABLED', `module:${id}`, `Активирован модуль "${module.name}" v${module.version}`);
        }
      }
      this.save();
    }
  }

  // Routes
  getRoutes(): Route[] {
    return this.data.routes;
  }

  createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Route {
    const newRoute: Route = {
      ...route,
      id: this.data.nextIds.route++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: this.data.currentUser?.id || 1,
    };
    this.data.routes.push(newRoute);
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'ROUTE_CREATED', `route:${route.pattern}`, `Создан маршрут ${route.method} ${route.pattern}`);
    }
    this.save();
    return newRoute;
  }

  updateRoute(id: number, updates: Partial<Route>) {
    const route = this.data.routes.find(r => r.id === id);
    if (route) {
      Object.assign(route, updates, { updatedAt: new Date().toISOString() });
      if (this.data.currentUser) {
        this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'ROUTE_UPDATED', `route:${route.pattern}`, `Обновлён маршрут ${route.method} ${route.pattern}`);
      }
      this.save();
    }
  }

  deleteRoute(id: number) {
    const route = this.data.routes.find(r => r.id === id);
    if (route) {
      this.data.routes = this.data.routes.filter(r => r.id !== id);
      if (this.data.currentUser) {
        this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'ROUTE_DELETED', `route:${route.pattern}`, `Удалён маршрут ${route.method} ${route.pattern}`);
      }
      this.save();
    }
  }

  // Incidents
  getIncidents(): Incident[] {
    return this.data.incidents;
  }

  createIncident(incident: Omit<Incident, 'id' | 'number' | 'createdAt' | 'createdBy'>): Incident {
    const year = new Date().getFullYear();
    const num = String(this.data.nextIds.incident).padStart(3, '0');
    const newIncident: Incident = {
      ...incident,
      id: this.data.nextIds.incident++,
      number: `INC-${year}-${num}`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: this.data.currentUser?.id || 1,
    };
    this.data.incidents.push(newIncident);
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'INCIDENT_CREATED', `incident:${newIncident.number}`, `Зарегистрирован инцидент: ${incident.description.slice(0, 50)}`);
    }
    // Уведомление
    this.data.notifications.unshift({
      id: this.data.nextIds.notification++,
      type: incident.severity === 'critical' || incident.severity === 'high' ? 'danger' : 'warning',
      title: 'Новый инцидент',
      message: `${newIncident.number}: ${incident.description.slice(0, 80)}`,
      read: false,
      createdAt: new Date().toISOString(),
      userId: null,
    });
    this.save();
    return newIncident;
  }

  updateIncident(id: number, updates: Partial<Incident>) {
    const incident = this.data.incidents.find(i => i.id === id);
    if (incident) {
      Object.assign(incident, updates);
      if (this.data.currentUser) {
        this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'INCIDENT_UPDATED', `incident:${incident.number}`, `Обновлён статус инцидента: ${updates.status || 'изменения'}`);
      }
      this.save();
    }
  }

  // Trainings
  getTrainings(): Training[] {
    return this.data.trainings;
  }

  createTraining(training: Omit<Training, 'id' | 'createdAt' | 'createdBy'>): Training {
    const newTraining: Training = {
      ...training,
      id: this.data.nextIds.training++,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: this.data.currentUser?.id || 1,
    };
    this.data.trainings.push(newTraining);
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'TRAINING_CREATED', `training:${newTraining.id}`, `Запланирован инструктаж: ${training.title}`);
    }
    this.save();
    return newTraining;
  }

  // PPE
  getPPEIssuances(): PPEIssuance[] {
    return this.data.ppeIssuances;
  }

  createPPEIssuance(issuance: Omit<PPEIssuance, 'id' | 'createdAt'>): PPEIssuance {
    const newIssuance: PPEIssuance = {
      ...issuance,
      id: this.data.nextIds.ppe++,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.data.ppeIssuances.push(newIssuance);
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'PPE_ISSUED', `ppe:${newIssuance.id}`, `Выданы СИЗ: ${issuance.workerName}`);
    }
    this.save();
    return newIssuance;
  }

  // Med Exams
  getMedExams(): MedExam[] {
    return this.data.medExams;
  }

  createMedExam(exam: Omit<MedExam, 'id' | 'createdAt'>): MedExam {
    const newExam: MedExam = {
      ...exam,
      id: this.data.nextIds.medExam++,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.data.medExams.push(newExam);
    if (this.data.currentUser) {
      this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'MEDEXAM_SCHEDULED', `medexam:${newExam.id}`, `Запланирован медосмотр: ${exam.workerName}`);
    }
    this.save();
    return newExam;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  markNotificationRead(id: number) {
    const n = this.data.notifications.find(n => n.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  markAllNotificationsRead() {
    this.data.notifications.forEach(n => n.read = true);
    this.save();
  }

  // Settings
  getSettings(): SystemSetting[] {
    return this.data.settings;
  }

  updateSetting(key: string, value: string) {
    const setting = this.data.settings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      if (this.data.currentUser) {
        this.addAuditEntry(this.data.currentUser.id, this.data.currentUser.username, 'SETTING_CHANGED', `setting:${key}`, `Изменена настройка: ${key}`);
      }
      this.save();
    }
  }

  // Reset
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = { ...defaultData };
    this.save();
  }
}

export const store = new Store();
