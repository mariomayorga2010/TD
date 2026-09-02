/* ---------------------------------------------------------
   Carriles (actores)
--------------------------------------------------------- */
const lanes = [
  { key:"solicitante", role:"Área / Usuario Solicitante", tag:"Solicitante" },
  { key:"compras",     role:"Compras",                     tag:"Compras" },
  { key:"proveedor",   role:"Proveedor",                    tag:"Proveedor" },
  { key:"responsable", role:"Usuario Responsable (SAP)",    tag:"SAP" },
  { key:"lider",       role:"Líder",                        tag:"Autoriza" },
];

/* ---------------------------------------------------------
   Fases (para la franja superior y los separadores)
--------------------------------------------------------- */
const phaseNames = {
  1:"Solicitud de compra", 2:"Gestión de compras", 3:"Ejecución del servicio",
  4:"Recepción de factura", 5:"Registro SAP", 6:"Constancia de recepción",
  7:"Firma y autorización", 8:"Envío a proveedor",
};

/* ---------------------------------------------------------
   Nodos del flujo — col = posición horizontal secuencial,
   lane = carril / actor, type = start | task | decision | end
--------------------------------------------------------- */
const nodes = [
  { id:"inicio-necesidad", col:0,  lane:"solicitante", type:"start",    phase:1, label:"Necesidad detectada",
    title:"Se identifica la necesidad del servicio",
    desc:"El área solicitante detecta que requiere contratar un servicio." },
  { id:"generar-solicitud-pedido", col:1,  lane:"solicitante", type:"task",     phase:1, label:"Generar Solicitud de Pedido",
    title:"Generar Solicitud de Pedido",
    desc:"Se elabora en SAP o en el formato interno correspondiente." },
  { id:"dec-cedula-aprobacion", col:2,  lane:"solicitante", type:"decision", phase:1, label:"¿Cédula de aprobación?",
    title:"¿Se cuenta con la Cédula de Aprobación?",
    desc:"Antes de enviar la solicitud debe existir el respaldo de autorización.",
    si:"Se adjunta al expediente y continúa el flujo.",
    no:"Se gestiona la cédula con el área correspondiente y se repite este punto.",
    selfLoop:true },
  { id:"adjuntar-cedula", col:3,  lane:"solicitante", type:"task",     phase:1, label:"Adjuntar Cédula de Aprobación",
    title:"Adjuntar la Cédula de Aprobación",
    desc:"Se integra al expediente de la solicitud." },
  { id:"enviar-a-compras", col:4,  lane:"lider", type:"task",     phase:1, label:"Enviar a Compras",
    title:"Enviar la solicitud al área de Compras",
    desc:"El expediente completo se traslada para iniciar la gestión de compra.",
    docs:["Solicitud de Pedido","Cédula de aprobación"] },

  { id:"solicitar-cotizaciones", col:5,  lane:"compras", type:"task", phase:2, label:"Solicitar cotizaciones",
    title:"Solicitar cotizaciones a proveedores",
    desc:"Compras identifica proveedores y solicita propuestas." },
  { id:"recibir-propuestas", col:6,  lane:"compras", type:"task", phase:2, label:"Recibir propuestas",
    title:"Proveedores envían propuestas",
    desc:"Se reciben las cotizaciones de los proveedores contactados." },
  { id:"cuadro-comparativo", col:7,  lane:"compras", type:"task", phase:2, label:"Cuadro comparativo",
    title:"Elaborar cuadro comparativo",
    desc:"Se comparan condiciones, precio, tiempos y alcance de cada propuesta." },
  { id:"dec-cumple-criterios", col:8,  lane:"compras", type:"decision", phase:2, label:"¿Cumple criterios?",
    title:"¿Alguna propuesta cumple los criterios de selección?",
    desc:"Se evalúa el cuadro comparativo contra los requisitos del área solicitante.",
    si:"Se avanza a la selección formal del proveedor.",
    no:"Se solicitan nuevas cotizaciones o se amplía el universo de proveedores.",
    loopTo:"solicitar-cotizaciones" },
  { id:"seleccionar-proveedor", col:9,  lane:"compras", type:"task", phase:2, label:"Seleccionar proveedor",
    title:"Seleccionar proveedor",
    desc:"Se define el proveedor ganador con base en el comparativo." },
  { id:"generar-pedido-sap", col:10, lane:"compras", type:"task", phase:2, label:"Generar Pedido SAP",
    title:"Generar Pedido en SAP",
    desc:"Se formaliza la compra dentro del sistema.",
    docs:["Cotizaciones","Cuadro comparativo","Pedido SAP"] },
  { id:"enviar-proveedor-firma", col:11, lane:"compras", type:"task", phase:2, label:"Enviar a Proveedor para firma",
    title:"Enviar a Proveedor para firma",
    desc:"Compras remite el Pedido SAP al proveedor para su firma antes de que inicie la ejecución del servicio." },

  { id:"entregar-servicio", col:12, lane:"proveedor", type:"task", phase:3, label:"Entregar servicio",
    title:"El proveedor entrega el servicio",
    desc:"El proveedor ejecuta el servicio conforme al Pedido SAP." },
  { id:"dec-recibido-conforme", col:13, lane:"solicitante", type:"decision", phase:3, label:"¿Recibido conforme?",
    title:"¿El usuario valida el servicio como recibido conforme?",
    desc:"El usuario solicitante revisa que lo entregado cumpla lo pactado.",
    si:"Se documenta la conformidad y el proceso continúa.",
    no:"El proveedor corrige o reprograma la entrega antes de continuar.",
    loopTo:"entregar-servicio" },
  { id:"registrar-evidencia", col:14, lane:"solicitante", type:"task", phase:3, label:"Registrar evidencia",
    title:"Se registra evidencia de entrega satisfactoria",
    desc:"Queda constancia de la validación previa a cualquier registro en SAP.",
    callout:"Antes de generar el MR debería existir evidencia de que el servicio fue entregado satisfactoriamente." },

  { id:"enviar-factura", col:15, lane:"proveedor", type:"task", phase:4, label:"Enviar factura",
    title:"El proveedor envía factura",
    desc:"La factura se remite para su validación." },
  { id:"dec-factura-coincide", col:16, lane:"responsable", type:"decision", phase:4, label:"¿Factura coincide?",
    title:"¿La factura coincide con Pedido SAP, servicio recibido y montos autorizados?",
    desc:"Se contrasta la factura contra los tres elementos de control.",
    si:"La factura queda validada y avanza a registro en SAP.",
    no:"Se devuelve la factura al proveedor para su corrección.",
    loopTo:"enviar-factura" },

  { id:"generar-mr-sap", col:17, lane:"responsable", type:"task", phase:5, label:"Generar MR en SAP",
    title:"Generar MR en SAP",
    desc:"Se crea la Hoja de Entrada de Servicios / Recepción (MR)." },
  { id:"obtener-numero-mr", col:18, lane:"responsable", type:"task", phase:5, label:"Obtener número MR",
    title:"Obtener número de MR",
    desc:"El sistema asigna el folio que identificará el resto del expediente.",
    docs:["MR SAP"] },

  { id:"generar-constancia", col:19, lane:"solicitante", type:"task", phase:6, label:"Generar Constancia",
    title:"Generar Constancia de Recepción de Servicios",
    desc:"El solicitante elabora el documento que acredita la recepción." },
  { id:"registrar-mr-constancia", col:20, lane:"solicitante", type:"task", phase:6, label:"Registrar MR en constancia",
    title:"Registrar el número de MR en la constancia",
    desc:"Se enlaza el folio SAP con la constancia generada." },
  { id:"registrar-mr-factura", col:21, lane:"solicitante", type:"task", phase:6, label:"Registrar MR en factura",
    title:"Registrar el número de MR en la factura o expediente",
    desc:"Se deja trazabilidad cruzada entre factura, MR y constancia.",
    docs:["Constancia de recepción"] },

  { id:"enviar-a-lider", col:22, lane:"lider", type:"task", phase:7, label:"Enviar a líder",
    title:"Enviar factura y constancia al líder",
    desc:"El expediente completo se remite para autorización." },
  { id:"revisar-documentacion", col:23, lane:"lider", type:"task", phase:7, label:"Revisar documentación",
    title:"El líder revisa la documentación",
    desc:"Se verifica consistencia entre factura, MR y constancia." },
  { id:"dec-aprueba-firma", col:24, lane:"lider", type:"decision", phase:7, label:"¿Aprueba y firma?",
    title:"¿El líder aprueba y firma?",
    desc:"Decisión de autorización final antes del envío al proveedor.",
    si:"El líder firma y el expediente avanza a la Fase 8.",
    no:"El expediente debería rechazarse y devolverse para corrección.",
    gap:"21.1 Rechazo y devolución para corrección — actividad no documentada en el flujo actual.",
    loopTo:"generar-constancia" },

  { id:"enviar-constancia-firmada", col:25, lane:"proveedor", type:"task", phase:8, label:"Enviar constancia firmada",
    title:"Enviar constancia firmada al proveedor",
    desc:"Se remite el documento firmado como cierre del ciclo (por el solicitante o Cuentas por Pagar). El proveedor sube toda su documentación al Portal de GMXT." },
  { id:"dec-confirma-recepcion", col:26, lane:"solicitante", type:"decision", phase:8, label:"¿Confirma recepción?",
    title:"¿El proveedor confirma recepción?",
    desc:"Se espera acuse de recibido de la constancia firmada.",
    si:"El expediente queda cerrado.",
    no:"Se da seguimiento y se reenvía la constancia al proveedor.",
    loopTo:"enviar-constancia-firmada" },
  { id:"fin-proceso", col:27, lane:"solicitante", type:"end", phase:8, label:"Proceso finalizado",
    title:"Proceso finalizado",
    desc:"Ciclo de solicitud, ejecución, facturación y recepción concluido." },
];

/* ---------------------------------------------------------
   Layout constants
--------------------------------------------------------- */
const LABEL_W   = 190;
const COL_W     = 196;
const PHASE_H   = 46;
const LANE_H    = 148;
const BOTTOM_M  = 96;
const TASK_W = 154, TASK_H = 66;
const DEC_W  = 150, DEC_H  = 92;
const CIRC_D = 68;

const laneIndex = Object.fromEntries(lanes.map((l,i)=>[l.key,i]));
function nodeIndexById(id){ return nodes.findIndex(n => n.id === id); }
const totalCols = Math.max(...nodes.map(n=>n.col)) + 1;
const canvasW = LABEL_W + totalCols*COL_W;
const canvasH = PHASE_H + lanes.length*LANE_H + BOTTOM_M;

function laneCenterY(laneKey){ return PHASE_H + laneIndex[laneKey]*LANE_H + LANE_H/2; }
function colCenterX(col){ return LABEL_W + col*COL_W + COL_W/2; }

function boxSize(type){
  if(type==="decision") return [DEC_W, DEC_H];
  if(type==="start" || type==="end") return [CIRC_D, CIRC_D];
  return [TASK_W, TASK_H];
}

/* ---------------------------------------------------------
   Íconos BPMN (línea, 24x24) para las cajas de tarea
--------------------------------------------------------- */
const ICONS = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1-4 4-6.2 7.5-6.2S18.5 16 19.5 20"/></svg>`,
  system: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="6.5" rx="1.4"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.4"/><circle cx="7" cy="7.25" r=".9" fill="currentColor" stroke="none"/><circle cx="7" cy="16.75" r=".9" fill="currentColor" stroke="none"/></svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2.5h8l4 4v14a1 1 0 01-1 1h-11a1 1 0 01-1-1v-17a1 1 0 011-1z"/><path d="M14 2.5v4.5h4.5"/><path d="M9 13h6M9 16.5h6"/></svg>`,
  gateway: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>`,
};

function iconKindFor(n){
  if(n.docs && n.docs.length) return "document";
  if(n.lane === "responsable") return "system";
  return "user";
}

/* ---------------------------------------------------------
   Render: fondo de carriles, encabezados de fase, nodos
--------------------------------------------------------- */
const canvas = document.getElementById("canvas");
const svg = document.getElementById("edges");
canvas.style.width = canvasW + "px";
canvas.style.height = canvasH + "px";
svg.setAttribute("width", canvasW);
svg.setAttribute("height", canvasH);
svg.setAttribute("viewBox", `0 0 ${canvasW} ${canvasH}`);

// Bandas de carril + etiquetas
lanes.forEach((lane, i) => {
  const band = document.createElement("div");
  band.className = `lane-band lane-band--${i % 2 === 0 ? "a" : "b"}`;
  band.style.top = (PHASE_H + i*LANE_H) + "px";
  band.style.width = canvasW + "px";
  band.style.height = LANE_H + "px";
  canvas.appendChild(band);

  const label = document.createElement("div");
  label.className = "lane-label";
  label.style.top = (PHASE_H + i*LANE_H) + "px";
  label.style.width = LABEL_W + "px";
  label.style.height = LANE_H + "px";
  label.innerHTML = `<span class="lane-label__role">${lane.role}</span><span class="lane-label__tag">${lane.tag}</span>`;
  canvas.appendChild(label);
});

// Encabezados y separadores de fase
const phaseSpans = {};
nodes.forEach(n => {
  if(!phaseSpans[n.phase]) phaseSpans[n.phase] = { min:n.col, max:n.col };
  phaseSpans[n.phase].min = Math.min(phaseSpans[n.phase].min, n.col);
  phaseSpans[n.phase].max = Math.max(phaseSpans[n.phase].max, n.col);
});
Object.entries(phaseSpans).forEach(([num, span]) => {
  const x = LABEL_W + span.min*COL_W;
  const w = (span.max - span.min + 1) * COL_W;

  const header = document.createElement("div");
  header.className = "phase-header";
  header.style.left = x + "px";
  header.style.width = w + "px";
  header.innerHTML = `<div class="phase-header__num">Fase ${num} de 8</div><div class="phase-header__name">${phaseNames[num]}</div>`;
  canvas.appendChild(header);

  if(Number(num) > 1){
    const divider = document.createElement("div");
    divider.className = "phase-divider";
    divider.style.left = x + "px";
    divider.style.height = canvasH + "px";
    canvas.appendChild(divider);
  }
});

// Nodos
nodes.forEach((n, idx) => {
  const [w, h] = boxSize(n.type);
  const cx = colCenterX(n.col), cy = laneCenterY(n.lane);
  n._x = cx; n._y = cy; n._w = w; n._h = h; n._idx = idx;

  const el = document.createElement("div");
  el.className = `node node--${n.type}`;
  el.style.left = (cx - w/2) + "px";
  el.style.top  = (cy - h/2) + "px";
  el.style.width = w + "px";
  el.style.height = h + "px";
  el.dataset.index = idx;

  const labelColor = (n.type === "start" || n.type === "end") ? ' style="color:#ffffff"' : "";
  let inner = `<span class="node__label"${labelColor}>${n.label}</span>`;

  if(n.type === "task"){
    inner = `<span class="node__icon">${ICONS[iconKindFor(n)]}</span>` + inner;
  }
  if(n.type === "decision"){
    inner = `<span class="node__gateway">${ICONS.gateway}</span>` + inner;
  }
  el.innerHTML = inner;

  if(n.selfLoop){
    const badge = document.createElement("span");
    badge.className = "node__loopbadge";
    badge.textContent = "↺";
    badge.title = "No → se repite este mismo punto";
    el.appendChild(badge);
  }

  n._el = el;
  canvas.appendChild(el);
});

/* ---------------------------------------------------------
   Conectores SVG
--------------------------------------------------------- */
function edgePoint(node, side){
  // side: "right" | "left" | "bottom"
  const { _x:x, _y:y, _w:w, _h:h, type } = node;
  if(type === "decision"){
    if(side==="right")  return [x + w/2, y];
    if(side==="left")   return [x - w/2, y];
    if(side==="bottom") return [x, y + h/2];
  }
  if(type==="start" || type==="end"){
    if(side==="right") return [x + w/2, y];
    if(side==="left")  return [x - w/2, y];
    if(side==="bottom") return [x, y + h/2];
  }
  // task
  if(side==="right")  return [x + w/2, y];
  if(side==="left")   return [x - w/2, y];
  if(side==="bottom") return [x, y + h/2];
}

function line(x1,y1,x2,y2, cls, marker){
  const p = document.createElementNS("http://www.w3.org/2000/svg","path");
  p.setAttribute("d", `M${x1},${y1} L${x2},${y2}`);
  p.setAttribute("class", cls);
  if(marker) p.setAttribute("marker-end", `url(#${marker})`);
  svg.appendChild(p);
}
function poly(points, cls, marker){
  const p = document.createElementNS("http://www.w3.org/2000/svg","path");
  const d = points.map((pt,i)=> (i===0?"M":"L") + pt[0] + "," + pt[1]).join(" ");
  p.setAttribute("d", d);
  p.setAttribute("class", cls);
  if(marker) p.setAttribute("marker-end", `url(#${marker})`);
  svg.appendChild(p);
}

const styleEdge = `fill:none;stroke:${"#1E5FE0"};stroke-width:2;`;
const styleLoop = `fill:none;stroke:${"#C24A3D"};stroke-width:2;stroke-dasharray:5 4;`;

// Flujo principal (Sí / secuencia)
for(let i=0; i<nodes.length-1; i++){
  const a = nodes[i], b = nodes[i+1];
  const p1 = edgePoint(a, "right");
  const p2 = edgePoint(b, "left");

  const el = document.createElementNS("http://www.w3.org/2000/svg","path");
  if(Math.abs(p1[1]-p2[1]) < 1){
    el.setAttribute("d", `M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`);
  } else {
    const midX = (p1[0] + p2[0]) / 2;
    el.setAttribute("d", `M${p1[0]},${p1[1]} L${midX},${p1[1]} L${midX},${p2[1]} L${p2[0]},${p2[1]}`);
  }
  el.setAttribute("style", styleEdge);
  el.setAttribute("marker-end", "url(#arrow)");
  svg.appendChild(el);

  if(a.type === "decision"){
    const lbl = document.createElement("span");
    lbl.className = "edge-label edge-label--si";
    lbl.textContent = "Sí";
    lbl.style.left = (p1[0] + 22) + "px";
    lbl.style.top  = (p1[1] - 14) + "px";
    canvas.appendChild(lbl);
  }
}

// Retornos ("No") — enrutados por la franja inferior
let loopSlot = 0;
nodes.forEach((n) => {
  if(n.selfLoop){
    // ya representado con el badge ↺ sobre el propio nodo
    return;
  }
  if(n.loopTo === undefined) return;
  const target = nodes[nodeIndexById(n.loopTo)];
  const depth = PHASE_H + lanes.length*LANE_H + 22 + (loopSlot % 3) * 24;
  loopSlot++;

  const p1 = edgePoint(n, "bottom");
  const p2 = edgePoint(target, "bottom");
  const points = [p1, [p1[0], depth], [p2[0], depth], [p2[0], p2[1] + 2]];
  poly(points, "", "arrowLoop");
  svg.lastChild.setAttribute("style", styleLoop);

  const lbl = document.createElement("span");
  lbl.className = "edge-label edge-label--no";
  lbl.textContent = "No";
  lbl.style.left = ((p1[0] + p2[0]) / 2) + "px";
  lbl.style.top  = (depth - 12) + "px";
  canvas.appendChild(lbl);
});

/* ---------------------------------------------------------
   Detalle / navegación
--------------------------------------------------------- */
const detailEl   = document.getElementById("detail");
const phaseLabel = document.getElementById("phaseLabel");
const stepLabel  = document.getElementById("stepLabel");
const barFill    = document.getElementById("barFill");
const btnPrev    = document.getElementById("btnPrev");
const btnNext    = document.getElementById("btnNext");
const btnRestart = document.getElementById("btnRestart");
const canvasScroll = document.getElementById("canvasScroll");

let current = 0;

function kickerText(type){
  return { start:"Inicio", task:"Tarea", decision:"Decisión", end:"Fin de proceso" }[type] || "Tarea";
}

function renderDetail(n){
  let html = `
    <div class="detail__card">
      <div class="detail__kicker">
        <span class="pill">Fase ${n.phase} · ${phaseNames[n.phase]}</span>
        <span>${kickerText(n.type)}</span>
      </div>
      <h3 class="detail__title">${n.title}</h3>
      <p class="detail__desc">${n.desc}</p>
  `;
  if(n.type === "decision"){
    html += `<div class="detail__outcomes">`;
    html += `<div class="outcome outcome--si"><span class="outcome__tag">SÍ</span><span>${n.si}</span></div>`;
    html += `<div class="outcome outcome--no"><span class="outcome__tag">NO</span><span>${n.no}</span></div>`;
    html += `</div>`;
    if(n.gap) html += `<div class="gapflag"><b>⚠ Brecha detectada ·</b> ${n.gap}</div>`;
  }
  if(n.callout) html += `<div class="callout">${n.callout}</div>`;
  if(n.docs && n.docs.length){
    html += `<div class="docs">` + n.docs.map(d=>`<span class="doc">${d}</span>`).join("") + `</div>`;
  }
  html += `</div>`;
  detailEl.innerHTML = html;
}

function render(scroll = true){
  const n = nodes[current];

  nodes.forEach((node, i) => {
    node._el.classList.toggle("is-current", i === current);
    node._el.classList.toggle("is-done", i < current);
  });

  phaseLabel.textContent = `Fase ${n.phase} · ${phaseNames[n.phase]}`;
  stepLabel.textContent = `Paso ${current + 1} de ${nodes.length}`;
  barFill.style.width = `${((current + 1) / nodes.length) * 100}%`;

  btnPrev.disabled = current === 0;
  btnNext.disabled = current === nodes.length - 1;
  btnNext.textContent = current === nodes.length - 1 ? "Proceso finalizado" : "Avanzar →";

  renderDetail(n);

  if(scroll){
    const targetLeft = Math.max(0, n._x - canvasScroll.clientWidth / 2);
    canvasScroll.scrollTo({ left: targetLeft, behavior: "smooth" });
    n._el.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"nearest" });
  }
}

function goTo(index){
  current = Math.max(0, Math.min(nodes.length - 1, index));
  render();
}

btnNext.addEventListener("click", () => goTo(current + 1));
btnPrev.addEventListener("click", () => goTo(current - 1));
btnRestart.addEventListener("click", () => {
  goTo(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------------------------------------------------------
   Modal — explicación breve por caja / rombo / inicio-fin
--------------------------------------------------------- */
const modalOverlay = document.getElementById("modalOverlay");
const modalBody    = document.getElementById("modalBody");
const modalClose   = document.getElementById("modalClose");

function laneRoleOf(key){
  const l = lanes.find(l => l.key === key);
  return l ? l.role : "";
}

function openModal(idx){
  const n = nodes[idx];
  let html = `
    <div class="modal__kicker">
      <span class="pill">${kickerText(n.type)}</span>
      <span class="pill pill--lane">Fase ${n.phase} · ${laneRoleOf(n.lane)}</span>
    </div>
    <h3 class="modal__title" id="modalTitle">${n.title}</h3>
    <p class="modal__desc">${n.desc}</p>
  `;
  if(n.type === "decision"){
    html += `<div class="detail__outcomes">
      <div class="outcome outcome--si"><span class="outcome__tag">SÍ</span><span>${n.si}</span></div>
      <div class="outcome outcome--no"><span class="outcome__tag">NO</span><span>${n.no}</span></div>
    </div>`;
    if(n.gap) html += `<div class="gapflag"><b>⚠ Brecha detectada ·</b> ${n.gap}</div>`;
  }
  if(n.callout) html += `<div class="callout">${n.callout}</div>`;
  if(n.docs && n.docs.length){
    html += `<div class="docs">` + n.docs.map(d=>`<span class="doc">${d}</span>`).join("") + `</div>`;
  }
  modalBody.innerHTML = html;
  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modalOverlay.classList.remove("is-open");
  modalOverlay.setAttribute("aria-hidden", "true");
}

canvas.addEventListener("click", (e) => {
  const el = e.target.closest(".node");
  if(!el) return;
  openModal(Number(el.dataset.index));
});

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if(e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && modalOverlay.classList.contains("is-open")){ closeModal(); return; }
  if(modalOverlay.classList.contains("is-open")) return;
  if(e.key === "ArrowRight") goTo(current + 1);
  if(e.key === "ArrowLeft") goTo(current - 1);
});

render(false);
