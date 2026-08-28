/* =========================================================
   Plan de acción · Automatización de Pago a Facturas
   Ventana total del plan: 30 días (estimación tentativa)
========================================================= */
const TOTAL_DAYS = 30;

/* ---------------------------------------------------------
   1. Slideshow
--------------------------------------------------------- */
const track = document.getElementById("slideTrack");
const slides = Array.from(track.querySelectorAll(".slide"));
const dotsWrap = document.getElementById("slideDots");
let slideIndex = 0;

slides.forEach((slide, i) => {
  const img = slide.querySelector("img");
  img.addEventListener("error", () => {
    slide.classList.add("is-missing");
    slide.dataset.missing = "No se encontró " + img.getAttribute("src");
  });

  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "dot";
  dot.setAttribute("role", "tab");
  dot.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
  dot.addEventListener("click", () => showSlide(i));
  dotsWrap.appendChild(dot);
});

function showSlide(i){
  slideIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  dotsWrap.querySelectorAll(".dot").forEach((d, k) => {
    d.classList.toggle("is-active", k === slideIndex);
    d.setAttribute("aria-selected", k === slideIndex ? "true" : "false");
  });
}

document.getElementById("slidePrev").addEventListener("click", () => showSlide(slideIndex - 1));
document.getElementById("slideNext").addEventListener("click", () => showSlide(slideIndex + 1));
showSlide(0);

/* ---------------------------------------------------------
   2. Fases del plan — 30 días, foco en Pago a Facturas
--------------------------------------------------------- */
const phases = [
  { n:1, start:1, end:5, title:"Entendimiento del proceso y del dolor operativo",
    obj:"Entender qué necesidad de negocio existe realmente detrás de la iniciativa de Pago a Facturas.",
    acts:[
      "Revisar antecedentes de la iniciativa y quién la solicitó",
      "Identificar los objetivos esperados por Finanzas y Cuentas por Pagar",
      "Levantamiento inicial del flujo de pago a proveedores",
      "Entender los dolores operativos del equipo que opera hoy",
      "Revisar la estrategia de TI y las prioridades del área",
      "Revisar los reportes actuales del ciclo de pago"
    ],
    outs:["Documento de entendimiento del problema","Lista de hipótesis de valor"] },

  { n:2, start:3, end:7, title:"Identificación y alineación de stakeholders",
    obj:"Entender quién gana, quién pierde y quién decide.",
    acts:[
      "Identificar a Dirección y Subdirección",
      "Mapear Finanzas y Cuentas por Pagar",
      "Mapear Data Team y Arquitectura",
      "Mapear Operaciones y usuarios finales del proceso",
      "Realizar entrevistas individuales"
    ],
    outs:["Mapa de stakeholders","Matriz Poder-Interés"],
    ask:{ t:"Guion de entrevista", d:"¿Cuál es el problema? ¿Qué impacto tiene? ¿Qué tan urgente es? ¿Qué ocurre si no hacemos nada?" } },

  { n:3, start:5, end:14, title:"Mapeo AS-IS e identificación de lo automatizable",
    obj:"Entender cómo opera realmente el proceso y separar lo que una máquina puede hacer de lo que exige criterio humano.",
    acts:[
      "Documentar el flujo actual actividad por actividad, con responsable y sistema",
      "Marcar actividades manuales, reprocesos y errores frecuentes",
      "Medir tiempos y cuellos de botella por etapa",
      "Clasificar cada actividad: automatizable, semiautomatizable o manual por criterio",
      "Identificar dónde el dato se captura a mano y podría capturarse solo"
    ],
    outs:["SIPOC","Process Map","Value Stream Map","Pain Points","Matriz de actividades automatizables"],
    ask:{ t:"Fase más larga del plan", d:"Es el corazón del diagnóstico: sin el mapeo detallado, la selección de tecnología sería una apuesta." },
    link:{ label:"Diagrama de proceso", url:"https://mariomayorga2010.github.io/TD/as-is/index.html" } },

  { n:4, start:12, end:18, title:"Cuantificación del valor",
    obj:"Pasar de opiniones a números.",
    acts:[
      "Medir facturas por mes y tiempo promedio por factura",
      "Calcular horas hombre dedicadas al proceso",
      "Cuantificar errores, retrabajos y penalizaciones por pago tardío",
      "Estimar el ahorro por actividad automatizable",
      "Construir el caso económico con supuestos explícitos"
    ],
    outs:["Business Case inicial"],
    ask:{ t:"Criterio de corte", d:"Ninguna actividad entra al alcance sin una cifra que un director pueda defender frente a Finanzas." } },

  { n:5, start:15, end:22, title:"Evaluación tecnológica agnóstica",
    obj:"Elegir la mejor solución por criterios, no por marca ni por preferencia previa.",
    acts:[
      "Traducir el proceso mapeado a requerimientos funcionales",
      "Evaluar alternativas de mercado: Google, Microsoft, especialistas y capacidades nativas de SAP",
      "Revisar OCR, workflow, reglas de validación e integraciones disponibles",
      "Estimar esfuerzo de integración con SAP y tiempo a primer valor",
      "Verificar cómo cada opción habilita la cadena Cortex, BigQuery y LookML",
      "Identificar Quick Wins y dependencias técnicas"
    ],
    outs:["Documento de arquitectura actual","Comparativo de alternativas"] },

  { n:6, start:20, end:25, title:"Priorización ejecutiva",
    obj:"Construir una recomendación objetiva con criterios acordados de antemano.",
    acts:[
      "Acordar los pesos de la matriz con Dirección",
      "Calificar cada alternativa y cada bloque de automatización",
      "Generar un score comparable",
      "Documentar los supuestos detrás de cada calificación"
    ],
    outs:["Matriz de priorización"] },

  { n:7, start:24, end:30, title:"Roadmap y recomendación ejecutiva",
    obj:"Presentar una propuesta neutral, secuenciada por valor y dependencia.",
    acts:[
      "Secuenciar los Quick Wins del proceso de pago",
      "Definir el alcance de la automatización por olas",
      "Diseñar la cadena de datos objetivo hacia LookML",
      "Establecer el ciclo de optimización continua",
      "Preparar la presentación ejecutiva final"
    ],
    outs:["Roadmap por fases","Recomendación ejecutiva","Arquitectura de datos objetivo"] },
];

const criteria = [
  { name:"Impacto negocio", w:30, red:false },
  { name:"ROI",             w:25, red:false },
  { name:"Urgencia",        w:15, red:true  },
  { name:"Complejidad",     w:10, red:true  },
  { name:"Riesgo",          w:10, red:true  },
  { name:"Adopción",        w:10, red:false },
];

/* ---- regla de días ---- */
const ruler = document.getElementById("ruler");
for(let mark = 5; mark <= TOTAL_DAYS; mark += 5){
  const s = document.createElement("span");
  s.textContent = "D" + mark;
  ruler.appendChild(s);
}

/* ---- barras del gantt ---- */
const rows = document.getElementById("ganttRows");

phases.forEach(p => {
  const row = document.createElement("div");
  row.className = "gantt__row";

  const grid = document.createElement("div");
  grid.className = "gantt__grid";
  grid.innerHTML = "<i></i>".repeat(6);
  row.appendChild(grid);

  const bar = document.createElement("button");
  bar.type = "button";
  bar.className = "bar";
  bar.dataset.phase = p.n;
  bar.style.left  = ((p.start - 1) / TOTAL_DAYS) * 100 + "%";
  bar.style.width = ((p.end - p.start + 1) / TOTAL_DAYS) * 100 + "%";
  bar.innerHTML =
    `<span class="bar__n">F${p.n}</span>` +
    `<span class="bar__t">${p.title}</span>` +
    `<span class="bar__d">D${p.start}–${p.end}</span>`;
  row.appendChild(bar);

  rows.appendChild(row);
});

/* ---- panel de detalle ---- */
const panel = document.getElementById("panel");

function renderPanel(n){
  const p = phases.find(x => x.n === n);
  const dur = p.end - p.start + 1;

  panel.innerHTML = `
    <div class="panel__main">
      <div class="panel__kick">
        <span class="tagday">Días ${p.start}–${p.end}</span>
        <span class="eyebrow">Fase ${p.n} de 7 · ${dur} días</span>
      </div>
      <h3>${p.title}</h3>
      <p class="panel__obj">${p.obj}</p>
      <ul class="acts">${p.acts.map(a => `<li>${a}</li>`).join("")}</ul>
    </div>
    <div class="panel__side">
      <div class="side__label">Entregables de la fase</div>
      <div class="chips">${p.outs.map(o => `<span class="chip chip--out">${o}</span>`).join("")}</div>
      ${p.link ? `<a class="diagram-btn" href="${p.link.url}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="6" rx="1.4"/><rect x="14" y="4" width="7" height="6" rx="1.4"/><rect x="8.5" y="14" width="7" height="6" rx="1.4"/><path d="M6.5 10v2a2 2 0 002 2H9M17.5 10v2a2 2 0 01-2 2H12"/></svg>
          ${p.link.label}
        </a>` : ""}
      ${p.ask ? `<div class="ask"><b>${p.ask.t}</b>${p.ask.d}</div>` : ""}
    </div>
  `;

  document.querySelectorAll(".bar").forEach(b => {
    b.classList.toggle("is-active", Number(b.dataset.phase) === n);
  });

  applyGlossary(panel);
}

rows.addEventListener("click", e => {
  const bar = e.target.closest(".bar");
  if(bar) renderPanel(Number(bar.dataset.phase));
});

/* ---- matriz de priorización ---- */
const matrix = document.getElementById("matrix");

criteria.forEach(c => {
  const row = document.createElement("div");
  row.className = "crit";
  row.innerHTML = `
    <span class="crit__n">${c.name}</span>
    <span class="crit__track"><span class="crit__fill${c.red ? " crit__fill--red" : ""}"><span class="crit__fill-n"></span></span></span>
    <span class="crit__w">0%</span>
  `;
  matrix.appendChild(row);
});

/* Anima el llenado de la barra y el contador del porcentaje al mismo ritmo */
function animateCriterion(row, targetPct, targetWidth){
  const fill   = row.querySelector(".crit__fill");
  const fillN  = row.querySelector(".crit__fill-n");
  const wLabel = row.querySelector(".crit__w");
  const duration = 900;
  const start = performance.now();

  fill.style.width = targetWidth + "%";

  function step(now){
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = Math.round(targetPct * eased);
    wLabel.textContent = current + "%";
    fillN.textContent = current + "%";
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const rowsEls = matrix.querySelectorAll(".crit");
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      rowsEls.forEach((row, i) => {
        animateCriterion(row, criteria[i].w, criteria[i].w / 30 * 100);
      });
      io.disconnect();
    }
  });
}, { threshold:.3 });
io.observe(matrix);

/* ---------------------------------------------------------
   3. Glosario · tooltips para anglicismos y términos técnicos
--------------------------------------------------------- */
const GLOSSARY = {
  "Business Partner":"Socio de negocio: rol puente entre el área de tecnología y las áreas operativas. Traduce necesidades de negocio en iniciativas viables.",
  "Business Case":"Caso de negocio: documento que justifica una inversión con cifras de costo, beneficio y riesgo.",
  "stakeholders":"Partes interesadas: personas o áreas afectadas por la iniciativa o con poder de decisión sobre ella.",
  "Stakeholders":"Partes interesadas: personas o áreas afectadas por la iniciativa o con poder de decisión sobre ella.",
  "Quick Wins":"Victorias rápidas: mejoras de bajo esfuerzo y retorno visible en el corto plazo. Sirven para generar credibilidad temprana.",
  "Roadmap":"Hoja de ruta: secuencia por fases de lo que se implementará y en qué orden.",
  "roadmap":"Hoja de ruta: secuencia por fases de lo que se implementará y en qué orden.",
  "AS-IS":"Del inglés \"tal como está\": el proceso documentado como opera hoy en la realidad, no como debería operar.",
  "SIPOC":"Proveedor, Entrada, Proceso, Salida y Cliente. Vista de una página que delimita el alcance de un proceso.",
  "Process Map":"Mapa de proceso: diagrama detallado de las actividades, responsables y sistemas involucrados.",
  "Value Stream Map":"Mapa de flujo de valor: representación que distingue el tiempo que agrega valor del tiempo de espera y desperdicio.",
  "Pain Points":"Puntos de dolor: los problemas concretos que sufre quien opera el proceso día a día.",
  "ROI":"Retorno de la inversión: cuánto valor genera la iniciativa frente a lo que cuesta.",
  "OCR":"Reconocimiento óptico de caracteres: tecnología que lee el texto de una factura escaneada y lo convierte en datos utilizables.",
  "workflow":"Flujo de trabajo: la secuencia automatizada de pasos, validaciones y aprobaciones por la que pasa una factura.",
  "SAP":"Sistema donde hoy viven las órdenes de compra, recepciones y facturas del proceso.",
  "Cortex":"Cortex Framework de Google Cloud: conectores y modelos preconstruidos que leen la información de SAP y la llevan a la nube sin desarrollar la extracción desde cero.",
  "BigQuery":"Almacén de datos analítico de Google Cloud. Es donde la información queda consultable a gran escala.",
  "LookML":"Lenguaje de modelado de Looker. Define una sola vez las métricas y reglas de negocio para que todos los reportes usen la misma definición.",
  "Looker":"Plataforma de analítica y visualización de Google Cloud.",
  "Power BI":"Herramienta de visualización de datos de Microsoft.",
  "Data Team":"Equipo de datos: área responsable de las canalizaciones de información y los modelos analíticos.",
  "score":"Puntaje: calificación numérica que resulta de aplicar los pesos de la matriz a cada alternativa.",
  "dashboards":"Tableros: pantallas que concentran indicadores para seguimiento y toma de decisiones.",
};

const tooltip = document.getElementById("tooltip");
const SKIP_TAGS = new Set(["SCRIPT","STYLE","BUTTON"]);

/* Envuelve automáticamente los términos del glosario dentro de un contenedor */
function applyGlossary(root){
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&"));
  const re = new RegExp("(?<![\\wÁÉÍÓÚÑáéíóúñ])(" + escaped.join("|") + ")(?![\\wÁÉÍÓÚÑáéíóúñ])");

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      let el = node.parentElement;
      while(el && el !== root.parentElement){
        if(SKIP_TAGS.has(el.tagName) || el.classList.contains("term")) return NodeFilter.FILTER_REJECT;
        el = el.parentElement;
      }
      return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const targets = [];
  while(walker.nextNode()) targets.push(walker.currentNode);

  targets.forEach(node => {
    const frag = document.createDocumentFragment();
    let rest = node.nodeValue;
    let match;

    while((match = re.exec(rest)) !== null){
      const word = match[1];
      if(match.index > 0) frag.appendChild(document.createTextNode(rest.slice(0, match.index)));

      const span = document.createElement("span");
      span.className = "term";
      span.tabIndex = 0;
      span.dataset.tip = GLOSSARY[word];
      span.textContent = word;
      frag.appendChild(span);

      rest = rest.slice(match.index + word.length);
    }
    if(rest) frag.appendChild(document.createTextNode(rest));
    node.parentNode.replaceChild(frag, node);
  });
}

/* Posicionamiento del globo de ayuda */
function openTip(el){
  const tip = el.dataset.tip;
  if(!tip) return;
  tooltip.innerHTML = `<span class="tooltip__t">${el.textContent}</span>${tip}`;
  tooltip.classList.add("is-open");
  tooltip.setAttribute("aria-hidden", "false");

  const r = el.getBoundingClientRect();
  const t = tooltip.getBoundingClientRect();
  const margin = 10;

  let left = r.left + window.scrollX + r.width / 2 - t.width / 2;
  left = Math.max(margin + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - t.width - margin));

  let top = r.top + window.scrollY - t.height - 9;
  if(r.top - t.height - 9 < 0) top = r.bottom + window.scrollY + 9;

  tooltip.style.left = left + "px";
  tooltip.style.top  = top + "px";
}

function closeTip(){
  tooltip.classList.remove("is-open");
  tooltip.setAttribute("aria-hidden", "true");
}

document.addEventListener("mouseover", e => {
  const el = e.target.closest(".term");
  if(el) openTip(el);
});
document.addEventListener("mouseout", e => {
  if(e.target.closest(".term")) closeTip();
});
document.addEventListener("focusin", e => {
  const el = e.target.closest(".term");
  if(el) openTip(el);
});
document.addEventListener("focusout", e => {
  if(e.target.closest(".term")) closeTip();
});
document.addEventListener("click", e => {
  const el = e.target.closest(".term");
  if(el){ openTip(el); return; }
  closeTip();
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape") closeTip();
});
window.addEventListener("scroll", closeTip, { passive:true });

/* ---------------------------------------------------------
   4. Arranque
--------------------------------------------------------- */
applyGlossary(document.querySelector(".page"));
renderPanel(1);
