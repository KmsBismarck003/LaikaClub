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
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='replace', shell=True)
        stdout = result.stdout or ""
        stderr = result.stderr or ""
        return result.returncode, stdout.strip(), stderr.strip()
    except Exception:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        stdout = result.stdout.decode('utf-8', errors='replace') if result.stdout else ""
        stderr = result.stderr.decode('utf-8', errors='replace') if result.stderr else ""
        return result.returncode, stdout.strip(), stderr.strip()

def run_cmd_live(cmd):
    """Ejecuta un comando mostrando su salida en tiempo real."""
    print(f"{CYAN}$ {cmd}{RESET}")
    # En Windows, algunas operaciones de git pueden necesitar shell=True
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace', shell=True)
    
    while True:
        try:
            output = process.stdout.readline()
        except Exception:
            break
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

import time

def get_git_sync_status():
    """Calcula el estado de sincronización con la rama de seguimiento remota."""
    branch = get_current_branch()
    up_code, up_name, _ = run_cmd(f"git rev-parse --abbrev-ref {branch}@{{upstream}}")
    if up_code != 0:
        return "Sin rama remota vinculada (upstream)"
    
    # Commits ahead (locales no subidos)
    code_ahead, ahead, _ = run_cmd(f"git rev-list --count {branch}@{{upstream}}..HEAD")
    # Commits behind (remotos no bajados)
    code_behind, behind, _ = run_cmd(f"git rev-list --count HEAD..{branch}@{{upstream}}")
    
    ahead = int(ahead) if code_ahead == 0 and ahead.isdigit() else 0
    behind = int(behind) if code_behind == 0 and behind.isdigit() else 0
    
    if ahead > 0 and behind > 0:
        return f"Divergido (↑{ahead} por subir, ↓{behind} por bajar)"
    elif ahead > 0:
        return f"Adelantado (↑{ahead} commits por subir)"
    elif behind > 0:
        return f"Atrasado (↓{behind} commits por bajar)"
    else:
        return "Sincronizado con origin"

def main_interactive():
    """Menú principal interactivo de Laika Git Assistant."""
    while True:
        clear_screen()
        print_header()
        
        if not check_git_repo():
            print(f"{RED}[❌] Error: Esta carpeta no es un repositorio de Git válido.{RESET}")
            return
            
        current_b = get_current_branch()
        files = get_status_files()
        sync_status = get_git_sync_status()
        
        # Mostrar información de estado
        print(f"🌲 {BOLD}Rama actual:{RESET} {CYAN}{current_b}{RESET}")
        print(f"🔄 {BOLD}Sincronización:{RESET} {YELLOW}{sync_status}{RESET}")
        
        if files:
            print(f"📂 {BOLD}Cambios locales:{RESET} {RED}{len(files)} archivo(s) modificado(s){RESET}")
            # Mostrar los primeros 3 archivos modificados
            for f in files[:3]:
                print(f"   {f['icon']} {f['color']}{f['state']:<10}{RESET} : {f['path']}")
            if len(files) > 3:
                print(f"   ... y {len(files) - 3} más.")
        else:
            print(f"📂 {BOLD}Cambios locales:{RESET} {GREEN}Limpio (sin cambios){RESET}")
        
        print("\n" + "═"*66)
        print(f"{BOLD}¿Qué deseas hacer?{RESET}")
        print(f"  {CYAN}1.{RESET} 🚀 Subir cambios (Add + Commit + Push)")
        print(f"  {CYAN}2.{RESET} 🌿 Crear una nueva rama local")
        print(f"  {CYAN}3.{RESET} 🔄 Cambiar a otra rama local existente")
        print(f"  {CYAN}4.{RESET} 📥 Consultar ramas en GitHub y bajar/actualizar una")
        print(f"  {CYAN}5.{RESET} ⚡ Traer cambios de GitHub (git pull)")
        print(f"  {CYAN}6.{RESET} 📤 Subir commits locales pendientes (git push)")
        print(f"  {CYAN}7.{RESET} 🚨 MENÚ DE EMERGENCIA (Time Machine / Deshacer cambios)")
        print(f"  {CYAN}0.{RESET} ❌ Salir")
        print("═"*66)
        
        opt = input(f"\nElige una opción [{BOLD}1{RESET}]: ").strip()
        if opt == "":
            opt = "1"
            
        if opt == "1":
            upload_flow()
        elif opt == "2":
            create_branch_flow()
        elif opt == "3":
            switch_branch_flow()
        elif opt == "4":
            consult_remote_branches_flow()
        elif opt == "5":
            pull_changes()
            input(f"\nPresiona ENTER para continuar...")
        elif opt == "6":
            push_existing()
            input(f"\nPresiona ENTER para continuar...")
        elif opt == "7":
            emergency_menu()
        elif opt == "0" or opt.lower() == "q":
            print(f"\n{GREEN}¡Adiós! Que pases un excelente día de desarrollo. 🐾{RESET}\n")
            break
        else:
            print(f"\n{RED}[!] Opción no válida.{RESET}")
            time.sleep(1)

def upload_flow():
    """Flujo interactivo para preparar, comitear y subir cambios."""
    clear_screen()
    print_header()
    
    files = get_status_files()
    if not files:
        print(f"\n{GREEN}✨ ¡Árbol de trabajo limpio! No hay cambios locales detectados. ✨{RESET}")
        input(f"\nPresiona ENTER para volver...")
        return
        
    print(f"\n{BOLD}📂 Cambios locales detectados:{RESET}")
    for idx, f in enumerate(files, 1):
        print(f"  {BOLD}[{idx}]{RESET} {f['icon']} {f['color']}{f['state']:<11}{RESET} : {f['path']}")
    print("")
    
    # === SELECCIONAR QUÉ PREPARAR (STAGING) ===
    print(f"{BOLD}¿Qué cambios deseas preparar (git add)?{RESET}")
    print(f"  {YELLOW}1.{RESET} Preparar TODOS los archivos [Default]")
    print(f"  {YELLOW}2.{RESET} Seleccionar archivos específicos por número (ej: 1,3)")
    print(f"  {YELLOW}3.{RESET} No preparar nada nuevo (usar lo que ya esté en staging)")
    print(f"  {YELLOW}0.{RESET} Volver al menú principal")
    
    stage_opt = input(f"\nElige opción [1]: ").strip()
    if stage_opt == "":
        stage_opt = "1"
        
    if stage_opt == "0":
        return
        
    staged_paths = []
    
    if stage_opt == "1":
        print(f"\n{GREEN}[+] Preparando todos los archivos (git add .)...{RESET}")
        run_cmd("git add .")
        staged_paths = [f["path"] for f in files]
    elif stage_opt == "2":
        nums = input(f"Ingresa los números de los archivos separados por comas (ej: 1,3) [o ENTER para cancelar]: ").strip()
        if not nums:
            print(f"{YELLOW}[!] Cancelado.{RESET}")
            time.sleep(1)
            return
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

    # === VERIFICAR STAGING ===
    if not staged_paths:
        # Verificar si hay algo en staging de todos modos
        _, out, _ = run_cmd("git diff --cached --name-only")
        staged_paths = [line.strip() for line in out.split("\n") if line.strip()]
        
    if not staged_paths:
        print(f"\n{RED}[!] No hay ningún archivo preparado para el commit.{RESET}")
        input(f"\nPresiona ENTER para volver...")
        return

    # === MENSAJE COMMIT ===
    suggestion = suggest_commit_message(staged_paths)
    print(f"\n{BOLD}📝 Mensaje del commit:{RESET}")
    print(f"  Sugerido: {YELLOW}{suggestion}{RESET}")
    print(f"  (Escribe '0' para cancelar y deshacer el git add)")
    commit_msg = input(f"  Escribe tu mensaje [o ENTER para usar el sugerido]: ").strip()
    
    if commit_msg == "0":
        # Deshacer staging
        print(f"\n{YELLOW}[!] Deshaciendo el git add...{RESET}")
        run_cmd("git reset")
        return
        
    if not commit_msg:
        commit_msg = suggestion
    else:
        commit_msg = f"🐾 {commit_msg}" if not commit_msg.startswith("🐾") else commit_msg

    print(f"\n{GREEN}[+] Haciendo commit...{RESET}")
    code, out, err = run_cmd(f'git commit -m "{commit_msg}"')
    if code != 0:
        print(f"{RED}[❌] Error al hacer commit:{RESET}\n{out or err}")
        input(f"\nPresiona ENTER para continuar...")
        return
    print(f"{GREEN}[✓] Commit creado con éxito!{RESET}")

    # === PUSH ===
    current_b = get_current_branch()
    print(f"\n🚀 {BOLD}¿Deseas subir los cambios a GitHub ahora mismo?{RESET}")
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
            print(f"\n{RED}{BOLD}[❌] Error al subir los cambios a GitHub.{RESET}\n")
    else:
        print(f"\n{YELLOW}[!] Cambios guardados localmente pero NO subidos.{RESET}\n")
        
    input(f"\nPresiona ENTER para continuar...")

def create_branch_flow():
    """Flujo para crear rama."""
    print(f"\n{BOLD}Crear nueva rama:{RESET}")
    print(f"  (Escribe '0' o ENTER para cancelar)")
    name = input("Nombre de la nueva rama: ").strip()
    if not name or name == "0":
        return False
        
    # Limpiar nombre
    clean_name = name.lower().replace(" ", "-")
    print(f"{GREEN}[*] Creando y cambiando a la rama '{clean_name}'...{RESET}")
    code, out, err = run_cmd(f"git checkout -b {clean_name}")
    if code == 0:
        print(f"{GREEN}[✓] Rama '{clean_name}' creada y seleccionada!{RESET}")
        input(f"\nPresiona ENTER para continuar...")
        return True
    else:
        print(f"{RED}[❌] Error al crear rama:{RESET}\n{err or out}")
        input(f"\nPresiona ENTER para continuar...")
    return False

def switch_branch_flow():
    """Flujo para cambiar de rama."""
    branches = get_local_branches()
    if not branches:
        print(f"{RED}[!] No se encontraron otras ramas locales.{RESET}")
        input(f"\nPresiona ENTER para continuar...")
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
        input(f"\nPresiona ENTER para continuar...")
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
            input(f"\nPresiona ENTER para continuar...")
            return True
        else:
            print(f"{RED}[❌] Error al cambiar de rama:{RESET}\n{err or out}")
            input(f"\nPresiona ENTER para continuar...")
    return False

def consult_remote_branches_flow():
    """Consulta ramas remotas de GitHub y permite descargarlas o cambiarse a ellas."""
    clear_screen()
    print_header()
    print(f"\n{CYAN}[*] Consultando ramas en GitHub (git fetch)...{RESET}")
    
    # Fetch remotas
    code, _, err = run_cmd("git fetch origin --prune")
    if code != 0:
        print(f"{RED}[❌] Error al consultar GitHub: {err}{RESET}")
        input(f"\nPresiona ENTER para volver al menú...")
        return
        
    # Obtener lista ordenada de ramas remotas
    cmd = 'git for-each-ref --sort=-committerdate refs/remotes/origin/ --format="%(refname:short)|%(committerdate:relative)|%(authorname)"'
    code, out, _ = run_cmd(cmd)
    
    if code != 0 or not out:
        print(f"{YELLOW}[!] No se encontraron ramas remotas o hubo un error al listarlas.{RESET}")
        input(f"\nPresiona ENTER para volver al menú...")
        return
        
    lines = out.split("\n")
    remote_branches = []
    
    for line in lines:
        if not line.strip():
            continue
        parts = line.split("|", 2)
        if len(parts) >= 3:
            name, date, author = parts[0], parts[1], parts[2]
            # Filtrar origin/HEAD y nombres que no empiecen con origin/
            if name.startswith("origin/") and not name.endswith("/HEAD"):
                remote_branches.append({
                    "full_name": name,
                    "local_name": name[7:], # remover "origin/"
                    "date": date,
                    "author": author
                })
                
    if not remote_branches:
        print(f"{YELLOW}[!] No se encontraron ramas en 'origin' (excluyendo HEAD).{RESET}")
        input(f"\nPresiona ENTER para volver al menú...")
        return
        
    print(f"\n{BOLD}Ramas remotas recientes en GitHub:{RESET}")
    print("-" * 75)
    for idx, rb in enumerate(remote_branches, 1):
        print(f"  {CYAN}[{idx:2d}]{RESET} {BOLD}{rb['local_name']:<30}{RESET} ({rb['date']}) por {rb['author']}")
        
    print(f"  {YELLOW}[ 0]{RESET} Volver al menú principal")
    print("-" * 75)
    
    choice = input(f"\nSelecciona el número de la rama que deseas descargar/cambiar [0]: ").strip()
    if not choice or choice == "0":
        return
        
    if not choice.isdigit() or int(choice) < 1 or int(choice) > len(remote_branches):
        print(f"{RED}[❌] Opción inválida.{RESET}")
        time.sleep(1.5)
        return
        
    selected = remote_branches[int(choice) - 1]
    local_name = selected["local_name"]
    full_name = selected["full_name"]
    
    # Verificar si ya existe localmente
    local_branches = get_local_branches()
    if local_name in local_branches:
        print(f"\n{YELLOW}[!] La rama local '{local_name}' ya existe.{RESET}")
        print(f"  1. Cambiar a ella y actualizar (git checkout + git pull)")
        print(f"  2. Reestablecerla a la fuerza a la versión de GitHub (git checkout + reset --hard origin/{local_name})")
        print(f"  0. Cancelar y volver")
        sub_opt = input(f"\nElige una opción [1]: ").strip() or "1"
        
        if sub_opt == "0":
            return
        elif sub_opt == "1":
            print(f"\n{GREEN}[*] Cambiando a rama '{local_name}'...{RESET}")
            c1, _, e1 = run_cmd(f"git checkout {local_name}")
            if c1 == 0:
                print(f"{GREEN}[*] Actualizando rama '{local_name}'...{RESET}")
                run_cmd_live(f"git pull origin {local_name}")
            else:
                print(f"{RED}[❌] Error al cambiar a la rama: {e1}{RESET}")
        elif sub_opt == "2":
            confirm = input(f"{RED}[⚠️] ¿Estás seguro? Esto borrará cualquier cambio local en '{local_name}'. [s/N]: {RESET}").strip().lower()
            if confirm in ["s", "si", "y", "yes"]:
                print(f"\n{GREEN}[*] Cambiando a rama '{local_name}'...{RESET}")
                c1, _, e1 = run_cmd(f"git checkout {local_name}")
                if c1 == 0:
                    print(f"{GREEN}[*] Reestableciendo a la fuerza a {full_name}...{RESET}")
                    run_cmd_live(f"git reset --hard {full_name}")
                else:
                    print(f"{RED}[❌] Error al cambiar a la rama: {e1}{RESET}")
    else:
        # No existe localmente, la creamos y tracking
        print(f"\n{GREEN}[*] Descargando y creando rama local '{local_name}' desde '{full_name}'...{RESET}")
        rc = run_cmd_live(f"git checkout -b {local_name} {full_name}")
        if rc == 0:
            print(f"\n{GREEN}[🎉] ¡Cambiado con éxito a la nueva rama local '{local_name}'!{RESET}")
        else:
            print(f"\n{RED}[❌] Error al crear la rama local.{RESET}")
            
    input(f"\nPresiona ENTER para continuar...")

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

def emergency_menu():
    """Menú de emergencia para deshacer cambios y viajar en el tiempo."""
    while True:
        clear_screen()
        print(f"""{RED}{BOLD}
╔══════════════════════════════════════════════════════════════════╗
║             🚨  LAIKA CLUB — MENÚ DE EMERGENCIA  🚨              ║
║                  (Time Machine & Git Rollbacks)                  ║
╚══════════════════════════════════════════════════════════════════╝{RESET}""")
        
        current_b = get_current_branch()
        print(f"🌲 Rama activa: {BOLD}{CYAN}{current_b}{RESET}")
        
        # Mostrar commits recientes
        print(f"\n{BOLD}Últimos 3 commits en esta rama:{RESET}")
        _, commits_out, _ = run_cmd('git log -n 3 --oneline')
        if commits_out:
            for line in commits_out.split("\n"):
                print(f"   {YELLOW}•{RESET} {line}")
        else:
            print(f"   (Sin commits recientes)")
            
        print("\n" + "═"*66)
        print(f"{BOLD}Opciones de Recuperación/Deshacer:{RESET}")
        print(f"  {RED}1.{RESET} 🗑️  Descartar todos los cambios locales NO guardados (git reset --hard + clean)")
        print(f"  {RED}2.{RESET} ↩️  Deshacer el último commit (MANTENIENDO tus archivos modificados)")
        print(f"  {RED}3.{RESET} 💥 Deshacer el último commit (BORRANDO tus archivos y cambios)")
        print(f"  {RED}4.{RESET} 🕰️  Time Machine (Reflog): Viajar en el tiempo a cualquier estado anterior")
        print(f"  {RED}5.{RESET} 📦 Guardar cambios en el Baúl (git stash) para limpiar temporalmente")
        print(f"  {RED}6.{RESET} 📤 Recuperar cambios del Baúl (git stash pop)")
        print(f"  {YELLOW}0.{RESET} 🔙 Volver al menú principal")
        print("═"*66)
        
        opt = input(f"\nElige una opción de emergencia [{BOLD}0{RESET}]: ").strip()
        if not opt or opt == "0":
            return
            
        if opt == "1":
            print(f"\n{RED}[⚠️] ADVERTENCIA: Esto eliminará permanentemente todos tus cambios locales no commiteados.")
            print(f"    Esto incluye archivos nuevos sin registrar y modificaciones. No se puede deshacer.{RESET}")
            confirm = input(f"¿Estás seguro de que quieres continuar? [escribe 'si' para confirmar]: ").strip().lower()
            if confirm == "si":
                print(f"\n{GREEN}[*] Limpiando repositorio...{RESET}")
                run_cmd("git reset --hard HEAD")
                run_cmd("git clean -fd")
                print(f"{GREEN}[✓] Repositorio limpio y reseteado a HEAD.{RESET}")
                input(f"\nPresiona ENTER para continuar...")
            else:
                print(f"\n{YELLOW}[!] Cancelado.{RESET}")
                time.sleep(1)
                
        elif opt == "2":
            print(f"\n{YELLOW}[*] Deshaciendo último commit pero manteniendo los archivos...{RESET}")
            code, out, err = run_cmd("git reset --soft HEAD~1")
            if code == 0:
                print(f"{GREEN}[✓] Deshecho con éxito. Los archivos están listos para ser modificados o commiteados nuevamente.{RESET}")
            else:
                print(f"{RED}[❌] Error al deshacer commit: {err or out}{RESET}")
            input(f"\nPresiona ENTER para continuar...")
            
        elif opt == "3":
            print(f"\n{RED}[⚠️] ADVERTENCIA: Esto borrará permanentemente el último commit y todos sus cambios.")
            print(f"    ¡Esta acción modificará tu historial local!{RESET}")
            confirm = input(f"¿Estás seguro de que quieres continuar? [escribe 'si' para confirmar]: ").strip().lower()
            if confirm == "si":
                code, out, err = run_cmd("git reset --hard HEAD~1")
                if code == 0:
                    print(f"{GREEN}[✓] Último commit borrado con éxito.{RESET}")
                else:
                    print(f"{RED}[❌] Error: {err or out}{RESET}")
                input(f"\nPresiona ENTER para continuar...")
                
        elif opt == "4":
            time_machine_flow()
            
        elif opt == "5":
            msg = input(f"\nNombre/descripción para esta copia del baúl [opcional]: ").strip()
            stash_cmd = "git stash push"
            if msg:
                stash_cmd += f' -m "Emergencia: {msg}"'
            else:
                stash_cmd += ' -m "Emergencia: Guardado automático"'
            print(f"\n{GREEN}[*] Guardando cambios en el baúl (git stash)...{RESET}")
            rc = run_cmd_live(stash_cmd)
            if rc == 0:
                print(f"{GREEN}[✓] Guardado en el baúl con éxito.{RESET}")
            else:
                print(f"{RED}[❌] Error al hacer stash.{RESET}")
            input(f"\nPresiona ENTER para continuar...")
            
        elif opt == "6":
            print(f"\n{GREEN}[*] Recuperando el último elemento del baúl (git stash pop)...{RESET}")
            rc = run_cmd_live("git stash pop")
            if rc == 0:
                print(f"{GREEN}[✓] Cambios restaurados con éxito.{RESET}")
            else:
                print(f"{RED}[❌] Error o conflicto al aplicar stash. Puede que tengas que resolver conflictos.{RESET}")
            input(f"\nPresiona ENTER para continuar...")

def time_machine_flow():
    """Viajar en el tiempo usando reflog."""
    clear_screen()
    print(f"""{RED}{BOLD}
╔══════════════════════════════════════════════════════════════════╗
║              🕰️  TIME MACHINE (GIT REFLOG)  🕰️                 ║
╚══════════════════════════════════════════════════════════════════╝{RESET}""")
    print("Reflog registra cada movimiento que haces (commits, checkouts, resets).")
    print("Puedes restaurar el código exactamente a cómo estaba en cualquiera de estos momentos.\n")
    
    # Obtener reflog
    code, out, _ = run_cmd('git reflog -n 15 --format="%h|%gd|%gs"')
    if code != 0 or not out:
        print(f"{RED}[❌] No se pudo obtener el reflog.{RESET}")
        input(f"\nPresiona ENTER para volver...")
        return
        
    lines = out.split("\n")
    reflog_items = []
    
    print(f"{BOLD}Estados recientes disponibles en el tiempo:{RESET}")
    print("-" * 75)
    for idx, line in enumerate(lines, 1):
        if not line.strip():
            continue
        parts = line.split("|", 2)
        if len(parts) >= 3:
            sha, selector, desc = parts[0], parts[1], parts[2]
            reflog_items.append({
                "sha": sha,
                "selector": selector,
                "desc": desc
            })
            print(f"  {CYAN}[{idx:2d}]{RESET} {BOLD}{selector}{RESET} ({sha}) -> {desc}")
            
    print(f"  {YELLOW}[ 0]{RESET} Volver atrás (Cancelar)")
    print("-" * 75)
    
    choice = input(f"\nSelecciona a qué momento deseas volver [0]: ").strip()
    if not choice or choice == "0":
        return
        
    if not choice.isdigit() or int(choice) < 1 or int(choice) > len(reflog_items):
        print(f"{RED}[❌] Opción inválida.{RESET}")
        time.sleep(1)
        return
        
    selected = reflog_items[int(choice) - 1]
    selector = selected["selector"]
    desc = selected["desc"]
    sha = selected["sha"]
    
    print(f"\n{RED}[⚠️] ADVERTENCIA: Vas a regresar el código al estado: '{selector}' ({sha})")
    print(f"    Esto ejecutará: git reset --hard {selector}")
    print(f"    Cualquier cambio local no guardado se perderá.{RESET}")
    
    confirm = input(f"¿Deseas proceder? [escribe 'si' para confirmar]: ").strip().lower()
    if confirm == "si":
        print(f"\n{GREEN}[*] Viajando en el tiempo a {selector}...{RESET}")
        rc = run_cmd_live(f"git reset --hard {selector}")
        if rc == 0:
            print(f"\n{GREEN}[🎉] ¡Viaje en el tiempo completado! Ahora estás en {selector} ({sha}).{RESET}")
        else:
            print(f"\n{RED}[❌] Hubo un problema al restaurar el estado.{RESET}")
    else:
        print(f"\n{YELLOW}[!] Cancelado.{RESET}")
        
    input(f"\nPresiona ENTER para continuar...")

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
