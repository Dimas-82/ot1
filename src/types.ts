// Типы данных системы АСУ ОТ

export type UserRole = 'admin' | 'safety-engineer' | 'manager' | 'worker' | 'auditor' | 'hr';

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface Module {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  author: string;
  installedAt: string;
  enabledAt: string | null;
  permissions: string[];
  settings: Record<string, any>;
}

export interface Route {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  pattern: string;
  handler: string;
  moduleId: string;
  requiredRoles: UserRole[];
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface AuditEntry {
  id: number;
  timestamp: string;
  userId: number;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

export interface Incident {
  id: number;
  number: string;
  type: 'incident' | 'accident' | 'near_miss' | 'dangerous_condition';
  date: string;
  time: string;
  location: string;
  department: string;
  description: string;
  involved: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'registered' | 'investigating' | 'completed' | 'closed';
  investigator: string;
  createdAt: string;
  createdBy: number;
}

export interface Training {
  id: number;
  type: 'introductory' | 'primary' | 'repeat' | 'unscheduled' | 'targeted';
  title: string;
  date: string;
  instructor: string;
  participants: string[];
  department: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration: number; // minutes
  notes: string;
  createdAt: string;
  createdBy: number;
}

export interface PPEIssuance {
  id: number;
  date: string;
  workerId: number;
  workerName: string;
  items: { name: string; quantity: number; size: string }[];
  department: string;
  issuedBy: string;
  nextReplacement: string;
  notes: string;
  createdAt: string;
}

export interface MedExam {
  id: number;
  workerId: number;
  workerName: string;
  type: 'preliminary' | 'periodic' | 'pre-shift' | 'extra';
  scheduledDate: string;
  completedDate: string | null;
  result: 'fit' | 'unfit' | 'restrictions' | null;
  doctor: string;
  department: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: number | null; // null = all users
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
}
