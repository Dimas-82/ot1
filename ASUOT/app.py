# -*- coding: utf-8 -*-
"""АСУ ОТ — Автоматизированная система управления охраной труда.
Веб-интерфейс на Flask. Законодательство РФ (ТК РФ, ПП 2464, Приказы 776н, 900н, 766н)."""
import os, json
from datetime import datetime, date, timedelta
from functools import wraps
from flask import (Flask, render_template, request, redirect, url_for, session,
                   flash, Response, abort)

from models import (db, User, Department, Profstandart, Worker, Training,
                    Incident, Document, Exam, SizIssue, Task, seed_profstandarts)

BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
app.secret_key = os.environ.get('ASUOT_SECRET', 'asuot-dev-secret-change-me')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE, 'asuot.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


# ---------- инициализация БД ----------
def init_db():
    with app.app_context():
        db.create_all()
        seed_profstandarts(db.session)
        if not User.query.filter_by(username='admin').first():
            a = User(username='admin', role='admin', full_name='Администратор ИТ')
            a.set_password('admin123'); db.session.add(a)
            e = User(username='engineer', role='engineer', full_name='Иванов И.И.', position='Специалист по охране труда')
            e.set_password('engineer123'); db.session.add(e)
            w = User(username='worker', role='worker', full_name='Петров П.П.', position='Электромонтёр')
            w.set_password('worker123'); db.session.add(w)
            db.session.commit()


# ---------- декораторы доступа ----------
def login_required(f):
    @wraps(f)
    def wrap(*a, **k):
        if 'uid' not in session:
            return redirect(url_for('login'))
        return f(*a, **k)
    return wrap


def role_required(min_role):
    def deco(f):
        @wraps(f)
        @login_required
        def wrap(*a, **k):
            u = db.session.get(User, session['uid'])
            if not u or not u.can(min_role):
                abort(403)
            return f(*a, **k)
        return wrap
    return deco


@app.context_processor
def inject():
    u = db.session.get(User, session['uid']) if 'uid' in session else None
    today = date.today()
    alerts = 0
    if u and u.level >= 2:
        alerts = (Task.query.filter_by(done=False).count() +
                  Training.query.filter(Training.next_date != None, Training.next_date <= today).count())
    return dict(cur_user=u, today=today, alerts=alerts,
                org_name=os.environ.get('ASUOT_ORG', 'ООО «Пример»'))


# ---------- авторизация / тема ----------
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        u = User.query.filter_by(username=request.form.get('username', '')).first()
        if u and u.enabled and u.check_password(request.form.get('password', '')):
            session['uid'] = u.id
            return redirect(url_for('index'))
        error = 'Неверный логин/пароль или учётная запись отключена'
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/theme')
@login_required
def theme():
    u = db.session.get(User, session['uid'])
    u.theme = 'dark' if u.theme == 'light' else 'light'
    db.session.commit()
    return redirect(request.referrer or url_for('index'))


# ---------- главная / панель ----------
@app.route('/')
@login_required
def index():
    u = db.session.get(User, session['uid'])
    upcoming = []
    if u.level >= 2:
        for t in Task.query.filter_by(done=False).order_by(Task.due_date).limit(15):
            wk = db.session.get(Worker, t.worker_id) if t.worker_id else None
            upcoming.append((t, wk))
        overdue_train = Training.query.filter(Training.next_date != None,
                                              Training.next_date <= date.today()).all()
    else:
        overdue_train = []
        my_tasks = Task.query.filter_by(done=False).join(Worker, Task.worker_id == Worker.id)\
            .filter(Worker.user_id == u.id).order_by(Task.due_date).all()
        upcoming = [(t, db.session.get(Worker, t.worker_id) if t.worker_id else None) for t in my_tasks]
    stats = dict(workers=Worker.query.count(), depts=Department.query.count(),
                 incidents=Incident.query.count(), docs=Document.query.count())
    return render_template('index.html', upcoming=upcoming, stats=stats, overdue_train=overdue_train)


# ---------- подразделения ----------
@app.route('/departments', methods=['GET', 'POST'])
@role_required('engineer')
def departments():
    if request.method == 'POST':
        d = Department(name=request.form['name'].strip(), kind=request.form.get('kind', 'Подразделение'),
                       head=request.form.get('head', ''),
                       parent_id=request.form.get('parent_id') or None)
        db.session.add(d); db.session.commit()
        flash('Подразделение создано')
        return redirect(url_for('departments'))
    items = Department.query.order_by(Department.name).all()
    return render_template('departments.html', items=items)


@app.route('/departments/delete/<int:did>')
@role_required('admin')
def dept_delete(did):
    d = db.session.get(Department, did)
    if d:
        db.session.delete(d); db.session.commit()
    return redirect(url_for('departments'))


# ---------- работники и профстандарты ----------
@app.route('/workers', methods=['GET', 'POST'])
@role_required('engineer')
def workers():
    if request.method == 'POST':
        w = Worker(full_name=request.form['full_name'].strip(),
                   profession=request.form.get('profession', ''),
                   department_id=request.form.get('department_id') or None,
                   hire_date=datetime.strptime(request.form['hire_date'], '%Y-%m-%d').date(),
                   electrical_group=request.form.get('electrical_group', 'без группы'),
                   work_type=request.form.get('work_type', 'обычные условия'))
        db.session.add(w); db.session.commit()
        auto_schedule(w)
        flash('Работник добавлен, задачи сформированы автоматически')
        return redirect(url_for('workers'))
    items = Worker.query.order_by(Worker.full_name).all()
    return render_template('workers.html', items=items,
                           deps=Department.query.all(),
                           ps=Profstandart.query.order_by(Profstandart.name).all())


@app.route('/workers/delete/<int:wid>')
@role_required('engineer')
def worker_delete(wid):
    w = db.session.get(Worker, wid)
    if w:
        db.session.delete(w); db.session.commit()
    return redirect(url_for('workers'))


@app.route('/profstandart')
@role_required('engineer')
def profstandart_list():
    q = request.args.get('q', '')
    items = Profstandart.query
    if q:
        items = items.filter(db.or_(Profstandart.name.like(f'%{q}%'), Profstandart.code.like(f'%{q}%')))
    return render_template('profstandart.html', items=items.order_by(Profstandart.name).all(), q=q)


# ---------- автопланирование по законодательству ----------
def auto_schedule(w):
    """ПП 2464: вводный — в день приёма; первичный — до допуска; повторный — не реже 1 раза в 3 мес.
    (для работ без повышенной опасности — 6 мес.); проверка знаний ПОТ — 1 год."""
    today = date.today()
    hazardous = 'повышенн' in (w.work_type or '').lower() or 'электро' in (w.work_type or '').lower() or 'высот' in (w.work_type or '').lower()
    per = 3 if hazardous else 6
    plan = [
        ('Вводный инструктаж', today),
        ('Первичный инструктаж на рабочем месте', today),
        ('Повторный инструктаж', today + timedelta(days=per * 30)),
        ('Проверка знаний требований ОТ', today + timedelta(days=365)),
    ]
    for kind, due in plan:
        if not Task.query.filter(Task.worker_id == w.id, Task.title.like(f'%{kind}%'), Task.done == False).first():
            db.session.add(Task(title=f'{kind} — {w.full_name}', kind='Инструктаж',
                                due_date=due, worker_id=w.id))
    if 'электро' in (w.work_type or '').lower() or (w.electrical_group or '') not in ('', 'без группы'):
        nxt = today + timedelta(days=365)
        db.session.add(Task(title=f'Очередная проверка знаний ЭБ (группа {w.electrical_group}) — {w.full_name}',
                            kind='Экзамен ЭБ', due_date=nxt, worker_id=w.id))
    db.session.commit()


# ---------- инструктажи ----------
@app.route('/trainings', methods=['GET', 'POST'])
@role_required('engineer')
def trainings():
    if request.method == 'POST':
        mode = request.form.get('method', 'manual')
        w = db.session.get(Worker, int(request.form['worker_id']))
        kind = request.form['kind']
        d = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        # авто-расчёт срока следующего по ПП 2464
        nd = None
        if mode == 'auto':
            haz = 'повышенн' in (w.work_type or '').lower() or 'электро' in (w.work_type or '').lower() or 'высот' in (w.work_type or '').lower()
            months = {'Повторный инструктаж': 3 if haz else 6,
                      'Проверка знаний требований ОТ': 12,
                      'Обучение по охране труда (ПОРТ)': 12}.get(kind, 3)
            nd = d + timedelta(days=months * 30)
        else:
            if request.form.get('next_date'):
                nd = datetime.strptime(request.form['next_date'], '%Y-%m-%d').date()
        tr = Training(worker_id=w.id, kind=kind, method=mode, date=d,
                      instructor=request.form.get('instructor', ''),
                      hours=int(request.form.get('hours') or 0), next_date=nd,
                      doc_no=request.form.get('doc_no', ''))
        db.session.add(tr); db.session.commit()
        gen_training_record(tr)
        # закрыть связанную задачу
        for t in Task.query.filter_by(worker_id=w.id, done=False).all():
            if kind.split()[0].lower() in t.title.lower():
                t.done = True
        db.session.commit()
        flash('Инструктаж записан, журнал обновлён')
        return redirect(url_for('trainings'))
    items = Training.query.order_by(Training.date.desc()).limit(200).all()
    return render_template('trainings.html', items=items, workers=Worker.query.all())


def gen_training_record(tr):
    w = db.session.get(Worker, tr.worker_id)
    content = (f"ЖУРНАЛ РЕГИСТРАЦИИ ИНСТРУКТАЖЕЙ\n\n"
               f"Вид инструктажа: {tr.kind}\nРаботник: {w.full_name} ({w.profession})\n"
               f"Дата: {tr.date:%d.%m.%Y}\nПровёл: {tr.instructor}\nОбъём: {tr.hours} ч.\n"
               f"Основание: Постановление Правительства РФ №2464 от 24.12.2021\n"
               f"Результат: {tr.result}\nПодпись инструктируемого: ____________")
    db.session.add(Document(doctype='Запись журнала инструктажей', title=f'{tr.kind} — {w.full_name}',
                            date=tr.date, number=tr.doc_no or f'ЖИ-{tr.id or 0}', content=content))
    db.session.commit()


@app.route('/trainings/schedule', methods=['POST'])
@role_required('engineer')
def trainings_schedule():
    """Автоматическая рассылка задач-напоминаний по всем активным работникам."""
    n = 0
    for w in Worker.query.all():
        before = Task.query.filter_by(done=False).count()
        auto_schedule(w)
        n += Task.query.filter_by(done=False).count() - before
    flash(f'Автопланирование выполнено: создано новых задач — {n}')
    return redirect(url_for('trainings'))


# ---------- инциденты и расследования ----------
@app.route('/incidents', methods=['GET', 'POST'])
@role_required('engineer')
def incidents():
    if request.method == 'POST':
        sev = request.form.get('severity', 'Лёгкий')
        d = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        # сроки расследования: 3 дня (лёгкий), 15 (тяжёлый/смертельный/групповой) — ст.229.2 ТК РФ
        days = 3 if sev == 'Лёгкий' else 15
        inc = Incident(date=datetime.combine(d, datetime.min.time()), kind=request.form.get('kind', 'Несчастный случай на производстве'),
                       worker_id=request.form.get('worker_id') or None,
                       description=request.form.get('description', ''), location=request.form.get('location', ''),
                       severity=sev, commission=request.form.get('commission', ''),
                       investigation_deadline=d + timedelta(days=days), status='Расследуется')
        db.session.add(inc); db.session.commit()
        db.session.add(Task(title=f'Расследование инцидента №{inc.id} (срок {days} дн.)', kind='Инцидент',
                            due_date=inc.investigation_deadline, priority='Высокий'))
        db.session.commit()
        flash(f'Инцидент зарегистрирован. Срок расследования — {days} кал. дней (ст. 229.2 ТК РФ)')
        return redirect(url_for('incidents'))
    items = Incident.query.order_by(Incident.date.desc()).all()
    return render_template('incidents.html', items=items, workers=Worker.query.all())


@app.route('/incidents/<int:iid>/investigate', methods=['POST'])
@role_required('engineer')
def incident_investigate(iid):
    inc = db.session.get(Incident, iid)
    cause = request.form.get('cause', '')
    measures = request.form.get('measures', '')
    w = db.session.get(Worker, inc.worker_id) if inc.worker_id else None
    num = f'ПРО-{inc.id}-{inc.date.year}'
    proto = (f"ПРОТОКОЛ осмотра места происшествия / расследования\n№ {num} от {date.today():%d.%m.%Y}\n\n"
             f"Комиссия: {inc.commission}\nСлучай: {inc.kind}, {inc.severity} исход\n"
             f"Пострадавший: {w.full_name if w else '—'}\nМесто: {inc.location}\n"
             f"Обстоятельства: {inc.description}\nПричина: {cause}\n"
             f"Мероприятия по устранению: {measures}\n"
             f"Основание: ст. 229-231 ТК РФ, Приказ Минтруда России №776н от 20.04.2022")
    act_num = f'Н-1-{inc.id}-{inc.date.year}'
    act = (f"АКТ ФОРМЫ Н-1 О НЕСЧАСТНОМ СЛУЧАЕ НА ПРОИЗВОДСТВЕ\n№ {act_num} от {date.today():%d.%m.%Y}\n\n"
           f"Вид деятельности организации, момент происшествия: {inc.location}\n"
           f"Лица, проводившие расследование: {inc.commission}\n"
           f"Краткое изложение обстоятельств: {inc.description}\n"
           f"Причина несчастного случая: {cause}\n"
           f"Лица, допустившие нарушение: устанавливаются комиссией\n"
           f"Мероприятия по устранению: {measures}\n"
           f"Форма акта утверждена Приказом Минтруда России №776н от 20.04.2022")
    db.session.add(Document(doctype='Протокол расследования', title=f'Протокол №{num}', date=date.today(),
                            number=num, content=proto, incident_id=inc.id))
    db.session.add(Document(doctype='Акт формы Н-1', title=f'Акт №{act_num}', date=date.today(),
                            number=act_num, content=act, incident_id=inc.id))
    inc.status = 'Расследован'
    db.session.commit()
    flash('Протокол и акт формы Н-1 сформированы')
    return redirect(url_for('incidents'))


# ---------- документы ----------
@app.route('/documents')
@role_required('engineer')
def documents():
    items = Document.query.order_by(Document.date.desc(), Document.id.desc()).all()
    return render_template('documents.html', items=items)


@app.route('/documents/<int:did>/print')
@role_required('engineer')
def document_print(did):
    d = db.session.get(Document, did)
    if not d:
        abort(404)
    html = f"<html><head><meta charset='utf-8'><title>{d.title}</title></head><body style='font-family:serif;white-space:pre-wrap;padding:40px'>{d.content}</body></html>"
    return Response(html)


# ---------- экзамены по электробезопасности ----------
@app.route('/exams', methods=['GET', 'POST'])
@role_required('engineer')
def exams():
    if request.method == 'POST':
        d = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        grp = request.form.get('group', 'II')
        e = Exam(date=d, group=grp, chairman=request.form.get('chairman', ''),
                 members=request.form.get('members', ''), candidates=request.form.get('candidates', ''),
                 result=request.form.get('result', 'Все проверены'))
        # периодичность: 1 год для электротехнологических работ, иначе 3 года (п.2.4 ПОТ ЭЭ)
        months = 12 if grp in ('III', 'IV', 'V') else 36
        e.next_date = d + timedelta(days=months * 30)
        db.session.add(e); db.session.commit()
        num = f'ПЭ-{e.id}-{d.year}'
        content = (f"ПРОТОКОЛ проверки знаний по электробезопасности\n№ {num} от {d:%d.%m.%Y}\n\n"
                   f"Проверяемая группа: {grp} (комиссия работодателя)\n"
                   f"Председатель комиссии: {e.chairman}\nЧлены комиссии: {e.members}\n"
                   f"Работники, прошедшие проверку:\n" +
                   '\n'.join(f"- {c.strip()}" for c in e.candidates.split(';') if c.strip()) +
                   f"\n\nРезультат: {e.result}\nСрок следующей проверки: {e.next_date:%d.%m.%Y}\n"
                   f"Основание: Приказ Минтруда России №900н от 15.12.2020 (ПОТ ЭЭ), "
                   f"Приказ Минэнерго России №1062н от 22.09.2020 (ПОЭЭ)")
        doc = Document(doctype='Протокол экзамена ЭБ', title=f'Протокол №{num}', date=d,
                       number=num, content=content, exam_id=e.id)
        db.session.add(doc); db.session.commit()
        e.protocol_id = doc.id
        db.session.add(Task(title=f'Очередной экзамен по ЭБ (группа {grp})', kind='Экзамен ЭБ', due_date=e.next_date))
        db.session.commit()
        flash('Экзамен проведён, протокол сформирован автоматически')
        return redirect(url_for('exams'))
    items = Exam.query.order_by(Exam.date.desc()).all()
    return render_template('exams.html', items=items)


# ---------- СИЗ ----------
@app.route('/siz', methods=['GET', 'POST'])
@role_required('engineer')
def siz():
    if request.method == 'POST':
        s = SizIssue(worker_id=int(request.form['worker_id']), item=request.form['item'].strip(),
                     norm=request.form.get('norm', 'Типовые нормы'),
                     issue_date=datetime.strptime(request.form['issue_date'], '%Y-%m-%d').date(),
                     replace_period_m=int(request.form.get('replace_period_m') or 12))
        db.session.add(s); db.session.commit()
        db.session.add(Task(title=f'Замена СИЗ: {s.item} — {db.session.get(Worker, s.worker_id).full_name}',
                            kind='СИЗ', due_date=s.due_date(), worker_id=s.worker_id))
        db.session.commit()
        flash('Выдача СИЗ оформлена, задача контроля создана')
        return redirect(url_for('siz'))
    items = SizIssue.query.order_by(SizIssue.issue_date.desc()).all()
    return render_template('siz.html', items=items, workers=Worker.query.all())


@app.route('/siz/<int:sid>/close')
@role_required('engineer')
def siz_close(sid):
    s = db.session.get(SizIssue, sid)
    s.status = 'Списано/возврат'; db.session.commit()
    return redirect(url_for('siz'))


# ---------- календарь ----------
@app.route('/calendar')
@role_required('engineer')
def calendar():
    ym = request.args.get('ym') or date.today().strftime('%Y-%m')
    y, m = map(int, ym.split('-'))
    first = date(y, m, 1)
    days_in = (date(y + (m == 12), (m % 12) + 1, 1) - first).days
    cells = []
    for i in range(days_in):
        dcur = first + timedelta(days=i)
        ev = []
        for t in Task.query.filter_by(done=False).all():
            if t.due_date == dcur:
                ev.append(('📋 ' + t.title, t.priority))
        for tr in Training.query.filter_by(next_date=dcur).all():
            w = db.session.get(Worker, tr.worker_id)
            ev.append(('🎓 ' + tr.kind + ' — ' + (w.full_name if w else ''), 'Средний'))
        for s in SizIssue.query.filter_by(status='Выдано').all():
            if s.due_date() == dcur:
                w = db.session.get(Worker, s.worker_id)
                ev.append(('🦺 Замена СИЗ: ' + s.item + ' — ' + (w.full_name if w else ''), 'Средний'))
        for ex in Exam.query.filter_by(next_date=dcur).all():
            ev.append(('⚡ Экзамен ЭБ гр.' + ex.group, 'Высокий'))
        cells.append((dcur, ev))
    prev_ym = (first - timedelta(days=1)).strftime('%Y-%m')
    next_ym = (first + timedelta(days=days_in)).strftime('%Y-%m')
    return render_template('calendar.html', cells=cells, ym=ym, month_name=first.strftime('%B %Y'),
                           prev=prev_ym, next=next_ym)


# ---------- уведомления работнику ----------
@app.route('/notifications')
@login_required
def notifications():
    u = db.session.get(User, session['uid'])
    w = Worker.query.filter_by(user_id=u.id).first()
    tasks = []
    if w:
        tasks = Task.query.filter_by(done=False, worker_id=w.id).order_by(Task.due_date).all()
        for t in tasks:
            t.notified = True
        db.session.commit()
    return render_template('notifications.html', tasks=tasks, w=w)


# ---------- пользователи (админ) ----------
@app.route('/users', methods=['GET', 'POST'])
@role_required('admin')
def users():
    if request.method == 'POST':
        act = request.form.get('action')
        uid = int(request.form.get('uid', 0))
        u = db.session.get(User, uid) if uid else None
        if act == 'create':
            nu = User(username=request.form['username'].strip(), role=request.form.get('role', 'worker'),
                      full_name=request.form.get('full_name', ''), position=request.form.get('position', ''))
            nu.set_password(request.form.get('password', 'changeme'))
            db.session.add(nu); db.session.commit()
            flash('Пользователь создан')
        elif u:
            if act == 'grant':          # админ даёт право работнику
                u.extra_perm = True; u.perm_confirmed_by = None
                flash('Право выдано. Ожидает подтверждения инженером по ОТ')
            elif act == 'confirm':      # подтверждение инженером (доступно и админу как руководителю)
                if u.extra_perm:
                    u.perm_confirmed_by = session['uid']
                    flash('Права подтверждены')
            elif act == 'revoke':
                u.extra_perm = False; u.perm_confirmed_by = None
            elif act == 'toggle':
                u.enabled = not u.enabled
            elif act == 'role':
                u.role = request.form.get('role', u.role)
            db.session.commit()
        return redirect(url_for('users'))
    items = User.query.order_by(User.username).all()
    return render_template('users.html', items=items)


@app.route('/users/confirm/<int:uid>')
@role_required('engineer')
def user_confirm(uid):
    u = db.session.get(User, uid)
    if u and u.extra_perm:
        u.perm_confirmed_by = session['uid']
        db.session.commit()
        flash(f'Права пользователя {u.username} подтверждены инженером по ОТ')
    return redirect(url_for('users') if db.session.get(User, session['uid']).can('admin') else url_for('index'))


# ---------- профиль ----------
@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    u = db.session.get(User, session['uid'])
    if request.method == 'POST':
        u.full_name = request.form.get('full_name', u.full_name)
        if request.form.get('new_password'):
            u.set_password(request.form['new_password'])
        db.session.commit()
        flash('Профиль сохранён')
        return redirect(url_for('profile'))
    return render_template('profile.html', u=u)


@app.errorhandler(403)
def forbidden(e):
    return render_template('403.html'), 403


if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('ASUOT_PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
