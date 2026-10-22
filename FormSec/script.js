/* =========================================================
   Reporte de Prevención de Accidentes — script.js
   JavaScript Vanilla · Sin dependencias · Listo para API REST
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. CONFIGURACIÓN
     Ajustar aquí. Los límites de archivos son técnicos
     (rendimiento / conectividad), no reglas de negocio.
     --------------------------------------------------------- */
  const CONFIG = Object.freeze({
    apiEndpoint: '',               // p. ej. 'https://api.tu-dominio.com/v1/reportes'. Vacío = modo demostración
    requestTimeoutMs: 45000,
    maxFiles: 5,
    maxImageBytes: 20 * 1024 * 1024,   // tamaño de origen permitido antes de optimizar
    maxVideoBytes: 50 * 1024 * 1024,
    maxTotalBytes: 80 * 1024 * 1024,   // total enviado
    imageMaxDimension: 1600,           // px del lado mayor tras optimizar
    imageQuality: 0.8,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'mp4', 'mov', 'webm', '3gp']
  });

  /* ---------------------------------------------------------
     2. REFERENCIAS DOM
     --------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const dom = {
    form: $('#reportForm'),
    formView: $('#formView'),
    successView: $('#successView'),
    errorSummary: $('#errorSummary'),
    errorSummaryList: $('#errorSummaryList'),
    submitBtn: $('#submitBtn'),
    fecha: $('#fecha'),
    hora: $('#hora'),
    retroGroup: $('#retroGroup'),
    fileCamera: $('#fileCamera'),
    fileGallery: $('#fileGallery'),
    fileActions: $('.file-actions'),
    fileStatus: $('#fileStatus'),
    previewList: $('#previewList'),
    maxFilesText: $('#maxFilesText'),
    dialog: $('#confirmDialog'),
    confirmSummary: $('#confirmSummary'),
    confirmBtn: $('#confirmBtn'),
    confirmLabel: $('#confirmLabel'),
    cancelBtn: $('#cancelBtn'),
    sendError: $('#sendError'),
    folioBox: $('#folioBox'),
    folioText: $('#folioText'),
    demoNote: $('#demoNote'),
    newReportBtn: $('#newReportBtn'),
    netBanner: $('#netBanner'),
    steps: $$('.step'),
    stepDots: $$('.stepper__dot'),
    stepper: $('#stepper'),
    stepLabel: $('#stepLabel'),
    stepFill: $('#stepFill'),
    prevBtn: $('#prevBtn'),
    nextBtn: $('#nextBtn'),
    menuBtn: $('#menuBtn'),
    menuPanel: $('#menuPanel'),
    helpBtn: $('#helpBtn'),
    helpDialog: $('#helpDialog'),
    helpCloseBtn: $('#helpCloseBtn')
  };

  /* ---------------------------------------------------------
     3. ESTADO (solo en memoria; nada en storage/cookies/URL)
     --------------------------------------------------------- */
  const state = {
    files: [],            // { id, file, kind: 'image'|'video', url }
    processing: 0,        // archivos en optimización
    sending: false,
    dirty: false,
    idempotencyKey: null, // evita duplicados si se reintenta el envío
    step: 0,              // paso visible
    maxReached: 0         // último paso alcanzado (habilita navegación por el indicador)
  };

  /* ---------------------------------------------------------
     4. UTILIDADES
     --------------------------------------------------------- */
  const pad = (n) => String(n).padStart(2, '0');

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function nowHHMM() {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** Normaliza texto: elimina caracteres de control (conserva saltos de línea) y espacios sobrantes. */
  function cleanText(value, multiline) {
    let v = String(value || '').normalize('NFC');
    v = multiline
      ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n')
      : v.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ');
    return v.trim();
  }

  function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function uuid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  function getRadioValue(name) {
    const checked = dom.form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  function fieldContainer(name) {
    return dom.form.querySelector(`[data-field="${name}"]`);
  }

  /* ---------------------------------------------------------
     5. REGLAS DE VALIDACIÓN
     Cada regla devuelve '' si es válido o el mensaje de error.
     --------------------------------------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    nombre: {
      label: 'Nombre',
      focus: '#nombre',
      validate() {
        const v = cleanText($('#nombre').value);
        if (!v) return 'Escribe tu nombre.';
        if (v.length < 3) return 'El nombre es muy corto.';
        if (!/^[\p{L}\s.'-]+$/u.test(v)) return 'Usa solo letras.';
        return '';
      }
    },
    numeroEmpleado: {
      label: 'Número de empleado',
      focus: '#numeroEmpleado',
      validate() {
        const v = cleanText($('#numeroEmpleado').value);
        if (!v) return 'Escribe tu número de empleado.';
        if (!/^[A-Za-z0-9-]+$/.test(v)) return 'Usa solo letras, números o guion.';
        return '';
      }
    },
    empresa: {
      label: 'Empresa',
      focus: 'input[name="empresa"]',
      validate: () => (getRadioValue('empresa') ? '' : 'Selecciona tu empresa.')
    },
    division: {
      label: 'División',
      focus: '#division',
      validate: () => ($('#division').value ? '' : 'Selecciona la división.')
    },
    localidad: {
      label: 'Localidad',
      focus: '#localidad',
      validate: () => ($('#localidad').value ? '' : 'Selecciona la localidad.')
    },
    direccion: {
      label: 'Dirección',
      focus: '#direccion',
      validate: () => ($('#direccion').value ? '' : 'Selecciona tu dirección.')
    },
    telefono: {
      label: 'Teléfono',
      focus: '#telefono',
      validate() {
        const raw = $('#telefono').value.trim();
        if (!raw) return '';
        return digitsOnly(raw).length === 10 ? '' : 'El teléfono debe tener 10 dígitos.';
      }
    },
    correo: {
      label: 'Correo',
      focus: '#correo',
      validate() {
        const v = $('#correo').value.trim();
        if (!v) return '';
        return EMAIL_RE.test(v) ? '' : 'Escribe un correo válido (ej. nombre@dominio.com).';
      }
    },
    fecha: {
      label: 'Fecha',
      focus: '#fecha',
      validate() {
        const v = dom.fecha.value;
        if (!v) return 'Selecciona la fecha.';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Fecha no válida.';
        if (v > todayISO()) return 'La fecha no puede ser futura.';
        return '';
      }
    },
    hora: {
      label: 'Hora',
      focus: '#hora',
      validate() {
        const v = dom.hora.value;
        if (!v) return '';
        if (!/^\d{2}:\d{2}/.test(v)) return 'Hora no válida.';
        if (dom.fecha.value === todayISO() && v.slice(0, 5) > nowHHMM()) return 'La hora no puede ser futura.';
        return '';
      }
    },
    descripcion: {
      label: 'Descripción',
      focus: '#descripcion',
      validate() {
        const v = cleanText($('#descripcion').value, true);
        if (!v) return 'Describe lo que detectaste.';
        if (v.length < 10) return 'Agrega más detalle.';
        return '';
      }
    },
    evidencias: {
      label: 'Foto o video',
      focus: '#fileGallery',
      validate() {
        if (state.processing > 0) return 'Espera a que terminen de cargarse los archivos.';
        const total = state.files.reduce((s, f) => s + f.file.size, 0);
        if (total > CONFIG.maxTotalBytes) return `Los archivos suman ${formatBytes(total)}. Máximo ${formatBytes(CONFIG.maxTotalBytes)}.`;
        return '';
      }
    },
    consecuencia: {
      label: 'Tipo de consecuencia',
      focus: 'input[name="consecuencia"]',
      validate: () => (getRadioValue('consecuencia') ? '' : 'Selecciona el tipo de consecuencia.')
    },
    potencial: {
      label: 'Potencial de daño',
      focus: 'input[name="potencial"]',
      validate: () => (getRadioValue('potencial') ? '' : 'Selecciona el potencial de daño.')
    },
    accion: {
      label: 'Acción tomada',
      focus: '#accion',
      validate() {
        const v = cleanText($('#accion').value, true);
        if (!v) return 'Indica si tomaste alguna acción.';
        if (v.length < 2) return 'Agrega más detalle.';
        return '';
      }
    }
  };

  /* ---------------------------------------------------------
     6. RENDER DE ERRORES
     --------------------------------------------------------- */
  function setFieldError(name, message) {
    const box = fieldContainer(name);
    if (!box) return;
    const errorEl = $(`#${name}-error`);
    const inputs = $$('input, select, textarea', box).filter((el) => !el.classList.contains('visually-hidden') || name === 'evidencias');

    box.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
    inputs.forEach((el) => {
      if (message) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    });
  }

  function markValid(name, isValid) {
    const box = fieldContainer(name);
    if (box) box.classList.toggle('is-valid', isValid);
  }

  function validateField(name, opts) {
    const rule = rules[name];
    if (!rule) return '';
    const msg = rule.validate();
    setFieldError(name, msg);
    if (opts && opts.showValid) markValid(name, !msg && hasValue(name));
    return msg;
  }

  function hasValue(name) {
    const el = dom.form.elements[name];
    if (!el) return false;
    return typeof el.value === 'string' ? el.value.trim() !== '' : Boolean(getRadioValue(name));
  }

  function validateAll() {
    const errors = [];
    Object.keys(rules).forEach((name) => {
      const msg = validateField(name);
      if (msg) errors.push({ name, msg });
    });
    return errors;
  }

  function renderErrorSummary(errors) {
    dom.errorSummaryList.textContent = '';
    if (!errors.length) {
      dom.errorSummary.hidden = true;
      return;
    }
    errors.forEach(({ name, msg }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = rules[name].label;
      a.setAttribute('aria-label', `${rules[name].label}: ${msg}`);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        focusField(name);
      });
      li.appendChild(a);
      dom.errorSummaryList.appendChild(li);
    });
    dom.errorSummary.hidden = false;
    dom.stepper.scrollIntoView({ block: 'start' });
    dom.errorSummary.focus({ preventScroll: true });
  }

  function focusField(name) {
    const step = stepOf(name);
    if (step !== state.step) goToStep(step, { keepErrors: true });
    const box = fieldContainer(name);
    const target = $(rules[name].focus, dom.form);
    if (box) box.scrollIntoView({ block: 'center' });
    if (target) target.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------
     7. VALIDACIÓN EN VIVO
     Error al salir del campo; se limpia en cuanto se corrige.
     --------------------------------------------------------- */
  function bindLiveValidation() {
    const textLike = ['nombre', 'numeroEmpleado', 'telefono', 'correo', 'fecha', 'hora', 'descripcion', 'accion'];

    textLike.forEach((name) => {
      const el = dom.form.elements[name];
      el.addEventListener('blur', () => {
        if (el.value.trim() || rules[name].validate() === '') validateField(name, { showValid: true });
      });
      el.addEventListener('input', () => {
        if (fieldContainer(name).classList.contains('has-error')) validateField(name, { showValid: true });
      });
    });

    ['division', 'localidad', 'direccion'].forEach((name) => {
      dom.form.elements[name].addEventListener('change', () => validateField(name, { showValid: true }));
    });

    ['empresa', 'consecuencia', 'potencial'].forEach((name) => {
      $$(`input[name="${name}"]`).forEach((r) => r.addEventListener('change', () => validateField(name)));
    });

    // Fecha cambia ⇒ revalidar hora (regla "no futura" depende de ambas)
    dom.fecha.addEventListener('change', () => {
      validateField('fecha');
      if (dom.hora.value) validateField('hora');
    });

    // Teléfono: solo dígitos, máximo 10
    dom.form.elements.telefono.addEventListener('input', (e) => {
      const d = digitsOnly(e.target.value).slice(0, 10);
      if (e.target.value !== d) e.target.value = d;
    });

    // Contadores de caracteres
    ['descripcion', 'accion'].forEach((name) => {
      const el = dom.form.elements[name];
      const counter = $(`#${name}-count`);
      const max = Number(el.getAttribute('maxlength'));
      const update = () => {
        counter.textContent = `${el.value.length} / ${max}`;
        counter.classList.toggle('is-near-limit', el.value.length >= max * 0.9);
      };
      el.addEventListener('input', update);
      update();
    });
  }

  /* ---------------------------------------------------------
     7b. NAVEGACIÓN POR PASOS (slideshow)
     Avanzar exige validar el paso actual; retroceder siempre se permite.
     --------------------------------------------------------- */
  const TOTAL_STEPS = dom.steps.length;

  function stepOf(name) {
    const box = fieldContainer(name);
    const step = box && box.closest('.step');
    return step ? Number(step.dataset.step) : 0;
  }

  function validateStep(index) {
    const errors = [];
    Object.keys(rules).forEach((name) => {
      if (stepOf(name) !== index) return;
      const msg = validateField(name);
      if (msg) errors.push({ name, msg });
    });
    return errors;
  }

  function goToStep(index, opts) {
    const options = opts || {};
    const target = Math.max(0, Math.min(TOTAL_STEPS - 1, index));
    const backwards = target < state.step;

    dom.steps.forEach((el, i) => {
      const active = i === target;
      el.hidden = !active;
      el.classList.toggle('is-active', active);
      el.classList.toggle('from-prev', active && backwards);
    });

    state.step = target;
    state.maxReached = Math.max(state.maxReached, target);
    if (!options.keepErrors) dom.errorSummary.hidden = true;
    updateStepper();

    if (!options.silent) {
      dom.stepper.scrollIntoView({ block: 'start' });
      const title = $('.step__title', dom.steps[target]);
      if (title) title.focus({ preventScroll: true });
    }
  }

  function updateStepper() {
    const i = state.step;
    dom.stepLabel.textContent = `Paso ${i + 1} de ${TOTAL_STEPS}`;
    dom.stepFill.style.width = `${((i + 1) / TOTAL_STEPS) * 100}%`;

    dom.stepDots.forEach((dot, d) => {
      const current = d === i;
      dot.classList.toggle('is-current', current);
      dot.classList.toggle('is-done', d < i || (d <= state.maxReached && d !== i && !dot.classList.contains('has-error')));
      dot.disabled = d > state.maxReached;
      if (current) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });

    const last = i === TOTAL_STEPS - 1;
    dom.prevBtn.hidden = i === 0;
    dom.nextBtn.hidden = last;
    dom.submitBtn.hidden = !last;
  }

  function markStepErrors(errors) {
    const withErrors = new Set(errors.map((e) => stepOf(e.name)));
    dom.stepDots.forEach((dot, d) => dot.classList.toggle('has-error', withErrors.has(d)));
  }

  function nextStep() {
    const errors = validateStep(state.step);
    dom.stepDots[state.step].classList.toggle('has-error', errors.length > 0);
    if (errors.length) {
      renderErrorSummary(errors);
      return;
    }
    goToStep(state.step + 1);
  }

  function prevStep() {
    goToStep(state.step - 1);
  }

  /* ---------------------------------------------------------
     7c. MENÚ DE AYUDA
     --------------------------------------------------------- */
  function toggleMenu(open) {
    const willOpen = typeof open === 'boolean' ? open : dom.menuPanel.hidden;
    dom.menuPanel.hidden = !willOpen;
    dom.menuBtn.setAttribute('aria-expanded', String(willOpen));
    dom.menuBtn.setAttribute('aria-label', willOpen ? 'Cerrar menú de ayuda' : 'Abrir menú de ayuda');
  }

  function openHelp() {
    toggleMenu(false);
    if (typeof dom.helpDialog.showModal === 'function') {
      dom.helpDialog.showModal();
      dom.helpCloseBtn.focus();
    }
  }

  /* ---------------------------------------------------------
     8. CAMPO CONDICIONAL: Retroalimentación (solo Acto inseguro)
     --------------------------------------------------------- */
  function updateConditional() {
    const show = getRadioValue('consecuencia') === 'Acto inseguro';
    dom.retroGroup.hidden = !show;
    if (!show) $$('input[name="retroalimentacion"]').forEach((r) => { r.checked = false; });
  }

  /* ---------------------------------------------------------
     9. EVIDENCIAS (fotos / videos)
     --------------------------------------------------------- */
  function fileExtension(name) {
    const m = /\.([a-z0-9]+)$/i.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  function classifyFile(file) {
    const type = (file.type || '').toLowerCase();
    const ext = fileExtension(file.name);
    if (!CONFIG.allowedExtensions.includes(ext) && !type) return null;
    if (type.startsWith('image/')) return CONFIG.allowedImageTypes.includes(type) || ['heic', 'heif'].includes(ext) ? 'image' : null;
    if (type.startsWith('video/')) return CONFIG.allowedVideoTypes.includes(type) ? 'video' : null;
    // Algunos navegadores no reportan MIME (p. ej. HEIC): se decide por extensión
    if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'webm', '3gp'].includes(ext)) return 'video';
    return null;
  }

  /** Reduce resolución y re-codifica a JPEG: menos datos móviles y elimina metadatos EXIF (GPS, dispositivo). */
  function optimizeImage(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        try {
          const scale = Math.min(1, CONFIG.imageMaxDimension / Math.max(img.naturalWidth, img.naturalHeight));
          const w = Math.round(img.naturalWidth * scale);
          const h = Math.round(img.naturalHeight * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return resolve(file);
            const base = (file.name || 'foto').replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_').slice(0, 40) || 'foto';
            resolve(new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', CONFIG.imageQuality);
        } catch (err) {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // formato no decodificable en este navegador (p. ej. HEIC): se envía original
      };
      img.src = url;
    });
  }

  async function handleFiles(fileList, inputEl) {
    const incoming = Array.from(fileList || []);
    inputEl.value = ''; // permite volver a seleccionar el mismo archivo
    if (!incoming.length) return;

    const rejected = [];
    const slots = CONFIG.maxFiles - state.files.length - state.processing;

    if (slots <= 0) {
      setFieldError('evidencias', `Máximo ${CONFIG.maxFiles} archivos.`);
      return;
    }

    const accepted = [];
    incoming.forEach((file) => {
      const kind = classifyFile(file);
      if (!kind) return rejected.push(`${file.name}: formato no permitido`);
      const limit = kind === 'image' ? CONFIG.maxImageBytes : CONFIG.maxVideoBytes;
      if (file.size > limit) return rejected.push(`${file.name}: excede ${formatBytes(limit)}`);
      if (file.size === 0) return rejected.push(`${file.name}: archivo vacío`);
      accepted.push({ file, kind });
    });

    if (accepted.length > slots) {
      rejected.push(`Solo se agregaron ${slots} (máximo ${CONFIG.maxFiles})`);
      accepted.length = slots;
    }

    setFieldError('evidencias', rejected.join(' · '));
    if (!accepted.length) return;

    state.processing += accepted.length;
    updateFileUI();

    for (const item of accepted) {
      const finalFile = item.kind === 'image' ? await optimizeImage(item.file) : item.file;
      state.processing -= 1;
      addFile(finalFile, item.kind);
    }

    state.dirty = true;
    updateFileUI();
    if (!rejected.length) validateField('evidencias');
  }

  function addFile(file, kind) {
    const entry = { id: uuid(), file, kind, url: URL.createObjectURL(file) };
    state.files.push(entry);

    const li = document.createElement('li');
    li.className = 'preview';
    li.dataset.id = entry.id;

    let media;
    if (kind === 'image') {
      media = document.createElement('img');
      media.alt = 'Foto adjunta';
    } else {
      media = document.createElement('video');
      media.muted = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.setAttribute('aria-label', 'Video adjunto');
    }
    media.src = entry.url;

    const badge = document.createElement('span');
    badge.className = 'preview__badge';
    badge.textContent = `${kind === 'image' ? 'Foto' : 'Video'} · ${formatBytes(file.size)}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'preview__remove';
    remove.setAttribute('aria-label', `Quitar ${kind === 'image' ? 'foto' : 'video'} ${state.files.length}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => removeFile(entry.id));

    li.append(media, badge, remove);
    dom.previewList.appendChild(li);
  }

  function removeFile(id) {
    const idx = state.files.findIndex((f) => f.id === id);
    if (idx === -1) return;
    URL.revokeObjectURL(state.files[idx].url);
    state.files.splice(idx, 1);
    const li = dom.previewList.querySelector(`[data-id="${id}"]`);
    if (li) li.remove();
    updateFileUI();
    setFieldError('evidencias', '');
    dom.fileStatus.textContent = 'Archivo eliminado.';
    dom.fileGallery.focus();
  }

  function clearFiles() {
    state.files.forEach((f) => URL.revokeObjectURL(f.url));
    state.files = [];
    dom.previewList.textContent = '';
    updateFileUI();
  }

  function updateFileUI() {
    const count = state.files.length;
    const full = count + state.processing >= CONFIG.maxFiles;
    dom.fileActions.classList.toggle('is-disabled', full);
    dom.fileCamera.disabled = full;
    dom.fileGallery.disabled = full;

    if (state.processing > 0) {
      dom.fileStatus.textContent = 'Procesando archivo…';
    } else if (count > 0) {
      const total = state.files.reduce((s, f) => s + f.file.size, 0);
      dom.fileStatus.textContent = `${count} de ${CONFIG.maxFiles} adjunto(s) · ${formatBytes(total)}`;
    } else {
      dom.fileStatus.textContent = '';
    }
  }

  /* ---------------------------------------------------------
     10. DATOS DEL FORMULARIO
     --------------------------------------------------------- */
  function collectData() {
    const f = dom.form.elements;
    const consecuencia = getRadioValue('consecuencia');
    return {
      nombre: cleanText(f.nombre.value),
      numeroEmpleado: cleanText(f.numeroEmpleado.value).toUpperCase(),
      empresa: getRadioValue('empresa'),
      division: f.division.value,
      localidad: f.localidad.value,
      direccion: f.direccion.value,
      telefono: digitsOnly(f.telefono.value),
      correo: f.correo.value.trim().toLowerCase(),
      fechaDeteccion: f.fecha.value,
      horaDeteccion: f.hora.value ? f.hora.value.slice(0, 5) : '',
      descripcion: cleanText(f.descripcion.value, true),
      consecuencia,
      retroalimentacion: consecuencia === 'Acto inseguro' ? getRadioValue('retroalimentacion') : '',
      potencialDano: getRadioValue('potencial'),
      accionTomada: cleanText(f.accion.value, true)
    };
  }

  /** Multipart para la API REST: campos de texto + archivos en "evidencias". */
  function buildFormData(data) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fd.append('zonaHoraria', Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    fd.append('capturadoEn', new Date().toISOString());
    state.files.forEach((entry) => fd.append('evidencias', entry.file, entry.file.name));
    return fd;
  }

  /* ---------------------------------------------------------
     11. CONFIRMACIÓN
     --------------------------------------------------------- */
  function renderSummary(data) {
    const rows = [
      ['Nombre', data.nombre],
      ['No. empleado', data.numeroEmpleado],
      ['Empresa', data.empresa],
      ['Localidad', data.localidad],
      ['Fecha', `${data.fechaDeteccion}${data.horaDeteccion ? ' ' + data.horaDeteccion : ''}`],
      ['Consecuencia', data.consecuencia],
      ['Potencial', data.potencialDano],
      ['Evidencias', state.files.length ? `${state.files.length} archivo(s)` : 'Ninguna']
    ];
    dom.confirmSummary.textContent = '';
    rows.forEach(([k, v]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = k;
      dd.textContent = v; // textContent: nunca se interpreta HTML del usuario
      dom.confirmSummary.append(dt, dd);
    });
  }

  function openConfirm() {
    renderSummary(collectData());
    dom.sendError.hidden = true;
    setSending(false);
    if (typeof dom.dialog.showModal === 'function') {
      dom.dialog.showModal();
      dom.cancelBtn.focus();   // foco en la acción segura
    } else if (window.confirm('¿Enviar reporte?')) {
      submitReport();
    }
  }

  function closeConfirm() {
    if (state.sending) return;
    if (dom.dialog.open) dom.dialog.close();
    dom.submitBtn.focus();
  }

  function setSending(on) {
    state.sending = on;
    dom.confirmBtn.disabled = on;
    dom.cancelBtn.disabled = on;
    dom.confirmBtn.classList.toggle('is-loading', on);
    dom.confirmLabel.textContent = on ? 'Enviando…' : 'Enviar';
  }

  /* ---------------------------------------------------------
     12. ENVÍO (API REST)
     --------------------------------------------------------- */
  async function sendToApi(formData) {
    if (!CONFIG.apiEndpoint) {
      // Modo demostración: simula latencia, no envía datos
      await new Promise((r) => setTimeout(r, 900));
      return { demo: true, folio: '' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);

    try {
      const res = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        body: formData,                       // el navegador define Content-Type multipart
        headers: { 'Idempotency-Key': state.idempotencyKey, Accept: 'application/json' },
        credentials: 'omit',
        mode: 'cors',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });

      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }

      let body = {};
      try { body = await res.json(); } catch (_) { /* respuesta sin JSON */ }
      return { demo: false, folio: typeof body.folio === 'string' ? body.folio : '' };
    } finally {
      clearTimeout(timer);
    }
  }

  function sendErrorMessage(err) {
    if (!navigator.onLine) return 'Sin conexión. Tus datos siguen aquí; intenta de nuevo cuando tengas señal.';
    if (err && err.name === 'AbortError') return 'La conexión tardó demasiado. Intenta de nuevo.';
    if (err && err.status === 413) return 'Los archivos son muy pesados. Quita alguno e intenta de nuevo.';
    if (err && err.status === 429) return 'Demasiados intentos. Espera un momento.';
    if (err && err.status >= 400 && err.status < 500) return 'El servidor rechazó el reporte. Revisa los datos.';
    return 'No se pudo enviar. Intenta de nuevo.';
  }

  async function submitReport() {
    if (state.sending) return;

    // Honeypot: un bot lo llena; se simula éxito sin enviar
    if (dom.form.elements.website.value) {
      showSuccess({ demo: false, folio: '' });
      return;
    }

    if (!navigator.onLine) {
      dom.sendError.textContent = sendErrorMessage();
      dom.sendError.hidden = false;
      return;
    }

    if (!state.idempotencyKey) state.idempotencyKey = uuid();
    setSending(true);
    dom.sendError.hidden = true;

    try {
      const result = await sendToApi(buildFormData(collectData()));
      setSending(false);
      if (dom.dialog.open) dom.dialog.close();
      showSuccess(result);
    } catch (err) {
      setSending(false);
      dom.sendError.textContent = sendErrorMessage(err);
      dom.sendError.hidden = false;
      dom.confirmLabel.textContent = 'Reintentar';
      dom.confirmBtn.focus();
    }
  }

  /* ---------------------------------------------------------
     13. VISTAS
     --------------------------------------------------------- */
  function showSuccess(result) {
    state.dirty = false;
    dom.formView.hidden = true;
    dom.successView.hidden = false;
    dom.folioBox.hidden = !result.folio;
    dom.folioText.textContent = result.folio || '';
    dom.demoNote.hidden = !result.demo;
    window.scrollTo(0, 0);
    dom.successView.focus();
    resetForm(); // limpia datos personales de la memoria/pantalla
  }

  function resetForm() {
    dom.form.reset();
    clearFiles();
    $$('.field', dom.form).forEach((el) => el.classList.remove('has-error', 'is-valid'));
    $$('[aria-invalid]', dom.form).forEach((el) => el.removeAttribute('aria-invalid'));
    $$('.field__error', dom.form).forEach((el) => { el.textContent = ''; });
    dom.errorSummary.hidden = true;
    updateConditional();
    setDefaults();
    state.maxReached = 0;
    dom.stepDots.forEach((dot) => dot.classList.remove('has-error', 'is-done'));
    goToStep(0, { silent: true });
    ['descripcion', 'accion'].forEach((n) => dom.form.elements[n].dispatchEvent(new Event('input')));
    state.idempotencyKey = null;
    state.dirty = false;
  }

  function startNewReport() {
    dom.successView.hidden = true;
    dom.formView.hidden = false;
    window.scrollTo(0, 0);
    $('#nombre').focus();
  }

  /* ---------------------------------------------------------
     14. VALORES POR DEFECTO
     --------------------------------------------------------- */
  function setDefaults() {
    dom.fecha.max = todayISO();
    dom.fecha.value = todayISO();
    dom.hora.value = nowHHMM();
  }

  /* ---------------------------------------------------------
     15. CONECTIVIDAD
     --------------------------------------------------------- */
  function updateNetwork() {
    dom.netBanner.hidden = navigator.onLine;
  }

  /* ---------------------------------------------------------
     16. EVENTOS E INICIO
     --------------------------------------------------------- */
  function init() {
    dom.maxFilesText.textContent = String(CONFIG.maxFiles);
    setDefaults();
    goToStep(0, { silent: true });
    bindLiveValidation();
    updateConditional();
    updateNetwork();

    dom.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (state.sending) return;
      // La fecha máxima se recalcula por si la página quedó abierta después de medianoche
      dom.fecha.max = todayISO();
      const errors = validateAll();
      markStepErrors(errors);
      if (!errors.length) {
        dom.errorSummary.hidden = true;
        openConfirm();
        return;
      }
      // Lleva al primer paso con errores y muestra solo los de ese paso
      const firstStep = Math.min(...errors.map((e) => stepOf(e.name)));
      if (firstStep !== state.step) goToStep(firstStep, { silent: true });
      renderErrorSummary(errors.filter((e) => stepOf(e.name) === firstStep));
    });

    // Enter en campos de una línea no debe enviar accidentalmente
    dom.form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') e.preventDefault();
    });

    dom.form.addEventListener('input', () => { state.dirty = true; });
    dom.form.addEventListener('change', (e) => {
      state.dirty = true;
      if (e.target.name === 'consecuencia') updateConditional();
    });

    dom.fileCamera.addEventListener('change', (e) => handleFiles(e.target.files, e.target));
    dom.fileGallery.addEventListener('change', (e) => handleFiles(e.target.files, e.target));

    dom.confirmBtn.addEventListener('click', submitReport);
    dom.cancelBtn.addEventListener('click', closeConfirm);
    dom.dialog.addEventListener('cancel', (e) => {   // tecla Esc / botón atrás
      if (state.sending) e.preventDefault();
    });

    dom.newReportBtn.addEventListener('click', startNewReport);

    // Pasos
    dom.nextBtn.addEventListener('click', nextStep);
    dom.prevBtn.addEventListener('click', prevStep);
    dom.stepDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.goto);
        if (target === state.step || target > state.maxReached) return;
        if (target > state.step) {
          // Saltar hacia adelante exige que el paso actual sea válido
          const errors = validateStep(state.step);
          dom.stepDots[state.step].classList.toggle('has-error', errors.length > 0);
          if (errors.length) return renderErrorSummary(errors);
        }
        goToStep(target);
      });
    });

    // Menú y ayuda
    dom.menuBtn.addEventListener('click', () => toggleMenu());
    dom.helpBtn.addEventListener('click', openHelp);
    dom.helpCloseBtn.addEventListener('click', () => dom.helpDialog.close());
    $$('a.menu__item', dom.menuPanel).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('click', (e) => {
      if (!dom.menuPanel.hidden && !e.target.closest('#menuPanel, #menuBtn')) toggleMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dom.menuPanel.hidden) {
        toggleMenu(false);
        dom.menuBtn.focus();
      }
    });

    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);

    // Aviso si se intenta cerrar/recargar con datos capturados
    window.addEventListener('beforeunload', (e) => {
      if (state.dirty || state.files.length) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
