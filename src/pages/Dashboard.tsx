import { dashboardStats } from '../data/mockData';
import { AlertTriangle, Users, Puzzle, ShieldCheck, Activity, FileWarning, Heart, ClipboardList } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Инциденты (открытые)', value: dashboardStats.openIncidents, total: dashboardStats.totalIncidents, icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
    { label: 'Инструктажи (выполнено)', value: dashboardStats.trainingsCompleted, total: dashboardStats.trainingsPending, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
    { label: 'СИЗ (выдано)', value: dashboardStats.ppeIssued, total: dashboardStats.ppeOverdue, icon: ShieldCheck, color: 'bg-green-100 text-green-600' },
    { label: 'Медосмотры', value: dashboardStats.medExamsCompleted, total: dashboardStats.medExamsDue, icon: Heart, color: 'bg-purple-100 text-purple-600' },
    { label: 'Активные модули', value: dashboardStats.activeModules, total: null, icon: Puzzle, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Маршруты API', value: dashboardStats.totalRoutes, total: null, icon: Activity, color: 'bg-cyan-100 text-cyan-600' },
    { label: 'Пользователи', value: dashboardStats.activeUsers, total: null, icon: Users, color: 'bg-amber-100 text-amber-600' },
    { label: 'Записи аудита', value: dashboardStats.auditEntries, total: null, icon: FileWarning, color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-500 mt-1">Обзор состояния системы АСУ «Охрана труда»</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card flex items-center gap-4">
              <div className={`stat-icon ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  {stat.total !== null && <span className="text-sm font-normal text-gray-400">/{stat.total}</span>}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Модульная архитектура</h3>
          <div className="space-y-3">
            {[
              { name: 'Ядро', desc: 'DI, Event Bus, Module Loader, Route Resolver', status: 'active' },
              { name: 'Инциденты', desc: 'Регистрация и расследование НС', status: 'active' },
              { name: 'Инструктажи', desc: 'Все виды инструктажей по ОТ', status: 'active' },
              { name: 'СИЗ', desc: 'Учёт выдачи средств защиты', status: 'active' },
              { name: 'Медосмотры', desc: 'Планирование и учёт МО', status: 'active' },
              { name: 'СОУТ', desc: 'Специальная оценка условий труда', status: 'inactive' },
            ].map((m) => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{m.name}</p>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </div>
                <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                  {m.status === 'active' ? '● Активен' : '○ Выключен'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние события</h3>
          <div className="space-y-3">
            {[
              { time: '09:30', text: 'Создан маршрут GET /api/v1/incidents', type: 'route' },
              { time: '09:28', text: 'Активирован модуль "Инциденты" v1.2.0', type: 'module' },
              { time: '08:45', text: 'Зарегистрирован инцидент INC-2024-001', type: 'incident' },
              { time: '08:00', text: 'Козлов Д.А. прошёл входной инструктаж', type: 'training' },
              { time: 'Вчера', text: 'Выданы СИЗ — Козлову Д.А.', type: 'ppe' },
              { time: 'Вчера', text: 'Утверждён план инструктажей на февраль', type: 'training' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-xs text-gray-400 w-12 flex-shrink-0 pt-0.5">{e.time}</span>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  e.type === 'route' ? 'bg-blue-500' :
                  e.type === 'module' ? 'bg-green-500' :
                  e.type === 'incident' ? 'bg-red-500' :
                  e.type === 'training' ? 'bg-purple-500' :
                  'bg-amber-500'
                }`} />
                <p className="text-sm text-gray-700">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Принципы системы</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Модульность', desc: 'Каждая предметная область — отдельный модуль с манифестом. Подключение без изменения ядра.' },
            { title: 'Динамическая маршрутизация', desc: 'Маршруты хранятся в БД, управляются через веб-админку с hot-reload.' },
            { title: 'Безопасность', desc: 'RBAC, аудит всех действий, OWASP Top 10, валидация, CSRF/XSS/SQLi-защита.' },
          ].map((p) => (
            <div key={p.title} className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-1">{p.title}</h4>
              <p className="text-sm text-blue-700">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
