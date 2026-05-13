import os
import subprocess
import time

def log(msg):
    with open("import_db_v3_final.log", "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    print(msg)

mysql_exe = r"C:\xampp\mysql\bin\mysql.exe"
mysqladmin_exe = r"C:\xampp\mysql\bin\mysqladmin.exe"
sql_file = "laika_club3_v2.sql"
db_name = "laika_club3_v2"

if os.path.exists("import_db_v3_final.log"):
    os.remove("import_db_v3_final.log")

log("Starting database import process for laika_club3_v2...")

# Create database if it doesn't exist
log(f"Creating database {db_name} if it doesn't exist...")
try:
    cmd = [mysqladmin_exe, "-u", "root", "create", db_name]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        log(f"Database {db_name} created successfully.")
    else:
        if "already exists" in result.stderr:
            log(f"Database {db_name} already exists.")
        else:
            log(f"Database {db_name} creation might have issues: {result.stderr}")
except Exception as e:
    log(f"Error creating database: {e}")

# Import SQL file
log(f"Importing {sql_file} into {db_name}...")
try:
    with open(sql_file, "r", encoding="utf-8", errors="ignore") as f:
        cmd = [mysql_exe, "-u", "root", db_name]
        result = subprocess.run(cmd, stdin=f, capture_output=True, text=True)
        
    if result.returncode == 0:
        log("Import completed successfully.")
    else:
        log(f"Import failed with return code {result.returncode}")
        log(f"Error: {result.stderr}")
except Exception as e:
    log(f"Exception during import: {e}")

log("Process finished.")
