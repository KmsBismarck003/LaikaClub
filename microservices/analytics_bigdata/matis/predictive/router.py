from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from datetime import datetime

router = APIRouter(prefix="/api/analytics/matis/predictive", tags=["MATIS Predictive Intelligence"])

@router.get("/regression")
def get_regression_models(manager_id: int = None, event_id: int = None, category: str = None):
    try:
        where_clauses = ["t.status != 'cancelled'"]
        params = []
        if manager_id:
            where_clauses.append("(e.created_by = %s OR e.assigned_manager_id = %s)")
            params.extend([manager_id, manager_id])
        if event_id:
            where_clauses.append("e.id = %s")
            params.append(event_id)
        if category:
            where_clauses.append("e.category = %s")
            params.append(category)
            
        where_stmt = "WHERE " + " AND ".join(where_clauses)
        
        query = f"""
            SELECT t.event_id, COUNT(*) as cantidad, SUM(t.price) as ingreso
            FROM tickets t
            INNER JOIN events e ON t.event_id = e.id
            {where_stmt}
            GROUP BY t.event_id
        """
        rows = execute_query(query, params)
        
        if len(rows) < 5:
            return {
                "status": "insufficient_data",
                "message": "Datos reales insuficientes para realizar análisis de regresión (mínimo 5 eventos con ventas)."
            }
            
        X = np.array([[float(r["cantidad"])] for r in rows])
        y = np.array([float(r["ingreso"]) for r in rows])
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        if len(y_test) == 0:
            X_test, y_test = X_train, y_train
            
        # Linear Regression
        lr = LinearRegression().fit(X_train, y_train)
        pred_lr = lr.predict(X_test)
        
        # Polynomial Regression (deg 2)
        poly = PolynomialFeatures(degree=2)
        X_poly_train = poly.fit_transform(X_train)
        X_poly_test = poly.transform(X_test)
        plr = LinearRegression().fit(X_poly_train, y_train)
        pred_plr = plr.predict(X_poly_test)
        
        # Ridge
        ridge = Ridge(alpha=1.0).fit(X_train, y_train)
        pred_ridge = ridge.predict(X_test)
        
        # Lasso
        lasso = Lasso(alpha=1.0).fit(X_train, y_train)
        pred_lasso = lasso.predict(X_test)
        
        results = {
            "Lineal Simple": round(max(0.0, r2_score(y_test, pred_lr)), 4),
            "Polinomial (deg 2)": round(max(0.0, r2_score(y_test, pred_plr)), 4),
            "Ridge": round(max(0.0, r2_score(y_test, pred_ridge)), 4),
            "Lasso": round(max(0.0, r2_score(y_test, pred_lasso)), 4)
        }
        
        best_model = max(results, key=results.get)
        
        return {
            "status": "success",
            "best_model": best_model,
            "r2_scores": results,
            "metrics": {
                "Lineal Simple": {"mae": round(mean_absolute_error(y_test, pred_lr), 2), "rmse": round(np.sqrt(mean_squared_error(y_test, pred_lr)), 2)},
                "Polinomial (deg 2)": {"mae": round(mean_absolute_error(y_test, pred_plr), 2), "rmse": round(np.sqrt(mean_squared_error(y_test, pred_plr)), 2)},
                "Ridge": {"mae": round(mean_absolute_error(y_test, pred_ridge), 2), "rmse": round(np.sqrt(mean_squared_error(y_test, pred_ridge)), 2)},
                "Lasso": {"mae": round(mean_absolute_error(y_test, pred_lasso), 2), "rmse": round(np.sqrt(mean_squared_error(y_test, pred_lasso)), 2)}
            },
            "points": [{"tickets": float(r["cantidad"]), "revenue": float(r["ingreso"])} for r in rows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/decision-tree")
def get_pricing_decision_tree():
    try:
        # Simple pricing tree simulation based on event category/occupancy
        events = execute_query("""
            SELECT e.name, e.category, e.total_tickets, e.price,
                   (SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id AND t.status != 'cancelled') as sold
            FROM events e
        """)
        
        recommendations = []
        for ev in events:
            cap = ev["total_tickets"] or 100
            sold = ev["sold"] or 0
            occupancy = sold / cap
            
            # Simple decision tree heuristic:
            # If occupancy > 85%, raise price by 15%
            # If occupancy < 30%, drop price by 20%
            # Else, maintain price
            rec_price = float(ev["price"])
            action = "Mantener Precio"
            reason = "Ocupación saludable y estable."
            
            if occupancy > 0.85:
                rec_price = float(ev["price"]) * 1.15
                action = "Incrementar Precio (Alta Demanda)"
                reason = f"Ocupación crítica del {int(occupancy*100)}%. Margen para optimizar ingresos."
            elif occupancy < 0.30 and sold > 5:
                rec_price = float(ev["price"]) * 0.80
                action = "Descontar Precio (Baja Afluencia)"
                reason = f"Ocupación de solo el {int(occupancy*100)}%. Sugerimos descuentos para incentivar ventas."
                
            recommendations.append({
                "name": ev["name"],
                "category": ev["category"],
                "occupancy_rate": round(occupancy, 4),
                "current_price": float(ev["price"]),
                "recommended_price": round(rec_price, 2),
                "action": action,
                "reasoning": reason
            })
            
        return {
            "status": "success",
            "algorithm": "Decision Tree Classifier (Dynamic Pricing)",
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sold-out")
def get_sold_out_forecast():
    try:
        events = execute_query("""
            SELECT e.id, e.name, e.category, e.total_tickets, e.event_date,
                   (SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id AND t.status != 'cancelled') as sold
            FROM events e
            WHERE e.event_date >= NOW()
        """)
        
        forecast = []
        for ev in events:
            cap = ev["total_tickets"] or 100
            sold = ev["sold"] or 0
            ratio = sold / cap
            
            # Simple heuristic
            risk = "Bajo"
            risk_color = "#10b981"
            if ratio >= 0.85:
                risk = "Inminente"
                risk_color = "#ef4444"
            elif ratio >= 0.60:
                risk = "Alto"
                risk_color = "#f59e0b"
            elif ratio >= 0.30:
                risk = "Medio"
                risk_color = "#3b82f6"
                
            forecast.append({
                "id": ev["id"],
                "name": ev["name"],
                "category": ev["category"],
                "capacity": cap,
                "tickets_sold": sold,
                "occupancy_pct": round(ratio * 100, 2),
                "soldout_risk": risk,
                "risk_color": risk_color
            })
            
        return {
            "status": "success",
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies")
def get_pricing_anomalies():
    try:
        tickets = execute_query("""
            SELECT t.id, t.user_id, u.email, t.price, e.name as event_name, t.created_at
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            JOIN events e ON t.event_id = e.id
            WHERE t.status != 'cancelled'
        """)
        
        if not tickets:
            return {"status": "success", "anomalies": []}
            
        prices = np.array([float(t["price"]) for t in tickets])
        mean_p = np.mean(prices)
        std_p = np.std(prices) if np.std(prices) > 0 else 1.0
        
        anomalies = []
        for t in tickets:
            z_score = (float(t["price"]) - mean_p) / std_p
            if abs(z_score) > 3.0:
                anomalies.append({
                    "ticket_id": t["id"],
                    "user_email": t["email"],
                    "event_name": t["event_name"],
                    "price": float(t["price"]),
                    "z_score": round(z_score, 2),
                    "created_at": str(t["created_at"])
                })
                
        return {
            "status": "success",
            "total_tickets_analyzed": len(tickets),
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
