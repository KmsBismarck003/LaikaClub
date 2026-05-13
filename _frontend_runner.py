#!/usr/bin/env python3
"""Frontend runner con control de teclado R=reload, S=stop"""
import subprocess, sys, os, time, threading, platform

ROOT = os.path.dirname(os.path.abspath(__file__))
PROCESS = None

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

IS_WIN = platform.system() == "Windows"

def start_frontend():
    global PROCESS
    print(f"\n{CYAN}[FRONTEND]{RESET} Iniciando React (npm start)...\n")
    if IS_WIN:
        PROCESS = subprocess.Popen(
            "npm start",
            cwd=ROOT, shell=True
        )
    else:
        PROCESS = subprocess.Popen(
            ["npm", "start"],
            cwd=ROOT
        )
    return PROCESS

def stop_frontend():
    global PROCESS
    if PROCESS and PROCESS.poll() is None:
        print(f"\n{YELLOW}[FRONTEND]{RESET} Deteniendo React...")
        if IS_WIN:
            # En Windows hay que matar todo el árbol de procesos
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(PROCESS.pid)],
                           capture_output=True)
        else:
            PROCESS.terminate()
        try:
            PROCESS.wait(timeout=5)
        except:
            PROCESS.kill()
        print(f"{RED}[FRONTEND]{RESET} React detenido.")
    PROCESS = None

def read_keys():
    try:
        import msvcrt
        while True:
            if msvcrt.kbhit():
                key = msvcrt.getwch().upper()
                if key == "R":
                    print(f"\n{YELLOW}[FRONTEND]{RESET} Recargando frontend (R)...")
                    stop_frontend()
                    time.sleep(1)
                    start_frontend()
                elif key == "S":
                    stop_frontend()
                    sys.exit(0)
            time.sleep(0.1)
    except ImportError:
        while True:
            try:
                line = input()
                key = line.strip().upper()
                if key == "R":
                    stop_frontend()
                    time.sleep(1)
                    start_frontend()
                elif key == "S":
                    stop_frontend()
                    sys.exit(0)
            except (EOFError, KeyboardInterrupt):
                stop_frontend()
                sys.exit(0)

def main():
    print(f"""
{CYAN}{BOLD}╔════════════════════════════════════════╗
║  LAIKA CLUB — FRONTEND (React)         ║
╚════════════════════════════════════════╝{RESET}
  {YELLOW}R{RESET} → Recargar   {YELLOW}S{RESET} → Detener
  Abrirá http://localhost:3000 automáticamente.
""")
    start_frontend()

    t = threading.Thread(target=read_keys, daemon=True)
    t.start()

    try:
        while True:
            if PROCESS and PROCESS.poll() is not None:
                print(f"\n{RED}[FRONTEND] El proceso terminó inesperadamente. Reiniciando en 3s...{RESET}")
                time.sleep(3)
                start_frontend()
            time.sleep(1)
    except KeyboardInterrupt:
        stop_frontend()
        sys.exit(0)

if __name__ == "__main__":
    main()
