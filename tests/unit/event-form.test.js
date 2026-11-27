/**
 * SUITE DE PRUEBAS UNITARIAS E INTEGRIDAD — FORMULARIO DE EVENTOS (MANAGER)
 * Valida la lógica pura de eventFormUtils.js, imageUtils.js y contratos UI/imports.
 * Uso: node tests/unit/event-form.test.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Carga un módulo ES sencillo (solo exports puros sin imports externos)
 * de forma compatible con cualquier versión de Node sin alterar package.json.
 */
function loadPureEsmModule(relPath, sandboxExtras = {}) {
  const absPath = path.join(ROOT, relPath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const exportedNames = [];

  const transformed = raw
    .replace(/export\s+const\s+([A-Za-z0-9_]+)\s*=/g, (_, name) => {
      exportedNames.push(name);
      return `const ${name} =`;
    })
    .replace(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/g, (_, name) => {
      exportedNames.push(name);
      return `function ${name}(`;
    });

  const wrapped = `(function() {\n${transformed}\nreturn { ${exportedNames.join(', ')} };\n})()`;
  const context = vm.createContext({
    console,
    Date,
    Math,
    Number,
    String,
    Array,
    Boolean,
    parseInt,
    parseFloat,
    ...sandboxExtras,
  });

  return vm.runInContext(wrapped, context, { filename: absPath });
}

const eventFormUtils = loadPureEsmModule('src/pages/manager/utils/eventFormUtils.js');
const gestorEventFormUtils = loadPureEsmModule('laika-gestor/src/pages/manager/utils/eventFormUtils.js');
const imageUtils = loadPureEsmModule('src/utils/imageUtils.js', {
  window: { location: { protocol: 'http:', hostname: 'localhost' } },
});
const gestorImageUtils = loadPureEsmModule('laika-gestor/src/utils/imageUtils.js', {
  window: { location: { protocol: 'http:', hostname: 'localhost' } },
});

const {
  EVENT_CATEGORIES,
  INITIAL_EVENT_FORM,
  formatEventTime,
  sortFunctionsChronologically,
  normalizeEventToForm,
  normalizeEventFunctions,
  resolveAndValidateEventForm,
  buildHomePreviewEvent,
  parseGalleryUrls,
  serializeGalleryUrls,
} = eventFormUtils;

const { getImageUrl } = imageUtils;

let passCount = 0;
let failCount = 0;

function assert(description, condition, details = '') {
  if (condition) {
    passCount++;
    console.log(`  [PASS] #${passCount + failCount} - ${description}`);
  } else {
    failCount++;
    console.error(`  [FAIL] #${passCount + failCount} - ${description}${details ? ` (${details})` : ''}`);
  }
}

console.log('\n===============================================================');
console.log('   SUITE DE PRUEBAS — FORMULARIO DE EVENTOS Y PREVIEW HOME');
console.log('===============================================================\n');

// -------------------------------------------------------------
// GRUPO 1: NORMALIZACIÓN Y FORMATO DE HORARIOS / CATEGORÍAS
// -------------------------------------------------------------
console.log('--- GRUPO 1: NORMALIZACIÓN, CATEGORÍAS Y FORMATO ---');

assert(
  'EVENT_CATEGORIES incluye "family" (Familiar) sincronizada con EventCardPremium',
  EVENT_CATEGORIES.some((c) => c.id === 'family' && c.label === 'Familiar')
);

assert(
  'formatEventTime normaliza HH:MM:SS y segundos numéricos a HH:MM',
  formatEventTime('20:30:00') === '20:30' && formatEventTime(75600) === '21:00' && formatEventTime('') === ''
);

const editedEvent = {
  id: 42,
  name: 'Concierto Sinfónico',
  category: 'concert',
  event_date: '2026-08-15T00:00:00',
  event_time: '19:30:00',
  venue_id: 7,
  room_id: 12,
  use_seating_map: true,
  total_tickets: 300,
  available_tickets: 185,
  price: 450,
  map_url: 'https://maps.google.com/?q=test',
  seat_map_url: 'https://cdn.laika.test/map.png',
  functions: [
    { id: 1, date: '2026-08-16T00:00:00', time: '21:00:00', venue_id: 7, room_id: 12 },
    { id: 2, date: '2026-08-15T00:00:00', time: '19:30:00', venue_id: 7, room_id: 14 },
  ],
};

const normalized = normalizeEventToForm(editedEvent);
assert(
  'normalizeEventToForm preserva room_id, map_url, seat_map_url y available_tickets',
  normalized.room_id === 12 &&
    normalized.map_url === 'https://maps.google.com/?q=test' &&
    normalized.seat_map_url === 'https://cdn.laika.test/map.png' &&
    normalized.available_tickets === 185
);

const normFns = normalizeEventFunctions(editedEvent);
assert(
  'normalizeEventFunctions preserva venue_id, room_id y limpia fecha/hora',
  normFns.length === 2 && normFns[0].date === '2026-08-16' && normFns[0].time === '21:00' && normFns[1].room_id === 14
);

const sortedFns = sortFunctionsChronologically(normFns);
assert(
  'sortFunctionsChronologically coloca primero la fecha y hora más próxima',
  sortedFns[0].date === '2026-08-15' && sortedFns[0].time === '19:30'
);

// -------------------------------------------------------------
// GRUPO 2: VALIDACIONES DE FORMULARIO Y REGLAS DE NEGOCIO
// -------------------------------------------------------------
console.log('\n--- GRUPO 2: VALIDACIONES Y RESOLUCIÓN DE PAYLOAD ---');

const missingName = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: '   ', venue_id: '5' },
  functions: [{ date: '2026-09-10', time: '20:00', venue_id: '5', room_id: '' }],
});
assert('Rechaza envío cuando el nombre está vacío', !missingName.valid);

const missingVenue = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: 'Evento Test', venue_id: '' },
  functions: [],
});
assert('Rechaza envío cuando no hay recinto principal', !missingVenue.valid);

const missingDate = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: 'Evento Test', venue_id: '3' },
  functions: [],
  newFunction: { date: '', time: '', venue_id: '3', room_id: '' },
});
assert('Rechaza envío cuando no se ha configurado ninguna fecha', !missingDate.valid);

const negativePrice = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: 'Evento Test', venue_id: '3', price: -50 },
  functions: [{ date: '2026-09-10', time: '20:00', venue_id: '3', room_id: '' }],
});
assert('Rechaza precios negativos', !negativePrice.valid);

const zeroTickets = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: 'Evento Test', venue_id: '3', total_tickets: 0 },
  functions: [{ date: '2026-09-10', time: '20:00', venue_id: '3', room_id: '' }],
});
assert('Rechaza aforo menor a 1 boleto', !zeroTickets.valid);

const autoAddedFn = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: 'Noche de Rock', venue_id: '9', room_id: '4', price: 250, total_tickets: 200 },
  functions: [],
  newFunction: { date: '2026-10-05', time: '', venue_id: '9', room_id: '4' },
});
assert(
  'Auto-agrega newFunction si no se pulsó "+ Agregar", preserva room_id y usa 20:00 por defecto',
  autoAddedFn.valid &&
    autoAddedFn.payload.functions.length === 1 &&
    autoAddedFn.payload.functions[0].room_id === 4 &&
    autoAddedFn.payload.event_time === '20:00'
);

const editPreservesSales = resolveAndValidateEventForm({
  formData: { ...normalized, total_tickets: 300, available_tickets: 185 },
  functions: normFns,
  hasAdvancedPackage: true,
  isEditing: true,
});
assert(
  'Modo edición preserva available_tickets (no resetea boletos vendidos) y toma la fecha más temprana',
  editPreservesSales.valid &&
    editPreservesSales.payload.available_tickets === 185 &&
    editPreservesSales.payload.event_date === '2026-08-15' &&
    editPreservesSales.payload.use_seating_map === true
);

const editClampsAvailable = resolveAndValidateEventForm({
  formData: { ...normalized, total_tickets: 120, available_tickets: 185 },
  functions: normFns,
  hasAdvancedPackage: false,
  isEditing: true,
});
assert(
  'Modo edición acota available_tickets si total_tickets baja y bloquea use_seating_map sin Plan Avanzado',
  editClampsAvailable.valid &&
    editClampsAvailable.payload.available_tickets === 120 &&
    editClampsAvailable.payload.use_seating_map === false
);

const seatingWithoutRoom = resolveAndValidateEventForm({
  formData: { ...INITIAL_EVENT_FORM, name: 'Show', venue_id: '2', room_id: '', use_seating_map: true },
  functions: [{ date: '2026-11-11', time: '20:00', venue_id: '2', room_id: '' }],
  hasAdvancedPackage: true,
});
assert(
  'Bloquea use_seating_map cuando no hay sala seleccionada aunque tenga Plan Avanzado',
  seatingWithoutRoom.valid && seatingWithoutRoom.payload.use_seating_map === false
);

// -------------------------------------------------------------
// GRUPO 3: PREVIEW 1:1 CON HOME Y UTILIDAD DE IMÁGENES
// -------------------------------------------------------------
console.log('\n--- GRUPO 3: SINCRONIZACIÓN DE PREVIEW Y IMAGE UTILS ---');

const preview = buildHomePreviewEvent(
  {
    name: 'Festival Laika',
    category: 'festival',
    venue: 'Arena Ixmiquilpan',
    location: 'Ixmiquilpan',
    price: 555,
    total_tickets: 500,
    image_url: '',
  },
  [
    { date: '2026-12-20', time: '22:00', venue_id: '1' },
    { date: '2026-12-18', time: '19:00', venue_id: '1' },
  ]
);
const parsedPreviewDate = new Date(preview.event_date);
assert(
  'buildHomePreviewEvent sincroniza la función más cercana sin corrimiento de día UTC',
  preview.name === 'Festival Laika' &&
    preview.category === 'festival' &&
    preview.venue === 'Arena Ixmiquilpan' &&
    preview.start_time === '19:00' &&
    parsedPreviewDate.getDate() === 18 &&
    preview.available_seats === 500
);

const dataUri = 'data:image/svg+xml;charset=UTF-8,%3Csvg%3E%3C/svg%3E';
assert(
  'getImageUrl (root y laika-gestor) permite data: URIs y resuelve uploads correctamente',
  getImageUrl(dataUri) === dataUri &&
    gestorImageUtils.getImageUrl(dataUri) === dataUri &&
    getImageUrl('https://cdn.test/img.jpg') === 'https://cdn.test/img.jpg' &&
    getImageUrl('/api/uploads/events/a.jpg') === '/uploads/events/a.jpg' &&
    gestorImageUtils.getImageUrl('/api/events/uploads/events/a.jpg') === 'http://localhost:8000/uploads/events/a.jpg'
);

const parsedGallery = parseGalleryUrls(' /api/events/uploads/events/1.jpg, https://cdn.test/2.png , /api/events/uploads/events/1.jpg ');
assert(
  'parseGalleryUrls y serializeGalleryUrls deduplican y preservan el orden del carrusel',
  parsedGallery.length === 2 &&
    parsedGallery[0] === '/api/events/uploads/events/1.jpg' &&
    serializeGalleryUrls(parsedGallery) === '/api/events/uploads/events/1.jpg, https://cdn.test/2.png'
);

const gestorContractPayload = gestorEventFormUtils.resolveAndValidateEventForm({
  formData: {
    ...gestorEventFormUtils.INITIAL_EVENT_FORM,
    name: 'Show Gestor B2B',
    venue_id: '3',
    price: 350,
    total_tickets: 150,
  },
  functions: [{ date: '2026-11-22', time: '20:00', venue_id: '3', room_id: '' }],
  activeContractId: 9,
});
assert(
  'laika-gestor resuelve contract_id desde contrato B2B activo (y cae a 1 por defecto)',
  gestorContractPayload.valid && gestorContractPayload.payload.contract_id === 9
);

// -------------------------------------------------------------
// GRUPO 4: AUDITORÍA ESTÁTICA (IMPORTS, ICONOS, 0 EMOJIS)
// -------------------------------------------------------------
console.log('\n--- GRUPO 4: AUDITORÍA ESTÁTICA DE COMPONENTES ---');

const iconsSource = fs.readFileSync(path.join(ROOT, 'src/components/Icons/Icons.jsx'), 'utf8');
const validIconNames = new Set(
  Array.from(iconsSource.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:\s*\(/gm)).map((m) => m[1])
);

const managerFiles = [
  'src/pages/manager/EventForm.jsx',
  'src/pages/manager/EventCardPreview.jsx',
  'src/pages/manager/views/CreateEventPage.jsx',
  'src/pages/manager/hooks/useManagerEventForm.js',
  'src/pages/manager/utils/eventFormUtils.js',
  'src/pages/manager/components/EventForm/EventIdentitySection.jsx',
  'src/pages/manager/components/EventForm/EventScheduleSection.jsx',
  'src/pages/manager/components/EventForm/EventPricingSection.jsx',
  'src/pages/manager/components/EventForm/EventExtrasSection.jsx',
  'laika-gestor/src/pages/manager/EventForm.jsx',
  'laika-gestor/src/pages/manager/EventCardPreview.jsx',
  'laika-gestor/src/pages/manager/views/CreateEventPage.jsx',
  'laika-gestor/src/pages/manager/hooks/useManagerEventForm.js',
  'laika-gestor/src/pages/manager/utils/eventFormUtils.js',
  'laika-gestor/src/pages/manager/components/EventForm/EventIdentitySection.jsx',
  'laika-gestor/src/pages/manager/components/EventForm/EventScheduleSection.jsx',
  'laika-gestor/src/pages/manager/components/EventForm/EventPricingSection.jsx',
  'laika-gestor/src/pages/manager/components/EventForm/EventExtrasSection.jsx',
  'laika-gestor/src/pages/manager/components/EventForm/HomeEventCardReplica.jsx',
];

const invalidIcons = [];
const brokenImports = [];
const emojiHits = [];
const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

for (const rel of managerFiles) {
  const fullPath = path.join(ROOT, rel);
  const src = fs.readFileSync(fullPath, 'utf8');

  if (emojiRegex.test(src)) {
    emojiHits.push(rel);
  }

  for (const m of src.matchAll(/<Icon\s+name="([^"]+)"/g)) {
    if (!validIconNames.has(m[1])) {
      invalidIcons.push(`${rel}: ${m[1]}`);
    }
  }

  for (const m of src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const spec = m[1];
    const base = path.resolve(path.dirname(fullPath), spec);
    const candidates = [
      base,
      `${base}.js`,
      `${base}.jsx`,
      `${base}.css`,
      path.join(base, 'index.js'),
      path.join(base, 'index.jsx'),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) {
      brokenImports.push(`${rel} -> ${spec}`);
    }
  }
}

assert(
  'Todos los nombres de <Icon name="..." /> existen en Icons.jsx',
  invalidIcons.length === 0,
  invalidIcons.join(', ')
);
assert(
  'Todos los imports relativos resuelven a archivos existentes',
  brokenImports.length === 0,
  brokenImports.join(', ')
);
assert(
  'Cero emojis en los archivos del formulario de eventos',
  emojiHits.length === 0,
  emojiHits.join(', ')
);

console.log('\n===============================================================');
console.log(`   RESUMEN: ${passCount} PASSED | ${failCount} FAILED`);
console.log('===============================================================\n');

process.exit(failCount > 0 ? 1 : 0);

