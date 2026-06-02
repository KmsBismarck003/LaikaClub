from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db, engine
from .security import get_current_user
from .schemas import TicketPurchase, TicketVerify
from . import controller
from . import transfer as transfer_ctrl

app = FastAPI(title="Laika Ticket Service", version="1.0.0")

@app.on_event("startup")
def _startup():
    """Ejecuta migraciones incrementales al arrancar el servicio."""
    transfer_ctrl.ensure_transfer_table(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "alive", "service": "ticket-service"}

@app.get("/my-tickets")
async def my_tickets(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return await controller.get_user_tickets(db, user['id'])

@app.post("/verify")
def verify_ticket(data: TicketVerify, db: Session = Depends(get_db)):
    return controller.verify_ticket(db, data.ticketCode)

@app.post("/redeem")
def redeem_ticket(data: TicketVerify, db: Session = Depends(get_db)):
    return controller.redeem_ticket(db, data.ticketCode)

@app.get("/busy-seats/{event_id}")
def busy_seats(event_id: int, function_id: int = None, db: Session = Depends(get_db)):
    return controller.get_busy_seats(db, event_id, function_id)

@app.post("/purchase")
async def purchase(data: TicketPurchase, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return await controller.purchase_tickets(db, user['id'], data.items, data.paymentMethod)

@app.post("/payments/create-intent")
def create_payment_intent(data: dict, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return controller.create_payment_intent(db, user['id'], data.get("amount"), data.get("event_id"), data.get("method", "card"))

@app.post("/payments/{reference}/confirm")
async def confirm_payment(reference: str, db: Session = Depends(get_db)):
    return await controller.confirm_payment(db, reference)

@app.post("/refund")
def refund(data: dict, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    ticket_id = data.get("ticket_id")
    if not ticket_id:
        raise HTTPException(status_code=400, detail="ticket_id requerido")
    return controller.process_refund(db, user['id'], ticket_id)

@app.get("/refund/my-refunds")
async def get_my_refunds(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return await controller.get_user_refunds(db, user['id'])

@app.post("/refund/request")
def request_refund(data: dict, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    ticket_id = data.get("ticket_id") or data.get("ticketId")
    if not ticket_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="ticket_id requerido")
    return controller.process_refund(db, user['id'], ticket_id)

@app.post("/lucky-seat/assign")
async def assign_lucky_seat(data: dict, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    event_id = data.get("event_id")
    if not event_id:
        raise HTTPException(status_code=400, detail="event_id es requerido")
    return await controller.assign_lucky_seat(db, user['id'], event_id)


# ── TRANSFERENCIA SEGURA DE BOLETOS ──────────────────────────────────────────

@app.post("/transfer/initiate")
async def initiate_transfer(
    data: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Genera token temporal de transferencia tras verificar contraseña del usuario."""
    ticket_id = data.get("ticket_id")
    password  = data.get("password", "")
    if not ticket_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="ticket_id requerido")
    return await transfer_ctrl.initiate_transfer(db, user['id'], ticket_id, password)


@app.get("/transfer/{token}")
async def get_transfer_info(token: str, db: Session = Depends(get_db)):
    """Info pública del boleto para que el receptor decida si aceptar."""
    return await transfer_ctrl.get_transfer_info(db, token)


@app.post("/transfer/{token}/claim")
def claim_transfer(
    token: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Reclama el boleto: invalida QR viejo, crea nuevo en la cuenta del receptor."""
    return transfer_ctrl.claim_transfer(db, token, user['id'])


# ── BOLETOS GRATUITOS (sin carrito ni pasarela) ──────────────────────────────

@app.post("/free")
async def claim_free_ticket(
    data: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Adquiere un boleto gratuito directamente, sin pasar por la pasarela de pagos.
    El evento DEBE tener precio 0 o flag is_free=true; el backend valida esto
    consultando el servicio de eventos.
    """
    event_id     = data.get("eventId") or data.get("event_id")
    section_name = data.get("sectionName") or data.get("section_name", "General")
    section_id   = data.get("sectionId") or data.get("section_id")
    function_id  = data.get("functionId") or data.get("function_id")
    seat_id      = data.get("seatId") or data.get("seat_id")

    if not event_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="event_id requerido")

    # Validar que el evento es realmente gratuito
    import httpx, os
    EVENT_URL = os.getenv("EVENTS_SERVICE_URL", "http://localhost:8002")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{EVENT_URL}/{event_id}")
            if resp.status_code == 200:
                ev = resp.json()
                price = float(ev.get("price") or 0)
                is_free = ev.get("is_free", False) or price == 0
                if not is_free:
                    from fastapi import HTTPException
                    raise HTTPException(
                        status_code=403,
                        detail="Este evento no es gratuito. Usa el flujo de pago normal."
                    )
    except Exception as exc:
        # Si no podemos verificar, rechazamos por seguridad
        if hasattr(exc, 'status_code'):
            raise
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="No se pudo verificar el evento")

    items = [{
        "eventId":      event_id,
        "seatId":       seat_id,
        "sectionName":  section_name,
        "price":        0,
        "functionId":   function_id,
    }]
    result = await controller.purchase_tickets(db, user['id'], items, payment_method="free")
    return {"status": "success", "message": "Entrada gratuita registrada", "tickets": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
