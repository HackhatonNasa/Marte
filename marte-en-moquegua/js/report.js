/* Informe de campaña bilingüe (ES/EN), CSV y GeoJSON. Todo se genera en el navegador con los datos del mapa.
   Cada idioma se construye con las mismas funciones del sistema, cambiando temporalmente el idioma activo. */
const Report = (() => {
  function mapImage(c) {
    const G = c.G, ov = c.overlay; if (!ov) return null;
    const rc = c.t.cells.map(i => [Math.floor(i / G.w), i % G.w]);
    let r0 = Math.min(...rc.map(x => x[0])) - 12, r1 = Math.max(...rc.map(x => x[0])) + 12, c0 = Math.min(...rc.map(x => x[1])) - 16, c1 = Math.max(...rc.map(x => x[1])) + 16;
    r0 = Math.max(0, r0); c0 = Math.max(0, c0); r1 = Math.min(G.h - 1, r1); c1 = Math.min(G.w - 1, c1);
    const k = 7, cv = document.createElement('canvas'); cv.width = (c1 - c0 + 1) * k; cv.height = (r1 - r0 + 1) * k;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#0b1426'; x.fillRect(0, 0, cv.width, cv.height);
    x.drawImage(ov, c0, r0, c1 - c0 + 1, r1 - r0 + 1, 0, 0, cv.width, cv.height);
    const P = (lat, lon) => [((lon - G.west) / G.dx - c0) * k, ((lat - G.north) / G.dy - r0) * k];
    x.strokeStyle = '#fff'; x.lineWidth = 2; c.outline.forEach(s => { const a = P(s[1], s[0]), b = P(s[3], s[2]); x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); });
    if (c.rover) { x.strokeStyle = '#8FD8CF'; x.lineWidth = 4; x.beginPath(); c.rover.active.pts.forEach((p, i) => { const q = P(p.lat, p.lon); i ? x.lineTo(...q) : x.moveTo(...q); }); x.stroke(); }
    if (c.eva) { const e = c.eva.p, rt = [e.hab, ...e.plan.map(o => o.p), e.hab]; x.strokeStyle = '#F3C27A'; x.lineWidth = 3; x.beginPath(); rt.forEach((p, i) => { const q = P(p.lat, p.lon); i ? x.lineTo(...q) : x.moveTo(...q); }); x.stroke();
      const h = P(e.hab.lat, e.hab.lon); x.fillStyle = '#B6A4F0'; x.beginPath(); x.arc(h[0], h[1], 7, 0, 7); x.fill(); }
    return cv.toDataURL('image/png');
  }
  const f = (v, d = 0) => fmt(v, d);

  function build(c, lang) {
    const prev = window.__lang; window.__lang = lang;
    try {
      const es = lang === 'es', T = (a, b) => es ? a : b, s = c.statsF(), w = c.whyF(s), m = c.mode, date = new Date().toLocaleDateString('en-CA');
      const row = (...a) => `<tr>${a.map(x => `<td>${x}</td>`).join('')}</tr>`, th = (...a) => `<tr>${a.map(x => `<th>${x}</th>`).join('')}</tr>`;
      const rv = c.rover && c.rover.active, vR = rv ? c.verdictRover(rv) : null, E = c.eva && c.eva.p, vE = E ? c.verdictEva(E) : null;
      const rng = c.range ? `${f(c.range[0])}–${f(c.range[2])}` : T('no calculado para un punto', 'not computed for a single point');
      const purpose = { probar: T('ensayos de movilidad de rovers', 'rover mobility tests'), entrenar: T('entrenamiento de tripulaciones análogas', 'analog crew training'), estudiar: T('estudios de suelos tipo Marte', 'Mars-like soil studies') }[m];
      const img = mapImage(c);
      const sum = T(`${c.name} (${c.region}) es un sitio <b>${s.cls.toLowerCase()}</b> según el PNUMA (AI = ${f(s.ai, 3)}). Su <b>similitud ambiental con Marte es ${f(s.sim)}</b> (rango de sensibilidad ${rng}; ${s.nInd}/3 indicadores), frente a ${f(c.yS)} de Yungay, ancla de la escala. El <b>${f(s.apt)}%</b> del área cumple los requisitos del modo ${c.modeName(m)}.${rv ? ` Ensayo de rover (límite ${rv.limit}°): <b>${vR.t}</b>.` : ''}${E ? ` EVA: <b>${vE.t}</b>.` : ''} Se propone como candidato preliminar para ${purpose}, sujeto a reconocimiento de campo y permisos.`,
        `${c.name} (${c.region}) is a <b>${s.cls.toLowerCase()}</b> site under UNEP (AI = ${f(s.ai, 3)}). Its <b>environmental similarity to Mars is ${f(s.sim)}</b> (sensitivity range ${rng}; ${s.nInd}/3 indicators), compared with ${f(c.yS)} for Yungay, the scale anchor. <b>${f(s.apt)}%</b> of the area meets the ${c.modeName(m)} mode requirements.${rv ? ` Rover test (${rv.limit}° limit): <b>${vR.t}</b>.` : ''}${E ? ` EVA: <b>${vE.t}</b>.` : ''} Proposed as a preliminary candidate for ${purpose}, subject to field reconnaissance and permits.`);
      const checks = T(['Reconocer el terreno a pie: firmeza del suelo, rocas y arena suelta.', 'Confirmar la ruta real de acceso en vehículo y los permisos del terreno.', 'Tomar muestras y analizarlas (difracción de rayos X) para confirmar los minerales indicados por EMIT.', 'Medir la temperatura del suelo de día y de noche.', 'Plan de seguridad y comunicaciones con la ciudad de apoyo.'],
        ['Walk the terrain: soil bearing, rocks and loose sand.', 'Confirm the real vehicle access route and land permits.', 'Take samples and analyse them (X-ray diffraction) to confirm EMIT minerals.', 'Measure ground temperature by day and night.', 'Safety and communications plan with the support town.']);
      const lims = T(['La similitud es un índice de cribado anclado a referencias; no es un porcentaje de parecido con Marte.', 'Resolución de ~1 km. TerraClimate (~4.6 km) y GPM (~11 km) están interpolados.', 'Yungay es el ancla de la aridez; no es una prueba independiente. Utah está en el límite árido/semiárido.', 'EMIT entrega indicios minerales con cobertura parcial; no reemplaza muestras.', 'La ruta del rover es un corredor preliminar, no una simulación de navegación.', 'Modelo no validado en campo: los resultados requieren verificación.'],
        ['Similarity is a screening index anchored to references; it is not a percentage of likeness to Mars.', '~1 km resolution. TerraClimate (~4.6 km) and GPM (~11 km) are interpolated.', 'Yungay anchors aridity; it is not an independent test. Utah sits at the arid/semi-arid boundary.', 'EMIT gives partial-coverage mineral indications; it does not replace samples.', 'The rover route is a preliminary corridor, not a navigation simulation.', 'Model not validated in the field: results require verification.']);
      let n = 1; const H = (a, b) => `<h2>${n++}. ${T(a, b)}</h2>`;
      let html = `<section class="cover"><div class="kick">${T('INFORME PRELIMINAR DE CAMPAÑA', 'PRELIMINARY CAMPAIGN REPORT')}</div><h1>${c.name}</h1><div class="sub">${c.region} · ${f(s.lat, 4)}, ${f(s.lon, 4)} · ${f(s.area)} km²</div>
        <div class="meta"><div><span>${T('Modo', 'Mode')}</span><b>${c.modeName(m)}</b></div><div><span>${T('Similitud ambiental', 'Environmental similarity')}</span><b>${f(s.sim)} <small>(${rng})</small></b></div><div><span>${T('Aptitud para la misión', 'Mission suitability')}</span><b>${f(s.apt)}%</b></div><div><span>${T('Confianza de datos', 'Data confidence')}</span><b>${w.level} · ${w.n}/4</b></div></div>
        ${img ? `<figure><img src="${img}" alt=""><figcaption>${T('Similitud ambiental (escala Plasma); contorno blanco = área evaluada', 'Environmental similarity (Plasma scale); white outline = evaluated area')}${rv ? T('; turquesa = ruta del rover', '; teal = rover route') : ''}${E ? T('; ámbar = ruta EVA', '; amber = EVA route') : ''}. ${T('Generado', 'Generated')}: ${date}.</figcaption></figure>` : ''}
        <div class="team">Marte en Moquegua · 404 Sleep Not Found · NASA Space Apps Challenge 2026</div></section>`;
      html += H('Resumen ejecutivo', 'Executive summary') + `<p class="lead">${sum}</p>`;
      html += H('¿Por qué este sitio?', 'Why this site?') + `<ul>${w.reasons.map(r => `<li>${r.t}</li>`).join('')}${w.weak ? `<li>${w.weak.t}</li>` : ''}${w.missing ? `<li>${w.missing}</li>` : ''}</ul>
        <table>${w.checks.map(x => row(x.ok ? '✓' : '✗', x.t)).join('')}</table>`;
      html += H('Caracterización', 'Characterization') + `<table>${th(T('Indicador', 'Indicator'), T('Valor', 'Value'), '0–1', T('Anclaje', 'Anchor'), T('Fuente', 'Source'))}
        ${row(T('Oscilación térmica del suelo', 'Ground thermal swing'), f(s.dT, 1) + ' °C', f(s.ind.T, 2), T('ΔT / 80 °C (Gale)', 'ΔT / 80 °C (Gale)'), 'MODIS; REMS [7]')}
        ${row(T('Índice de aridez', 'Aridity index'), `${f(s.ai, 3)} (${s.cls})`, f(s.ind.A, 2), T('0 en AI 0.20; 1 en Yungay', '0 at AI 0.20; 1 at Yungay'), 'TerraClimate [5]; UNEP [4]; [2]')}
        ${row(T('Minerales tipo Marte', 'Mars-like minerals'), s.fe == null ? T('sin dato', 'no data') : `Fe ${f(s.fe)}% · ${T('sulf./arc.', 'sulf./clays')} ${f(s.cs)}%`, f(s.ind.M, 2), T('promedio de dos fracciones', 'mean of two fractions'), 'NASA EMIT')}
        ${row(T('Pendiente media (aptitud)', 'Mean slope (suitability)'), f(s.slope, 1) + '°', '—', T('límite del usuario', 'user limit') + ' ' + c.f.slope + '°', 'SRTM; JPL [6]')}
        ${row(T('Lluvia anual', 'Annual rainfall'), `${f(s.pr_tc)} mm (TerraClimate) · ${f(s.pr_gpm)} mm (GPM)`, '—', '—', T('productos en desacuerdo', 'products disagree'))}</table>
        <p class="small">${T(`Similitud = promedio de los indicadores disponibles (OCDE/JRC [9]). Percentil regional ${f(s.pct)}. Cobertura EMIT ${f(s.emitCov)}%.`, `Similarity = mean of available indicators (OECD/JRC [9]). Regional percentile ${f(s.pct)}. EMIT coverage ${f(s.emitCov)}%.`)}</p>`;
      html += H('Comparación con análogos de referencia', 'Comparison with reference analogs') + `<div class="chart">${Charts.groups([{ label: T('Térmica', 'Thermal'), color: '#c4675c' }, { label: T('Aridez', 'Aridity'), color: '#a58a45' }, { label: T('Minerales', 'Minerals'), color: '#b9822e' }],
        [{ name: c.name, color: '#8b7fd6', vals: ['T', 'A', 'M'].map(k => s.ind[k]) }, { name: 'Yungay', color: '#d79a73', vals: ['T', 'A', 'M'].map(k => c.yN[k]) }, { name: 'Utah MDRS', color: '#9aa2b0', vals: ['T', 'A', 'M'].map(k => c.uN[k]) }], 560, 160)}</div>
        <table>${th('', c.name, 'Yungay', 'Utah MDRS')}${row(T('Similitud', 'Similarity'), f(s.sim), f(c.yS), f(c.uS))}${row('AI', f(s.ai, 3), f(c.Y.vals.ai, 4), f(c.U.vals.ai, 3))}${row(T('Clase PNUMA', 'UNEP class'), s.cls, c.aiClass(c.Y.vals.ai), c.aiClass(c.U.vals.ai))}</table>`;
      html += H('Dónde se parece a Marte y dónde no', 'Where it resembles Mars and where not') + `<table>${th(T('Variable', 'Variable'), T('Este sitio', 'This site'), T('Marte (Gale)', 'Mars (Gale)'))}
        ${row(T('Aridez', 'Aridity'), s.cls, T('sin agua líquida', 'no liquid water'))}${row(T('Oscilación del suelo', 'Ground swing'), f(s.dT, 1) + ' °C', '≈ 80 °C [7]')}${row(T('Gravedad', 'Gravity'), '9.81 m/s²', '3.71 m/s² — ' + T('no se copia', 'not reproduced'))}${row(T('Presión', 'Pressure'), '≈ 1013 hPa', '≈ 6 hPa — ' + T('no se copia', 'not reproduced'))}${row(T('Radiación', 'Radiation'), '≈ 0.007 mSv/d', '≈ 0.64 mSv/d [8] — ' + T('no se copia', 'not reproduced'))}</table>`;
      html += H('Requisitos y logística', 'Requirements and logistics') + `<table>${th(T('Requisito', 'Requirement'), T('Valor', 'Value'))}${row(T('Pendiente máxima', 'Maximum slope'), c.f.slope + '°')}${row(T('Distancia a carretera', 'Distance to road'), '≤ ' + c.f.road + ' km')}${row(T('Áreas protegidas', 'Protected areas'), c.f.anp ? T('excluidas', 'excluded') : T('permitidas', 'allowed'))}${row(T('Cielo oscuro', 'Dark sky'), c.f.dark ? 'VIIRS ≤ 0.5' : T('no requerido', 'not required'))}${row(T('Dato EMIT', 'EMIT data'), c.f.emit ? T('requerido', 'required') : T('opcional', 'optional'))}</table>
        <p>${T('Carretera a', 'Road at')} ${f(s.road, 1)} km · ${T('ciudad de apoyo', 'support town')} ${c.town.n} (${f(c.town.d)} km ${T('en línea recta', 'straight-line')}) · VIIRS ${f(s.ntl, 2)} · ${T('área protegida', 'protected area')}: ${s.anp ? T('en parte', 'partly') : 'no'}.</p>`;
      if (rv) {
        const cmp = c.roverCmp && c.roverCmp.plan.best;
        html += H('Ensayo de rover (evaluación preliminar de ruta)', 'Rover test (preliminary route assessment)') + `<div class="verdict ${vR.cls}"><b>${vR.t}</b> ${vR.d}</div>
          <table>${th(T('Parámetro', 'Parameter'), T('Valor', 'Value'))}${row(T('Límite del equipo', 'Equipment limit'), rv.limit + '°')}${row(T('Ruta activa', 'Active route'), T('rumbo ', 'heading ') + Math.round(rv.h * 180 / Math.PI) + '°' + (rv === c.rover.plan.best ? '' : T(' (alternativa elegida por el usuario)', ' (alternative chosen by the user)')))}
          ${row(T('Longitud real (suma de segmentos)', 'Actual length (sum of segments)'), f(rv.length, 2) + ' km')}${row(T('Longitud bajo el límite', 'Length under the limit'), f(rv.ok) + '%')}${row(T('Sin evaluar', 'Not evaluated'), f(rv.nod) + '%')}${row(T('Pendiente máx. / media', 'Max / mean slope'), `${f(rv.max, 1)}° / ${f(rv.mean, 1)}°`)}
          ${row(T('Fuente de la pendiente', 'Slope source'), c.rover.plan.src === 'terrain' ? T('Cesium World Terrain (~30 m), entre puntos cada 100 m', 'Cesium World Terrain (~30 m), between points every 100 m') : T('pendiente media de celdas de 1 km (SRTM)', 'mean slope of 1 km cells (SRTM)'))}${row(T('Calculado', 'Computed'), c.rover.time.slice(0, 16).replace('T', ' '))}</table>
          <div class="chart">${Charts.profile(rv.segs, rv.limit, 560, 120)}</div>${cmp ? `<p>${T('Mismo ensayo en', 'Same test at')} ${c.roverCmp.name}: ${c.verdictRover(cmp).t}, ${f(cmp.ok)}% ${T('bajo el límite', 'under the limit')}.</p>` : ''}`;
      }
      if (E) {
        html += H(E.kind === 'sample' ? 'Ruta de muestreo' : 'Ensayo de misión análoga (EVA)', E.kind === 'sample' ? 'Sampling route' : 'Analog mission test (EVA)') + `<div class="verdict ${vE.cls}"><b>${vE.t}</b> ${vE.d}</div>
          <table>${th(T('Supuesto', 'Assumption'), T('Valor', 'Value'))}${row(T('Radio', 'Radius'), E.c.R + ' km')}${row(T('Tiempo', 'Time'), E.c.hours + ' h')}${row(T('Velocidad a pie', 'Walking speed'), E.c.speed + ' km/h')}${row(T('Reserva de regreso', 'Return reserve'), E.c.reserve + '%')}${row(T('Pendiente máx.', 'Max slope'), E.c.limit + '°')}</table>
          <table>${th(T('Objetivo', 'Objective'), T('Indicio', 'Indication'), T('Estado', 'Status'))}${E.plan.map(o => row(c.objLab(o.k), c.objWhy(o), T('incluido', 'included'))).join('')}${E.out.map(o => row(c.objLab(o.k), c.objWhy(o), T('descartado: ', 'discarded: ') + c.objReason(o.reason))).join('')}</table>
          <p>${T('Distancia', 'Distance')} ${f(E.dist, 1)} km · ${T('tiempo', 'time')} ${f(E.t / 60, 1)} h · ${T('reserva', 'reserve')} ${f(E.reserveLeft)} min${E.forced ? ' · ' + T('hábitat fuera de requisitos (decisión del usuario)', 'habitat outside requirements (user decision)') : ''}.</p>`;
      }
      html += H('Verificaciones pendientes en campo', 'Pending field verifications') + `<ul>${checks.map(x => `<li>${x}</li>`).join('')}</ul>`;
      html += H('Limitaciones', 'Limitations') + `<ul>${lims.map(x => `<li>${x}</li>`).join('')}</ul>`;
      html += H('Trazabilidad de los datos', 'Data traceability') + `<table>${th(T('Dato', 'Dataset'), T('Resolución', 'Resolution'), T('Periodo', 'Period'), T('Tipo', 'Type'))}${c.trace.map(r => row(r.d, r.r, r.p, es ? r.t[0] : r.t[1])).join('')}</table>`;
      html += `<h2>${T('Referencias', 'References')}</h2><ol class="refs">${['foucher', 'navarro', 'valdivia', 'unep', 'terra', 'heverly', 'rems', 'hassler', 'oecd'].map(k => `<li>${c.refs[k]}</li>`).join('')}</ol>
        <div class="foot">${T('Propuesta preliminar de campaña. No garantiza movilidad, seguridad ni aptitud para instalar una base.', 'Preliminary campaign proposal. Not a guarantee of mobility, safety or suitability to install a base.')} · Marte en Moquegua · 404 Sleep Not Found · ${date}</div>`;
      return html;
    } finally { window.__lang = prev; }
  }

  function open(c) {
    const w = window.open('', '_blank'); if (!w) { alert(L('Permite las ventanas emergentes para ver el informe.', 'Allow pop-ups to see the report.')); return; }
    const html = `<!DOCTYPE html><html lang="${c.lang}"><head><meta charset="utf-8"><title>${c.lang === 'en' ? 'Report' : 'Informe'} · ${c.name}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:16mm 14mm}body{font:12.5px/1.55 'IBM Plex Sans',system-ui,sans-serif;color:#1d2433;margin:0;background:#eef1f6}
.bar{position:sticky;top:0;background:#0b1426;color:#fff;padding:10px 20px;display:flex;gap:10px;align-items:center;z-index:9}.bar b{font-family:Sora;letter-spacing:.1em;margin-right:auto}
.bar button{background:none;border:1px solid #fff6;color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit}.bar button.on{background:#B6A4F0;color:#0b1426;border-color:#B6A4F0}
.page{max-width:820px;margin:20px auto;background:#fff;padding:36px 44px;box-shadow:0 4px 24px #0002;border-radius:6px}
h1,h2{font-family:Sora,sans-serif;color:#0b1426}h1{font-size:32px;margin:6px 0 2px}h2{font-size:16px;margin:24px 0 8px;padding-bottom:4px;border-bottom:2px solid #B6A4F0}
.kick{font-size:11px;letter-spacing:.2em;color:#6b7385}.sub{color:#5b6475}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}
.meta div{border:1px solid #dde2ea;border-left:3px solid #B6A4F0;border-radius:6px;padding:8px}.meta span{display:block;font-size:10.5px;color:#6b7385}.meta b{font-size:14px}.meta small{font-weight:400;color:#6b7385}
figure{margin:10px 0}figure img{width:100%;max-height:440px;object-fit:contain;background:#0b1426;border-radius:6px;image-rendering:pixelated}figcaption{font-size:10.5px;color:#6b7385}
.team{font-size:11px;color:#6b7385}.lead{font-size:13.5px}table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11.5px}th{background:#f3f5f9;text-align:left;font-weight:600}td,th{padding:6px 8px;border-bottom:1px solid #e3e7ee;vertical-align:top}
.chart{border:1px solid #e3e7ee;border-radius:6px;padding:10px;margin:8px 0}.chart svg text{fill:#4a5262;font-size:10px}.leg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:10.5px;color:#4a5262}.leg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}
.verdict{padding:10px 12px;border-radius:6px;border:1px solid #ccd;border-left:4px solid #9FD8A8;margin:8px 0}.verdict.ko{border-left-color:#E07F7F}.verdict.warn{border-left-color:#F3C27A}
.small{font-size:11px;color:#5b6475}.refs{font-size:10.5px;padding-left:18px}.foot{margin-top:24px;padding-top:10px;border-top:1px solid #dde2ea;font-size:10.5px;color:#6b7385}
.L{display:none}.L.on{display:block}@media print{body{background:#fff}.bar{display:none}.page{box-shadow:none;margin:0;padding:0;max-width:none}h2{break-after:avoid}table,figure,.chart{break-inside:avoid}}</style></head><body>
<div class="bar"><b>MARTE EN MOQUEGUA · ${c.name.toUpperCase()}</b><button id="bEs">Español</button><button id="bEn">English</button><button id="bPdf">PDF</button></div>
<div class="page"><div class="L" id="Les">${build(c, 'es')}</div><div class="L" id="Len">${build(c, 'en')}</div></div></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
    const d = w.document, set = l => { d.getElementById('Les').classList.toggle('on', l === 'es'); d.getElementById('Len').classList.toggle('on', l === 'en'); d.getElementById('bEs').classList.toggle('on', l === 'es'); d.getElementById('bEn').classList.toggle('on', l === 'en'); d.documentElement.lang = l; d.getElementById('bPdf').textContent = l === 'es' ? 'Descargar PDF' : 'Download PDF'; };
    d.getElementById('bEs').onclick = () => set('es'); d.getElementById('bEn').onclick = () => set('en'); d.getElementById('bPdf').onclick = () => w.print(); set(c.lang);
  }
  function dl(name, text, type) { const b = new Blob([text], { type }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  const slug = c => c.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  function csv(c) {
    const G = c.G, R = 6371.0088, dl_ = G.dx * Math.PI / 180;
    const head = ['cell_id', 'lat', 'lon', 'area_km2', 'env_similarity_0_100', 'n_indicators', 'meets_requirements', 'aridity_index', 'thermal_swing_C', 'slope_deg', 'fe_oxides_pct', 'sulfates_clays_pct', 'ndvi', 'elevation_m', 'road_km', 'viirs', 'rain_terraclimate_mm', 'rain_gpm_mm', 'protected_area'];
    const v = x => x == null || (typeof x === 'number' && isNaN(x)) ? '' : x;
    const lines = [head.join(',')].concat(c.t.cells.map((i, k) => { const p = c.cellsLL[k], r = Math.floor(i / G.w), a = (G.north + r * G.dy) * Math.PI / 180, b = (G.north + (r + 1) * G.dy) * Math.PI / 180;
      const n = [G.dT[i], G.ai[i], G.fe[i]].filter(x => x != null).length;
      return [i, p.lat.toFixed(5), p.lon.toFixed(5), (R * R * dl_ * Math.abs(Math.sin(a) - Math.sin(b))).toFixed(3), isNaN(c.allSim[i]) ? '' : c.allSim[i].toFixed(1), n, c.passes(i) ? 'yes' : 'no', v(G.ai[i]), v(G.dT[i]), v(G.slope[i]), v(G.fe[i]), v(G.cs[i]), v(G.ndvi[i]), v(G.elev[i]), v(G.road[i]), v(G.ntl[i]), v(G.pr_tc[i]), v(G.pr_gpm[i]), G.anp[i]].join(','); }));
    dl(`marte_moquegua_${slug(c)}.csv`, lines.join('\n'), 'text/csv');
  }
  function geojson(c) {
    const G = c.G, feats = [];
    feats.push({ type: 'Feature', properties: { name: c.name, env_similarity: +fmt(c.s.sim, 1), sensitivity_range: c.range ? [c.range[0], c.range[2]] : null, suitability_pct: +fmt(c.s.apt, 1), aridity_index: +fmt(c.s.ai, 4), area_km2: +fmt(c.s.area, 1), cells: c.t.cells.length, source: 'Marte en Moquegua · 404 Sleep Not Found' },
      geometry: { type: 'MultiPolygon', coordinates: c.t.cells.map(i => { const r = Math.floor(i / G.w), k = i % G.w, x0 = G.west + k * G.dx, y0 = G.north + r * G.dy, x1 = x0 + G.dx, y1 = y0 + G.dy; return [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]; }) } });
    if (c.rover) { const r = c.rover.active; feats.push({ type: 'Feature', properties: { type: 'rover_route_active', computed: c.rover.time, limit_deg: r.limit, length_km: +fmt(r.length, 3), pct_length_under_limit: +fmt(r.ok, 1), pct_not_evaluated: +fmt(r.nod, 1), max_slope_deg: +fmt(r.max, 1), slope_source: c.rover.plan.src, verdict: c.verdictRover(r).key }, geometry: { type: 'LineString', coordinates: r.pts.map(p => [+p.lon.toFixed(6), +p.lat.toFixed(6)]) } }); }
    if (c.eva) { const e = c.eva.p; feats.push({ type: 'Feature', properties: { type: 'habitat', forced: !!e.forced, computed: c.eva.time }, geometry: { type: 'Point', coordinates: [e.hab.lon, e.hab.lat] } });
      e.plan.concat(e.out).forEach(o => feats.push({ type: 'Feature', properties: { type: 'eva_objective', objective: o.k, status: e.plan.includes(o) ? 'included' : 'discarded', reason: o.reason ? o.reason.k : null }, geometry: { type: 'Point', coordinates: [o.p.lon, o.p.lat] } })); }
    dl(`marte_moquegua_${slug(c)}.geojson`, JSON.stringify({ type: 'FeatureCollection', features: feats }), 'application/geo+json');
  }
  return { open, csv, geojson };
})();
