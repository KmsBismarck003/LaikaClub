import os

input_file = "data/laika_club_database.sql"
output_file = "data/import_ready.sql"

print(f"[*] Cleaning {input_file} for import...")

try:
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f_in:
        with open(output_file, 'w', encoding='utf-8') as f_out:
            for line in f_in:
                # Remove database-level commands that cause issues with existing folders
                if "DROP DATABASE" in line or "CREATE DATABASE" in line or "USE `laika_club`" in line:
                    continue
                f_out.write(line)
    print(f"[OK] Created {output_file}")
except Exception as e:
    print(f"[ERROR] Failed to clean SQL: {e}")
