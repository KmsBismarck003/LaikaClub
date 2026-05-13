import os
import re

def get_python_imports(directory):
    imports = set()
    # Match imports like: import package, from package import ...
    import_re = re.compile(r"^\s*(?:import|from)\s+([a-zA-Z0-9_]+)", re.MULTILINE)
    
    for root, dirs, files in os.walk(directory):
        if 'venv' in root or '.venv' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        matches = import_re.findall(content)
                        for pkg in matches:
                            imports.add(pkg)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return imports

root_dir = r'c:\Users\redja\Music\LaikaClub'
py_imports = get_python_imports(root_dir)

# Map common import names to package names
import_to_pkg = {
    'PIL': 'Pillow',
    'jose': 'python-jose',
    'dotenv': 'python-dotenv',
    'jwt': 'PyJWT',
    'bson': 'pymongo',
    'gridfs': 'pymongo',
    'mysql': 'PyMySQL',
    'pyspark': 'pyspark',
    'sklearn': 'scikit-learn',
    'yaml': 'PyYAML',
    'smtplib': None, # standard library
    'email': None,
    'json': None,
    'os': None,
    'sys': None,
    'time': None,
    'datetime': None,
    're': None,
    'hashlib': None,
    'uuid': None,
    'abc': None,
    'typing': None,
    'enum': None,
    'logging': None,
    'asyncio': None,
    'threading': None,
    'multiprocessing': None,
    'subprocess': None,
    'shutil': None,
    'tempfile': None,
    'pathlib': None,
    'base64': None,
    'collections': None,
    'itertools': None,
    'functools': None,
    'operator': None,
    'math': None,
    'random': None,
    'statistics': None,
    'decimal': None,
    'fractions': None,
    'pickle': None,
    'copy': None,
    'inspect': None,
    'traceback': None,
    'contextlib': None,
    'warnings': None,
    'unittest': None,
    'pytest': 'pytest',
    'requests': 'requests',
    'fastapi': 'fastapi',
    'pydantic': 'pydantic',
    'sqlalchemy': 'SQLAlchemy',
    'uvicorn': 'uvicorn',
    'httpx': 'httpx',
    'pandas': 'pandas',
    'numpy': 'numpy',
    'matplotlib': 'matplotlib',
    'seaborn': 'seaborn',
    'scipy': 'scipy',
    'redis': 'redis',
    'celery': 'celery',
    'pika': 'pika',
    'psycopg2': 'psycopg2-binary',
    'motor': 'motor',
    'jinja2': 'jinja2',
    'passlib': 'passlib',
    'bcrypt': 'bcrypt',
    'cryptography': 'cryptography',
    'reportlab': 'reportlab',
    'openpyxl': 'openpyxl',
    'psutil': 'psutil',
    'google': 'google-auth',
    'aiosmtplib': 'aiosmtplib'
}

stdlib = {
    'abc', 'argparse', 'ast', 'asyncio', 'base64', 'collections', 'concurrent', 'contextlib', 'copy', 'csv', 'ctypes', 
    'datetime', 'decimal', 'difflib', 'dis', 'email', 'enum', 'errno', 'faulthandler', 'filecmp', 'fileinput', 'fnmatch', 
    'fractions', 'ftplib', 'functools', 'gc', 'getopt', 'getpass', 'gettext', 'glob', 'grp', 'gzip', 'hashlib', 'heapq', 
    'hmac', 'html', 'http', 'imaplib', 'inspect', 'io', 'ipaddress', 'itertools', 'json', 'keyword', 'lib2to3', 'linecache', 
    'locale', 'logging', 'lzma', 'mailbox', 'mailcap', 'marshal', 'math', 'mimetypes', 'mmap', 'modulefinder', 'multiprocessing', 
    'netrc', 'nntplib', 'ntpath', 'numbers', 'operator', 'optparse', 'os', 'pathlib', 'pdb', 'pickle', 'pipes', 'pkgutil', 
    'platform', 'plistlib', 'poplib', 'posixpath', 'pprint', 'profile', 'pstats', 'pty', 'pwd', 'py_compile', 'pyclbr', 
    'pydoc', 'queue', 'quopri', 'random', 're', 'readline', 'reprlib', 'resource', 'rlcompleter', 'runpy', 'sched', 'select', 
    'selectors', 'shelve', 'shlex', 'shutil', 'signal', 'site', 'smtpd', 'smtplib', 'sndhdr', 'socket', 'socketserver', 
    'spwd', 'sqlite3', 'ssl', 'stat', 'statistics', 'string', 'stringprep', 'struct', 'subprocess', 'sunau', 'symbol', 
    'symtable', 'sys', 'sysconfig', 'syslog', 'tabnanny', 'tarfile', 'telnetlib', 'tempfile', 'termios', 'test', 'textwrap', 
    'threading', 'time', 'timeit', 'token', 'tokenize', 'trace', 'traceback', 'tracemalloc', 'tty', 'types', 'typing', 
    'unicodedata', 'unittest', 'urllib', 'uu', 'uuid', 'venv', 'warnings', 'wave', 'weakref', 'webbrowser', 'wsgiref', 
    'xdrlib', 'xml', 'xmlrpc', 'zipapp', 'zipfile', 'zipimport', 'zlib'
}

# Add local packages
local_packages = {'microservices', 'common', 'models', 'schemas', 'utils', 'services', 'config', 'core', 'db', 'crud', 'api', 'routers', 'auth', 'tickets', 'events', 'admin', 'achievements', 'analytics_bigdata', 'merchandise', 'stats'}

req_path = r'c:\Users\redja\Music\LaikaClub\requirements.txt'
with open(req_path, 'r') as f:
    current_reqs = {line.split('==')[0].split('>=')[0].strip().lower() for line in f if line.strip() and not line.startswith('#')}

found_pkgs = set()
for imp in py_imports:
    if imp.lower() in stdlib or imp in local_packages:
        continue
    pkg = import_to_pkg.get(imp, imp)
    if pkg:
        found_pkgs.add(pkg.lower())

missing = found_pkgs - current_reqs

print("Python imports found (potential packages):")
print(sorted(list(found_pkgs)))
print("\nCurrent requirements:")
print(sorted(list(current_reqs)))
print("\nPotentially missing from requirements.txt:")
print(sorted(list(missing)))
