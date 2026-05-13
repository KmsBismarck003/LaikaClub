import os, pymysql, bcrypt
from dotenv import load_dotenv
load_dotenv('.env')

conn = pymysql.connect(
    host=os.getenv('MYSQL_HOST','localhost'),
    user=os.getenv('MYSQL_USER','root'),
    password=os.getenv('MYSQL_PASSWORD',''),
    database=os.getenv('MYSQL_DATABASE','laika_club'),
    connect_timeout=5
)
c = conn.cursor()

target = 'usuario@laikaclub.com'
c.execute('SELECT id, email, role, password_hash, failed_attempts, lockout_until, status FROM users WHERE email=%s', (target,))
r = c.fetchone()

if r:
    print(f'ID: {r[0]} | Email: {r[1]} | Role: {r[2]} | Status: {r[6]}')
    print(f'Failed attempts: {r[4]} | Lockout: {r[5]}')
    ph = r[3]
    if ph:
        if isinstance(ph, (bytes, bytearray)):
            ph_bytes = ph
        else:
            ph_bytes = ph.encode('utf-8')
        
        print('Testeando contrasenas...')
        found = False
        for pwd in ['usuario123', 'usuario', 'admin123', '123456', 'password', 'Usuario123']:
            try:
                ok = bcrypt.checkpw(pwd.encode(), ph_bytes)
                status_str = 'OK' if ok else 'fail'
                print(f'  [{pwd}]: {status_str}')
                if ok:
                    found = True
            except Exception as e:
                print(f'  [{pwd}]: ERROR - {e}')
        
        if not found:
            print('\nNinguna contrasena conocida funcionó. Forzando reset a usuario123...')
            new_hash = bcrypt.hashpw('usuario123'.encode(), bcrypt.gensalt()).decode()
            c.execute('UPDATE users SET password_hash=%s, failed_attempts=0, lockout_until=NULL WHERE id=%s', (new_hash, r[0]))
            conn.commit()
            print('Hash actualizado. Contrasena ahora: usuario123')
    else:
        print('SIN password_hash en MySQL! Reseteando a usuario123...')
        new_hash = bcrypt.hashpw('usuario123'.encode(), bcrypt.gensalt()).decode()
        c.execute('UPDATE users SET password_hash=%s, failed_attempts=0, lockout_until=NULL WHERE id=%s', (new_hash, r[0]))
        conn.commit()
        print('Hash creado. Contrasena ahora: usuario123')
else:
    print(f'No encontrado: {target}')

# Tambien listar cuentas Google (social_provider)
print('\nCuentas con social_provider en MySQL:')
c.execute("SELECT email, role, social_provider FROM users WHERE social_provider IS NOT NULL LIMIT 10")
for row in c.fetchall():
    print(f'  {row[0]} | {row[1]} | provider: {row[2]}')

conn.close()
print('\nDone.')
