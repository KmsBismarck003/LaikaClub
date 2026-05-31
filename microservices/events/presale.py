"""
presale.py — Lógica de negocio aislada para preventas exclusivas por banco.

Responsabilidad única: determinar si un evento está en preventa y si un BIN es válido.
No tiene dependencias de FastAPI ni de la base de datos (pura lógica Python).
"""

from datetime import datetime
from typing import Optional


def is_presale_active(event: dict) -> bool:
    """
    Determina si un evento se encuentra actualmente en periodo de preventa activa.

    Args:
        event: Diccionario con los datos del evento (tal como viene de la BD).

    Returns:
        True si la preventa está habilitada y dentro del rango de fechas; False en cualquier otro caso.
    """
    if not event.get("presale_enabled"):
        return False

    start_str = event.get("presale_start")
    end_str = event.get("presale_end")

    if not start_str or not end_str:
        return False

    try:
        now = datetime.now()
        # Normalizar: quitar "Z" o microsegundos si los hubiera
        start_dt = datetime.fromisoformat(str(start_str).replace("Z", "").split(".")[0])
        end_dt = datetime.fromisoformat(str(end_str).replace("Z", "").split(".")[0])
        return start_dt <= now <= end_dt
    except (ValueError, TypeError):
        return False


def validate_bin(card_number: str, allowed_bins_csv: Optional[str]) -> bool:
    """
    Valida si los primeros 6 dígitos de un número de tarjeta coinciden con la
    lista de BINs permitidos para una preventa.

    Args:
        card_number:      Número de tarjeta (puede contener espacios; se limpian aquí).
        allowed_bins_csv: BINs permitidos separados por coma (ej. "415231,455511").

    Returns:
        True si el BIN está en la lista; False si la tarjeta no aplica o la lista está vacía.
    """
    if not card_number or not allowed_bins_csv:
        return False

    # Limpiar caracteres no numéricos
    clean_number = "".join(filter(str.isdigit, card_number))

    if len(clean_number) < 6:
        return False

    user_bin = clean_number[:6]
    allowed_bins = {b.strip() for b in allowed_bins_csv.split(",") if b.strip()}

    return user_bin in allowed_bins


def get_presale_info(event: dict) -> dict:
    """
    Retorna un resumen público de la configuración de preventa de un evento.
    No expone los BINs completos — solo info para mostrar en el frontend.

    Args:
        event: Diccionario del evento.

    Returns:
        Dict con estado de preventa para el frontend.
    """
    active = is_presale_active(event)
    return {
        "presale_enabled": bool(event.get("presale_enabled")),
        "presale_active": active,
        "presale_bank_name": event.get("presale_bank_name") or None,
        "presale_start": event.get("presale_start") or None,
        "presale_end": event.get("presale_end") or None,
        # Solo enviamos los BINs al frontend para la validación local (igual se re-valida en backend al comprar)
        "presale_bins": event.get("presale_bins") or None,
    }
