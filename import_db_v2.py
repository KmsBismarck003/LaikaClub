import os
import subprocess
import time

def log(msg):
    with open("import_db_v2.log", "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    print(msg)

mysql_exe = r"C:\xampp\mysql\bin\mysql.exe"
mysqladmin_exe = r"C:\xampp\mysql\bin\mysqladmin.exe"
sql_file = "laika_club.sql"
db_name = "laika_club3_v2"

if os.path.exists("import_db_v2.log"):
    os.remove("import_db_v2.log")

log(f"Starting database import process for {db_name} with FK checks disabled...")

# Create database (if it doesn't exist)
log(f"Ensuring database {db_name} exists...")
subprocess.run([mysqladmin_exe, "-u", "root", "create", db_name], capture_output=True)

# Import SQL file with FK checks disabled
log(f"Importing {sql_file} into {db_name}...")
try:
    # We'll use a temporary file to wrap the SQL with FK check disabling
    temp_sql = "import_temp.sql"
    with open(temp_sql, "w", encoding="utf-8") as out:
        out.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        with open(sql_file, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                out.write(line)
        out.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")
    
    with open(temp_sql, "r", encoding="utf-8") as f:
        cmd = [mysql_exe, "-u", "root", db_name]
        result = subprocess.run(cmd, stdin=f, capture_output=True, text=True)
        
    if result.returncode == 0:
        log("Import completed successfully.")
    else:
        log(f"Import failed with return code {result.returncode}")
        log(f"Error: {result.stderr}")
    
    os.remove(temp_sql)
except Exception as e:
    log(f"Exception during import: {e}")

log("Process finished.")
