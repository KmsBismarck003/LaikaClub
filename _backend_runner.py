#!/usr/bin/env python3
"""Backend runner con control de teclado R=reload, S=stop"""
import subprocess, sys, os, time, threading

ROOT = os.path.dirname(os.path.abspath(__file__))
PROCESS = None

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def start_backend():
    global PROCESS
    print(f"\n{CYAN}[BACKEND]{RESET} Iniciando microservicios...\n")
    PROCESS = subprocess.Popen(
        [sys.executable, "run_microservices.py"],
        cwd=ROOT
    )
    return PROCESS

def stop_backend():
    global PROCESS
    if PROCESS and PROCESS.poll() is None:
        print(f"\n{YELLOW}[BACKEND]{RESET} Deteniendo microservicios...")
        PROCESS.terminate()
        try:
            PROCESS.wait(timeout=5)
        except:
            PROCESS.kill()
        print(f"{RED}[BACKEND]{RESET} Microservicios detenidos.")
    PROCESS = None

def read_keys():
    """Lee teclas del teclado — Windows usa msvcrt"""
    try:
        import msvcrt
        while True:
            if msvcrt.kbhit():
                key = msvcrt.getwch().upper()
                if key == "R":
                    print(f"\n{YELLOW}[BACKEND]{RESET} Recargando backend (R)...")
                    stop_backend()
                    time.sleep(1)
                    start_backend()
                elif key == "S":
                    print(f"\n{RED}[BACKEND]{RESET} Deteniendo sistema (S)...")
                    stop_backend()
                    sys.exit(0)
            time.sleep(0.1)
    except ImportError:
        # Linux/Mac: usar input estándar
        while True:
            try:
                line = input()
                key = line.strip().upper()
                if key == "R":
                    print(f"\n{YELLOW}[BACKEND]{RESET} Recargando backend...")
                    stop_backend()
                    time.sleep(1)
                    start_backend()
                elif key == "S":
                    stop_backend()
                    sys.exit(0)
            except (EOFError, KeyboardInterrupt):
                stop_backend()
                sys.exit(0)

def main():
    print(f"""
{CYAN}{BOLD}╔════════════════════════════════════════╗
║  LAIKA CLUB — BACKEND (Microservicios) ║
╚════════════════════════════════════════╝{RESET}
  {YELLOW}R{RESET} → Recargar   {YELLOW}S{RESET} → Detener
""")
    start_backend()

    # Leer teclado en hilo separado
    t = threading.Thread(target=read_keys, daemon=True)
    t.start()

    try:
        while True:
            # Verificar si el proceso murió inesperadamente
            if PROCESS and PROCESS.poll() is not None:
                print(f"\n{RED}[BACKEND] El proceso terminó inesperadamente. Reiniciando en 3s...{RESET}")
                time.sleep(3)
                start_backend()
            time.sleep(1)
    except KeyboardInterrupt:
        stop_backend()
        sys.exit(0)

if __name__ == "__main__":
    main()
