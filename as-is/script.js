/* =============================================================================
   FUENTE: Manual de Políticas y Procedimientos de Egresos para el
   Trámite de Pagos con Pedido (Ferromex, MPDFIN-04, Rev. 2.0)
   Procedimientos modelados: 5.1 Pago a Proveedores Nacionales
   y 5.4 Pago a Proveedores Extranjeros.
   Capa 1: diagrama AS-IS "Solicitud, recepción y pago de servicios"
   (archivo original cargado por el usuario).
   Capa 2 (Abastecimientos): actividades ya documentadas en Capa 1
   (carril "Compras") y en Capa 3 (puntos de consulta con Egresos),
   presentadas aquí como su propio diagrama BPMN preliminar — el
   contenido/texto es el mismo, solo se re-presenta en cajas.
   ============================================================================= */

/* ---------------------------------------------------------
   CAPA 1 · SOLICITUD, RECEPCIÓN Y PAGO DE SERVICIOS
   Carriles: Solicitante, Compras, Proveedor, Responsable (SAP), Líder
--------------------------------------------------------- */
const lanes_layer1 = [
  { key:"solicitante", role:"Área / Usuario Solicitante", tag:"Solicitante" },
  { key:"compras",     role:"Compras",                     tag:"Compras", pendingLayer2:true },
  { key:"proveedor",   role:"Proveedor",                    tag:"Proveedor" },
  { key:"responsable", role:"Usuario Responsable (SAP)",    tag:"SAP" },
  { key:"lider",       role:"Líder",                        tag:"Autoriza" },
];

const phaseNames_layer1 = {
  1:"Solicitud de compra", 2:"Gestión de compras", 3:"Ejecución del servicio",
  4:"Recepción de factura", 5:"Registro SAP", 6:"Constancia de recepción",
  7:"Firma y autorización", 8:"Envío a proveedor",
};

const nodes_layer1 = [
  { id:"l1-inicio-necesidad", col:0,  lane:"solicitante", type:"start",    phase:1, label:"Necesidad detectada",
    title:"Se identifica la necesidad del servicio",
    desc:"El área solicitante detecta que requiere contratar un servicio." },
  { id:"l1-generar-solicitud-pedido", col:1,  lane:"solicitante", type:"task",     phase:1, label:"Generar Solicitud de Pedido",
    title:"Generar Solicitud de Pedido",
    desc:"Se elabora en SAP o en el formato interno correspondiente." },
  { id:"l1-dec-cedula-aprobacion", col:2,  lane:"solicitante", type:"decision", phase:1, label:"¿Cédula de aprobación?",
    title:"¿Se cuenta con la Cédula de Aprobación?",
    desc:"Antes de enviar la solicitud debe existir el respaldo de autorización.",
    si:"Se adjunta al expediente y continúa el flujo.",
    no:"Se gestiona la cédula con el área correspondiente y se repite este punto.",
    selfLoop:true },
  { id:"l1-adjuntar-cedula", col:3,  lane:"solicitante", type:"task",     phase:1, label:"Adjuntar Cédula de Aprobación",
    title:"Adjuntar la Cédula de Aprobación",
    desc:"Se integra al expediente de la solicitud." },
  { id:"l1-enviar-a-compras", col:4,  lane:"lider", type:"task",     phase:1, label:"Enviar a Compras",
    title:"Enviar la solicitud al área de Compras",
    desc:"El expediente completo se traslada para iniciar la gestión de compra.",
    docs:["Solicitud de Pedido","Cédula de aprobación"],
    crossLayer:[{ targetLayer:"layer2", targetProcess:null, targetNodeId:"p-inicio",
      label:"Continúa en Capa 2 · Abastecimientos (gestión de compra)", direction:"forward" }] },
  { id:"l1-solicitar-cotizaciones", col:5,  lane:"compras", type:"task", phase:2, label:"Solicitar cotizaciones",
    title:"Solicitar cotizaciones a proveedores",
    desc:"Compras identifica proveedores y solicita propuestas." },
  { id:"l1-recibir-propuestas", col:6,  lane:"compras", type:"task", phase:2, label:"Recibir propuestas",
    title:"Proveedores envían propuestas",
    desc:"Se reciben las cotizaciones de los proveedores contactados." },
  { id:"l1-cuadro-comparativo", col:7,  lane:"compras", type:"task", phase:2, label:"Cuadro comparativo",
    title:"Elaborar cuadro comparativo",
    desc:"Se comparan condiciones, precio, tiempos y alcance de cada propuesta." },
  { id:"l1-dec-cumple-criterios", col:8,  lane:"compras", type:"decision", phase:2, label:"¿Cumple criterios?",
    title:"¿Alguna propuesta cumple los criterios de selección?",
    desc:"Se evalúa el cuadro comparativo contra los requisitos del área solicitante.",
    si:"Se avanza a la selección formal del proveedor.",
    no:"Se solicitan nuevas cotizaciones o se amplía el universo de proveedores.",
    loopTo:"l1-solicitar-cotizaciones" },
  { id:"l1-seleccionar-proveedor", col:9,  lane:"compras", type:"task", phase:2, label:"Seleccionar proveedor",
    title:"Seleccionar proveedor",
    desc:"Se define el proveedor ganador con base en el comparativo." },
  { id:"l1-generar-pedido-sap", col:10, lane:"compras", type:"task", phase:2, label:"Generar Pedido SAP",
    title:"Generar Pedido en SAP",
    desc:"Se formaliza la compra dentro del sistema.",
    docs:["Cotizaciones","Cuadro comparativo","Pedido SAP"] },
  { id:"l1-enviar-proveedor-firma", col:11, lane:"compras", type:"task", phase:2, label:"Enviar a Proveedor para firma",
    title:"Enviar a Proveedor para firma",
    desc:"Compras remite el Pedido SAP al proveedor para su firma antes de que inicie la ejecución del servicio." },
  { id:"l1-entregar-servicio", col:12, lane:"proveedor", type:"task", phase:3, label:"Entregar servicio",
    title:"El proveedor entrega el servicio",
    desc:"El proveedor ejecuta el servicio conforme al Pedido SAP.",
    crossLayer:[{ targetLayer:"layer2", targetProcess:null, targetNodeId:"p-fin",
      label:"← Viene de Capa 2 · Abastecimientos (Pedido SAP firmado)", direction:"backward" }] },
  { id:"l1-dec-recibido-conforme", col:13, lane:"solicitante", type:"decision", phase:3, label:"¿Recibido conforme?",
    title:"¿El usuario valida el servicio como recibido conforme?",
    desc:"El usuario solicitante revisa que lo entregado cumpla lo pactado.",
    si:"Se documenta la conformidad y el proceso continúa.",
    no:"El proveedor corrige o reprograma la entrega antes de continuar.",
    loopTo:"l1-entregar-servicio" },
  { id:"l1-registrar-evidencia", col:14, lane:"solicitante", type:"task", phase:3, label:"Registrar evidencia",
    title:"Se registra evidencia de entrega satisfactoria",
    desc:"Queda constancia de la validación previa a cualquier registro en SAP.",
    callout:"Antes de generar el MR debería existir evidencia de que el servicio fue entregado satisfactoriamente." },
  { id:"l1-enviar-factura", col:15, lane:"proveedor", type:"task", phase:4, label:"Enviar factura",
    title:"El proveedor envía factura",
    desc:"La factura se remite para su validación." },
  { id:"l1-dec-factura-coincide", col:16, lane:"responsable", type:"decision", phase:4, label:"¿Factura coincide?",
    title:"¿La factura coincide con Pedido SAP, servicio recibido y montos autorizados?",
    desc:"Se contrasta la factura contra los tres elementos de control.",
    si:"La factura queda validada y avanza a registro en SAP.",
    no:"Se devuelve la factura al proveedor para su corrección.",
    loopTo:"l1-enviar-factura" },
  { id:"l1-generar-mr-sap", col:17, lane:"responsable", type:"task", phase:5, label:"Generar MR en SAP",
    title:"Generar MR en SAP",
    desc:"Se crea la Hoja de Entrada de Servicios / Recepción (MR)." },
  { id:"l1-obtener-numero-mr", col:18, lane:"responsable", type:"task", phase:5, label:"Obtener número MR",
    title:"Obtener número de MR",
    desc:"El sistema asigna el folio que identificará el resto del expediente.",
    docs:["MR SAP"] },
  { id:"l1-generar-constancia", col:19, lane:"solicitante", type:"task", phase:6, label:"Generar Constancia",
    title:"Generar Constancia de Recepción de Servicios",
    desc:"El solicitante elabora el documento que acredita la recepción." },
  { id:"l1-registrar-mr-constancia", col:20, lane:"solicitante", type:"task", phase:6, label:"Registrar MR en constancia",
    title:"Registrar el número de MR en la constancia",
    desc:"Se enlaza el folio SAP con la constancia generada." },
  { id:"l1-registrar-mr-factura", col:21, lane:"solicitante", type:"task", phase:6, label:"Registrar MR en factura",
    title:"Registrar el número de MR en la factura o expediente",
    desc:"Se deja trazabilidad cruzada entre factura, MR y constancia.",
    docs:["Constancia de recepción"] },
  { id:"l1-enviar-a-lider", col:22, lane:"lider", type:"task", phase:7, label:"Enviar a líder",
    title:"Enviar factura y constancia al líder",
    desc:"El expediente completo se remite para autorización." },
  { id:"l1-revisar-documentacion", col:23, lane:"lider", type:"task", phase:7, label:"Revisar documentación",
    title:"El líder revisa la documentación",
    desc:"Se verifica consistencia entre factura, MR y constancia." },
  { id:"l1-dec-aprueba-firma", col:24, lane:"lider", type:"decision", phase:7, label:"¿Aprueba y firma?",
    title:"¿El líder aprueba y firma?",
    desc:"Decisión de autorización final antes del envío al proveedor.",
    si:"El líder firma y el expediente avanza a la Fase 8.",
    no:"El expediente debería rechazarse y devolverse para corrección.",
    gap:"21.1 Rechazo y devolución para corrección — actividad no documentada en el flujo actual.",
    loopTo:"l1-generar-constancia" },
  { id:"l1-enviar-constancia-firmada", col:25, lane:"proveedor", type:"task", phase:8, label:"Enviar constancia firmada",
    title:"Enviar constancia firmada al proveedor",
    desc:"Se remite el documento firmado como cierre del ciclo (por el solicitante o Cuentas por Pagar). El proveedor sube toda su documentación al Portal de GMXT.",
    crossLayer:[{ targetLayer:"layer3", targetProcess:"nacionales", targetNodeId:"n-inicio",
      label:"Dispara Capa 3 · Egresos (5.1 Nacionales) — el paquete subido al portal es el que Egresos recibe y verifica",
      direction:"forward" }] },
  { id:"l1-dec-confirma-recepcion", col:26, lane:"solicitante", type:"decision", phase:8, label:"¿Confirma recepción?",
    title:"¿El proveedor confirma recepción?",
    desc:"Se espera acuse de recibido de la constancia firmada.",
    si:"El expediente queda cerrado.",
    no:"Se da seguimiento y se reenvía la constancia al proveedor.",
    loopTo:"l1-enviar-constancia-firmada" },
  { id:"l1-fin-proceso", col:27, lane:"solicitante", type:"end", phase:8, label:"Proceso finalizado",
    title:"Proceso finalizado — cierre de Capa 1",
    desc:"Ciclo de solicitud, ejecución, facturación y recepción concluido. El expediente completo (factura + MR + Constancia de Recepción de Servicios firmada) ya está disponible en el Portal para que Egresos inicie el trámite de pago.",
    crossLayer:[{ targetLayer:"layer3", targetProcess:"nacionales", targetNodeId:"n-inicio",
      label:"Continúa en Capa 3 · Egresos (5.1 Nacionales)", direction:"forward" }] },
];

/* ---------------------------------------------------------
   CAPA 2 · ABASTECIMIENTOS (vista preliminar en cajas BPMN)
   -----------------------------------------------------------
   IMPORTANTE: no se inventa contenido nuevo. Cada caja reutiliza
   textualmente el título/descripción/SÍ-NO ya documentado en la
   Capa 1 (carril "Compras") y las referencias de consulta ya
   documentadas en la Capa 3 (Egresos). Esta capa formal aún no
   ha sido levantada de manera independiente en el manual; por
   eso cada nodo está marcado con pending:true (estilo punteado)
   y conserva un enlace de regreso (crossLayer) a su fuente real.
   Carril único: Abastecimientos / Compras
--------------------------------------------------------- */
const lanes_layer2 = [
  { key:"abastecimientos", role:"Abastecimientos / Compras", tag:"Vista preliminar" },
];

const phaseNames_layer2 = {
  1:"Cotización y selección (detalle documentado en Capa 1)",
  2:"Consulta y resolución de discrepancias (referenciado desde Capa 3)",
};

const nodes_layer2 = [
  { id:"p-inicio", col:0, lane:"abastecimientos", type:"start", phase:1, label:"Solicitud recibida",
    pending:true,
    title:"Compras recibe la solicitud del área usuaria",
    desc:"Punto de entrada de esta capa: el expediente (Solicitud de Pedido + Cédula de aprobación) llega desde la Capa 1 para iniciar la gestión de compra.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-enviar-a-compras",
      label:"← Ver origen en Capa 1 · Fase 1 (Enviar a Compras)", direction:"backward" }] },

  { id:"p-cotizaciones", col:1, lane:"abastecimientos", type:"task", phase:1, label:"Solicitar cotizaciones",
    pending:true,
    title:"Solicitar cotizaciones a proveedores",
    desc:"Compras identifica proveedores y solicita propuestas.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-solicitar-cotizaciones",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-propuestas", col:2, lane:"abastecimientos", type:"task", phase:1, label:"Recibir propuestas",
    pending:true,
    title:"Proveedores envían propuestas",
    desc:"Se reciben las cotizaciones de los proveedores contactados.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-recibir-propuestas",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-comparativo", col:3, lane:"abastecimientos", type:"task", phase:1, label:"Cuadro comparativo",
    pending:true,
    title:"Elaborar cuadro comparativo",
    desc:"Se comparan condiciones, precio, tiempos y alcance de cada propuesta.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-cuadro-comparativo",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-dec-criterios", col:4, lane:"abastecimientos", type:"decision", phase:1, label:"¿Cumple criterios?",
    pending:true,
    title:"¿Alguna propuesta cumple los criterios de selección?",
    desc:"Se evalúa el cuadro comparativo contra los requisitos del área solicitante.",
    si:"Se avanza a la selección formal del proveedor.",
    no:"Se solicitan nuevas cotizaciones o se amplía el universo de proveedores.",
    loopTo:"p-cotizaciones",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-dec-cumple-criterios",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-seleccionar", col:5, lane:"abastecimientos", type:"task", phase:1, label:"Seleccionar proveedor",
    pending:true,
    title:"Seleccionar proveedor",
    desc:"Se define el proveedor ganador con base en el comparativo.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-seleccionar-proveedor",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-pedido-sap", col:6, lane:"abastecimientos", type:"task", phase:1, label:"Generar Pedido SAP",
    pending:true,
    title:"Generar Pedido en SAP",
    desc:"Se formaliza la compra dentro del sistema.",
    docs:["Cotizaciones","Cuadro comparativo","Pedido SAP"],
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-generar-pedido-sap",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-enviar-firma", col:7, lane:"abastecimientos", type:"task", phase:1, label:"Enviar a Proveedor para firma",
    pending:true,
    title:"Enviar a Proveedor para firma",
    desc:"Compras remite el Pedido SAP al proveedor para su firma antes de que inicie la ejecución del servicio.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-enviar-proveedor-firma",
      label:"Ver detalle documentado en Capa 1 · Fase 2", direction:"backward" }] },

  { id:"p-aclaracion-discrepancias", col:8, lane:"abastecimientos", type:"task", phase:2, label:"Aclarar discrepancias con Egresos",
    pending:true,
    title:"Aclaración de discrepancias y validación de contratos",
    desc:"Abastecimientos/Compras es consultado por la Gerencia de Egresos (Capa 3) para aclarar discrepancias entre pedido, MR y factura (procedimientos 5.1 y 5.4), y para validar la existencia de contrato autorizado en pagos de arrendamiento de equipo (5.4).",
    docs:["Pedido SAP","MR","Contrato (si aplica)"],
    crossLayer:[
      { targetLayer:"layer3", targetProcess:"nacionales", targetNodeId:"n-dec-discrepancia",
        label:"Ver punto de consulta en Capa 3 · 5.1 Nacionales", direction:"forward" },
      { targetLayer:"layer3", targetProcess:"extranjeros", targetNodeId:"e-dec-discrepancia",
        label:"Ver punto de consulta en Capa 3 · 5.4 Extranjeros (discrepancias)", direction:"forward" },
      { targetLayer:"layer3", targetProcess:"extranjeros", targetNodeId:"e-dec-contrato",
        label:"Ver punto de consulta en Capa 3 · 5.4 Extranjeros (contrato de arrendamiento)", direction:"forward" },
    ] },

  { id:"p-fin", col:9, lane:"abastecimientos", type:"end", phase:2, label:"Pedido formalizado",
    pending:true,
    title:"Gestión de Abastecimientos concluida (vista preliminar)",
    desc:"Placeholder de cierre: cuando esta capa se documente formalmente en el manual, aquí quedará el detalle completo del proceso de Abastecimientos, con sus propios conectores directos hacia la Capa 1 y la Capa 3.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-entregar-servicio",
      label:"→ Continúa en Capa 1 · Fase 3 (Entregar servicio)", direction:"forward" }] },
];

/* ---------------------------------------------------------
   CAPA 3 · EGRESOS — 5.1 PAGO A PROVEEDORES NACIONALES
   Carriles: Proveedor, Egresos, Tesorería, Contabilidad
--------------------------------------------------------- */
const lanes_nacionales = [
  { key:"proveedor",    role:"Proveedor",                  tag:"Externo" },
  { key:"egresos",      role:"Gerencia de Egresos",        tag:"Egresos" },
  { key:"tesoreria",    role:"Tesorería",                  tag:"Pago" },
  { key:"contabilidad", role:"Contabilidad",                tag:"Archivo" },
];

const phaseNames_nacionales = {
  1:"Recepción y verificación",
  2:"Contabilización y solicitud de pago",
  3:"Ejecución del pago",
  4:"Conciliación y archivo",
};

const nodes_nacionales = [
  { id:"n-inicio", col:0, lane:"proveedor", type:"start", phase:1, label:"Deposita factura",
    title:"El proveedor deposita la factura y envía documentación",
    desc:"El proveedor deposita la factura electrónica en el “Portal depósito de facturas” y envía vía correo electrónico la factura en PDF con firmas de autorización o MR, así como el acuse de recepción del portal con número de folio.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-enviar-constancia-firmada",
      label:"← Viene de Capa 1 · Solicitud, recepción y pago de servicios (Constancia firmada / Portal GMXT)",
      direction:"backward" }] },

  { id:"n-verificar-portal", col:1, lane:"egresos", type:"task", phase:1, label:"Verificar factura en portal",
    title:"Verifica las facturas depositadas en el Portal de depósito de facturas",
    desc:"Gerencia de Egresos recibe del proveedor vía correo electrónico la factura electrónica en PDF con firmas de autorización o MR, y el acuse de recepción del portal con número de folio (Anexo 6.2).",
    docs:["Factura PDF con MR","Acuse de recepción del portal"] },

  { id:"n-dec-servicio", col:2, lane:"egresos", type:"decision", phase:1, label:"¿Pago ligado a servicio?",
    title:"¿El pago está ligado a la prestación de un servicio?",
    desc:"Se determina si el pago corresponde a un servicio, lo cual condiciona la documentación requerida antes de crear el pasivo.",
    si:"Se requiere la Constancia de Recepción de Servicios (Anexo 6.6), la cual debe ser llenada por los empleados de Ferromex que avalen la recepción correcta del servicio y entregada en copia al proveedor. Esta constancia es generada en la Capa 1 (fases 6-7).",
    no:"No aplica este requisito documental y continúa directamente con la creación del pasivo.",
    docs:["Constancia de Recepción de Servicios (Anexo 6.6)"],
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-generar-constancia",
      label:"Ver origen de la Constancia en Capa 1 · Fase 6", direction:"backward" }] },

  { id:"n-dec-discrepancia", col:3, lane:"egresos", type:"decision", phase:2, label:"¿Existen discrepancias?",
    title:"Crea pasivo de acuerdo con el MR y pedido señalado en la factura",
    desc:"Sella y firma de revisado; revisa operaciones aritméticas verificando consistencia entre MR, pedido y factura antes de contabilizar.",
    si:"Existen discrepancias: se aclaran con el área de Abastecimientos y/o con el proveedor antes de continuar.",
    no:"No hay discrepancias: el pasivo queda validado y se continúa con la contabilización.",
    selfLoop:true,
    layer2Note:"La aclaración de discrepancias de pedido/MR se gestiona con el área de Abastecimientos — ver vista preliminar en Capa 2.",
    crossLayer:[{ targetLayer:"layer2", targetProcess:null, targetNodeId:"p-aclaracion-discrepancias",
      label:"← Consultar con Capa 2 · Abastecimientos", direction:"backward" }] },

  { id:"n-contabilizar", col:4, lane:"egresos", type:"task", phase:2, label:"Contabilizar factura",
    title:"Contabiliza factura",
    desc:"Una vez validada la consistencia entre MR, pedido y factura, se registra contablemente la factura en el sistema SAP." },

  { id:"n-dec-activo-fijo", col:5, lane:"egresos", type:"decision", phase:2, label:"¿Es activo fijo?",
    title:"¿La factura corresponde a compra de activo fijo?",
    desc:"Se determina si la factura corresponde a la adquisición de un activo fijo, lo cual requiere validación adicional.",
    si:"Se envía la factura digital al área de Activo Fijo y se recaba acuse de recibo por correo electrónico.",
    no:"No aplica y continúa directamente con la elaboración de la solicitud de pago." },

  { id:"n-solicitud-pago", col:6, lane:"egresos", type:"task", phase:2, label:"Elaborar solicitud de pago",
    title:"Elabora solicitud de pago",
    desc:"Firma y sella de revisado la solicitud de pago." },

  { id:"n-propuesta-pago", col:7, lane:"egresos", type:"task", phase:2, label:"Generar propuesta de pago",
    title:"Genera propuesta de pago",
    desc:"Firma y recaba autorización de la Gerencia de Egresos." },

  { id:"n-enviar-tesoreria", col:8, lane:"egresos", type:"task", phase:2, label:"Enviar a Tesorería",
    title:"Envía solicitud, propuesta de pago y factura a Tesorería",
    desc:"Envía correo electrónico con la solicitud, propuesta de pago y factura a Tesorería. Archiva copia digital de la propuesta de pago para su control.",
    docs:["Solicitud de pago","Propuesta de pago","Factura"] },

  { id:"n-recibir-tesoreria", col:9, lane:"tesoreria", type:"task", phase:3, label:"Recibir y ejecutar propuesta",
    title:"Recibe correo electrónico con propuesta autorizada",
    desc:"Recibe correo electrónico del Gerente de Egresos que incluye la propuesta con solicitud de pago debidamente autorizada; para efectos del pago se ejecuta la propuesta cancelando la cuenta por pagar del proveedor." },

  { id:"n-layout-banca", col:10, lane:"tesoreria", type:"task", phase:3, label:"Generar layout bancario",
    title:"Genera layout para el proceso de pago en la banca",
    desc:"Se genera el archivo (layout) requerido por el banco para ejecutar la transferencia al proveedor." },

  { id:"n-comprobante-pago", col:11, lane:"tesoreria", type:"task", phase:3, label:"Generar comprobante de pago",
    title:"Genera el comprobante de pago",
    desc:"El sistema SAP asigna en automático número de folio para control (archivos kz). Entrega a Contabilidad la propuesta de pago ejecutada, así como la documentación soporte para resguardo digital.",
    docs:["Comprobante de pago (folio kz)"] },

  { id:"n-recibir-constancias", col:12, lane:"contabilidad", type:"task", phase:4, label:"Recibir constancias de transferencia",
    title:"Recibe constancias de transferencia y documentos soporte",
    desc:"Recibe mediante relación, firma la relación y devuelve a Tesorería." },

  { id:"n-revisar-poliza", col:13, lane:"contabilidad", type:"task", phase:4, label:"Revisar número de póliza",
    title:"Revisa que todas las constancias indiquen el número de póliza",
    desc:"Verifica que cada constancia de transferencia cuente con su número de póliza asociado." },

  { id:"n-archivar", col:14, lane:"contabilidad", type:"task", phase:4, label:"Archivar digitalmente",
    title:"Archiva digitalmente",
    desc:"Archiva de acuerdo con la fecha, tipo de moneda, número de póliza y consecutivo." },

  { id:"n-fin", col:15, lane:"contabilidad", type:"end", phase:4, label:"Proceso finalizado",
    title:"Proceso finalizado",
    desc:"Ciclo de recepción, contabilización, pago y archivo de la factura del proveedor nacional concluido." },
];

/* ---------------------------------------------------------
   CAPA 3 · EGRESOS — 5.4 PAGO A PROVEEDORES EXTRANJEROS
   Carriles: Proveedor, Egresos, Tesorería, Contabilidad
--------------------------------------------------------- */
const lanes_extranjeros = [
  { key:"proveedor",    role:"Proveedor",                 tag:"Externo" },
  { key:"egresos",      role:"Gerencia de Egresos",       tag:"Egresos" },
  { key:"tesoreria",    role:"Tesorería",                 tag:"Pago" },
  { key:"contabilidad", role:"Contabilidad",               tag:"Archivo" },
];

const phaseNames_extranjeros = {
  1:"Recepción y validación fiscal",
  2:"Verificación de pedido y servicio",
  3:"Contabilización y solicitud de pago",
  4:"Ejecución del pago",
  5:"Conciliación y archivo",
};

const nodes_extranjeros = [
  { id:"e-inicio", col:0, lane:"proveedor", type:"start", phase:1, label:"Envía factura",
    title:"El proveedor envía factura",
    desc:"El proveedor extranjero envía vía correo electrónico su factura a la Gerencia de Egresos.",
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-enviar-constancia-firmada",
      label:"← Relacionado con el cierre de Capa 1 (cuando el proveedor extranjero presta un servicio con Constancia de Recepción)",
      direction:"backward" }] },

  { id:"e-recibir-factura", col:1, lane:"egresos", type:"task", phase:1, label:"Recibir factura",
    title:"Recibe factura vía correo electrónico",
    desc:"Egresos recibe la factura enviada por el proveedor extranjero y sella de recibido." },

  { id:"e-revisar-fiscal", col:2, lane:"egresos", type:"task", phase:1, label:"Revisar datos fiscales",
    title:"Revisa datos fiscales de la factura",
    desc:"Se valida que la factura cumpla los requisitos fiscales de comprobantes emitidos por residentes en el extranjero sin establecimiento permanente en México (Anexo 6.5).",
    docs:["Anexo 6.5 · Requisitos fiscales CFDI extranjero"] },

  { id:"e-verificar-mr", col:3, lane:"egresos", type:"task", phase:2, label:"Verificar pedido y obtener MR",
    title:"Verifica en SAP el pedido para obtener el número de MR",
    desc:"Se localiza en SAP el pedido correspondiente para obtener el número de Mercancía Recibida (MR)." },

  { id:"e-dec-servicio", col:4, lane:"egresos", type:"decision", phase:2, label:"¿Es pago de servicios?",
    title:"¿El pago corresponde a la prestación de un servicio?",
    desc:"Determina la documentación adicional requerida cuando el pago está ligado a servicios.",
    si:"Se solicita al comprador el envío de bitácoras o reportes del servicio recibido y evidencia de dónde se prestó el servicio; adicionalmente se solicita al área usuaria la Constancia de Recepción de Servicios (el mismo documento generado en la Capa 1, fase 6).",
    no:"No aplica documentación adicional de servicios y continúa con la validación de la Constancia de Residencia Fiscal.",
    docs:["Bitácoras / reportes de servicio","Constancia de Recepción de Servicios (Anexo 6.6)"],
    crossLayer:[{ targetLayer:"layer1", targetProcess:null, targetNodeId:"l1-generar-constancia",
      label:"Ver origen de la Constancia en Capa 1 · Fase 6", direction:"backward" }] },

  { id:"e-dec-contrato", col:5, lane:"egresos", type:"decision", phase:2, label:"¿Existe contrato?",
    title:"¿El servicio cuenta con contrato?",
    desc:"Se determina si existe contrato asociado al servicio prestado (aplica especialmente a arrendamiento de equipo).",
    si:"Se coordina con el área usuaria para proporcionar copia al área Fiscal, a fin de determinar si el servicio está sujeto a retención de impuestos.",
    no:"No aplica esta validación y continúa el proceso.",
    gap:"Todos los pagos de arrendamiento de equipo deben contar con contrato debidamente autorizado — responsabilidad del área de Compras (Nota 3 de la política).",
    layer2Note:"La elaboración y autorización del contrato de arrendamiento es responsabilidad del área de Compras/Abastecimientos — ver vista preliminar en Capa 2.",
    crossLayer:[{ targetLayer:"layer2", targetProcess:null, targetNodeId:"p-aclaracion-discrepancias",
      label:"← Consultar con Capa 2 · Abastecimientos", direction:"backward" }] },

  { id:"e-validar-crf", col:6, lane:"egresos", type:"task", phase:2, label:"Validar Constancia de Residencia Fiscal",
    title:"Valida vigencia de la Constancia de Residencia Fiscal",
    desc:"La Constancia de Residencia Fiscal tiene vigencia anual; si el proveedor continúa prestando servicios en ejercicios posteriores, debe entregar la constancia vigente según el año de la operación.",
    callout:"El área usuaria es responsable de recabar y entregar la Constancia de Residencia Fiscal vigente a Egresos." },

  { id:"e-dec-discrepancia", col:7, lane:"egresos", type:"decision", phase:2, label:"¿Hay discrepancias?",
    title:"¿Existen discrepancias entre lo facturado y el pedido?",
    desc:"Se contrasta la factura contra el pedido y el MR obtenido en SAP.",
    si:"Se aclara con el responsable de Comercio Exterior, Compras o el Proveedor antes de continuar.",
    no:"No hay discrepancias y se continúa con la creación del pasivo.",
    selfLoop:true,
    layer2Note:"La aclaración de discrepancias con Compras / Comercio Exterior se gestiona con el área de Abastecimientos — ver vista preliminar en Capa 2.",
    crossLayer:[{ targetLayer:"layer2", targetProcess:null, targetNodeId:"p-aclaracion-discrepancias",
      label:"← Consultar con Capa 2 · Abastecimientos", direction:"backward" }] },

  { id:"e-crear-pasivo", col:8, lane:"egresos", type:"task", phase:3, label:"Crear pasivo",
    title:"Crea pasivo",
    desc:"Si hay compra de activos fijos, envía la factura digital al área de Activo Fijo, recabando acuse de recibo por correo electrónico." },

  { id:"e-solicitud-pago", col:9, lane:"egresos", type:"task", phase:3, label:"Elaborar solicitud de pago",
    title:"Elabora solicitud de pago",
    desc:"Firma y sella de revisado la solicitud de pago." },

  { id:"e-propuesta-pago", col:10, lane:"egresos", type:"task", phase:3, label:"Generar propuesta de pago",
    title:"Genera propuesta de pago",
    desc:"Firma y recaba autorización de la Gerencia de Egresos." },

  { id:"e-enviar-tesoreria", col:11, lane:"egresos", type:"task", phase:3, label:"Enviar a Tesorería",
    title:"Envía solicitud, propuesta de pago y factura a Tesorería",
    desc:"Envía correo electrónico con la solicitud, propuesta de pago y factura a Tesorería. Archiva copia digital de la propuesta de pago para su control.",
    docs:["Solicitud de pago","Propuesta de pago","Factura"] },

  { id:"e-recibir-tesoreria", col:12, lane:"tesoreria", type:"task", phase:4, label:"Recibir y ejecutar propuesta",
    title:"Recibe correo electrónico con propuesta autorizada",
    desc:"Recibe la propuesta con solicitud de pago debidamente autorizada; ejecuta la propuesta cancelando la cuenta por pagar del proveedor." },

  { id:"e-layout-banca", col:13, lane:"tesoreria", type:"task", phase:4, label:"Generar layout bancario",
    title:"Genera layout para el proceso de pago en la banca",
    desc:"Se genera el archivo requerido por el banco para ejecutar el pago al proveedor extranjero." },

  { id:"e-comprobante-pago", col:14, lane:"tesoreria", type:"task", phase:4, label:"Generar comprobante de pago",
    title:"Genera el comprobante de pago",
    desc:"El sistema SAP asigna en automático número de folio para control (archivos kz). Entrega a Contabilidad la propuesta de pago ejecutada y la documentación soporte para resguardo digital.",
    docs:["Comprobante de pago (folio kz)"] },

  { id:"e-recibir-constancias", col:15, lane:"contabilidad", type:"task", phase:5, label:"Recibir constancias de transferencia",
    title:"Recibe constancias de transferencia y documentos soporte",
    desc:"Recibe mediante relación, firma la relación y devuelve a Tesorería." },

  { id:"e-revisar-poliza", col:16, lane:"contabilidad", type:"task", phase:5, label:"Revisar número de póliza",
    title:"Revisa que todas las constancias indiquen el número de póliza",
    desc:"Verifica que cada constancia de transferencia cuente con su número de póliza asociado." },

  { id:"e-archivar", col:17, lane:"contabilidad", type:"task", phase:5, label:"Archivar digitalmente",
    title:"Archiva digitalmente",
    desc:"Archiva de acuerdo con la fecha, tipo de moneda, número de póliza y consecutivo." },

  { id:"e-fin", col:18, lane:"contabilidad", type:"end", phase:5, label:"Proceso finalizado",
    title:"Proceso finalizado",
    desc:"Ciclo de recepción, validación fiscal, contabilización, pago y archivo de la factura del proveedor extranjero concluido." },
];

/* =============================================================================
   ESTRUCTURA DE CAPAS
   ============================================================================= */
const layers = {
  layer1: {
    num:1, key:"layer1", name:"Solicitud, recepción y pago de servicios", status:"active",
    lanes: lanes_layer1, phaseNames: phaseNames_layer1, nodes: nodes_layer1,
  },
  layer2: {
    num:2, key:"layer2", name:"Abastecimientos", status:"preliminary",
    lanes: lanes_layer2, phaseNames: phaseNames_layer2, nodes: nodes_layer2,
  },
  layer3: {
    num:3, key:"layer3", name:"Egresos", status:"active",
    defaultProcess:"nacionales",
    processes: {
      nacionales:  { code:"5.1", name:"Pago a Proveedores Nacionales",  lanes:lanes_nacionales,  phaseNames:phaseNames_nacionales,  nodes:nodes_nacionales },
      extranjeros: { code:"5.4", name:"Pago a Proveedores Extranjeros", lanes:lanes_extranjeros, phaseNames:phaseNames_extranjeros, nodes:nodes_extranjeros },
    },
  },
};

/* =============================================================================
   LAYOUT CONSTANTS
   ============================================================================= */
const LABEL_W   = 190;
const COL_W     = 196;
const PHASE_H   = 46;
const LANE_H    = 148;
const BOTTOM_M  = 60;
const TASK_W = 154, TASK_H = 66;
const DEC_W  = 150, DEC_H  = 92;
const CIRC_D = 68;

/* Íconos BPMN (línea, 24x24) */
const ICONS = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1-4 4-6.2 7.5-6.2S18.5 16 19.5 20"/></svg>`,
  system: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="6.5" rx="1.4"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.4"/><circle cx="7" cy="7.25" r=".9" fill="currentColor" stroke="none"/><circle cx="7" cy="16.75" r=".9" fill="currentColor" stroke="none"/></svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2.5h8l4 4v14a1 1 0 01-1 1h-11a1 1 0 01-1-1v-17a1 1 0 011-1z"/><path d="M14 2.5v4.5h4.5"/><path d="M9 13h6M9 16.5h6"/></svg>`,
  gateway: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l6-6M10 6h5a3 3 0 010 6M14 18H9a3 3 0 010-6"/></svg>`,
  pending: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 2"/></svg>`,
};
const SYSTEM_LANES = ["tesoreria", "contabilidad"];
function iconKindFor(n){
  if(n.pending) return "pending";
  if(n.docs && n.docs.length) return "document";
  if(SYSTEM_LANES.includes(n.lane)) return "system";
  return "user";
}
function kickerText(type){
  return { start:"Inicio", task:"Tarea", decision:"Decisión", end:"Fin de proceso" }[type] || "Tarea";
}

/* =============================================================================
   REGISTRO DE "FLOWS" — cada capa/sub-proceso visible en pantalla es un flow
   independiente, con su propio canvas, controles y panel de detalle.
   Cada flow tiene un `offsetX` (px) que lo desplaza horizontalmente dentro
   de su propio contenedor con scroll, generando el efecto de "escalera":
     - layer1              -> offsetX = 0
     - layer2              -> offsetX = x donde Capa 1 entrega a Compras
     - layer3 (5.1 y 5.4)  -> offsetX = ancho total de Capa 1 (Egresos
                              arranca visualmente donde termina la Capa 1)
   ============================================================================= */
const flows = {};

function laneRoleOf(flow, key){
  const l = flow.lanes.find(l => l.key === key);
  return l ? l.role : "";
}
function nodeIndexById(flow, id){ return flow.nodes.findIndex(n => n.id === id); }
function laneCenterY(flow, laneKey){ return PHASE_H + flow.laneIndex[laneKey]*LANE_H + LANE_H/2; }
function colCenterX(col, offsetX){ return offsetX + LABEL_W + col*COL_W + COL_W/2; }
function boxSize(type){
  if(type==="decision") return [DEC_W, DEC_H];
  if(type==="start" || type==="end") return [CIRC_D, CIRC_D];
  return [TASK_W, TASK_H];
}

function registerFlow(flowKey, dataset, offsetX){
  const els = {
    canvas:       document.getElementById(`canvas-${flowKey}`),
    svg:          document.getElementById(`edges-${flowKey}`),
    canvasScroll: document.getElementById(`canvasScroll-${flowKey}`),
    detail:       document.getElementById(`detail-${flowKey}`),
    phaseLabel:   document.getElementById(`phaseLabel-${flowKey}`),
    stepLabel:    document.getElementById(`stepLabel-${flowKey}`),
    barFill:      document.getElementById(`barFill-${flowKey}`),
    btnPrev:      document.getElementById(`btnPrev-${flowKey}`),
    btnNext:      document.getElementById(`btnNext-${flowKey}`),
    btnRestart:   document.getElementById(`btnRestart-${flowKey}`),
  };
  const flow = {
    key: flowKey,
    lanes: dataset.lanes,
    phaseNames: dataset.phaseNames,
    nodes: dataset.nodes,
    laneIndex: Object.fromEntries(dataset.lanes.map((l,i)=>[l.key,i])),
    totalCols: Math.max(...dataset.nodes.map(n=>n.col)) + 1,
    offsetX: offsetX || 0,
    current: 0,
    els,
  };
  flows[flowKey] = flow;
  return flow;
}

/* =============================================================================
   CONSTRUCCIÓN DEL CANVAS DE UN FLOW (respeta flow.offsetX -> efecto escalera)
   ============================================================================= */
function buildCanvas(flow){
  const { canvas, svg } = flow.els;
  canvas.querySelectorAll(".lane-band, .lane-label, .phase-header, .phase-divider, .node, .edge-label")
    .forEach(el => el.remove());
  while(svg.children.length > 1){ svg.removeChild(svg.lastChild); } // conserva <defs>

  const offsetX = flow.offsetX || 0;
  const innerW = LABEL_W + flow.totalCols*COL_W; // ancho "natural" del diagrama, sin el corrimiento
  const canvasW = offsetX + innerW;
  const canvasH = PHASE_H + flow.lanes.length*LANE_H + BOTTOM_M;
  flow.canvasW = canvasW; flow.canvasH = canvasH; flow.innerW = innerW;

  canvas.style.width = canvasW + "px";
  canvas.style.height = canvasH + "px";
  svg.setAttribute("width", canvasW);
  svg.setAttribute("height", canvasH);
  svg.setAttribute("viewBox", `0 0 ${canvasW} ${canvasH}`);

  flow.lanes.forEach((lane, i) => {
    const band = document.createElement("div");
    band.className = `lane-band lane-band--${i % 2 === 0 ? "a" : "b"}`;
    band.style.top = (PHASE_H + i*LANE_H) + "px";
    band.style.left = offsetX + "px";
    band.style.width = innerW + "px";
    band.style.height = LANE_H + "px";
    canvas.appendChild(band);

    const label = document.createElement("div");
    label.className = "lane-label";
    label.style.top = (PHASE_H + i*LANE_H) + "px";
    label.style.width = LABEL_W + "px";
    label.style.height = LANE_H + "px";
    label.innerHTML = `<span class="lane-label__role">${lane.role}</span><span class="lane-label__tag">${lane.tag}</span>${lane.pendingLayer2 ? '<span class="lane-label__pending">→ Capa 2 (vista preliminar)</span>' : ''}`;
    canvas.appendChild(label);
  });

  const phaseSpans = {};
  flow.nodes.forEach(n => {
    if(!phaseSpans[n.phase]) phaseSpans[n.phase] = { min:n.col, max:n.col };
    phaseSpans[n.phase].min = Math.min(phaseSpans[n.phase].min, n.col);
    phaseSpans[n.phase].max = Math.max(phaseSpans[n.phase].max, n.col);
  });
  const phaseCount = Object.keys(flow.phaseNames).length;
  Object.entries(phaseSpans).forEach(([num, span]) => {
    const x = offsetX + LABEL_W + span.min*COL_W;
    const w = (span.max - span.min + 1) * COL_W;
    const header = document.createElement("div");
    header.className = "phase-header";
    header.style.left = x + "px";
    header.style.width = w + "px";
    header.innerHTML = `<div class="phase-header__num">Fase ${num} de ${phaseCount}</div><div class="phase-header__name">${flow.phaseNames[num]}</div>`;
    canvas.appendChild(header);
    if(Number(num) > 1){
      const divider = document.createElement("div");
      divider.className = "phase-divider";
      divider.style.left = x + "px";
      divider.style.height = canvasH + "px";
      canvas.appendChild(divider);
    }
  });

  flow.nodes.forEach((n, idx) => {
    const [w, h] = boxSize(n.type);
    const cx = colCenterX(n.col, offsetX), cy = laneCenterY(flow, n.lane);
    n._x = cx; n._y = cy; n._w = w; n._h = h; n._idx = idx;
    const el = document.createElement("div");
    el.className = `node node--${n.type}${n.pending ? ' node--pending' : ''}`;
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
    if(n.crossLayer && n.crossLayer.length){
      const cl = document.createElement("span");
      cl.className = `node__crosslink node__crosslink--${n.crossLayer[0].direction}`;
      cl.innerHTML = ICONS.link;
      cl.title = n.crossLayer.map(c=>c.label).join(" | ");
      el.appendChild(cl);
    }
    if(n.pending){
      const pb = document.createElement("span");
      pb.className = "node__pendingtag";
      pb.textContent = "Vista preliminar";
      el.appendChild(pb);
    }
    n._el = el;
    canvas.appendChild(el);
  });

  drawEdges(flow);
}

/* =============================================================================
   CONECTORES SVG
   ============================================================================= */
function edgePoint(node, side){
  const { _x:x, _y:y, _w:w, _h:h } = node;
  if(side==="right")  return [x + w/2, y];
  if(side==="left")   return [x - w/2, y];
  if(side==="bottom") return [x, y + h/2];
}
const styleEdge = `fill:none;stroke:${"#1E5FE0"};stroke-width:2;`;
const styleLoop = `fill:none;stroke:${"#C24A3D"};stroke-width:2;stroke-dasharray:5 4;`;

function drawEdges(flow){
  const { svg, canvas } = flow.els;
  const nodes = flow.nodes;
  const markerArrow = `arrow-${flow.key}`;
  const markerLoop  = `arrowLoop-${flow.key}`;

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
    el.setAttribute("style", (a.pending || b.pending) ? styleEdge.replace("#1E5FE0","#B9790C") : styleEdge);
    el.setAttribute("marker-end", `url(#${markerArrow})`);
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
  let loopSlot = 0;
  nodes.forEach((n) => {
    if(n.selfLoop) return;
    if(n.loopTo === undefined) return;
    const target = nodes[nodeIndexById(flow, n.loopTo)];
    if(!target) return;
    const depth = PHASE_H + flow.lanes.length*LANE_H + 22 + (loopSlot % 3) * 24;
    loopSlot++;
    const p1 = edgePoint(n, "bottom");
    const p2 = edgePoint(target, "bottom");
    const points = [p1, [p1[0], depth], [p2[0], depth], [p2[0], p2[1] + 2]];
    const el = document.createElementNS("http://www.w3.org/2000/svg","path");
    const d = points.map((pt,i)=> (i===0?"M":"L") + pt[0] + "," + pt[1]).join(" ");
    el.setAttribute("d", d);
    el.setAttribute("style", styleLoop);
    el.setAttribute("marker-end", `url(#${markerLoop})`);
    svg.appendChild(el);
    const lbl = document.createElement("span");
    lbl.className = "edge-label edge-label--no";
    lbl.textContent = "No";
    lbl.style.left = ((p1[0] + p2[0]) / 2) + "px";
    lbl.style.top  = (depth - 12) + "px";
    canvas.appendChild(lbl);
  });
}

/* =============================================================================
   PANEL DE DETALLE
   ============================================================================= */
function crossLayerButtonsHTML(n){
  if(!n.crossLayer || !n.crossLayer.length) return "";
  return `<div class="crosslink-box">` + n.crossLayer.map(cl => {
    const targetFlowKey = cl.targetProcess ? `${cl.targetLayer}-${cl.targetProcess}` : cl.targetLayer;
    const arrow = cl.direction === "forward" ? "→" : "←";
    return `<button type="button" class="crosslink-btn" data-jump-flow="${targetFlowKey}" data-jump-node="${cl.targetNodeId}">
      <span class="crosslink-btn__arrow">${arrow}</span>
      <span>${cl.label}</span>
    </button>`;
  }).join("") + `</div>`;
}
function renderDetail(flow, n){
  let html = `
    <div class="detail__card${n.pending ? ' detail__card--pending' : ''}">
      <div class="detail__kicker">
        <span class="pill${n.pending ? ' pill--pending' : ''}">Fase ${n.phase} · ${flow.phaseNames[n.phase]}</span>
        <span>${kickerText(n.type)}</span>
        ${n.pending ? '<span class="pill pill--pending">Vista preliminar</span>' : ''}
      </div>
      <h3 class="detail__title">${n.title}</h3>
      <p class="detail__desc">${n.desc}</p>
  `;
  if(n.type === "decision"){
    html += `<div class="detail__outcomes">`;
    html += `<div class="outcome outcome--si"><span class="outcome__tag">SÍ</span><span>${n.si}</span></div>`;
    html += `<div class="outcome outcome--no"><span class="outcome__tag">NO</span><span>${n.no}</span></div>`;
    html += `</div>`;
    if(n.gap) html += `<div class="gapflag"><b>⚠ Nota ·</b> ${n.gap}</div>`;
  }
  if(n.callout) html += `<div class="callout">${n.callout}</div>`;
  if(n.layer2Note) html += `<div class="layer2note"><b>🔧 Capa 2 · Abastecimientos ·</b> ${n.layer2Note}</div>`;
  if(n.docs && n.docs.length){
    html += `<div class="docs">` + n.docs.map(d=>`<span class="doc">${d}</span>`).join("") + `</div>`;
  }
  html += crossLayerButtonsHTML(n);
  html += `</div>`;
  flow.els.detail.innerHTML = html;
}

/* =============================================================================
   RENDER / NAVEGACIÓN (por flow independiente)
   ============================================================================= */
function render(flow, scroll = true){
  const n = flow.nodes[flow.current];
  const { phaseLabel, stepLabel, barFill, btnPrev, btnNext, canvasScroll } = flow.els;
  flow.nodes.forEach((node, i) => {
    node._el.classList.toggle("is-current", i === flow.current);
    node._el.classList.toggle("is-done", i < flow.current);
  });
  phaseLabel.textContent = `Fase ${n.phase} · ${flow.phaseNames[n.phase]}`;
  stepLabel.textContent = `Paso ${flow.current + 1} de ${flow.nodes.length}`;
  barFill.style.width = `${((flow.current + 1) / flow.nodes.length) * 100}%`;
  btnPrev.disabled = flow.current === 0;
  btnNext.disabled = flow.current === flow.nodes.length - 1;
  btnNext.textContent = flow.current === flow.nodes.length - 1 ? "Proceso finalizado" : "Avanzar →";
  renderDetail(flow, n);
  if(scroll){
    const targetLeft = Math.max(0, n._x - canvasScroll.clientWidth / 2);
    canvasScroll.scrollTo({ left: targetLeft, behavior: "smooth" });
  }
}
function goTo(flow, index){
  flow.current = Math.max(0, Math.min(flow.nodes.length - 1, index));
  render(flow);
}

/* =============================================================================
   MODAL (compartido por todos los flows)
   ============================================================================= */
const modalOverlay = document.getElementById("modalOverlay");
const modalBody    = document.getElementById("modalBody");
const modalClose   = document.getElementById("modalClose");

function openModal(flow, idx){
  const n = flow.nodes[idx];
  let html = `
    <div class="modal__kicker">
      <span class="pill">${kickerText(n.type)}</span>
      <span class="pill pill--lane">Fase ${n.phase} · ${laneRoleOf(flow, n.lane)}</span>
      ${n.pending ? '<span class="pill pill--pending">Vista preliminar</span>' : ''}
    </div>
    <h3 class="modal__title" id="modalTitle">${n.title}</h3>
    <p class="modal__desc">${n.desc}</p>
  `;
  if(n.type === "decision"){
    html += `<div class="detail__outcomes">
      <div class="outcome outcome--si"><span class="outcome__tag">SÍ</span><span>${n.si}</span></div>
      <div class="outcome outcome--no"><span class="outcome__tag">NO</span><span>${n.no}</span></div>
    </div>`;
    if(n.gap) html += `<div class="gapflag"><b>⚠ Nota ·</b> ${n.gap}</div>`;
  }
  if(n.callout) html += `<div class="callout">${n.callout}</div>`;
  if(n.layer2Note) html += `<div class="layer2note"><b>🔧 Capa 2 · Abastecimientos ·</b> ${n.layer2Note}</div>`;
  if(n.docs && n.docs.length){
    html += `<div class="docs">` + n.docs.map(d=>`<span class="doc">${d}</span>`).join("") + `</div>`;
  }
  html += crossLayerButtonsHTML(n);
  modalBody.innerHTML = html;
  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");
}
function closeModal(){
  modalOverlay.classList.remove("is-open");
  modalOverlay.setAttribute("aria-hidden", "true");
}
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if(e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && modalOverlay.classList.contains("is-open")){ closeModal(); return; }
});

/* =============================================================================
   SALTO ENTRE FLOWS (conectores cross-layer / clic en nodo)
   ============================================================================= */
function showProcBlock(procKey){
  document.querySelectorAll("[data-proc-block]").forEach(block => {
    block.classList.toggle("is-hidden", block.dataset.procBlock !== procKey);
  });
  document.querySelectorAll(".proc-switch__btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.proc === procKey);
  });
}
function sectionIdForFlow(flowKey){
  if(flowKey.startsWith("layer3")) return "layer3";
  if(flowKey === "layer2") return "layer2";
  return "layer1";
}
function jumpTo(flowKey, nodeId){
  closeModal();
  if(flowKey === "layer3-nacionales") showProcBlock("nacionales");
  if(flowKey === "layer3-extranjeros") showProcBlock("extranjeros");

  const flow = flows[flowKey];
  if(!flow) return;
  const idx = nodeIndexById(flow, nodeId);
  if(idx < 0) return;
  goTo(flow, idx);
  const section = document.getElementById(sectionIdForFlow(flowKey));
  if(section) section.scrollIntoView({ behavior:"smooth", block:"start" });
  flow.nodes[idx]._el.classList.add("is-flash");
  setTimeout(()=> flow.nodes[idx]._el.classList.remove("is-flash"), 1400);
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".crosslink-btn");
  if(!btn) return;
  jumpTo(btn.dataset.jumpFlow, btn.dataset.jumpNode);
});

function attachCanvasClick(flow){
  flow.els.canvas.addEventListener("click", (e) => {
    const el = e.target.closest(".node");
    if(!el) return;
    openModal(flow, Number(el.dataset.index));
  });
}
function attachFlowControls(flow){
  const { btnNext, btnPrev, btnRestart } = flow.els;
  btnNext.addEventListener("click", () => goTo(flow, flow.current + 1));
  btnPrev.addEventListener("click", () => goTo(flow, flow.current - 1));
  btnRestart.addEventListener("click", () => {
    goTo(flow, 0);
    document.getElementById(sectionIdForFlow(flow.key)).scrollIntoView({ behavior:"smooth", block:"start" });
  });
}

/* =============================================================================
   PROC SWITCH (tabs 5.1 / 5.4 dentro de la Capa 3)
   ============================================================================= */
document.getElementById("procSwitch").addEventListener("click", (e) => {
  const btn = e.target.closest(".proc-switch__btn");
  if(!btn) return;
  showProcBlock(btn.dataset.proc);
});

/* =============================================================================
   SCROLLSPY — resalta en el nav superior la capa visible al hacer scroll
   ============================================================================= */
function initScrollspy(){
  const sections = ["layer1","layer2","layer3"].map(id => document.getElementById(id));
  const navBtns = document.querySelectorAll(".layer-nav__btn");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        navBtns.forEach(b => b.classList.toggle("is-inview", b.dataset.scrollTo === entry.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
  sections.forEach(s => s && observer.observe(s));
}
document.querySelectorAll(".layer-nav__btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(btn.dataset.scrollTo);
    if(target) target.scrollIntoView({ behavior:"smooth", block:"start" });
  });
});

/* =============================================================================
   INICIALIZACIÓN — construye los flows EN ORDEN (1 -> 2 -> 3) calculando
   el offsetX de cada capa a partir de la geometría real de la anterior,
   para lograr el efecto de "escalera" horizontal.
   ============================================================================= */
function initFlows(){
  // 1) Capa 1 primero, sin corrimiento — es la referencia geométrica base.
  const f1 = registerFlow("layer1", layers.layer1, 0);
  buildCanvas(f1);
  attachCanvasClick(f1);
  attachFlowControls(f1);
  render(f1, false);

  // 2) Capa 2 — se indenta hasta el punto donde la Capa 1 entrega a Compras
  //    ("Enviar a Compras"), para que la escalera avance un escalón intermedio.
  const handoffNode = f1.nodes.find(n => n.id === "l1-enviar-a-compras");
  const layer2Offset = handoffNode ? Math.round(handoffNode._x - handoffNode._w/2) : 0;
  const f2 = registerFlow("layer2", layers.layer2, layer2Offset);
  buildCanvas(f2);
  attachCanvasClick(f2);
  attachFlowControls(f2);
  render(f2, false);

  // 3) Capa 3 — se indenta exactamente el ancho total de la Capa 1, para que
  //    Egresos arranque visualmente en el mismo nivel donde termina la Capa 1.
  const layer3Offset = f1.canvasW;
  const f3n = registerFlow("layer3-nacionales", layers.layer3.processes.nacionales, layer3Offset);
  const f3e = registerFlow("layer3-extranjeros", layers.layer3.processes.extranjeros, layer3Offset);
  [f3n, f3e].forEach(flow => {
    buildCanvas(flow);
    attachCanvasClick(flow);
    attachFlowControls(flow);
    render(flow, false);
  });

  showProcBlock("nacionales");
  initScrollspy();
}
initFlows();
