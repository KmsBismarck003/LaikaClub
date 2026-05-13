import os
import subprocess
import time

def log(msg):
    with open("drop_tables.log", "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    print(msg)

mysql_exe = r"C:\xampp\mysql\bin\mysql.exe"
db_name = "laika_club3"

log(f"Dropping all tables in {db_name}...")

try:
    # Get table list
    cmd = [mysql_exe, "-u", "root", "-e", f"USE {db_name}; SHOW TABLES;"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"Error getting tables: {result.stderr}")
        exit(1)
    
    tables = result.stdout.strip().split('\n')[1:] # Skip header
    if not tables:
        log("No tables found.")
    else:
        log(f"Found {len(tables)} tables. Dropping them...")
        # Disable foreign key checks
        drop_cmd = "SET FOREIGN_KEY_CHECKS = 0; "
        for table in tables:
            drop_cmd += f"DROP TABLE IF EXISTS `{table.strip()}`; "
        drop_cmd += "SET FOREIGN_KEY_CHECKS = 1;"
        
        cmd = [mysql_exe, "-u", "root", "-e", f"USE {db_name}; {drop_cmd}"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            log("All tables dropped successfully.")
        else:
            log(f"Error dropping tables: {result.stderr}")

except Exception as e:
    log(f"Exception: {e}")
