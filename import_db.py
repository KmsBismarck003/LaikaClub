import os
import subprocess
import time

def log(msg):
    with open("import_db.log", "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    print(msg)

mysql_exe = r"C:\xampp\mysql\bin\mysql.exe"
mysqladmin_exe = r"C:\xampp\mysql\bin\mysqladmin.exe"
sql_file = "laika_club.sql"
db_name = "laika_club3"

if os.path.exists("import_db.log"):
    os.remove("import_db.log")

log("Starting database import process...")

# Drop database
log(f"Dropping database {db_name} if it exists...")
try:
    cmd = [mysqladmin_exe, "-u", "root", "drop", db_name, "-f"]
    subprocess.run(cmd, capture_output=True, text=True)
    log("Drop command executed.")
except Exception as e:
    log(f"Error dropping database: {e}")

# Create database
log(f"Creating database {db_name}...")
try:
    cmd = [mysqladmin_exe, "-u", "root", "create", db_name]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        log(f"Database {db_name} created successfully.")
    else:
        log(f"Database {db_name} creation might have issues: {result.stderr}")
except Exception as e:
    log(f"Error creating database: {e}")

# Import SQL file
log(f"Importing {sql_file} into {db_name}...")
try:
    # Use shell=True for large files on Windows or pass file object to stdin
    # Passing file object is safer for memory
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
