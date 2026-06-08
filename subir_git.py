#!/usr/bin/env python3
import os
import sys
import subprocess

# Configuración de colores ANSI para una interfaz bonita
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

def run_command(cmd, shell=True):
    """Ejecuta un comando y devuelve el código de retorno, stdout y stderr."""
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=shell)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return -1, "", str(e)

def run_command_live(cmd):
    """Ejecuta un comando mostrando su salida en tiempo real en la terminal."""
    print(f"{CYAN}$ {cmd}{RESET}")
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, shell=True)
    
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())
            
    return process.poll()

def get_current_branch():
    _, stdout, _ = run_command("git rev-parse --abbrev-ref HEAD")
    return stdout or "main"

def get_local_branches():
    _, stdout, _ = run_command("git branch --format='%(refname:short)'")
    if not stdout:
        return []
    return [line.strip().replace("'", "") for line in stdout.split("\n") if line.strip()]

def get_git_status():
    _, stdout, _ = run_command("git status --porcelain")
    if not stdout:
        return []
    
    files = []
    for line in stdout.split("\n"):
        if len(line) < 4:
            continue
        status_code = line[:2]
        file_path = line[3:].strip('"')
        
        # Clasificación simple
        state = "Modificado"
        color = YELLOW
        if "A" in status_code or "?" in status_code:
            state = "Nuevo"
            color = GREEN
        elif "D" in status_code:
            state = "Eliminado"
            color = RED
            
        files.append((file_path, state, color))
    return files

def check_pending_commits():
    """Verifica si hay commits locales no subidos al origin."""
    branch = get_current_branch()
    # Verifica si tiene upstream
    code, _, _ = run_command(f"git rev-parse --abbrev-ref {branch}@{{upstream}}")
    if code != 0:
        return True # Si no tiene upstream, hay que subirla
    
    # Cuenta commits ahead
    code_ahead, stdout, _ = run_command(f"git rev-list --count {branch}@{{upstream}}..HEAD")
    if code_ahead == 0 and stdout.isdigit() and int(stdout) > 0:
        return True
    return False

def print_header():
    print(f"\n{CYAN}{BOLD}╔══════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{CYAN}{BOLD}║            🐾  LAIKA CLUB - SUBIDOR AUTOMÁTICO  🐾          ║{RESET}")
    print(f"{CYAN}{BOLD}╚══════════════════════════════════════════════════════════════╝{RESET}\n")

def main():
    # Asegurar que estamos en el directorio correcto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print_header()
    
    # 1. Verificar si es un repositorio git
    git_check, _, _ = run_command("git rev-parse --is-inside-work-tree")
    if git_check != 0:
        print(f"{RED}[❌] Este directorio no es un repositorio Git.{RESET}")
        return

    # 2. Obtener cambios locales
    changes = get_git_status()
    has_pending_commits = check_pending_commits()
    current_branch = get_current_branch()
    
    if not changes:
        print(f"{GREEN}[✓] No hay cambios locales sin confirmar (git status limpio).{RESET}")
        if has_pending_commits:
            print(f"{YELLOW}[!] Tienes commits locales listos para subir en la rama '{current_branch}'.{RESET}")
            resp = input(f"¿Quieres subirlos ahora mismo a origin/{current_branch}? [S/n]: ").strip().lower()
            if resp in ["", "s", "si", "y", "yes"]:
                run_command_live(f"git push -u origin {current_branch}")
            return
        else:
            print(f"{GREEN}[✓] ¡Todo está perfectamente sincronizado con el servidor!{RESET}")
            return

    # 3. Mostrar los cambios detectados
    print(f"{BOLD}📂 Cambios locales detectados ({len(changes)} archivos):{RESET}")
    for file, state, color in changes:
        print(f"  {color}• [{state}] {file}{RESET}")
    print(f"\n🌲 Rama actual: {BOLD}{CYAN}{current_branch}{RESET}")
    
    # 4. Preguntar a qué rama subir
    print(f"\n{BOLD}¿A qué rama deseas subir estos cambios?{RESET}")
    print(f"  {GREEN}1.{RESET} Usar rama actual: {BOLD}{current_branch}{RESET}")
    print(f"  {GREEN}2.{RESET} Cambiar a una rama existente y subir ahí")
    print(f"  {GREEN}3.{RESET} Crear una NUEVA rama y subir ahí")
    print(f"  {GREEN}0.{RESET} Cancelar")
    
    branch_option = input(f"\nElige una opción [{BOLD}1{RESET}]: ").strip()
    if branch_option == "":
        branch_option = "1"
        
    target_branch = current_branch
    
    if branch_option == "0":
        print(f"\n{YELLOW}[!] Operación cancelada.{RESET}")
        return
    
    elif branch_option == "2":
        branches = get_local_branches()
        if not branches:
            print(f"{RED}[❌] No se encontraron ramas locales.{RESET}")
            return
        print(f"\n{BOLD}Ramas locales disponibles:{RESET}")
        for idx, br in enumerate(branches, 1):
            marker = "*" if br == current_branch else " "
            print(f"  {marker} {idx}. {CYAN}{br}{RESET}")
            
        br_idx = input(f"\nSelecciona el número de la rama: ").strip()
        if not br_idx.isdigit() or int(br_idx) < 1 or int(br_idx) > len(branches):
            print(f"{RED}[❌] Selección inválida.{RESET}")
            return
        
        target_branch = branches[int(br_idx) - 1]
        
    elif branch_option == "3":
        new_branch = input(f"\nIngresa el nombre de la NUEVA rama: ").strip()
        if not new_branch:
            print(f"{RED}[❌] El nombre de la rama no puede estar vacío.{RESET}")
            return
        # Limpiar nombre
        new_branch = new_branch.lower().replace(" ", "-")
        target_branch = new_branch
        
        print(f"\n{GREEN}[*] Creando y cambiando a la nueva rama '{target_branch}'...{RESET}")
        code, _, err = run_command(f"git checkout -b {target_branch}")
        if code != 0:
            print(f"{RED}[❌] Error al crear la rama: {err}{RESET}")
            return

    # Si elegimos una rama existente diferente a la actual, hacer checkout
    if target_branch != current_branch and branch_option == "2":
        print(f"\n{GREEN}[*] Cambiando a la rama '{target_branch}'...{RESET}")
        code, _, err = run_command(f"git checkout {target_branch}")
        if code != 0:
            print(f"{RED}[❌] Error al cambiar de rama: {err}{RESET}")
            return

    # 5. Pedir mensaje de commit (por defecto sugerir el nombre de la rama)
    print(f"\n{BOLD}📝 Mensaje de commit:{RESET}")
    default_msg = target_branch
    commit_msg = input(f"Escribe el mensaje [Default: '{default_msg}']: ").strip()
    if not commit_msg:
        commit_msg = default_msg

    # 6. Ejecutar Git Add, Commit y Push
    print(f"\n{GREEN}[+] Agregando todos los cambios (git add .)...{RESET}")
    run_command("git add .")
    
    print(f"{GREEN}[+] Confirmando cambios (git commit)...{RESET}")
    commit_code, stdout, stderr = run_command(f'git commit -m "{commit_msg}"')
    if commit_code != 0:
        print(f"{RED}[❌] Error al hacer commit:{RESET}\n{stdout or stderr}")
        return
        
    print(f"{GREEN}[+] Subiendo cambios a origin/{target_branch}...{RESET}")
    push_code = run_command_live(f"git push -u origin {target_branch}")
    
    if push_code == 0:
        print(f"\n{GREEN}{BOLD}[🎉] ¡Todo listo! Cambios subidos exitosamente a origin/{target_branch}{RESET}\n")
    else:
        print(f"\n{RED}{BOLD}[❌] Error al subir cambios a GitHub.{RESET}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}[!] Operación cancelada por el usuario.{RESET}")
        sys.exit(0)
