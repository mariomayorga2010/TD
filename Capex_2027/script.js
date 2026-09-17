/* =============================================================
   CAPEX DIGITAL – Reporte dinámico
   GMXT / Área Digital
   script.js — lógica de datos, cálculo de matriz, KPIs y gráfica
   ============================================================= */

'use strict';

/* -------------------------------------------------------------
   1. CONFIGURACIÓN GLOBAL
   ------------------------------------------------------------- */
const EMPRESAS = ['FXE', 'FSRR', 'FEC', 'IMEX', 'TXPC', 'CGR'];

// Orden exacto de filas del reporte (igual al layout objetivo)
const FILAS_CAPEX = ['Estratégicos', 'Esenciales', 'Obsolescencia', 'Carry Over'];
const FILAS_FIN_TMS = ['TMS y módulos asociados', 'Finanzas – One SAP'];

/* -------------------------------------------------------------
   2. DATASET MOCK (extraído de la base DTD.xlsx)
   Montos expresados en miles de USD.
   Campos:
     id, titulo, responsable, gerencia, empresa,
     categoria  -> fila del reporte
     bloque     -> 'CAPEX' | 'FIN_TMS'
     anio, monto
   ------------------------------------------------------------- */
const DATA_MOCK = [
  { id: 1,  titulo: 'Data Lake para analítica e IA corporativa GMXT', responsable: 'Ramon Hernandez Maldonado', gerencia: 'Gcia. Aplicaciones', empresa: 'FXE',  categoria: 'Esenciales',    bloque: 'CAPEX',   anio: 2027, monto: 240 },
  { id: 2,  titulo: 'RFID en neumáticos de flota propia', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Esenciales',    bloque: 'CAPEX',   anio: 2027, monto: 160 },
  { id: 3,  titulo: 'Habilitación de WiFi en accesos de terminales intermodales', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 284 },
  { id: 4,  titulo: 'ONE Intermodal', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 1750 },
  { id: 5,  titulo: 'Plataforma unificada de servicios', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 130 },
  { id: 6,  titulo: 'Plataforma Integral de Visibilidad GPS y Diagnóstico de Pulsaciones', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 130 },
  { id: 7,  titulo: 'Instalación de taquilla en coche de Chepe Regional', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'CGR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 40 },
  { id: 8,  titulo: 'Players por GPS de sitios de interés', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'CGR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 135 },
  { id: 9,  titulo: 'OneSAP FXE', responsable: 'Jose Manuel Guntin Ocampo', gerencia: 'Gcia. Aplicaciones', empresa: 'FXE', categoria: 'Finanzas – One SAP', bloque: 'FIN_TMS', anio: 2027, monto: 2520 },
  { id: 10, titulo: 'OneSAP FSRR', responsable: 'Jose Manuel Guntin Ocampo', gerencia: 'Gcia. Aplicaciones', empresa: 'FSRR', categoria: 'Finanzas – One SAP', bloque: 'FIN_TMS', anio: 2027, monto: 770 },
  { id: 11, titulo: 'OneSAP IMEX', responsable: 'Jose Manuel Guntin Ocampo', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Finanzas – One SAP', bloque: 'FIN_TMS', anio: 2027, monto: 130 },
  { id: 12, titulo: 'Dispositivos biométricos FXE', responsable: 'Roberto Trejo Hernandez', gerencia: 'Gerencia/Superintendencia/Ing. División', empresa: 'FXE', categoria: 'Obsolescencia', bloque: 'CAPEX', anio: 2027, monto: 210 },
  { id: 13, titulo: 'Venta de servicio de Internet a clientes desde boletos', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'CGR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 176 },
  { id: 14, titulo: 'Sistema de venta de boletos turismo multimarca', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'CGR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 200 },
  { id: 15, titulo: 'Migración por obsolescencia tecnológica FXE', responsable: 'German Flores Serrano', gerencia: 'Gcia. Sr. Desarrollo de Soluciones', empresa: 'FXE', categoria: 'Obsolescencia', bloque: 'CAPEX', anio: 2027, monto: 100 },
  { id: 16, titulo: 'Migración por obsolescencia tecnológica IMEX', responsable: 'German Flores Serrano', gerencia: 'Gcia. Sr. Desarrollo de Soluciones', empresa: 'IMEX', categoria: 'Obsolescencia', bloque: 'CAPEX', anio: 2027, monto: 100 },
  { id: 17, titulo: 'Jefa de Maquinistas (agente IA)', responsable: 'Alejandro Gaytan Treviño', gerencia: 'Gcia. TI Digital Transporte y Oper.', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 300 },
  { id: 18, titulo: 'Sistema Control Reclamos / Confrontas', responsable: 'Alejandro Gaytan Treviño', gerencia: 'Gcia. TI Digital Transporte y Oper.', empresa: 'FXE', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 600 },
  { id: 19, titulo: 'La Maquinista – Patios (industria)', responsable: 'Jose Armando Alvarez Hernandez', gerencia: 'Gcia. TI', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 500 },
  { id: 20, titulo: 'TMS Mejoras y Replicación FXE', responsable: 'Jose Armando Alvarez Hernandez', gerencia: 'Gcia. TI', empresa: 'FXE', categoria: 'TMS y módulos asociados', bloque: 'FIN_TMS', anio: 2027, monto: 2200 },
  { id: 21, titulo: 'Sistema de alertas Ops. comunicación redundante Fase II', responsable: 'Jose Armando Alvarez Hernandez', gerencia: 'Gcia. TI', empresa: 'FXE', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 700 },
  { id: 22, titulo: 'Piloto Movement Planner + CTC', responsable: 'Jose Armando Alvarez Hernandez', gerencia: 'Gcia. TI', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 2000 },
  { id: 23, titulo: 'Registro de asistencia de cuadrillas de vía con biométrico', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 350 },
  { id: 24, titulo: 'TIMPS 2026-2027 FXE', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 535 },
  { id: 25, titulo: 'TIMPS 2026-2027 FSRR', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FSRR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 134 },
  { id: 26, titulo: 'Reemplazo de biométrico de huella por facial para tripulaciones', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 150 },
  { id: 27, titulo: 'SICALL 2.0 Implementación FXE', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 133 },
  { id: 28, titulo: 'SICALL 2.0 Soporte y Mantenimiento FXE', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 578 },
  { id: 29, titulo: 'SICALL 2.0 Implementación FSRR', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FSRR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 90 },
  { id: 30, titulo: 'SICALL 2.0 Soporte y Mantenimiento FSRR', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FSRR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 144 },
  { id: 31, titulo: 'Maquinista – Ferroways', responsable: 'Jose Armando Alvarez Hernandez', gerencia: 'Gcia. TI', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 350 },
  { id: 32, titulo: 'La Maquinista – Tripulaciones', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 100 },
  { id: 33, titulo: 'Sistema de Asignación de Locomotoras', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 1000 },
  { id: 34, titulo: 'App Boletines – Fase 2', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 80 },
  { id: 35, titulo: 'Mejoras y Migración MIIT (Patio y Camino)', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 300 },
  { id: 36, titulo: 'Mejoras y Migración del SAO', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 300 },
  { id: 37, titulo: 'Mejoras y Migración del SOP', responsable: 'Luis Joel Orozco Garcia', gerencia: 'Gcia. Sistemas Operativos', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 300 },
  { id: 38, titulo: 'Sistema de confirmación de cambio de agujas', responsable: 'Jose Israel Cuarenta Gallardo', gerencia: 'Gcia. Señales y Electricidad', empresa: 'FXE', categoria: 'Esenciales', bloque: 'CAPEX', anio: 2027, monto: 1000 },
  { id: 39, titulo: 'TMS Mejoras y Replicación FSRR', responsable: 'Jose Armando Alvarez Hernandez', gerencia: 'Gcia. TI', empresa: 'FSRR', categoria: 'TMS y módulos asociados', bloque: 'FIN_TMS', anio: 2027, monto: 800 },
  { id: 40, titulo: 'Plataforma de Onboarding para empleados de nuevo ingreso', responsable: 'Roberto Trejo Hernandez', gerencia: 'Gerencia/Superintendencia/Ing. División', empresa: 'FXE', categoria: 'Obsolescencia', bloque: 'CAPEX', anio: 2027, monto: 120 },
  { id: 41, titulo: 'Actualización de Universidad Virtual GMXT', responsable: 'Roberto Trejo Hernandez', gerencia: 'Gerencia/Superintendencia/Ing. División', empresa: 'FXE', categoria: 'Obsolescencia', bloque: 'CAPEX', anio: 2027, monto: 90 },
  { id: 42, titulo: 'Implementación de plataforma Coupa FXE', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'FXE', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 134 },
  { id: 43, titulo: 'Implementación de plataforma Coupa FSRR', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'FSRR', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 100 },
  { id: 44, titulo: 'Implementación de plataforma Coupa IMEX', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'IMEX', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 100 },
  { id: 45, titulo: 'Implementación de plataforma Coupa FEC', responsable: 'Jorge Alvelais Torres', gerencia: 'Gcia. Aplicaciones', empresa: 'FEC', categoria: 'Estratégicos', bloque: 'CAPEX', anio: 2027, monto: 84 },
  /* --- Carry Over 2026 (arrastre de ejercicio previo) --- */
  { id: 46, titulo: 'Carry Over 2026 – proyectos en ejecución FXE', responsable: 'Alejandro Gaytan Treviño', gerencia: 'Gcia. TI Digital', empresa: 'FXE', categoria: 'Carry Over', bloque: 'CAPEX', anio: 2026, monto: 1748 },
  { id: 47, titulo: 'Carry Over 2026 – proyectos en ejecución FSRR', responsable: 'Alejandro Gaytan Treviño', gerencia: 'Gcia. TI Digital', empresa: 'FSRR', categoria: 'Carry Over', bloque: 'CAPEX', anio: 2026, monto: 304 }
];

/* -------------------------------------------------------------
   3. CARGA DE DATOS
   ► loadData(): ÚNICO punto de acceso a la fuente.
     Hoy devuelve el mock; para producción basta con sustituir
     el cuerpo por la llamada REST a SharePoint (ver bloque
     comentado más abajo).
   ------------------------------------------------------------- */
async function loadData() {
  // ---------- MODO MOCK (actual) ----------
  return new Promise(resolve => setTimeout(() => resolve(DATA_MOCK), 150));

  /* ---------- MODO SHAREPOINT (producción) ----------
  const LISTA   = 'CAPEX 2027 Agrupados Completa';
  const SELECT  = 'Id,Title,Empresa,Categoria,Bloque,Anio,Monto,Responsable,Gerencia';
  const url = `${_spPageContextInfo.webAbsoluteUrl}` +
              `/_api/web/lists/getbytitle('${LISTA}')/items` +
              `?$select=${SELECT}&$top=5000`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json;odata=nometadata' },
    credentials: 'same-origin'          // usa la sesión del usuario
  });
  if (!res.ok) throw new Error('Error al consultar SharePoint: ' + res.status);
  const json = await res.json();

  // Mapeo campo-lista -> modelo interno del reporte
  return json.value.map(it => ({
    id:          it.Id,
    titulo:      it.Title,
    responsable: it.Responsable,
    gerencia:    it.Gerencia,
    empresa:     it.Empresa,
    categoria:   it.Categoria,
    bloque:      it.Bloque,          // 'CAPEX' | 'FIN_TMS'
    anio:        Number(it.Anio),
    monto:       Number(it.Monto) || 0
  }));
  -------------------------------------------------- */
}

/* -------------------------------------------------------------
   4. ESTADO DE LA APLICACIÓN
   ------------------------------------------------------------- */
const state = {
  raw: [],                 // dataset completo
  filtros: { empresa: 'ALL', categoria: 'ALL', anio: 'ALL', q: '' },
  chart: null
};

/* -------------------------------------------------------------
   5. UTILIDADES
   ------------------------------------------------------------- */
const DASH = '–'; // guion largo para nulos/ceros

/** Formatea número con separador de miles; DASH si es 0/nulo. */
function fmt(n) {
  if (!n || Number.isNaN(n)) return DASH;
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(Math.round(n));
}

/** Normaliza texto para búsquedas (sin acentos, minúsculas). */
function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* -------------------------------------------------------------
   6. FILTRADO
   ------------------------------------------------------------- */
function getFiltered() {
  const { empresa, categoria, anio, q } = state.filtros;
  const qn = norm(q);
  return state.raw.filter(r =>
    (empresa === 'ALL'   || r.empresa === empresa) &&
    (categoria === 'ALL' || r.categoria === categoria) &&
    (anio === 'ALL'      || String(r.anio) === String(anio)) &&
    (!qn || norm(r.titulo).includes(qn) || norm(r.responsable).includes(qn) || norm(r.gerencia).includes(qn))
  );
}

/* -------------------------------------------------------------
   7. AGREGACIÓN — matriz categoría × empresa
   Devuelve { 'Estratégicos': { FXE: 1489, ..., TOTAL: 5734 }, ... }
   ------------------------------------------------------------- */
function buildMatrix(rows) {
  const filas = [...FILAS_CAPEX, ...FILAS_FIN_TMS];
  const m = {};
  filas.forEach(f => {
    m[f] = {};
    EMPRESAS.forEach(e => (m[f][e] = 0));
    m[f].TOTAL = 0;
  });
  rows.forEach(r => {
    if (!m[r.categoria] || !EMPRESAS.includes(r.empresa)) return;
    m[r.categoria][r.empresa] += r.monto;
    m[r.categoria].TOTAL += r.monto;
  });
  return m;
}

/** Suma dinámica de un conjunto de filas de la matriz. */
function sumRows(matrix, filas) {
  const out = {};
  EMPRESAS.forEach(e => (out[e] = filas.reduce((a, f) => a + (matrix[f]?.[e] || 0), 0)));
  out.TOTAL = filas.reduce((a, f) => a + (matrix[f]?.TOTAL || 0), 0);
  return out;
}

/* -------------------------------------------------------------
   8. RENDER — tabla principal
   ------------------------------------------------------------- */
function renderTable(matrix) {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';

  const subtotal = sumRows(matrix, FILAS_CAPEX);
  const finTms   = sumRows(matrix, FILAS_FIN_TMS);
  const total    = sumRows(matrix, [...FILAS_CAPEX, ...FILAS_FIN_TMS]);

  // --- Filas de detalle CAPEX ---
  FILAS_CAPEX.forEach(f => tbody.appendChild(
    buildRow(f, matrix[f], f === 'Carry Over' ? 'row--carry' : 'row--detalle')
  ));
  tbody.appendChild(buildRow('SUBTOTAL CAPEX', subtotal, 'row--subtotal', false));
  tbody.appendChild(spacerRow());

  // --- Bloque Finanzas y TMS ---
  FILAS_FIN_TMS.forEach(f => tbody.appendChild(buildRow(f, matrix[f], 'row--detalle')));
  tbody.appendChild(buildRow('TOTAL CAPEX FINANZAS Y TMS', finTms, 'row--subtotal', false));
  tbody.appendChild(spacerRow());

  // --- Gran total ---
  tbody.appendChild(buildRow('TOTAL CAPEX', total, 'row--total', false));
}

function spacerRow() {
  const tr = document.createElement('tr');
  tr.className = 'row--spacer';
  tr.setAttribute('aria-hidden', 'true');
  tr.innerHTML = `<td colspan="${EMPRESAS.length + 2}"></td>`;
  return tr;
}

/**
 * Construye una fila. Si drill = true las celdas son interactivas.
 */
function buildRow(label, vals, cls, drill = true) {
  const tr = document.createElement('tr');
  tr.className = cls;

  const th = document.createElement('th');
  th.scope = 'row';
  th.textContent = label;
  tr.appendChild(th);

  EMPRESAS.forEach(e => {
    const td = document.createElement('td');
    td.textContent = fmt(vals[e]);
    td.dataset.empresa = e;
    td.dataset.categoria = label;
    if (drill && vals[e]) {
      td.classList.add('is-drill');
      td.tabIndex = 0;
      td.setAttribute('role', 'button');
      td.setAttribute('aria-label', `Ver detalle de ${label} en ${e}: ${fmt(vals[e])} miles de USD`);
      td.addEventListener('click', () => openDrill(label, e));
      td.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openDrill(label, e); }
      });
    }
    tr.appendChild(td);
  });

  const tdTot = document.createElement('td');
  tdTot.className = 'col-total';
  tdTot.textContent = fmt(vals.TOTAL);
  if (drill && vals.TOTAL) {
    tdTot.classList.add('is-drill');
    tdTot.tabIndex = 0;
    tdTot.setAttribute('role', 'button');
    tdTot.addEventListener('click', () => openDrill(label, 'ALL'));
  }
  tr.appendChild(tdTot);

  return tr;
}

/* -------------------------------------------------------------
   9. DRILL-DOWN
   ------------------------------------------------------------- */
function openDrill(categoria, empresa) {
  const rows = getFiltered().filter(r =>
    r.categoria === categoria && (empresa === 'ALL' || r.empresa === empresa)
  );

  document.getElementById('drillTitle').textContent =
    `${categoria} · ${empresa === 'ALL' ? 'Todas las empresas' : empresa}`;
  document.getElementById('drillMeta').textContent =
    `${rows.length} registro(s) · ${fmt(rows.reduce((a, r) => a + r.monto, 0))} miles USD`;

  const body = document.getElementById('drillBody');
  body.innerHTML = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.titulo}</td>
      <td>${r.empresa}</td>
      <td>${r.responsable}</td>
      <td>${r.gerencia}</td>
      <td>${r.anio}</td>
      <td class="num">${fmt(r.monto)}</td>
    </tr>`).join('') ||
    `<tr><td colspan="7" class="empty">Sin registros para esta combinación.</td></tr>`;

  const dlg = document.getElementById('drill');
  dlg.hidden = false;
  document.getElementById('drillClose').focus();
}

function closeDrill() {
  document.getElementById('drill').hidden = true;
}

/* -------------------------------------------------------------
   10. KPIs
   ------------------------------------------------------------- */
function renderKPIs(rows, matrix) {
  const total = rows.reduce((a, r) => a + r.monto, 0);
  document.getElementById('kpiTotal').textContent = fmt(total);

  // Categoría con mayor peso
  const cats = Object.entries(matrix)
    .map(([k, v]) => [k, v.TOTAL])
    .sort((a, b) => b[1] - a[1]);
  const topCat = cats[0] || ['—', 0];
  document.getElementById('kpiCat').textContent = topCat[0];
  document.getElementById('kpiCatPct').textContent =
    total ? `${((topCat[1] / total) * 100).toFixed(1)} % del total` : DASH;

  // Empresa con mayor inversión
  const porEmp = EMPRESAS
    .map(e => [e, rows.filter(r => r.empresa === e).reduce((a, r) => a + r.monto, 0)])
    .sort((a, b) => b[1] - a[1]);
  const topEmp = porEmp[0] || ['—', 0];
  document.getElementById('kpiEmp').textContent = topEmp[0];
  document.getElementById('kpiEmpVal').textContent =
    `${fmt(topEmp[1])} miles USD${total ? ` · ${((topEmp[1] / total) * 100).toFixed(1)} %` : ''}`;

  document.getElementById('kpiProy').textContent = rows.length;
}

/* -------------------------------------------------------------
   11. GRÁFICA (Chart.js — barras apiladas por empresa/categoría)
   ------------------------------------------------------------- */
const PALETA = {
  'Estratégicos':            '#3c5a72',
  'Esenciales':              '#5b8aa6',
  'Obsolescencia':           '#9db8c7',
  'Carry Over':              '#c8102e',
  'TMS y módulos asociados': '#7a9a3f',
  'Finanzas – One SAP':      '#d99a2b'
};

function renderChart(matrix) {
  const ctx = document.getElementById('chart');
  const filas = [...FILAS_CAPEX, ...FILAS_FIN_TMS];

  const datasets = filas.map(f => ({
    label: f,
    data: EMPRESAS.map(e => matrix[f][e]),
    backgroundColor: PALETA[f],
    borderRadius: 4,
    borderSkipped: false
  }));

  if (state.chart) { state.chart.destroy(); }
  state.chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: EMPRESAS, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.y)} kUSD` }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, ticks: { callback: v => fmt(v) }, grid: { color: '#eef1f4' } }
      }
    }
  });
}

/* -------------------------------------------------------------
   12. EXPORTACIÓN CSV (abre en Excel; BOM para acentos)
   ------------------------------------------------------------- */
function exportCSV() {
  const rows = getFiltered();
  const head = ['ID', 'Proyecto', 'Empresa', 'Categoria', 'Bloque', 'Responsable', 'Gerencia', 'Anio', 'Monto (kUSD)'];
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [head.join(',')]
    .concat(rows.map(r => [r.id, r.titulo, r.empresa, r.categoria, r.bloque, r.responsable, r.gerencia, r.anio, r.monto].map(esc).join(',')))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `CAPEX_Digital_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* -------------------------------------------------------------
   13. FILTROS — poblar selects y escuchar eventos
   ------------------------------------------------------------- */
function initFiltros() {
  const selE = document.getElementById('fEmpresa');
  const selC = document.getElementById('fCategoria');
  const selA = document.getElementById('fAnio');

  EMPRESAS.forEach(e => selE.add(new Option(e, e)));
  [...FILAS_CAPEX, ...FILAS_FIN_TMS].forEach(c => selC.add(new Option(c, c)));
  [...new Set(state.raw.map(r => r.anio))].sort().forEach(a => selA.add(new Option(a, a)));

  selE.onchange = () => { state.filtros.empresa = selE.value; render(); };
  selC.onchange = () => { state.filtros.categoria = selC.value; render(); };
  selA.onchange = () => { state.filtros.anio = selA.value; render(); };

  const q = document.getElementById('fQuery');
  let t;
  q.oninput = () => { clearTimeout(t); t = setTimeout(() => { state.filtros.q = q.value; render(); }, 200); };

  document.getElementById('btnExport').onclick = exportCSV;
  document.getElementById('btnReset').onclick = () => {
    state.filtros = { empresa: 'ALL', categoria: 'ALL', anio: 'ALL', q: '' };
    selE.value = selC.value = selA.value = 'ALL';
    q.value = '';
    render();
  };

  document.getElementById('drillClose').onclick = closeDrill;
  document.getElementById('drill').addEventListener('click', e => {
    if (e.target.id === 'drill') closeDrill();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrill(); });
}

/* -------------------------------------------------------------
   14. RENDER MAESTRO
   ------------------------------------------------------------- */
function render() {
  const rows = getFiltered();
  const matrix = buildMatrix(rows);
  renderKPIs(rows, matrix);
  renderTable(matrix);
  renderChart(matrix);
  document.getElementById('stamp').textContent =
    `${rows.length} proyectos visibles · actualizado ${new Date().toLocaleString('es-MX')}`;
}

/* -------------------------------------------------------------
   15. BOOTSTRAP
   ------------------------------------------------------------- */
(async function init() {
  try {
    state.raw = await loadData();
    initFiltros();
    render();
  } catch (err) {
    console.error(err);
    document.getElementById('stamp').textContent = 'Error al cargar los datos: ' + err.message;
  }
})();
