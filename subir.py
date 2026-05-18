#!/usr/bin/env python3
"""
🐾 LAIKA CLUB — SUBIDOR DE CAMBIOS RAPIDITO 🐾
==============================================
Un script interactivo ultra-útil para subir cambios a Git sin flojera.
Diseñado para la consola de LaikaClub.

Uso:
  - Interactivo:  python subir.py
  - Súper Flojo:  python subir.py "mensaje del commit"
"""

import os
import sys
import subprocess
import platform
import datetime

# Configuración de colores (a juego con run.py)
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"
UNDERLINE = "\033[4m"
CLEAR  = "\033[H\033[J"

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

def run_cmd(cmd):
    """Ejecuta un comando en la terminal y retorna el código de salida, stdout y stderr."""
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def run_cmd_live(cmd):
    """Ejecuta un comando mostrando su salida en tiempo real."""
    print(f"{CYAN}$ {cmd}{RESET}")
    # En Windows, algunas operaciones de git pueden necesitar shell=True
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, shell=True)
    
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())
            
    rc = process.poll()
    return rc

def clear_screen():
    """Limpia la pantalla en terminales compatibles."""
    if platform.system() == "Windows":
        os.system("cls")
    else:
        print(CLEAR, end="")

def print_header():
    """Dibuja el encabezado del asistente."""
    print(f"""{CYAN}{BOLD}
╔══════════════════════════════════════════════════════════════════╗
║             🐾  LAIKA CLUB — ASISTENTE DE GIT  🐾                ║
╚══════════════════════════════════════════════════════════════════╝{RESET}""")

def get_current_branch():
    """Retorna el nombre de la rama actual."""
    _, out, _ = run_cmd("git rev-parse --abbrev-ref HEAD")
    return out or "desconocida"

def get_local_branches():
    """Retorna una lista de ramas locales."""
    _, out, _ = run_cmd('git branch --format="%(refname:short)"')
    if not out:
        return []
    return [b.strip() for b in out.split("\n") if b.strip()]

def check_git_repo():
    """Verifica si es un repositorio de git válido."""
    code, _, _ = run_cmd("git rev-parse --is-inside-work-tree")
    return code == 0

def get_status_files():
    """Obtiene la lista de archivos modificados, nuevos y eliminados."""
    code, out, _ = run_cmd("git status --porcelain")
    if code != 0 or not out:
        return []
        
    files = []
    for line in out.split("\n"):
        if len(line) < 4:
            continue
        status_code = line[:2]
        file_path = line[3:].strip('"')
        
        # Mapear estado
        state = "Modificado"
        color = YELLOW
        icon = "🟡"
        
        if "A" in status_code or "?" in status_code:
            state = "Nuevo"
            color = GREEN
            icon = "🟢"
        elif "D" in status_code:
            state = "Eliminado"
            color = RED
            icon = "🔴"
        elif "R" in status_code:
            state = "Renombrado"
            color = CYAN
            icon = "🔵"
            
        files.append({
            "path": file_path,
            "state": state,
            "color": color,
            "icon": icon,
            "raw_status": status_code
        })
    return files

def suggest_commit_message(staged_files):
    """Genera un mensaje de commit inteligente basado en los archivos preparados."""
    if not staged_files:
        return f"🐾 autocommit: guardando cambios rápidos - {datetime.date.today().strftime('%d/%m/%Y')}"
        
    basenames = [os.path.basename(f) for f in staged_files]
    unique_basenames = list(dict.fromkeys(basenames)) # remover duplicados preservando orden
    
    if len(unique_basenames) == 1:
        return f"🐾 avance: actualización de {unique_basenames[0]}"
    elif len(unique_basenames) <= 3:
        files_str = ", ".join(unique_basenames)
        return f"🐾 avance: cambios en {files_str}"
    else:
        files_str = ", ".join(unique_basenames[:2])
        return f"🐾 avance: actualizando {len(unique_basenames)} archivos (ej: {files_str})"

def run_fast_mode(commit_msg):
    """Ejecuta el modo rápido: agrega todo, commit con mensaje, y push."""
    print_header()
    print(f"\n{CYAN}[*] ¡MODO RÁPIDO ACTIVADO! ⚡{RESET}\n")
    
    # 1. Verificar Git
    if not check_git_repo():
        print(f"{RED}[❌] No estás en un repositorio de Git.{RESET}")
        return
        
    branch = get_current_branch()
    print(f"🌲 Rama actual: {BOLD}{CYAN}{branch}{RESET}")
    
    # 2. Agregar cambios
    print(f"{GREEN}[+] Agregando todos los cambios locales (git add .)...{RESET}")
    run_cmd("git add .")
    
    # 3. Hacer commit
    full_msg = f"🐾 {commit_msg}" if not commit_msg.startswith("🐾") else commit_msg
    print(f"{GREEN}[+] Realizando commit con el mensaje: '{BOLD}{full_msg}{RESET}'")
    code, out, err = run_cmd(f'git commit -m "{full_msg}"')
    if code != 0:
        if "nothing to commit" in out or "nothing to commit" in err:
            print(f"{YELLOW}[!] Nada que commitear, el árbol de trabajo está limpio.{RESET}")
        else:
            print(f"{RED}[❌] Error al commitear:{RESET}\n{out or err}")
            return
            
    # 4. Pushear
    print(f"{GREEN}[+] Subiendo cambios a origin/{branch}...{RESET}")
    # Verificar upstream
    up_code, _, _ = run_cmd(f"git rev-parse --abbrev-ref {branch}@{{upstream}}")
    if up_code != 0:
        print(f"{YELLOW}[!] La rama no tiene rama remota configurada. Creándola...{RESET}")
        push_cmd = f"git push -u origin {branch}"
    else:
        push_cmd = "git push"
        
    rc = run_cmd_live(push_cmd)
    if rc == 0:
        print(f"\n{GREEN}{BOLD}[🎉] ¡Cambios subidos exitosamente en la rama '{branch}'!{RESET}")
    else:
        print(f"\n{RED}{BOLD}[❌] Error al subir los cambios a GitHub.{RESET}")

def main_interactive():
    """Flujo interactivo paso a paso."""
    clear_screen()
    print_header()
    
    if not check_git_repo():
        print(f"{RED}[❌] Error: Esta carpeta no es un repositorio de Git válido.{RESET}")
        return

    # === PASO 1: ANALIZAR CAMBIOS ===
    files = get_status_files()
    
    if not files:
        print(f"\n{GREEN}✨ ¡Árbol de trabajo limpio! No hay cambios en los archivos. ✨{RESET}")
        print(f"🌲 Rama actual: {BOLD}{CYAN}{get_current_branch()}{RESET}\n")
        
        print(f"{BOLD}¿Qué deseas hacer?{RESET}")
        print(f"  {YELLOW}1.{RESET} Cambiar de rama o crear una nueva")
        print(f"  {YELLOW}2.{RESET} Traer cambios de GitHub (git pull)")
        print(f"  {YELLOW}3.{RESET} Subir commits locales que falten por pushear (git push)")
        print(f"  {YELLOW}4.{RESET} Salir")
        
        opt = input(f"\nElige una opción [{BOLD}4{RESET}]: ").strip()
        if opt == "1":
            manage_branches()
        elif opt == "2":
            pull_changes()
        elif opt == "3":
            push_existing()
        return

    # Si hay cambios locales
    print(f"\n{BOLD}📂 Cambios locales detectados:{RESET}")
    for idx, f in enumerate(files, 1):
        print(f"  {BOLD}[{idx}]{RESET} {f['icon']} {f['color']}{f['state']:<11}{RESET} : {f['path']}")
    print("")

    # === PASO 2: GESTIONAR RAMA ===
    current_b = get_current_branch()
    print(f"🌲 Rama actual: {BOLD}{CYAN}{current_b}{RESET}")
    print(f"¿Quieres hacer algo con la rama antes de guardar cambios?")
    print(f"  {YELLOW}1.{RESET} Continuar en la rama actual ({BOLD}{current_b}{RESET}) [Default]")
    print(f"  {YELLOW}2.{RESET} Cambiar a una rama existente")
    print(f"  {YELLOW}3.{RESET} Crear una NUEVA rama y cambiarme a ella")
    
    branch_opt = input(f"\nElige opción [{BOLD}1{RESET}]: ").strip() or "1"
    
    if branch_opt == "2":
        if not switch_branch_flow():
            # Si canceló, volvemos a preguntar o seguimos
            pass
    elif branch_opt == "3":
        if not create_branch_flow():
            pass

    current_b = get_current_branch() # refrescar por si cambió
    print(f"\n{GREEN}[✓] Trabajando en la rama:{RESET} {BOLD}{CYAN}{current_b}{RESET}\n")

    # === PASO 3: SELECCIONAR QUÉ PREPARAR (STAGING) ===
    print(f"{BOLD}¿Qué cambios deseas preparar (git add)?{RESET}")
    print(f"  {YELLOW}1.{RESET} Preparar TODOS los archivos [Default]")
    print(f"  {YELLOW}2.{RESET} Seleccionar archivos específicos por número (ej: 1,3)")
    print(f"  {YELLOW}3.{RESET} No preparar nada nuevo (usar lo que ya esté en staging)")
    
    stage_opt = input(f"\nElige opción [{BOLD}1{RESET}]: ").strip() or "1"
    staged_paths = []
    
    if stage_opt == "1":
        print(f"\n{GREEN}[+] Preparando todos los archivos (git add .)...{RESET}")
        run_cmd("git add .")
        staged_paths = [f["path"] for f in files]
    elif stage_opt == "2":
        nums = input(f"Ingresa los números de los archivos separados por comas (ej: 1,3): ").strip()
        try:
            indices = [int(n.strip()) - 1 for n in nums.split(",") if n.strip().isdigit()]
            valid_paths = []
            for idx in indices:
                if 0 <= idx < len(files):
                    file_to_add = files[idx]["path"]
                    run_cmd(f'git add "{file_to_add}"')
                    valid_paths.append(file_to_add)
                    print(f"  {GREEN}✓ Agregado:{RESET} {file_to_add}")
            staged_paths = valid_paths
        except Exception as e:
            print(f"{RED}[❌] Error al procesar selección. Agregando todo por seguridad.{RESET}")
            run_cmd("git add .")
            staged_paths = [f["path"] for f in files]
    else:
        # Ver cuáles están ya en staging
        _, out, _ = run_cmd("git diff --cached --name-only")
        staged_paths = [line.strip() for line in out.split("\n") if line.strip()]
        print(f"\n{YELLOW}[!] Usando archivos previamente preparados ({len(staged_paths)} archivos).{RESET}")

    # === PASO 4: COMMIT ===
    if not staged_paths:
        # Verificar si hay algo en staging de todos modos
        _, out, _ = run_cmd("git diff --cached --name-only")
        staged_paths = [line.strip() for line in out.split("\n") if line.strip()]
        
    if not staged_paths:
        print(f"\n{RED}[!] No hay ningún archivo preparado para el commit. Saliendo...{RESET}")
        return

    # Sugerir mensaje inteligente
    suggestion = suggest_commit_message(staged_paths)
    print(f"\n{BOLD}📝 Mensaje del commit:{RESET}")
    print(f"  Sugerido: {YELLOW}{suggestion}{RESET}")
    commit_msg = input(f"  Escribe tu mensaje [o presiona ENTER para usar el sugerido]: ").strip()
    
    if not commit_msg:
        commit_msg = suggestion
    else:
        commit_msg = f"🐾 {commit_msg}" if not commit_msg.startswith("🐾") else commit_msg

    print(f"\n{GREEN}[+] Haciendo commit...{RESET}")
    code, out, err = run_cmd(f'git commit -m "{commit_msg}"')
    if code != 0:
        print(f"{RED}[❌] Error al hacer commit:{RESET}\n{out or err}")
        return
    print(f"{GREEN}[✓] Commit creado con éxito!{RESET}")

    # === PASO 5: PUSH ===
    print(f"\n🚀 {BOLD}¿Deseas subir los cambios a GitHub/GitLab ahora mismo?{RESET}")
    push_confirm = input(f"  Subir a origin/{current_b} [Y/n]: ").strip().lower()
    
    if push_confirm == "" or push_confirm in ["y", "si", "sí", "yes"]:
        print(f"\n{GREEN}[+] Subiendo cambios a GitHub...{RESET}")
        
        # Verificar upstream
        up_code, _, _ = run_cmd(f"git rev-parse --abbrev-ref {current_b}@{{upstream}}")
        if up_code != 0:
            print(f"{YELLOW}[!] La rama '{current_b}' no tiene rama de seguimiento remota. Creándola...{RESET}")
            push_cmd = f"git push -u origin {current_b}"
        else:
            push_cmd = "git push"
            
        rc = run_cmd_live(push_cmd)
        if rc == 0:
            print(f"\n{GREEN}{BOLD}[🎉] ¡Todo listo y subido con éxito! ¡Buen trabajo! 🐾{RESET}\n")
        else:
            print(f"\n{RED}{BOLD}[❌] Error al subir los cambios.{RESET}\n")
    else:
        print(f"\n{YELLOW}[!] Cambios guardados localmente pero NO subidos a internet.{RESET}\n")

# === FUNCIONES AUXILIARES DE FLUJOS ===

def switch_branch_flow():
    """Flujo para cambiar de rama."""
    branches = get_local_branches()
    if not branches:
        print(f"{RED}[!] No se encontraron otras ramas locales.{RESET}")
        return False
        
    current = get_current_branch()
    print(f"\n{BOLD}Ramas locales disponibles:{RESET}")
    available = []
    
    idx = 1
    for b in branches:
        if b == current:
            print(f"  * {CYAN}{b} (Rama actual){RESET}")
        else:
            print(f"  {YELLOW}[{idx}]{RESET} {b}")
            available.append(b)
            idx += 1
            
    if not available:
        print(f"{YELLOW}[!] No hay otras ramas a las que cambiar.{RESET}")
        return False
        
    choice = input(f"\nElige el número de la rama a cambiar [o ENTER para cancelar]: ").strip()
    if not choice or not choice.isdigit():
        return False
        
    idx_choice = int(choice) - 1
    if 0 <= idx_choice < len(available):
        target_branch = available[idx_choice]
        print(f"{GREEN}[*] Cambiando a la rama '{target_branch}'...{RESET}")
        code, out, err = run_cmd(f"git checkout {target_branch}")
        if code == 0:
            print(f"{GREEN}[✓] Cambiado con éxito!{RESET}")
            return True
        else:
            print(f"{RED}[❌] Error al cambiar de rama:{RESET}\n{err or out}")
    return False

def create_branch_flow():
    """Flujo para crear rama."""
    print(f"\n{BOLD}Crear nueva rama:{RESET}")
    name = input("Nombre de la nueva rama (ej: act-merch-fixes): ").strip()
    if not name:
        print(f"{RED}[!] Nombre inválido.{RESET}")
        return False
        
    # Limpiar nombre
    clean_name = name.lower().replace(" ", "-")
    print(f"{GREEN}[*] Creando y cambiando a la rama '{clean_name}'...{RESET}")
    code, out, err = run_cmd(f"git checkout -b {clean_name}")
    if code == 0:
        print(f"{GREEN}[✓] Rama '{clean_name}' creada y seleccionada!{RESET}")
        return True
    else:
        print(f"{RED}[❌] Error al crear rama:{RESET}\n{err or out}")
    return False

def manage_branches():
    """Administrar ramas cuando no hay cambios locales."""
    print(f"\n{BOLD}Gestión de Ramas:{RESET}")
    print(f"  {YELLOW}1.{RESET} Cambiar a una rama existente")
    print(f"  {YELLOW}2.{RESET} Crear una nueva rama")
    print(f"  {YELLOW}3.{RESET} Volver")
    
    opt = input(f"\nElige opción: ").strip()
    if opt == "1":
        switch_branch_flow()
    elif opt == "2":
        create_branch_flow()

def pull_changes():
    """Realiza git pull de la rama actual."""
    branch = get_current_branch()
    print(f"\n{GREEN}[+] Descargando cambios para origin/{branch}...{RESET}")
    rc = run_cmd_live("git pull")
    if rc == 0:
        print(f"\n{GREEN}[✓] ¡Actualizado con éxito!{RESET}\n")
    else:
        print(f"\n{RED}[❌] Error al hacer pull. Es posible que debas resolver conflictos o configurar el origen.{RESET}\n")

def push_existing():
    """Sube commits locales pendientes."""
    branch = get_current_branch()
    print(f"\n{GREEN}[+] Subiendo commits locales pendientes en origin/{branch}...{RESET}")
    up_code, _, _ = run_cmd(f"git rev-parse --abbrev-ref {branch}@{{upstream}}")
    if up_code != 0:
        push_cmd = f"git push -u origin {branch}"
    else:
        push_cmd = "git push"
        
    rc = run_cmd_live(push_cmd)
    if rc == 0:
        print(f"\n{GREEN}[✓] ¡Subido con éxito!{RESET}\n")
    else:
        print(f"\n{RED}[❌] Error al subir commits.{RESET}\n")

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            # Modo rápido
            msg = " ".join(sys.argv[1:])
            run_fast_mode(msg)
        else:
            # Modo interactivo completo
            main_interactive()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}[!] Operación cancelada por el usuario. ¡Adiós! 🐾{RESET}")
        sys.exit(0)
