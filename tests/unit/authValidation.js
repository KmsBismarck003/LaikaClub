/**
 * VALIDACIONES DE AUTENTICACIÓN, REGISTRO Y SEGURIDAD
 * Pruebas unitarias para validar reglas de negocio, formatos y sanitización.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FORBIDDEN_SQL_PATTERNS = [
    /('|--|;|\/\*|\*\/|xp_|sp_)/i,
    /(union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|drop\s+table)/i
];
const FORBIDDEN_XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /<img\s+[^>]*onerror=/gi,
    /<iframe/gi
];

/**
 * Valida si un correo electrónico tiene formato correcto según estándar RFC.
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return { valid: false, reason: 'Correo nulo o vacío' };
    const trimmed = email.trim();
    if (trimmed.length > 254) return { valid: false, reason: 'Excede longitud máxima de 254 caracteres' };
    if (!EMAIL_REGEX.test(trimmed)) return { valid: false, reason: 'Formato de correo no cumple estándar' };
    return { valid: true, email: trimmed.toLowerCase() };
}

/**
 * Simula verificación de duplicados de correo en base a un listado de usuarios existentes.
 */
function checkEmailAvailability(email, existingEmails = []) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) return { available: false, reason: emailValidation.reason };
    const exists = existingEmails.some(e => e.toLowerCase() === emailValidation.email);
    if (exists) {
        return { available: false, reason: 'El correo electrónico ya se encuentra registrado en el sistema' };
    }
    return { available: true };
}

/**
 * Evalúa las directrices de robustez de contraseña.
 * Regla: Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
 */
function validatePasswordStrength(password) {
    if (!password || typeof password !== 'string') return { valid: false, score: 0, reason: 'Contraseña requerida' };
    if (password.length < 8) return { valid: false, score: 1, reason: 'Requiere mínimo 8 caracteres' };
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const passedChecks = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (!hasUpper) return { valid: false, score: passedChecks, reason: 'Falta al menos una letra mayúscula' };
    if (!hasLower) return { valid: false, score: passedChecks, reason: 'Falta al menos una letra minúscula' };
    if (!hasNumber) return { valid: false, score: passedChecks, reason: 'Falta al menos un número' };
    if (!hasSpecial) return { valid: false, score: passedChecks, reason: 'Falta al menos un carácter especial' };

    return { valid: true, score: 4, reason: 'Contraseña segura' };
}

/**
 * Comprueba coincidencia exacta entre contraseña y confirmación.
 */
function validatePasswordMatch(password, confirmPassword) {
    if (!password || !confirmPassword) return { match: false, reason: 'Ambos campos son obligatorios' };
    if (password !== confirmPassword) return { match: false, reason: 'Las contraseñas no coinciden' };
    return { match: true };
}

/**
 * Detecta inyecciones SQL y caracteres prohibidos.
 */
function detectSqlInjection(input) {
    if (!input || typeof input !== 'string') return { safe: true };
    for (const pattern of FORBIDDEN_SQL_PATTERNS) {
        if (pattern.test(input)) {
            return { safe: false, threat: 'SQL_INJECTION_DETECTED', matched: pattern.toString() };
        }
    }
    return { safe: true };
}

/**
 * Detecta scripts o vectores XSS en entradas de texto.
 */
function detectXssThreats(input) {
    if (!input || typeof input !== 'string') return { safe: true };
    for (const pattern of FORBIDDEN_XSS_PATTERNS) {
        if (pattern.test(input)) {
            return { safe: false, threat: 'XSS_ATTACK_DETECTED', matched: pattern.toString() };
        }
    }
    return { safe: true };
}

/**
 * Sanitiza campos de texto eliminando etiquetas HTML y caracteres de control no imprimibles.
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Elimina caracteres de control
        .replace(/<[^>]*>?/gm, '')                    // Elimina tags HTML
        .trim();
}

module.exports = {
    validateEmail,
    checkEmailAvailability,
    validatePasswordStrength,
    validatePasswordMatch,
    detectSqlInjection,
    detectXssThreats,
    sanitizeInput
};
