import io
import uuid
from pathlib import Path
from PIL import Image
from fastapi import HTTPException

def optimize_to_webp(file_contents: bytes, quality: int = 80) -> bytes:
    """
    Recibe los bytes de una imagen, la abre usando Pillow,
    la optimiza y la convierte al formato WebP.
    Retorna los bytes del archivo WebP resultante.
    """
    try:
        image = Image.open(io.BytesIO(file_contents))
        
        # Manejo de la transparencia
        # Si tiene un canal alfa (transparencia), preservarlo en WebP.
        # De lo contrario, convertir a RGB para evitar problemas al guardar.
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            pass
        else:
            image = image.convert("RGB")
            
        output = io.BytesIO()
        image.save(output, format="WEBP", quality=quality)
        return output.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al procesar y convertir la imagen a WebP: {str(e)}"
        )

def save_image_as_webp(file_contents: bytes, destination_dir: Path, filename_prefix: str = "", quality: int = 80) -> str:
    """
    Optimiza una imagen y la guarda en la ruta destino en formato WebP con un nombre único.
    Retorna el nombre final del archivo generado.
    """
    # Generar un nombre único con extensión .webp
    unique_suffix = uuid.uuid4().hex[:12]
    prefix = f"{filename_prefix}_" if filename_prefix else ""
    filename = f"{prefix}{unique_suffix}.webp"
    
    # Asegurar que el directorio de destino existe
    destination_dir.mkdir(parents=True, exist_ok=True)
    filepath = destination_dir / filename
    
    # Optimizar
    webp_contents = optimize_to_webp(file_contents, quality=quality)
    
    # Guardar en disco
    with open(filepath, "wb") as f:
        f.write(webp_contents)
        
    return filename
