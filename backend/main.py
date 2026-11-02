"""
АСУ Охрана труда - Backend на FastAPI
Полный backend в одном файле для простоты развертывания на Windows
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Загрузка конфигурации
load_dotenv()

# ===== КОНФИГУРАЦИЯ =====
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/rcs_ot.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ===== БАЗА ДАННЫХ =====
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===== МОДЕЛИ БАЗЫ ДАННЫХ =====
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    email = Column(String)
    role = Column(String)
    department = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Module(Base):
    __tablename__ = "modules"
    id = Column(String, primary_key=True)
    name = Column(String)
    version = Column(String)
    status = Column(String, default="active")
    description = Column(Text)
    author = Column(String)
    installed_at = Column(DateTime, default=datetime.utcnow)
    enabled_at = Column(DateTime, nullable=True)
    permissions = Column(JSON)
    settings = Column(JSON)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    method = Column(String)
    pattern = Column(String)
    handler = Column(String)
    module_id = Column(String)
    required_roles = Column(JSON)
    active = Column(Boolean, default=True)
    priority = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True)
    type = Column(String)
    date = Column(String)
    time = Column(String)
    location = Column(String)
    department = Column(String)
    description = Column(Text)
    involved = Column(JSON)
    severity = Column(String)
    status = Column(String)
    investigator = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)

class Training(Base):
    __tablename__ = "trainings"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    title = Column(String)
    date = Column(String)
    instructor = Column(String)
    participants = Column(JSON)
    department = Column(String)
    status = Column(String)
    duration = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)

class PPEIssuance(Base):
    __tablename__ = "ppe_issuances"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    worker_id = Column(Integer)
    worker_name = Column(String)
    items = Column(JSON)
    department = Column(String)
    issued_by = Column(String)
    next_replacement = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class MedExam(Base):
    __tablename__ = "med_exams"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer)
    worker_name = Column(String)
    type = Column(String)
    scheduled_date = Column(String)
    completed_date = Column(String, nullable=True)
    result = Column(String, nullable=True)
    doctor = Column(String)
    department = Column(String)
    status = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer)
    username = Column(String)
    action = Column(String)
    resource = Column(String)
    details = Column(Text)
    ip_address = Column(String)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    title = Column(String)
    message = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, nullable=True)

class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(String)
    description = Column(Text)
    category = Column(String)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# ===== PYDANTIC СХЕМЫ =====
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    department: str
    active: bool
    created_at: datetime
    last_login: Optional[datetime]
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    role: str
    department: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    active: Optional[bool] = None

class IncidentCreate(BaseModel):
    type: str
    date: str
    time: str
    location: str
    department: str
    description: str
    involved: List[str]
    severity: str
    investigator: str = ""

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    investigator: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    number: str
    type: str
    date: str
    time: str
    location: str
    department: str
    description: str
    involved: List[str]
    severity: str
    status: str
    investigator: str
    created_at: datetime
    class Config:
        from_attributes = True

class TrainingCreate(BaseModel):
    type: str
    title: str
    date: str
    instructor: str
    participants: List[str]
    department: str
    duration: int
    notes: str = ""
    status: str = "scheduled"

class TrainingResponse(BaseModel):
    id: int
    type: str
    title: str
    date: str
    instructor: str
    participants: List[str]
    department: str
    status: str
    duration: int
    notes: str
    created_at: datetime
    class Config:
        from_attributes = True

class PPEIssuanceCreate(BaseModel):
    date: str
    worker_id: int
    worker_name: str
    items: List[dict]
    department: str
    issued_by: str
    next_replacement: str
    notes: str = ""

class PPEIssuanceResponse(BaseModel):
    id: int
    date: str
    worker_id: int
    worker_name: str
    items: List[dict]
    department: str
    issued_by: str
    next_replacement: str
    notes: str
    created_at: datetime
    class Config:
        from_attributes = True

class MedExamCreate(BaseModel):
    worker_id: int
    worker_name: str
    type: str
    scheduled_date: str
    doctor: str
    department: str
    status: str = "scheduled"
    completed_date: Optional[str] = None
    result: Optional[str] = None
    notes: str = ""

class MedExamResponse(BaseModel):
    id: int
    worker_id: int
    worker_name: str
    type: str
    scheduled_date: str
    completed_date: Optional[str]
    result: Optional[str]
    doctor: str
    department: str
    status: str
    notes: str
    created_at: datetime
    class Config:
        from_attributes = True

class ModuleResponse(BaseModel):
    id: str
    name: str
    version: str
    status: str
    description: str
    author: str
    installed_at: datetime
    enabled_at: Optional[datetime]
    permissions: List[str]
    settings: dict
    class Config:
        from_attributes = True

class RouteCreate(BaseModel):
    method: str
    pattern: str
    handler: str
    module_id: str
    required_roles: List[str]
    active: bool = True
    priority: int = 10

class RouteUpdate(BaseModel):
    method: Optional[str] = None
    pattern: Optional[str] = None
    handler: Optional[str] = None
    required_roles: Optional[List[str]] = None
    active: Optional[bool] = None
    priority: Optional[int] = None

class RouteResponse(BaseModel):
    id: int
    method: str
    pattern: str
    handler: str
    module_id: str
    required_roles: List[str]
    active: bool
    priority: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_id: int
    username: str
    action: str
    resource: str
    details: str
    ip_address: str
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class SettingResponse(BaseModel):
    key: str
    value: str
    description: str
    category: str
    class Config:
        from_attributes = True

class SettingUpdate(BaseModel):
    value: str

# ===== УТИЛИТЫ =====
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== AUTH =====
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def get_current_user(db: Session = Depends(get_db), token: str = Depends(lambda: None)):
    from fastapi import Header
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Получаем токен из заголовка
    auth_header = token
    if not auth_header:
        raise credentials_exception
    
    try:
        payload = jwt.decode(auth_header, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# ===== FASTAPI APP =====
app = FastAPI(title="АСУ Охрана труда", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Монтирование статических файлов
if os.path.exists("dist"):
    app.mount("/static", StaticFiles(directory="dist/static"), name="static")

# ===== ENDPOINTS =====

@app.post("/api/auth/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    if not user.active:
        raise HTTPException(status_code=403, detail="Пользователь заблокирован")
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Аудит
    audit = AuditLog(
        user_id=user.id,
        username=user.username,
        action="USER_LOGIN",
        resource="auth",
        details=f"Пользователь {user.full_name} вошёл в систему",
        ip_address="127.0.0.1"
    )
    db.add(audit)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/users")
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(User).offset(skip).limit(limit).all()

@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        department=user.department
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.put("/api/users/{user_id}")
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/incidents")
def get_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Incident).offset(skip).limit(limit).all()

@app.post("/api/incidents")
def create_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    # Генерация номера
    year = datetime.utcnow().year
    count = db.query(Incident).count() + 1
    number = f"INC-{year}-{count:03d}"
    
    db_incident = Incident(
        number=number,
        type=incident.type,
        date=incident.date,
        time=incident.time,
        location=incident.location,
        department=incident.department,
        description=incident.description,
        involved=incident.involved,
        severity=incident.severity,
        status="registered",
        investigator=incident.investigator
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.put("/api/incidents/{incident_id}")
def update_incident(incident_id: int, incident: IncidentUpdate, db: Session = Depends(get_db)):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Инцидент не найден")
    
    for key, value in incident.dict(exclude_unset=True).items():
        setattr(db_incident, key, value)
    
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.get("/api/trainings")
def get_trainings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Training).offset(skip).limit(limit).all()

@app.post("/api/trainings")
def create_training(training: TrainingCreate, db: Session = Depends(get_db)):
    db_training = Training(**training.dict())
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

@app.get("/api/ppe")
def get_ppe(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(PPEIssuance).offset(skip).limit(limit).all()

@app.post("/api/ppe")
def create_ppe(issuance: PPEIssuanceCreate, db: Session = Depends(get_db)):
    db_issuance = PPEIssuance(**issuance.dict())
    db.add(db_issuance)
    db.commit()
    db.refresh(db_issuance)
    return db_issuance

@app.get("/api/med-exams")
def get_med_exams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(MedExam).offset(skip).limit(limit).all()

@app.post("/api/med-exams")
def create_med_exam(exam: MedExamCreate, db: Session = Depends(get_db)):
    db_exam = MedExam(**exam.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@app.get("/api/modules")
def get_modules(db: Session = Depends(get_db)):
    return db.query(Module).all()

@app.put("/api/modules/{module_id}/toggle")
def toggle_module(module_id: str, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Модуль не найден")
    
    module.status = "inactive" if module.status == "active" else "active"
    module.enabled_at = datetime.utcnow() if module.status == "active" else None
    db.commit()
    
    return {"status": module.status}

@app.get("/api/routes")
def get_routes(db: Session = Depends(get_db)):
    return db.query(Route).all()

@app.post("/api/routes")
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    db_route = Route(**route.dict())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@app.put("/api/routes/{route_id}")
def update_route(route_id: int, route: RouteUpdate, db: Session = Depends(get_db)):
    db_route = db.query(Route).filter(Route.id == route_id).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Маршрут не найден")
    
    for key, value in route.dict(exclude_unset=True).items():
        setattr(db_route, key, value)
    
    db_route.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_route)
    return db_route

@app.delete("/api/routes/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    db_route = db.query(Route).filter(Route.id == route_id).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Маршрут не найден")
    
    db.delete(db_route)
    db.commit()
    return {"status": "deleted"}

@app.get("/api/audit")
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(50).all()

@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.read = True
        db.commit()
    return {"status": "ok"}

@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    return db.query(Setting).all()

@app.put("/api/settings/{key}")
def update_setting(key: str, setting: SettingUpdate, db: Session = Depends(get_db)):
    db_setting = db.query(Setting).filter(Setting.key == key).first()
    if not db_setting:
        raise HTTPException(status_code=404, detail="Настройка не найдена")
    
    db_setting.value = setting.value
    db.commit()
    return {"status": "ok"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return {
        "incidents_open": db.query(Incident).filter(Incident.status != "closed").count(),
        "trainings_scheduled": db.query(Training).filter(Training.status == "scheduled").count(),
        "ppe_issued": db.query(PPEIssuance).count(),
        "medexams_overdue": db.query(MedExam).filter(MedExam.status == "overdue").count(),
        "modules_active": db.query(Module).filter(Module.status == "active").count(),
        "routes_active": db.query(Route).filter(Route.active == True).count()
    }

@app.get("/favicon.ico")
async def favicon():
    # Возвращаем пустой ответ для favicon
    from fastapi.responses import Response
    return Response(content=b"", media_type="image/x-icon")

@app.get("/")
async def serve_frontend():
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    return {"message": "Frontend not built. Run 'npm run build' first."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ===== ИНИЦИАЛИЗАЦИЯ ДАННЫХ =====
def init_data():
    """Инициализация начальных данных"""
    db = SessionLocal()
    
    # Проверка, есть ли уже данные
    if db.query(User).count() > 0:
        db.close()
        return
    
    # Создание администратора
    admin = User(
        username="admin",
        password_hash=get_password_hash("admin123"),
        full_name="Иванов Алексей Петрович",
        email="admin@example.com",
        role="admin",
        department="ИТ"
    )
    db.add(admin)
    
    # Создание инженера по ОТ
    safety = User(
        username="safety",
        password_hash=get_password_hash("safety123"),
        full_name="Петрова Мария Сергеевна",
        email="safety@example.com",
        role="safety-engineer",
        department="Охрана труда"
    )
    db.add(safety)
    
    # Создание модулей
    modules = [
        Module(
            id="safety-incidents",
            name="Инциденты",
            version="1.2.0",
            status="active",
            description="Регистрация и расследование инцидентов",
            author="RCS Team",
            enabled_at=datetime.utcnow(),
            permissions=["incidents.view", "incidents.create", "incidents.edit"],
            settings={}
        ),
        Module(
            id="trainings",
            name="Инструктажи",
            version="1.1.0",
            status="active",
            description="Учёт инструктажей по охране труда",
            author="RCS Team",
            enabled_at=datetime.utcnow(),
            permissions=["trainings.view", "trainings.create"],
            settings={}
        ),
        Module(
            id="ppe",
            name="СИЗ",
            version="1.0.0",
            status="active",
            description="Учёт выдачи СИЗ",
            author="RCS Team",
            enabled_at=datetime.utcnow(),
            permissions=["ppe.view", "ppe.issue"],
            settings={}
        ),
        Module(
            id="med-exams",
            name="Медосмотры",
            version="0.9.0",
            status="active",
            description="Планирование медосмотров",
            author="RCS Team",
            enabled_at=datetime.utcnow(),
            permissions=["medexams.view", "medexams.schedule"],
            settings={}
        ),
        Module(
            id="sout",
            name="СОУТ",
            version="1.0.0",
            status="inactive",
            description="Специальная оценка условий труда",
            author="RCS Team",
            permissions=["sout.view", "sout.manage"],
            settings={}
        )
    ]
    db.add_all(modules)
    
    # Создание маршрутов
    routes = [
        Route(method="GET", pattern="/api/v1/incidents", handler="safety-incidents::IncidentController::list", module_id="safety-incidents", required_roles=["admin", "safety-engineer"], priority=10),
        Route(method="POST", pattern="/api/v1/incidents", handler="safety-incidents::IncidentController::create", module_id="safety-incidents", required_roles=["admin", "safety-engineer"], priority=10),
        Route(method="GET", pattern="/api/v1/trainings", handler="trainings::TrainingController::list", module_id="trainings", required_roles=["admin", "safety-engineer"], priority=10),
    ]
    db.add_all(routes)
    
    # Создание настроек
    settings = [
        Setting(key="company_name", value="ООО Пример", description="Название организации", category="Общие"),
        Setting(key="timezone", value="Europe/Moscow", description="Часовой пояс", category="Общие"),
        Setting(key="session_timeout", value="30", description="Таймаут сессии (минуты)", category="Безопасность"),
    ]
    db.add_all(settings)
    
    db.commit()
    db.close()
    print("✓ Начальные данные инициализированы")

if __name__ == "__main__":
    import uvicorn
    init_data()
    uvicorn.run(app, host="0.0.0.0", port=8000)
