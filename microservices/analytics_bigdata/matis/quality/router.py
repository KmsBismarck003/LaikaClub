from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query, execute_update
import math

router = APIRouter(prefix="/api/analytics/matis/quality", tags=["MATIS Data Quality"])

@router.get("/integrity-score")
def get_integrity_score():
    try:
        tables = ["users", "events", "tickets", "payments"]
        details = {}
        total_score = 0
        
        for table in tables:
            # 1. Total rows
            rows = execute_query(f"SELECT COUNT(*) as count FROM {table}")
            total_rows = rows[0]["count"] if rows else 0
            
            if total_rows == 0:
                details[table] = {"total_records": 0, "null_fields": 0, "duplicates": 0, "score": 100}
                total_score += 100
                continue
                
            # 2. Check nulls in critical columns
            null_count = 0
            if table == "users":
                res = execute_query("SELECT COUNT(*) as count FROM users WHERE email IS NULL OR role IS NULL")
                null_count = res[0]["count"] if res else 0
            elif table == "events":
                res = execute_query("SELECT COUNT(*) as count FROM events WHERE name IS NULL OR category IS NULL OR price IS NULL")
                null_count = res[0]["count"] if res else 0
            elif table == "tickets":
                res = execute_query("SELECT COUNT(*) as count FROM tickets WHERE user_id IS NULL OR event_id IS NULL OR price IS NULL")
                null_count = res[0]["count"] if res else 0
            elif table == "payments":
                res = execute_query("SELECT COUNT(*) as count FROM payments WHERE user_id IS NULL OR amount IS NULL")
                null_count = res[0]["count"] if res else 0

            # 3. Check duplicate IDs
            dup_count = 0
            if table in ["users", "events", "tickets", "payments"]:
                res = execute_query(f"SELECT COUNT(id) - COUNT(DISTINCT id) as count FROM {table}")
                dup_count = res[0]["count"] if res else 0
                
            # Calculate quality score (0 to 100)
            null_penalty = (null_count / total_rows) * 50
            dup_penalty = (dup_count / total_rows) * 50
            score = max(0, min(100, int(100 - null_penalty - dup_penalty)))
            
            details[table] = {
                "total_records": total_rows,
                "null_fields": null_count,
                "duplicates": dup_count,
                "score": score
            }
            total_score += score
            
        avg_score = int(total_score / len(tables))
        return {
            "status": "success",
            "global_integrity_score": avg_score,
            "details": details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clean")
def run_clean(table: str = "tickets"):
    if table not in ["tickets", "users", "payments", "events"]:
        raise HTTPException(status_code=400, detail="Invalid table name")
        
    try:
        imputed = 0
        deduplicated = 0
        
        if table == "tickets":
            # Impute empty/null ticket types to 'GENERAL'
            imputed = execute_update("UPDATE tickets SET ticket_type = 'GENERAL' WHERE ticket_type IS NULL OR ticket_type = ''")
            # Impute negative or null prices to average price
            avg_res = execute_query("SELECT AVG(price) as avg_p FROM tickets WHERE price > 0")
            avg_p = avg_res[0]["avg_p"] or 250.0
            imputed += execute_update("UPDATE tickets SET price = %s WHERE price IS NULL OR price <= 0", (avg_p,))
            
        elif table == "events":
            # Impute null categories to 'other'
            imputed = execute_update("UPDATE events SET category = 'other' WHERE category IS NULL OR category = ''")
            # Impute null capacities to 500
            imputed += execute_update("UPDATE events SET total_tickets = 500 WHERE total_tickets IS NULL OR total_tickets <= 0")
            
        elif table == "payments":
            # Impute null payment methods to 'credit_card'
            imputed = execute_update("UPDATE payments SET payment_method = 'credit_card' WHERE payment_method IS NULL OR payment_method = ''")
            
        elif table == "users":
            # Impute null roles to 'USUARIO'
            imputed = execute_update("UPDATE users SET role = 'USUARIO' WHERE role IS NULL OR role = ''")

        return {
            "status": "success",
            "table_cleaned": table,
            "records_imputed": imputed,
            "records_deduplicated": deduplicated,
            "message": f"Saneamiento KDD completado para la tabla {table}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
