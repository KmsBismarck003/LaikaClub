#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║              🐾  LAIKA CLUB — CONSOLA MAESTRA  🐾                ║
║                                                                  ║
║  Este es el controlador central que gestiona los microservicios  ║
║  y el frontend en ventanas independientes.                       ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import subprocess
import platform
import time
import threading

# Configuración de colores
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"
CLEAR  = "\033[H\033[J"

ROOT = os.path.dirname(os.path.abspath(__file__))
IS_WINDOWS = platform.system() == "Windows"

# Variables globales para los procesos
backend_proc = None
frontend_proc = None

def kill_process_tree(proc):
    """Mata un proceso y todos sus hijos."""
    if not proc:
        return
    
    try:
        if IS_WINDOWS:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], 
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            proc.terminate()
            proc.wait(timeout=3)
    except Exception:
        try:
            proc.kill()
        except:
            pass

def start_backend():
    global backend_proc
    if backend_proc and backend_proc.poll() is None:
        print(f"{YELLOW}[!] El backend ya está corriendo.{RESET}")
        return

    print(f"{GREEN}[+] Iniciando Backend...{RESET}")
    # Usamos CREATE_NEW_CONSOLE en Windows para que tenga su propia ventana
    if IS_WINDOWS:
        backend_proc = subprocess.Popen(
            [sys.executable, "run_microservices.py"],
            cwd=ROOT,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        # En Linux/Mac usamos una terminal si es posible (ej. xterm, gnome-terminal)
        # Por ahora lo lanzamos normal si no es Windows
        backend_proc = subprocess.Popen([sys.executable, "run_microservices.py"], cwd=ROOT)
    
    time.sleep(1)

def stop_backend():
    global backend_proc
    if not backend_proc or backend_proc.poll() is not None:
        print(f"{RED}[!] El backend no está corriendo.{RESET}")
        backend_proc = None
        return

    print(f"{RED}[-] Deteniendo Backend...{RESET}")
    kill_process_tree(backend_proc)
    backend_proc = None

def restart_backend():
    print(f"{CYAN}[*] Reiniciando Backend...{RESET}")
    stop_backend()
    time.sleep(1)
    start_backend()

def start_frontend():
    global frontend_proc
    if frontend_proc and frontend_proc.poll() is None:
        print(f"{YELLOW}[!] El frontend ya está corriendo.{RESET}")
        return

    print(f"{GREEN}[+] Iniciando Frontend...{RESET}")
    if IS_WINDOWS:
        # Usamos shell=True para npm start
        frontend_proc = subprocess.Popen(
            "npm start",
            cwd=ROOT,
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        frontend_proc = subprocess.Popen(["npm", "start"], cwd=ROOT)
    
    time.sleep(1)

def stop_frontend():
    global frontend_proc
    if not frontend_proc or frontend_proc.poll() is not None:
        print(f"{RED}[!] El frontend no está corriendo.{RESET}")
        frontend_proc = None
        return

    print(f"{RED}[-] Deteniendo Frontend...{RESET}")
    kill_process_tree(frontend_proc)
    frontend_proc = None

def restart_frontend():
    print(f"{CYAN}[*] Reiniciando Frontend...{RESET}")
    stop_frontend()
    time.sleep(1)
    start_frontend()

def print_status():
    """Dibuja la interfaz de usuario en la consola."""
    print(CLEAR)
    print(f"""{CYAN}{BOLD}
╔══════════════════════════════════════════════════════════════════╗
║              🐾  LAIKA CLUB — CONSOLA MAESTRA  🐾                ║
╚══════════════════════════════════════════════════════════════════╝{RESET}""")

    # Backend Status
    be_status = f"{GREEN}RUNNING{RESET}" if (backend_proc and backend_proc.poll() is None) else f"{RED}STOPPED{RESET}"
    print(f"\n  {BOLD}[BACKEND]{RESET} Status: {be_status}")
    print(f"    {YELLOW}1{RESET} -> {RED}Detener{RESET}")
    print(f"    {YELLOW}Q{RESET} -> {CYAN}Reiniciar{RESET}")
    print(f"    {YELLOW}A{RESET} -> {GREEN}Iniciar/Levantar{RESET}")

    # Frontend Status
    fe_status = f"{GREEN}RUNNING{RESET}" if (frontend_proc and frontend_proc.poll() is None) else f"{RED}STOPPED{RESET}"
    print(f"\n  {BOLD}[FRONTEND]{RESET} Status: {fe_status}")
    print(f"    {YELLOW}2{RESET} -> {RED}Detener{RESET}")
    print(f"    {YELLOW}W{RESET} -> {CYAN}Reiniciar{RESET}")
    print(f"    {YELLOW}S{RESET} -> {GREEN}Iniciar/Levantar{RESET}")

    print(f"\n  {BOLD}[SISTEMA]{RESET}")
    print(f"    {YELLOW}ESC{RESET} -> {BOLD}Salir de Todo{RESET}")
    print(f"\n{CYAN}──────────────────────────────────────────────────────────────────{RESET}")
    print(f"  Backend:  {BOLD}http://localhost:8000/api{RESET}")
    print(f"  Frontend: {BOLD}http://localhost:3000{RESET}")
    print(f"{CYAN}──────────────────────────────────────────────────────────────────{RESET}")
    print(f"\n  Esperando comando... ", end="", flush=True)

def main_loop():
    global backend_proc, frontend_proc
    
    # Iniciar servicios al arranque
    start_backend()
    start_frontend()
    
    last_be_status = None
    last_fe_status = None
    
    try:
        import msvcrt
        while True:
            # Calcular estados actuales
            be_running = (backend_proc and backend_proc.poll() is None)
            fe_running = (frontend_proc and frontend_proc.poll() is None)
            
            # Redibujar solo si cambió el estado o es la primera vez
            if be_running != last_be_status or fe_running != last_fe_status:
                print_status()
                last_be_status = be_running
                last_fe_status = fe_running
            
            # Esperar tecla con timeout corto para checar procesos
            if msvcrt.kbhit():
                key = msvcrt.getwch().lower()
                
                if key == '1':
                    stop_backend()
                elif key == 'q':
                    restart_backend()
                elif key == 'a':
                    start_backend()
                elif key == '2':
                    stop_frontend()
                elif key == 'w':
                    restart_frontend()
                elif key == 's':
                    start_frontend()
                elif key == '\x1b': # ESC
                    print(f"\n{YELLOW}[!] Saliendo del sistema...{RESET}")
                    stop_backend()
                    stop_frontend()
                    break
                
                # Forzar redibujado después de un comando
                last_be_status = None 
            
            time.sleep(0.1)
            
    except ImportError:
        print(f"{RED}Este script interactivo está optimizado para Windows.{RESET}")
        print("Lanzando servicios de forma normal...")
        # Fallback básico para otros sistemas
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            stop_backend()
            stop_frontend()

if __name__ == "__main__":
    if not IS_WINDOWS:
        # Asegurarse de que al menos lance los procesos
        start_backend()
        start_frontend()
    
    try:
        main_loop()
    except KeyboardInterrupt:
        stop_backend()
        stop_frontend()
    print(f"\n{GREEN}Sistema cerrado correctamente.{RESET}")
