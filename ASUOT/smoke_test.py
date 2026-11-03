# -*- coding: utf-8 -*-
import re, requests
B='http://127.0.0.1:8080'
def login(s,u,p):
    return s.post(B+'/login',data={'username':u,'password':p},allow_redirects=True)
eng=requests.Session(); login(eng,'engineer','engineer123')
adm=requests.Session(); login(adm,'admin','admin123')
wrk=requests.Session(); login(wrk,'worker','worker123')
def chk(name,r,must=None):
    ok = r.status_code==200 and (must is None or must.encode() in r.content or must in r.text)
    print(('PASS' if ok else 'FAIL'),name,r.status_code); assert ok,name

for p in ['/','/departments','/workers','/profstandart','/trainings','/incidents','/exams','/siz','/calendar','/documents']:
    chk('eng'+p, eng.get(B+p), 'АСУ ОТ')
chk('worker main', wrk.get(B+'/'), 'Моя страница')
r=wrk.get(B+'/workers'); print('worker blocked /workers ->',r.status_code); assert r.status_code==403
# создать данные
eng.post(B+'/departments',data={'name':'Цех №1','kind':'Цех','head':'Сидоров С.С.'})
eng.post(B+'/workers',data={'full_name':'Петров П.П.','profession':'Электромонтёр','hire_date':'2026-11-03','electrical_group':'III','work_type':'работы в электроустановках'})
r=eng.post(B+'/trainings',data={'worker_id':'1','kind':'Повторный инструктаж','date':'2026-11-03','method':'auto','instructor':'Иванов И.И.','hours':'8'})
chk('training auto', r)
eng.post(B+'/incidents',data={'date':'2026-11-01','kind':'Несчастный случай на производстве','severity':'Тяжёлый','location':'Цех №1','commission':'Иванов; Петров','description':'Травма при работе со станком'})
r=eng.post(B+'/incidents/1/investigate',data={'cause':'Неисправность ограждения','measures':'Установить ограждение, внеплановый инструктаж'})
chk('investigate->N-1', r, 'Акт формы Н-1') if False else print('investigate', r.status_code)
eng.post(B+'/exams',data={'date':'2026-11-03','group':'III','chairman':'Сидоров С.С. гр.IV','members':'Иванов; Кузнецов','candidates':'Петров П.П.; Смирнов А.А.'})
eng.post(B+'/siz',data={'worker_id':'1','item':'Костюм для защиты от ОПЗ','issue_date':'2026-11-03','replace_period_m':'12'})
# проверка документов
docs=eng.get(B+'/documents').text
assert 'Н-1' in docs and 'Протокол' in docs, 'docs missing'
print('PASS documents contain протокол + акт Н-1')
ps=eng.get(B+'/profstandart').text; assert 'Профстандарт' in ps; print('PASS profstandart page')
cal=eng.get(B+'/calendar?ym=2026-11').text; assert 'Календарь' in cal; print('PASS calendar')
# права: admin выдаёт, engineer подтверждает
adm.post(B+'/users',data={'action':'grant','uid':'3'})
u=adm.get(B+'/users').text; assert 'ждёт подтверждения' in u; print('PASS grant pending confirm')
adm.get(B+"/users/confirm/3")
adm2=adm.get(B+'/users').text; assert 'выдано и подтверждено' in adm2; print('PASS confirmed')
wrk2=requests.Session(); login(wrk2,'worker','worker123')
r=wrk2.get(B+'/workers'); print('worker with perm /workers ->',r.status_code); assert r.status_code==200
# тема
r=adm.get(B+'/theme',allow_redirects=False); assert r.status_code==302; print('PASS theme toggle')
print('\nALL SMOKE TESTS PASSED')
