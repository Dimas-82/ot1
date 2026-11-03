# -*- coding: utf-8 -*-
"""Модели БД АСУ ОТ. Роли: admin, engineer, worker."""
from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

ROLE_LEVEL = {'worker': 1, 'engineer': 2, 'admin': 3}


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='worker')  # admin/engineer/worker
    full_name = db.Column(db.String(150), default='')
    position = db.Column(db.String(150), default='')
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    profession = db.Column(db.String(150), default='')
    theme = db.Column(db.String(10), default='light')
    # расширенные права worker: выданы admin, подтверждены engineer
    extra_perm = db.Column(db.Boolean, default=False)
    perm_confirmed_by = db.Column(db.Integer, nullable=True)
    electrical_group = db.Column(db.String(20), default='')
    enabled = db.Column(db.Boolean, default=True)

    def set_password(self, p):
        self.password_hash = generate_password_hash(p)

    def check_password(self, p):
        return check_password_hash(self.password_hash, p)

    @property
    def level(self):
        return ROLE_LEVEL.get(self.role, 1) + (1 if (self.role == 'worker' and self.extra_perm and self.perm_confirmed_by) else 0)

    def can(self, min_role):
        return self.level >= ROLE_LEVEL.get(min_role, 3)


class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    kind = db.Column(db.String(50), default='Подразделение')  # отдел/цех/бригада...
    parent_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    head = db.Column(db.String(150), default='')

    def children(self):
        return Department.query.filter_by(parent_id=self.id).all()


class Profstandart(db.Model):
    """Справочник профстандартов (актуально на 2026 г., приказ Минтруда РФ)."""
    __tablename__ = 'profstandarts'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(30))       # регистрационный номер ПСП
    name = db.Column(db.String(250))      # наименование профессии/должности
    title = db.Column(db.String(250))     # обобщённая трудовая функция
    level = db.Column(db.String(10))      # уровень квалификации
    hazardous = db.Column(db.Boolean, default=False)  # вредные/опасные условия (ТОТ)


class Worker(db.Model):
    __tablename__ = 'workers'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    profession = db.Column(db.String(150), default='')
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    hire_date = db.Column(db.Date, default=date.today)
    electrical_group = db.Column(db.String(30), default='без группы')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    work_type = db.Column(db.String(50), default='обычные условия')  # работы на высоте, электроустановки...

    def department(self):
        return db.session.get(Department, self.department_id) if self.department_id else None


class Training(db.Model):
    """Обучение и инструктажи (ПП 2464 от 24.12.2021)."""
    __tablename__ = 'trainings'
    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=False)
    kind = db.Column(db.String(80), nullable=False)  # Вводный, Первичный на рабочем месте, Повторный, Внеплановый, Целевой, СОУТ, ПОРТ...
    method = db.Column(db.String(20), default='auto')  # auto/manual
    date = db.Column(db.Date, default=date.today)
    instructor = db.Column(db.String(150), default='')
    result = db.Column(db.String(50), default='Пройдено')
    next_date = db.Column(db.Date, nullable=True)   # срок следующего (для повт. инструктажа - 3/6 мес.)
    hours = db.Column(db.Integer, default=0)
    doc_no = db.Column(db.String(50), default='')

    KINDS = ['Вводный инструктаж', 'Первичный инструктаж на рабочем месте',
             'Повторный инструктаж', 'Внеплановый инструктаж', 'Целевой инструктаж',
             'Обучение по охране труда (ПОРТ)', 'Проверка знаний требований ОТ']


class Incident(db.Model):
    """Инцидент/несчастный случай (гл. 7 ТК РФ, Приказ Минтруда №776н)."""
    __tablename__ = 'incidents'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.now)
    kind = db.Column(db.String(80), default='Несчастный случай на производстве')
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'))
    description = db.Column(db.Text, default='')
    location = db.Column(db.String(200), default='')
    severity = db.Column(db.String(50), default='Лёгкий')  # лёгкий/тяжёлый/групповой/со смертельным исходом
    status = db.Column(db.String(30), default='Зарегистрирован')  # расследуется/расследован
    investigation_deadline = db.Column(db.Date, nullable=True)
    commission = db.Column(db.Text, default='')


class Document(db.Model):
    """Генерируемые документы: протокол, акт Н-1, протокол экзамена и т.п."""
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    doctype = db.Column(db.String(80))   # Акт Н-1, Протокол расследования, Протокол экзамена по ЭБ...
    title = db.Column(db.String(250))
    date = db.Column(db.Date, default=date.today)
    number = db.Column(db.String(50))
    content = db.Column(db.Text)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'))
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'))


class Exam(db.Model):
    """Экзамен по электробезопасности (ПОТ ЭЭ Приказ 900н, ПОЭЭПриказ 1062н)."""
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=date.today)
    group = db.Column(db.String(30), default='II')  # группа II..V (до/выше 1000 В)
    chairman = db.Column(db.String(150), default='')
    members = db.Column(db.Text, default='')  # члены комиссии, через ;
    candidates = db.Column(db.Text, default='')  # фамилии через ;
    result = db.Column(db.String(50), default='')
    protocol_id = db.Column(db.Integer, nullable=True)
    next_date = db.Column(db.Date, nullable=True)  # периодичность: 1 год (электротехнологии)/3 года


class SizIssue(db.Model):
    """Выдача СИЗ, спецодежды, обуви (ЕОТ, Приказ 766н/767н, ТР ТС 019/2011)."""
    __tablename__ = 'siz'
    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=False)
    item = db.Column(db.String(200), nullable=False)  # Костюм, Boots...
    norm = db.Column(db.String(100), default='Типовые нормы')
    issue_date = db.Column(db.Date, default=date.today)
    replace_period_m = db.Column(db.Integer, default=12)  # месяцы носки
    status = db.Column(db.String(30), default='Выдано')

    def due_date(self):
        m = self.replace_period_m or 12
        return self.issue_date + timedelta(days=int(m * 30.44))


class Task(db.Model):
    """Задачи/напоминания: проверки знаний, СИЗ, поверки, медосмотры."""
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=False)
    kind = db.Column(db.String(60), default='Контроль')  # СИЗ/Инструктаж/Экзамен ЭБ/Медосмотр/Проверка
    due_date = db.Column(db.Date, default=date.today)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'))
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    done = db.Column(db.Boolean, default=False)
    notified = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(10), default='Средний')


def seed_profstandarts(db_session):
    if db_session.query(Profstandart).count() > 0:
        return
    data = [
        ('ПСП 000006', 'Специалист по охране труда', 'Организация управления охраной труда', '5', True),
        ('ПСП 000007', 'Специалист по защите от ЧС', 'Предупреждение и ликвидация ЧС', '5', True),
        ('ПСП 400002', 'Специалист по управлению персоналом', 'Реализация кадровой политики', '6', False),
        ('ПСП 400029', 'Инженер по качеству', 'Управление качеством продукции', '5', False),
        ('ПСП 15027', 'Электромонтёр по ремонту оборудования электрических станций', 'Обслуживание электрооборудования', '4', True),
        ('ПСП 15043', 'Электромонтёр по эксплуатации распределительных сетей', 'Эксплуатация распредсетей', '4', True),
        ('ПСП 15001', 'Электрик', 'Монтаж и обслуживание электрооборудования', '4', True),
        ('ПСП 16062', 'Сварщик', 'Сварка металлоконструкций', '4', True),
        ('ПСП 16026', 'Наладчик оборудования в производстве пищевых продуктов', 'Наладка оборудования', '4', False),
        ('ПСП 40020', 'Водитель автомобиля', 'Перевозка грузов автотранспортом', '3', True),
        ('ПСП 40038', 'Водитель погрузчика', 'Работы на промышленном транспорте', '3', True),
        ('ПСП 15016', 'Слесарь-ремонтник', 'Ремонт и обслуживание оборудования', '3', True),
        ('ПСП 15018', 'Станочник широкого профиля', 'Механическая обработка металлов', '3', True),
        ('ПСП 16004', 'Каменщик', 'Изготовление каменных конструкций', '2', True),
        ('ПСП 16007', 'Монтажник строительный', 'Монтаж строительных конструкций', '3', True),
        ('ПСП 16063', 'Маляр', 'Окраска поверхностей', '2', True),
        ('ПСП 16096', 'Штукатур', 'Оштукатуривание поверхностей', '2', True),
        ('ПСП 14038', 'Химик-оператор', 'Проведение химического анализа', '4', True),
        ('ПСП 12006', 'Лаборант-исследователь', 'Лабораторные исследования', '4', True),
        ('ПСП 50006', 'Программист', 'Разработка ПО', '5', False),
        ('ПСП 50017', 'Системный администратор', 'Администрирование ИТ-инфраструктуры', '5', False),
        ('ПСП 23002', 'Инженер по метрологии', 'Обеспечение единства измерений', '5', False),
        ('ПСП 000022', 'Специалист по пожарной профилактике', 'Пожарная безопасность объекта', '5', True),
        ('ПСП 15055', 'Электромонтер оперативно-выездной бригады', 'Оперативные выезды в электроустановки', '4', True),
        ('ПСП 16034', 'Крановщик (башенный кран)', 'Управление башенным краном', '4', True),
        ('ПСП 16036', 'Стропальщик', 'Строповка грузов', '2', True),
        ('ПСП 15021', 'Машинист крана автомобильного', 'Работы автокрана', '4', True),
        ('ПСП 400004', 'Бухгалтер', 'Ведение бухгалтерского учёта', '5', False),
        ('ПСП 400043', 'Юрист', 'Правовое обеспечение организации', '6', False),
        ('ПСП 13004', 'Фельдшер', 'Оказание первичной медпомощи', '4', True),
    ]
    for c, n, t, lv, hz in data:
        db_session.add(Profstandart(code=c, name=n, title=t, level=lv, hazardous=hz))
    db_session.commit()
