/* Marte en Moquegua · 404 Sleep Not Found · NASA Space Apps 2026
   Two indices: (1) Mars environmental similarity (thermal, aridity, minerals) and
   (2) suitability for the user's mission (requirements of the selected mode). */
'use strict';
const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNlRzRUWFFSaXVhaHRieHoiLCJqdGkiOiJlM2UzMDBiOS00ZmE5LTRkMWQtOTJkNS0xMTIxYTZmNDZiMGIiLCJpZCI6NTQ5NjQzLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3OTQ2OTg2OTl9.HcyqqxGBV3Y7hDzdSUXrOr6mWajfZ3OsHL9nd2RImo0';
const $ = s => document.querySelector(s);
const clip = x => x < 0 ? 0 : x > 1 ? 1 : x;
const mean = a => { const b = a.filter(v => v != null && !isNaN(v)); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; };
const hav = (a, b, c, d) => { const R = 6371, t = Math.PI / 180, x = Math.sin((c - a) * t / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin((d - b) * t / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const nf = (v, d = 0) => v == null || isNaN(v) ? '—' : Number(v).toLocaleString(window.__lang === 'en' ? 'en-US' : 'es-PE', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- References ---------- */
const REFS = {
  foucher: 'Foucher, F. et al. (2021). Definition and use of functional analogues in planetary exploration. Planetary and Space Science, 197, 105162. doi:10.1016/j.pss.2021.105162',
  navarro: 'Navarro-González, R. et al. (2003). Mars-like soils in the Atacama Desert, Chile, and the dry limit of microbial life. Science, 302, 1018–1021. doi:10.1126/science.1089143',
  valdivia: 'Valdivia-Silva, J. E. et al. (2011). Multidisciplinary approach of the hyperarid desert of Pampas de La Joya in southern Peru as a new Mars-like soil analog. Geochimica et Cosmochimica Acta, 75(7), 1975–1991. doi:10.1016/j.gca.2011.01.017',
  unep: 'UNEP (1997). World Atlas of Desertification, 2nd ed. Aridity index AI = P/PET; hyper-arid < 0.05, arid 0.05–0.20.',
  terra: 'Abatzoglou, J. T. et al. (2018). TerraClimate, a high-resolution global dataset of monthly climate and climatic water balance. Scientific Data, 5, 170191. doi:10.1038/sdata.2017.191',
  heverly: 'Heverly, M. et al. (2013). Traverse performance characterization for the Mars Science Laboratory rover. Journal of Field Robotics, 30(6). doi:10.1002/rob.21481',
  rems: 'Gómez-Elvira, J. et al. (2017). Gale atmospheric evolution along the first two years on Mars using REMS-MSL data. 6th Int. Workshop on the Mars Atmosphere, Granada.',
  hassler: 'Hassler, D. M. et al. (2014). Mars’ surface radiation environment measured by the Mars Science Laboratory’s Curiosity rover. Science, 343(6169). doi:10.1126/science.1244797',
  oecd: 'OECD/JRC (2008). Handbook on Constructing Composite Indicators: Methodology and User Guide.'
};
const GLOSS = {
  ai: ['Índice de aridez del PNUMA: lluvia anual ÷ evaporación potencial. Menos de 0.05 es hiperárido; menos de 0.20, árido.', 'UNEP aridity index: annual rainfall ÷ potential evaporation. Below 0.05 is hyper-arid; below 0.20, arid.'],
  emit: ['NASA EMIT: espectrómetro en la Estación Espacial que identifica minerales desde el espacio (60 m). Es un indicio, no una muestra.', 'NASA EMIT: space-station spectrometer that identifies minerals from orbit (60 m). An indication, not a sample.'],
  modis: ['NASA MODIS: satélite que mide la temperatura de la superficie de día y de noche (1 km).', 'NASA MODIS: satellite measuring land surface temperature by day and night (1 km).'],
  ndvi: ['NDVI: índice de vegetación. Por encima de 0.15 hay plantas y la celda se excluye.', 'NDVI: vegetation index. Above 0.15 there are plants and the cell is excluded.'],
  viirs: ['NASA VIIRS: luces nocturnas. Más de 2 indica ciudad; 0.5 o menos, cielo oscuro.', 'NASA VIIRS: night lights. Above 2 means a town; 0.5 or less, dark sky.'],
  sim: ['Similitud ambiental: qué tanto se parece el clima y el suelo a Marte (térmica, aridez y minerales). Es un índice de cribado, no un porcentaje de parecido. El rango muestra cuánto cambia al variar el método.', 'Environmental similarity: how close climate and soil are to Mars (thermal, aridity, minerals). A screening index, not a percentage of likeness. The range shows how it changes when the method varies.'],
  apt: ['Aptitud para tu misión: % del área que cumple los requisitos que elegiste (pendiente, acceso, áreas protegidas, cielo oscuro, datos).', 'Suitability for your mission: % of the area meeting your chosen requirements (slope, access, protected areas, dark sky, data).'],
  conf: ['Confianza: cuántos de 4 criterios de calidad de datos se cumplen (cobertura EMIT, clase de aridez robusta, datos completos, tamaño de muestra).', 'Confidence: how many of 4 data-quality criteria are met (EMIT coverage, robust aridity class, complete data, sample size).']
};
const gl = k => `<button type="button" class="gl" aria-label="${esc(L(GLOSS[k][0], GLOSS[k][1]))}" data-tip="${esc(L(GLOSS[k][0], GLOSS[k][1]))}">i</button>`;

/* ---------- Indicators and modes ---------- */
const IND = {
  T: { es: 'Oscilación térmica', en: 'Thermal swing', ses: 'Térmica', sen: 'Thermal', color: PAL.temp, icon: 'therm' },
  A: { es: 'Aridez (PNUMA)', en: 'Aridity (UNEP)', ses: 'Aridez', sen: 'Aridity', color: PAL.arid, icon: 'drop' },
  M: { es: 'Minerales (EMIT)', en: 'Minerals (EMIT)', ses: 'Minerales', sen: 'Minerals', color: PAL.iron, icon: 'gem' }
};
const iname = (k, short) => short ? L(IND[k].ses, IND[k].sen) : L(IND[k].es, IND[k].en);
const MODES = {
  probar: { es: 'Probar', en: 'Test', needEs: 'Necesito probar mi rover', needEn: 'I need to test my rover', whoEs: 'Equipos de robótica espacial', whoEn: 'Space robotics teams', icon: 'bot', color: PAL.probar,
    f: { slope: 17, road: 15, anp: true, dark: false, emit: false }, primary: 'rover' },
  entrenar: { es: 'Entrenar', en: 'Train', needEs: 'Necesito entrenar a mi tripulación', needEn: 'I need to train my crew', whoEs: 'Misiones análogas', whoEn: 'Analog missions', icon: 'users', color: PAL.entrenar,
    f: { slope: 15, road: 30, anp: true, dark: true, emit: false }, primary: 'eva' },
  estudiar: { es: 'Estudiar', en: 'Study', needEs: 'Necesito estudiar un suelo parecido a Marte', needEn: 'I need to study Mars-like soil', whoEs: 'Investigadores científicos', whoEn: 'Planetary scientists', icon: 'flask', color: PAL.estudiar,
    f: { slope: 22, road: 40, anp: true, dark: false, emit: true }, primary: 'sample' }
};
const mname = k => L(MODES[k].es, MODES[k].en);
const S = { lang: 'es', mode: 'entrenar', sort: 'sim', layer: 'sim', ftab: 'res', ltab: 'zones', f: {}, G: null, M: null, sim: null, ind: null, zoneOf: null, zstats: {}, sel: null, overlay: null,
  ents: [], simEnts: [], tourOn: false, accOpen: {}, last: {}, simOn: false, simRequest: 0 };
let viewer, RECT, overlayCanvas, AN, AREA;
try { S.lang = (new URLSearchParams(location.search).get('lang') || localStorage.getItem('mm_lang') || 'es') === 'en' ? 'en' : 'es'; } catch (e) { }
window.__lang = S.lang;

/* ---------- Scoring ---------- */
function norm(dT, ai, fe, cs) {
  return {
    T: dT == null ? null : clip(dT / AN.T_mars),                                   // fraction of the Gale ground swing (REMS)
    A: ai == null ? null : clip((AN.ai_zero - ai) / (AN.ai_zero - AN.ai_one)),      // 0 at UNEP arid limit, 1 at Yungay (anchor)
    M: fe == null ? null : clip((fe + cs) / 200)                                    // mean of two EMIT detection fractions
  };
}
const slopeScore = s => s == null ? null : clip(1 - Math.max(0, s - AN.slope_ok) / (AN.slope_max - AN.slope_ok));
function combine(o) { let a = 0, b = 0; for (const k of ['T', 'A', 'M']) if (o[k] != null) { a += o[k]; b++; } return b ? 100 * a / b : null; }
const nInd = o => ['T', 'A', 'M'].filter(k => o && o[k] != null).length;
function aiClass(ai) { return ai == null ? L('sin dato', 'no data') : ai < .05 ? L('Hiperárido', 'Hyper-arid') : ai < .2 ? L('Árido', 'Arid') : ai < .5 ? L('Semiárido', 'Semi-arid') : ai < .65 ? L('Subhúmedo seco', 'Dry sub-humid') : L('Húmedo', 'Humid'); }
function cellLL(i) { const G = S.G, r = Math.floor(i / G.w), c = i % G.w; return { lon: G.west + (c + .5) * G.dx, lat: G.north + (r + .5) * G.dy }; }
function llCell(lat, lon) { const G = S.G, c = Math.floor((lon - G.west) / G.dx), r = Math.floor((lat - G.north) / G.dy); return (c < 0 || r < 0 || c >= G.w || r >= G.h) ? -1 : r * G.w + c; }
function buildArea() { // geodesic area of each grid cell (km²)
  const G = S.G, R = 6371.0088, dl = G.dx * Math.PI / 180; AREA = new Float32Array(G.h);
  for (let r = 0; r < G.h; r++) { const a = (G.north + r * G.dy) * Math.PI / 180, b = (G.north + (r + 1) * G.dy) * Math.PI / 180; AREA[r] = R * R * dl * Math.abs(Math.sin(a) - Math.sin(b)); }
}
const cellArea = i => AREA[Math.floor(i / S.G.w)];
const areaOf = cells => cells.reduce((s, i) => s + cellArea(i), 0);
function computeScores() {
  const G = S.G, N = G.w * G.h; S.sim = new Float32Array(N).fill(NaN); S.ind = new Array(N);
  for (let i = 0; i < N; i++) if (G.status[i] === 1) { const o = norm(G.dT[i], G.ai[i], G.fe[i], G.cs[i]); S.ind[i] = o; S.sim[i] = combine(o); }
  S.zstats = {}; S.M.zones.forEach(z => S.zstats[z.id] = statsOf(z.cells));
}
const BASE = () => [L('Océano', 'Ocean'), '', L('vegetación (NDVI > 0.15)', 'vegetation (NDVI > 0.15)'), L('zona urbana (VIIRS > 2)', 'urban area (VIIRS > 2)'), L('no es árido (AI ≥ 0.20, PNUMA)', 'not arid (AI ≥ 0.20, UNEP)')];
function fails(i) { // list of {k, es/en text}
  const G = S.G, f = S.f, out = [];
  if (G.status[i] !== 1) { out.push({ k: 'base', t: BASE()[G.status[i]] || L('fuera del área', 'outside area') }); return out; }
  if (G.slope[i] > f.slope) out.push({ k: 'slope', t: L(`pendiente ${nf(G.slope[i], 1)}° > ${f.slope}°`, `slope ${nf(G.slope[i], 1)}° > ${f.slope}°`) });
  if ((G.road[i] ?? 99) > f.road) out.push({ k: 'road', t: L(`carretera a ${nf(G.road[i], 1)} km > ${f.road} km`, `road at ${nf(G.road[i], 1)} km > ${f.road} km`) });
  if (f.anp && G.anp[i]) out.push({ k: 'anp', t: L('área natural protegida', 'protected area') });
  if (f.dark && (G.ntl[i] ?? 0) > .5) out.push({ k: 'dark', t: L(`luz nocturna ${nf(G.ntl[i], 2)} > 0.5`, `night light ${nf(G.ntl[i], 2)} > 0.5`) });
  if (f.emit && G.fe[i] == null) out.push({ k: 'emit', t: L('sin dato de minerales EMIT', 'no EMIT mineral data') });
  return out;
}
const passes = i => fails(i).length === 0;
const REQN = () => 2 + (S.f.anp ? 1 : 0) + (S.f.dark ? 1 : 0) + (S.f.emit ? 1 : 0);
function aptCell(i) { if (S.G.status[i] !== 1) return 0; const n = REQN(); return 1 - fails(i).length / n; }
const FAILNAME = () => ({ base: L('excluida por clima o uso', 'excluded by climate or land use'), slope: L('pendiente', 'slope'), road: L('acceso por carretera', 'road access'), anp: L('área protegida', 'protected area'), dark: L('luz nocturna', 'night light'), emit: L('sin dato EMIT', 'no EMIT data') });
function statsOf(cells) {
  const G = S.G, s = { n: cells.length, cells };
  s.area = areaOf(cells);
  s.sim = mean(cells.map(i => S.sim[i]));
  const ok = cells.filter(passes); s.apt = 100 * areaOf(ok) / Math.max(1e-9, s.area);
  s.ind = {}; ['T', 'A', 'M'].forEach(k => s.ind[k] = mean(cells.map(i => S.ind[i] ? S.ind[i][k] : null)));
  s.P = mean(cells.map(i => slopeScore(G.slope[i])));
  ['dT', 'slope', 'fe', 'cs', 'elev', 'ntl', 'road', 'ndvi', 'ai', 'pr_tc', 'pr_gpm', 'pet'].forEach(k => s[k] = mean(cells.map(i => G[k][i])));
  s.emitCov = 100 * cells.filter(i => G.fe[i] != null).length / Math.max(1, cells.length);
  s.nInd = nInd(s.ind);
  let la = 0, lo = 0; cells.forEach(i => { const c = cellLL(i); la += c.lat; lo += c.lon; }); s.lat = la / cells.length; s.lon = lo / cells.length;
  s.anp = cells.some(i => G.anp[i]); s.cls = aiClass(s.ai);
  const fc = {}; cells.forEach(i => fails(i).forEach(x => fc[x.k] = (fc[x.k] || 0) + cellArea(i))); s.failSummary = fc;
  let below = 0, tot = 0; for (let i = 0; i < S.sim.length; i++) if (!isNaN(S.sim[i])) { tot++; if (S.sim[i] < s.sim) below++; }
  s.pct = 100 * below / tot; return s;
}
const analogNorm = a => a.vals ? norm(a.vals.dT, a.vals.ai, a.vals.fe, a.vals.cs) : null;
const analogScore = a => a.vals ? combine(analogNorm(a)) : null;
const zoneById = id => S.M.zones.find(z => z.id === id);
const yungay = () => S.M.analogs.find(a => a.id === 'atacama');
const utah = () => S.M.analogs.find(a => a.id === 'utah');
const range = id => (S.M.robust && S.M.robust.range[id]) || null;
const rangeTxt = id => { const r = range(id); return r ? `${nf(r[0])}–${nf(r[2])}` : ''; };
function nearestTown(lat, lon) { let b = null; S.M.towns.forEach(([n, a, o]) => { const d = hav(lat, lon, a, o); if (!b || d < b.d) b = { n, d }; }); return { ...b, txt: L(`${b.n} · ${nf(b.d)} km en línea recta`, `${b.n} · ${nf(b.d)} km straight-line`) }; }


/* ---------- Cesium ---------- */
function initViewer() {
  Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;
  const base = Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(2));
  viewer = new Cesium.Viewer('globe', { baseLayer: base, terrain: Cesium.Terrain.fromWorldTerrain(), animation: false, timeline: false, baseLayerPicker: false, geocoder: false,
    homeButton: false, sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false, infoBox: false, selectionIndicator: false, shouldAnimate: true,
    contextOptions: { webgl: { preserveDrawingBuffer: true } } });
  base.errorEvent.addEventListener(addGibsFallback);
  const sc = viewer.scene; sc.skyAtmosphere.show = true; sc.globe.showGroundAtmosphere = true; sc.fog.enabled = true; sc.fog.density = 2.2e-4;
  sc.globe.enableLighting = false; sc.highDynamicRange = false; sc.postProcessStages.fxaa.enabled = true;
  viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(-60, -10, 2.2e7) });
  const G = S.G; RECT = Cesium.Rectangle.fromDegrees(G.west, G.north + G.h * G.dy, G.west + G.w * G.dx, G.north);
}
function addGibsFallback() {
  if (S.gibs) return; S.gibs = true;
  viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({ url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg', maximumLevel: 8, credit: 'NASA GIBS' }), 0);
}
let spinOn = true;
function spin() { if (spinOn) viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.0009); requestAnimationFrame(spin); }
const APT_RGB = t => [Math.round(60 + 115 * t), Math.round(70 + 150 * t), Math.round(90 + 60 * t)]; // grey-blue → pastel green
function drawOverlay() {
  const G = S.G, Wd = G.w, H = G.h, base = document.createElement('canvas'); base.width = Wd; base.height = H;
  const ctx = base.getContext('2d'), img = ctx.createImageData(Wd, H), d = img.data;
  for (let i = 0; i < Wd * H; i++) {
    const st = G.status[i]; let r = 0, g = 0, b = 0, a = 0;
    if (st === 1) {
      if (S.layer === 'apt') { const t = aptCell(i); [r, g, b] = t >= 1 ? [159, 216, 168] : APT_RGB(t * .6); a = t >= 1 ? 225 : 150; }
      else { const [R, Gc, B] = plasma(S.sim[i] / 100); r = R; g = Gc; b = B; a = 225; }
    } else if (st === 2) { r = 60; g = 120; b = 80; a = 100; } else if (st === 3) { r = 200; g = 200; b = 210; a = 110; } else if (st === 4) { r = 70; g = 110; b = 170; a = 95; }
    d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0); overlayCanvas = base;
  const big = document.createElement('canvas'); big.width = Wd * 4; big.height = H * 4; const bc = big.getContext('2d'); bc.imageSmoothingEnabled = false; bc.drawImage(base, 0, 0, Wd * 4, H * 4);
  Cesium.SingleTileImageryProvider.fromUrl(big.toDataURL('image/png'), { rectangle: RECT }).then(p => {
    const old = S.overlay; S.overlay = viewer.imageryLayers.addImageryProvider(p); S.overlay.alpha = .8; S.overlay.show = !S.simOn;
    if (old) viewer.imageryLayers.remove(old, true);
  });
  drawMini(); renderLegend();
}
function addMarkers() {
  viewer.entities.values.filter(e => e._mm).forEach(e => viewer.entities.remove(e));
  const lbl = t => ({ text: t, font: '600 15px Sora, sans-serif', fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -18), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('rgba(8,14,28,.6)'), backgroundPadding: new Cesium.Cartesian2(8, 5) });
  const add = o => { const e = viewer.entities.add(o); e._mm = true; return e; };
  S.M.zones.forEach(z => add({ position: Cesium.Cartesian3.fromDegrees(z.lon, z.lat),
    point: { pixelSize: 12, color: Cesium.Color.WHITE, outlineColor: Cesium.Color.fromCssColorString(z.new ? PAL.estudiar : '#ffffff'), outlineWidth: 3, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, disableDepthTestDistance: 5e5 },
    label: { ...lbl(z.name + (z.new ? L('  · NUEVA', '  · NEW') : '')), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 900000), disableDepthTestDistance: 5e5 } }));
  S.M.analogs.forEach(a => add({ position: Cesium.Cartesian3.fromDegrees(a.lon, a.lat),
    point: { pixelSize: 11, color: Cesium.Color.fromCssColorString(PAL.mars), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 }, label: { ...lbl(a.name), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2.6e7) } }));
  add({ position: Cesium.Cartesian3.fromDegrees(-71.2, -17.1), label: { ...lbl(L('Moquegua · sur del Perú', 'Moquegua · southern Peru')), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1.2e6, 2.6e7) },
    point: { pixelSize: 13, color: Cesium.Color.fromCssColorString(PAL.entrenar), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 } });
}
function fly(lon, lat, h = 60000, pitch = -50, heading = 0, dur = 2.5) {
  return new Promise(res => viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon, lat - (h / 111000) * .9 * Math.cos(-pitch * Math.PI / 180), h), orientation: { heading: Cesium.Math.toRadians(heading), pitch: Cesium.Math.toRadians(pitch) }, duration: dur, complete: res, cancel: res }));
}
const flyAOI = () => fly(-71.25, -17.05, 230000, -55, 0, 3.2);

/* ---------- Top bar, modes, language ---------- */
function renderTop() {
  if (viewer) MapCamera.controls();
  $('#modes').innerHTML = Object.entries(MODES).map(([k, m]) => `<button type="button" class="mode ${k === S.mode ? 'on' : ''}" data-m="${k}" style="--mc:${m.color}" aria-pressed="${k === S.mode}">${ic(m.icon, 18)}<span>${mname(k)}<small>${L(m.whoEs, m.whoEn)}</small></span></button>`).join('');
  $('#modes').querySelectorAll('.mode').forEach(b => b.onclick = () => setMode(b.dataset.m));
  $('#btnHome').innerHTML = ic('home', 15) + `<span>${L('Inicio', 'Home')}</span>`; $('#btnHome').setAttribute('aria-label', L('Volver a la página principal', 'Back to home page'));
  $('#btnMethod').innerHTML = ic('book', 15) + `<span>${L('Método', 'Method')}</span>`;
  $('#btnTour').innerHTML = ic('play', 14) + `<span>Tour</span>`;
  $('#btnClean').innerHTML = ic('eye', 14) + `<span>${L('Paneles', 'Panels')}</span>`; $('#btnClean').title = L('Ocultar o mostrar paneles (tecla H)', 'Hide or show panels (H key)');
  $('#langctl').querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.l === S.lang); b.setAttribute('aria-pressed', b.dataset.l === S.lang); });
  $('#fzDown').setAttribute('aria-label', L('Texto más pequeño', 'Smaller text')); $('#fzUp').setAttribute('aria-label', L('Texto más grande', 'Larger text'));
  document.documentElement.lang = S.lang; document.title = L('Marte en Moquegua · 404 Sleep Not Found', 'Mars in Moquegua · 404 Sleep Not Found');
  $('.brand b').textContent = L('MARTE EN MOQUEGUA', 'MARS IN MOQUEGUA'); $('.brand small').textContent = L('Buscador de análogos de Marte · Datos NASA', 'Mars analog finder · NASA data');
}
function setLang(l) {
  S.lang = l === 'en' ? 'en' : 'es'; window.__lang = S.lang; try { localStorage.setItem('mm_lang', S.lang); } catch (e) { }
  computeScores(); renderTop(); renderLeft(); renderIntro(); addMarkers(); drawOverlay(); renderFobosChips(); fobosMode(); updateHUD();
  if (S.sel) openFicha(S.sel, false);
  if (!$('#sim').classList.contains('hidden') && S.simKind) (S.simKind === 'rover' ? Rover : Eva).open(true);
  if (!$('#method').classList.contains('hidden')) openMethod();
  window.dispatchEvent(new Event('langchange'));
}

/* ---------- Left panel: tabs Zones | Requirements ---------- */
function renderLeft() {
  const m = MODES[S.mode];
  $('#leftHead').innerHTML = `<div class="tabs" role="tablist">
      <button type="button" role="tab" data-t="zones" aria-selected="${S.ltab === 'zones'}" class="${S.ltab === 'zones' ? 'on' : ''}">${ic('list', 14)} ${L('Zonas', 'Zones')}</button>
      <button type="button" role="tab" data-t="req" aria-selected="${S.ltab === 'req'}" class="${S.ltab === 'req' ? 'on' : ''}">${ic('sliders', 14)} ${L('Requisitos', 'Requirements')}</button></div>`;
  $('#leftHead').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { S.ltab = b.dataset.t; renderLeft(); });
  $('#leftToggle').setAttribute('aria-label', L('Plegar panel', 'Collapse panel'));
  $('#rail').innerHTML = Object.entries(MODES).map(([k, mm]) => `<button type="button" class="icbtn" data-m="${k}" aria-label="${mname(k)}" style="color:${k === S.mode ? mm.color : ''}">${ic(mm.icon)}</button>`).join('');
  $('#rail').querySelectorAll('button').forEach(b => b.onclick = () => setMode(b.dataset.m));
  const B = $('#leftBody');
  const need = `<div class="need"><div class="who">${ic(m.icon, 14)} ${L(m.whoEs, m.whoEn)}</div><div class="q">“${L(m.needEs, m.needEn)}”</div></div>`;
  if (S.ltab === 'zones') {
    B.innerHTML = need + `<div class="row-h"><span class="ttl">${L('Ordenar por', 'Sort by')}</span>
      <div class="seg sm" role="group"><button type="button" data-s="sim" class="${S.sort === 'sim' ? 'on' : ''}" aria-pressed="${S.sort === 'sim'}">${L('Similitud', 'Similarity')}</button><button type="button" data-s="apt" class="${S.sort === 'apt' ? 'on' : ''}" aria-pressed="${S.sort === 'apt'}">${L('Aptitud', 'Suitability')}</button></div></div>
      <div id="ranking"></div>
      <details class="refs-box"><summary>${L('Análogos de referencia', 'Reference analogs')} (3)</summary><div id="analogs"></div></details>`;
    B.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { S.sort = b.dataset.s; renderLeft(); });
    renderRanking();
  } else {
    const f = S.f;
    const rng = (k, lab, icn, min, max, unit, tip) => `<div class="frow"><label for="f_${k}">${ic(icn, 14)} ${lab}${tip ? `<button type="button" class="gl" data-tip="${esc(tip)}" aria-label="${esc(tip)}">i</button>` : ''}</label><input id="f_${k}" type="range" min="${min}" max="${max}" value="${f[k]}" data-k="${k}" data-u="${unit}"><output>≤ ${f[k]} ${unit}</output></div>`;
    const tg = (k, lab, icn, tip) => `<div class="frow"><span class="lab">${ic(icn, 14)} ${lab}${tip ? `<button type="button" class="gl" data-tip="${esc(tip)}" aria-label="${esc(tip)}">i</button>` : ''}</span><button type="button" role="switch" class="tog ${f[k] ? 'on' : ''}" aria-checked="${!!f[k]}" aria-label="${esc(lab)}" data-k="${k}"></button></div>`;
    B.innerHTML = need + `<p class="hint">${L('Ajusta lo que tu misión necesita. El mapa de Aptitud y el ranking se actualizan.', 'Set what your mission needs. The Suitability map and ranking update.')}</p>` +
      rng('slope', L('Pendiente máxima', 'Maximum slope'), 'mountain', 5, 30, '°', L('Criterio de cribado inspirado en ensayos JPL para Curiosity: deslizamiento moderado a 10° y atascamiento a 17° en arena suelta; hasta 22° en roca lisa. Tu equipo puede tener otros límites.', 'Screening criterion inspired by JPL tests for Curiosity: moderate slip at 10° and embedding at 17° in loose sand; up to 22° on bedrock. Your equipment may differ.')) +
      rng('road', L('Distancia a carretera', 'Distance to road'), 'road', 2, 60, 'km', L('Preferencia logística. Distancia a la vía principal más cercana (OpenStreetMap).', 'Logistics preference. Distance to the nearest main road (OpenStreetMap).')) +
      tg('anp', L('Excluir áreas protegidas', 'Exclude protected areas'), 'shield', L('Requieren permisos especiales (WDPA/SERNANP).', 'They require special permits (WDPA/SERNANP).')) +
      tg('dark', L('Cielo oscuro (VIIRS ≤ 0.5)', 'Dark sky (VIIRS ≤ 0.5)'), 'moon', L('Umbral de preferencia del proyecto, no un estándar.', 'Project preference threshold, not a standard.')) +
      tg('emit', L('Solo celdas con minerales EMIT', 'Only cells with EMIT minerals'), 'gem', GLOSS.emit[S.lang === 'en' ? 1 : 0]) +
      `<p class="note">${L('Siempre se excluye: vegetación, ciudades y clima no árido (PNUMA).', 'Always excluded: vegetation, towns and non-arid climate (UNEP).')}</p>
       <button type="button" class="btn sm" id="fReset">${L('Restablecer valores del modo', 'Reset mode defaults')}</button>`;
    B.querySelectorAll('input[type=range]').forEach(el => el.oninput = () => { f[el.dataset.k] = +el.value; el.nextElementSibling.textContent = `≤ ${el.value} ${el.dataset.u}`; schedule(); });
    B.querySelectorAll('.tog').forEach(el => el.onclick = () => { f[el.dataset.k] = !f[el.dataset.k]; el.classList.toggle('on'); el.setAttribute('aria-checked', f[el.dataset.k]); schedule(); });
    $('#fReset').onclick = () => { S.f = { ...MODES[S.mode].f }; renderLeft(); schedule(); };
  }
}
let tmr; function schedule() { clearTimeout(tmr); tmr = setTimeout(refresh, 140); }
function refresh() { computeScores(); drawOverlay(); if (S.ltab === 'zones') renderRanking(); if (S.sel) openFicha(S.sel, false); }
const ranked = (by = S.sort) => S.M.zones.map(z => ({ z, s: S.zstats[z.id] })).sort((a, b) => by === 'apt' ? (b.s.apt - a.s.apt) || (b.s.sim - a.s.sim) : b.s.sim - a.s.sim);
function renderRanking() {
  const R = $('#ranking'); if (!R) return;
  R.innerHTML = ranked().map((r, i) => `<button type="button" class="rk" data-z="${r.z.id}"><span class="n">${i + 1}</span><span class="nm"><b>${r.z.name}${r.z.new ? `<span class="badge">${L('NUEVA', 'NEW')}</span>` : ''}</b>
     <small>${L('Similitud', 'Similarity')} <b class="mono">${nf(r.s.sim)}</b> <span class="dim">(${rangeTxt(r.z.id)})</span> · ${L('Aptitud', 'Suitability')} <b class="mono">${nf(r.s.apt)}%</b> · ${r.s.nInd}/3 ${L('datos', 'data')}</small>
     <span class="bars"><i style="width:${r.s.sim}%;background:${plasmaHex(r.s.sim / 100)}"></i></span><span class="bars apt"><i style="width:${r.s.apt}%"></i></span></span></button>`).join('');
  R.querySelectorAll('.rk').forEach(el => el.onclick = () => openZone(el.dataset.z));
  const A = $('#analogs'); if (A) {
    A.innerHTML = S.M.analogs.map(a => { const s = analogScore(a); return `<button type="button" class="rk" data-a="${a.id}"><span class="n">${ic('globe', 14)}</span><span class="nm"><b>${a.name}</b><small>${a.country}${a.vals ? ` · ${aiClass(a.vals.ai)} (AI ${nf(a.vals.ai, 3)}) · ${L('Similitud', 'Similarity')} ${nf(s)}` : ' · ' + L('no evaluado', 'not evaluated')}</small></span></button>`; }).join('');
    A.querySelectorAll('.rk').forEach(el => el.onclick = () => { const a = S.M.analogs.find(x => x.id === el.dataset.a); fly(a.lon, a.lat, 90000, -45); fobosSay(APP.compareText(a.id), L('acción · comparar', 'action · compare')); });
  }
}
function setMode(m) {
  if (!MODES[m]) return; stopSim(); S.mode = m; S.f = { ...MODES[m].f };
  document.documentElement.style.setProperty('--accent', MODES[m].color);
  renderTop(); renderLeft(); refresh(); renderFobosChips();
}


/* ---------- Map legend + layer switch + minimap ---------- */
function renderLegend() {
  const box = $('#mapbody'); if (!box) return;
  const sim = S.layer === 'sim';
  box.innerHTML = `<div class="seg sm" role="group" aria-label="${L('Capa del mapa', 'Map layer')}">
      <button type="button" data-l="sim" class="${sim ? 'on' : ''}" aria-pressed="${sim}">${L('Similitud', 'Similarity')}</button>
      <button type="button" data-l="apt" class="${!sim ? 'on' : ''}" aria-pressed="${!sim}">${L('Aptitud', 'Suitability')} · ${mname(S.mode)}</button></div>
    ${sim ? `<div class="lg-bar"></div><div class="lg-ticks"><span>0</span><span>50</span><span>100</span></div>`
      : `<div class="lg-bar apt"></div><div class="lg-ticks"><span>${L('ningún requisito', 'no requirement')}</span><span>${L('todos', 'all')}</span></div>`}
    <div class="lg-cats"><span><i style="background:#3c7850"></i>${L('Vegetación', 'Vegetation')}</span><span><i style="background:#c8c8d2"></i>${L('Urbano', 'Urban')}</span><span><i style="background:#466eaa"></i>${L('No árido', 'Not arid')}</span></div>
    <button type="button" class="linkbtn" id="miniT">${ic('map', 13)} ${L('Minimapa', 'Minimap')}</button>`;
  box.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { S.layer = b.dataset.l; drawOverlay(); });
  $('#miniT').onclick = () => { $('#minimap').classList.toggle('hidden'); drawMini(); };
  $('#mapTitle').textContent = sim ? L('Similitud ambiental con Marte', 'Environmental similarity to Mars') : L('Aptitud para tu misión', 'Suitability for your mission');
}
function drawMini() {
  const c = $('#minimap'); if (!c || c.classList.contains('hidden')) return; const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.fillStyle = '#0a1426'; x.fillRect(0, 0, c.width, c.height);
  if (overlayCanvas) x.drawImage(overlayCanvas, 0, 0);
  S.M.zones.forEach(z => { const i = llCell(z.lat, z.lon), r = Math.floor(i / S.G.w), cc = i % S.G.w; x.strokeStyle = '#fff'; x.lineWidth = 1.2; x.beginPath(); x.arc(cc, r, 4, 0, 7); x.stroke(); });
  const cam = viewer.camera.positionCartographic, lon = Cesium.Math.toDegrees(cam.longitude), lat = Cesium.Math.toDegrees(cam.latitude), cc = (lon - S.G.west) / S.G.dx, rr = (lat - S.G.north) / S.G.dy;
  if (cc > -20 && cc < S.G.w + 20 && rr > -20 && rr < S.G.h + 20) { x.strokeStyle = MODES[S.mode].color; x.lineWidth = 2; x.beginPath(); x.moveTo(cc - 6, rr); x.lineTo(cc + 6, rr); x.moveTo(cc, rr - 6); x.lineTo(cc, rr + 6); x.stroke(); }
}
function updateHUD() {
  const H = $('#hud'); if (!H || !viewer || !S.G) return; const ll = S.hoverLL, i = ll ? llCell(ll.lat, ll.lon) : -1;
  H.innerHTML = `<span><i class="dot"></i>${L('MODO', 'MODE')} <b>${mname(S.mode).toUpperCase()}</b></span><span>LAT <b>${ll ? nf(ll.lat, 3) : '—'}</b></span><span>LON <b>${ll ? nf(ll.lon, 3) : '—'}</b></span>
   <span>${L('ELEV', 'ELEV')} <b>${i >= 0 && S.G.elev[i] != null ? nf(S.G.elev[i]) + ' m' : '—'}</b></span><span>${L('SIMILITUD', 'SIMILARITY')} <b>${i >= 0 && !isNaN(S.sim[i]) ? nf(S.sim[i]) : '—'}</b></span>
   <button type="button" class="icbtn" id="hudX" aria-label="${L('Ocultar barra', 'Hide bar')}">${ic('x', 12)}</button>`;
  $('#hudX').onclick = () => H.classList.add('hidden');
}

/* ---------- Hover (one tooltip) and click ---------- */
function pickLL(pos) {
  const ray = viewer.camera.getPickRay(pos); if (!ray) return null;
  const c = viewer.scene.globe.pick(ray, viewer.scene) || viewer.camera.pickEllipsoid(pos); if (!c) return null;
  const g = Cesium.Cartographic.fromCartesian(c); return { lon: Cesium.Math.toDegrees(g.longitude), lat: Cesium.Math.toDegrees(g.latitude) };
}
function initPointer() {
  const h = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas); let pend = null;
  h.setInputAction(e => { pend = e.endPosition; }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  const loop = () => { if (pend) { hover(pend); pend = null; } requestAnimationFrame(loop); }; loop();
  h.setInputAction(e => {
    const ll = pickLL(e.position); if (!ll) return; const i = llCell(ll.lat, ll.lon);
    if (i < 0 || S.G.status[i] === 0) return;
    stopSim(); const z = S.zoneOf[i]; if (z >= 0) openZone(S.M.zones[z].id); else openFicha({ kind: 'cell', id: 'c' + i, cells: [i], lat: ll.lat, lon: ll.lon });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  viewer.scene.canvas.addEventListener('mouseleave', () => $('#tip').classList.add('hidden'));
}
function cellLines(i) {
  const G = S.G;
  if (G.status[i] !== 1) return `<div class="hd">${ic('alert', 13)} ${L('Excluida', 'Excluded')}: ${BASE()[G.status[i]]}</div><div class="t"><span>AI</span><span>${nf(G.ai[i], 3)} · ${aiClass(G.ai[i])}</span></div>`;
  const fl = fails(i);
  return `<div class="hd"><span class="sw" style="background:${plasmaHex(S.sim[i] / 100)}"></span>${L('Similitud', 'Similarity')} ${nf(S.sim[i])} <small class="dim">· ${nInd(S.ind[i])}/3 ${L('datos', 'data')}</small></div>
    <div class="t"><span style="color:${PAL.temp}">${iname('T', 1)}</span><span>${nf(G.dT[i], 1)} °C</span></div>
    <div class="t"><span style="color:${PAL.arid}">${iname('A', 1)}</span><span>AI ${nf(G.ai[i], 3)}</span></div>
    <div class="t"><span style="color:${PAL.iron}">${iname('M', 1)}</span><span>${G.fe[i] == null ? L('sin EMIT', 'no EMIT') : nf(G.fe[i]) + ' / ' + nf(G.cs[i]) + ' %'}</span></div>
    <div class="t"><span style="color:${PAL.terr}">${L('Pendiente', 'Slope')}</span><span>${nf(G.slope[i], 1)}°</span></div>
    <div class="t sep"><span class="${fl.length ? 'ko' : 'ok'}">${fl.length ? L('No cumple', 'Does not meet') : L('Cumple tus requisitos', 'Meets your requirements')}</span><span>${fl.length ? fl[0].t : ''}</span></div>`;
}
function hover(pos) {
  const tip = $('#tip'), ll = pickLL(pos); S.hoverLL = ll;
  if (!ll || S.simOn || document.body.classList.contains('clean')) { tip.classList.add('hidden'); return; }
  const i = llCell(ll.lat, ll.lon); updateHUD();
  if (i < 0 || S.G.status[i] === 0) { tip.classList.add('hidden'); return; }
  const zi = S.zoneOf[i];
  if (zi >= 0) {
    const z = S.M.zones[zi], s = S.zstats[z.id];
    tip.className = 'tip glass zone';
    tip.innerHTML = `<small class="dim">${z.region}</small><div class="row"><b>${z.name}</b>${z.new ? `<span class="badge">${L('NUEVA', 'NEW')}</span>` : ''}</div><img src="${z.img}" alt="">
      <div class="row"><span><span class="big" style="color:${plasmaHex(Math.max(.45, s.sim / 100))}">${nf(s.sim)}</span> <small class="dim">${L('similitud', 'similarity')}</small></span><span><span class="big apt">${nf(s.apt)}%</span> <small class="dim">${L('aptitud', 'suitability')}</small></span></div>
      <div class="cellmini">${L('Aquí', 'Here')}: ${nf(S.sim[i])} · ${nf(S.G.slope[i], 1)}° · AI ${nf(S.G.ai[i], 3)}</div><small class="dim">${L('Clic para abrir la ficha', 'Click to open the data sheet')}</small>`;
  } else { tip.className = 'tip glass'; tip.innerHTML = cellLines(i); }
  const w = tip.offsetWidth || 260, h = tip.offsetHeight || 180;
  tip.style.left = Math.min(pos.x + 16, innerWidth - w - 8) + 'px'; tip.style.top = Math.min(pos.y + 16, innerHeight - h - 8) + 'px'; tip.classList.remove('hidden');
}

/* ---------- Why / confidence / traceability ---------- */
const TRACE = [
  { d: 'MODIS MOD11A2', r: '1 km', p: '2023', t: ['observado', 'observed'], u: ['Oscilación térmica día − noche', 'Day − night thermal swing'] },
  { d: 'MODIS MOD13A2 (NDVI)', r: '1 km', p: '2023', t: ['observado', 'observed'], u: ['Filtro de vegetación', 'Vegetation filter'] },
  { d: 'SRTM GL1', r: '30 m → 1 km', p: '2000', t: ['observado, agregado', 'observed, aggregated'], u: ['Pendiente media por celda', 'Mean slope per cell'] },
  { d: 'Cesium World Terrain', r: '~30 m', p: '—', t: ['observado', 'observed'], u: ['Pendiente de la ruta del rover', 'Rover route slope'] },
  { d: 'NASA EMIT L2B MIN V002', r: '60 m → 1 km', p: L('escenas disponibles', 'available scenes'), t: ['observado, agregado', 'observed, aggregated'], u: ['% de píxeles con detección mineral', '% of pixels with mineral detection'] },
  { d: 'TerraClimate (P, ET₀)', r: '~4.6 km → 1 km', p: '1991–2020', t: ['modelado, interpolado', 'modelled, interpolated'], u: ['Índice de aridez PNUMA = P / ET₀', 'UNEP aridity index = P / ET₀'] },
  { d: 'NASA GPM IMERG V07', r: '~11 km → 1 km', p: '2001–2020', t: ['observado, interpolado', 'observed, interpolated'], u: ['Comparación de lluvia', 'Rainfall comparison'] },
  { d: 'NASA VIIRS VNP46A2', r: '500 m → 1 km', p: '—', t: ['observado, agregado', 'observed, aggregated'], u: ['Filtro urbano y cielo oscuro', 'Urban and dark-sky filter'] },
  { d: 'NASA POWER (CERES)', r: '1°', p: '2001–2025', t: ['modelado', 'modelled'], u: ['Radiación solar regional', 'Regional solar radiation'] },
  { d: 'OpenStreetMap · WDPA', r: L('vectorial', 'vector'), p: '2026', t: ['observado', 'observed'], u: ['Carreteras y áreas protegidas', 'Roads and protected areas'] }
];
function whyData(t, s) {
  const G = S.G, cells = t.cells, Y = yungay(), out = { reasons: [] };
  const R = {
    A: s.ai == null ? null : [`${s.cls} (AI ${nf(s.ai, 3)}); ${L('el límite hiperárido es 0.05 y Yungay tiene', 'the hyper-arid limit is 0.05 and Yungay has')} ${nf(Y.vals.ai, 4)}.`],
    T: s.dT == null ? null : [L(`El suelo oscila ${nf(s.dT, 1)} °C entre día y noche: ${nf(100 * s.dT / AN.T_mars)}% de la referencia de Gale.`, `Ground swings ${nf(s.dT, 1)} °C between day and night: ${nf(100 * s.dT / AN.T_mars)}% of the Gale reference.`)],
    M: s.fe == null ? null : [L(`EMIT indica óxidos de hierro en ${nf(s.fe)}% y sulfatos o arcillas en ${nf(s.cs)}% de los píxeles.`, `EMIT indicates iron oxides in ${nf(s.fe)}% and sulfates or clays in ${nf(s.cs)}% of pixels.`)]
  };
  const order = ['T', 'A', 'M'].filter(k => R[k] && s.ind[k] != null).sort((a, b) => s.ind[b] - s.ind[a]);
  out.reasons = order.slice(0, 2).map(k => ({ k, t: R[k][0] }));
  const wk = order[order.length - 1];
  if (wk) out.weak = { k: wk, t: wk === 'T' ? L(`Ningún lugar de la Tierra llega a la oscilación de Gale; aquí es ${nf(100 * s.dT / AN.T_mars)}%.`, `No place on Earth reaches the Gale swing; here it is ${nf(100 * s.dT / AN.T_mars)}%.`) : R[wk][0] };
  if (s.nInd < 3) out.missing = L('Sin datos de minerales EMIT: la nota usa 2 de 3 indicadores.', 'No EMIT mineral data: the score uses 2 of 3 indicators.');
  const margin = s.ai == null ? 0 : 100 * Math.min(...[0.05, 0.2, 0.5].map(b => Math.abs(s.ai - b) / b));
  const complete = 100 * cells.filter(i => G.dT[i] != null && G.ai[i] != null).length / Math.max(1, cells.length);
  out.checks = [
    { ok: s.emitCov >= 80, t: L(`Cobertura EMIT ${nf(s.emitCov)}% (≥ 80%)`, `EMIT coverage ${nf(s.emitCov)}% (≥ 80%)`) },
    { ok: margin >= 20, t: L(`Clase de aridez robusta: a ${nf(margin)}% del límite más cercano (≥ 20%)`, `Robust aridity class: ${nf(margin)}% from the nearest limit (≥ 20%)`) },
    { ok: complete >= 95, t: L(`Datos básicos completos en ${nf(complete)}% de celdas (≥ 95%)`, `Core data complete in ${nf(complete)}% of cells (≥ 95%)`) },
    { ok: cells.length >= 9, t: L(`Muestra de ${cells.length} celdas (≥ 9)`, `Sample of ${cells.length} cells (≥ 9)`) }
  ];
  const n = out.checks.filter(c => c.ok).length; out.n = n;
  out.level = n === 4 ? L('alta', 'high') : n === 3 ? L('media', 'medium') : L('baja', 'low'); out.levelKey = n === 4 ? 'hi' : n === 3 ? 'mid' : 'lo';
  return out;
}
const ACC_OPEN = {};
function accordionize(root, openFirst = 2) {
  let k = 0;
  root.querySelectorAll(':scope > .card').forEach(c => {
    const h = c.querySelector(':scope > h5'); if (!h) return; const key = c.dataset.key || h.firstChild.textContent.trim();
    c.classList.add('acc'); h.setAttribute('role', 'button'); h.tabIndex = 0;
    const open = S.accOpen[key] ?? ACC_OPEN[key] ?? (k++ < openFirst);
    if (!open) c.classList.add('closed'); h.setAttribute('aria-expanded', open);
    const tog = () => { c.classList.toggle('closed'); const o = !c.classList.contains('closed'); S.accOpen[key] = o; h.setAttribute('aria-expanded', o); };
    h.onclick = tog; h.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } };
  });
}


/* ---------- Data sheet with tabs: Summary | Analysis | Mars | Data ---------- */
function openZone(id) {
  const z = zoneById(id); if (!z) return L('No encontré esa zona.', 'Zone not found.');
  stopSim();
  S.ftab = 'res'; openFicha({ kind: 'zone', id: z.id, z, cells: z.cells, lat: z.lat, lon: z.lon });
  const s = S.zstats[z.id];
  return L(`${z.name}: similitud ambiental ${nf(s.sim)} (rango ${rangeTxt(z.id)}), ${s.cls}; aptitud para ${mname(S.mode)} ${nf(s.apt)}% del área. ${nf(s.area)} km².`,
    `${z.name}: environmental similarity ${nf(s.sim)} (range ${rangeTxt(z.id)}), ${s.cls}; suitability for ${mname(S.mode)} ${nf(s.apt)}% of the area. ${nf(s.area)} km².`);
}
const ctxStats = t => t.kind === 'zone' ? S.zstats[t.id] : statsOf(t.cells);
const selName = t => t.z ? t.z.name : L(`Punto ${nf(t.lat, 3)}, ${nf(t.lon, 3)}`, `Point ${nf(t.lat, 3)}, ${nf(t.lon, 3)}`);
function reqLine(t, s) {
  if (t.kind === 'cell') { const fl = fails(t.cells[0]); return fl.length ? `<div class="line ko">${ic('x', 14)} ${L('No cumple', 'Does not meet')}: ${fl.map(x => x.t).join(' · ')}</div>` : `<div class="line ok">${ic('check', 14)} ${L('Cumple todos tus requisitos', 'Meets all your requirements')}</div>`; }
  const top = Object.entries(s.failSummary).sort((a, b) => b[1] - a[1])[0];
  return `<div class="line ${s.apt >= 50 ? 'ok' : 'ko'}">${ic(s.apt >= 50 ? 'check' : 'alert', 14)} ${L(`${nf(s.apt)}% del área cumple tus requisitos`, `${nf(s.apt)}% of the area meets your requirements`)}${top ? ` · <span class="dim">${L('principal limitante', 'main limit')}: ${FAILNAME()[top[0]]}</span>` : ''}</div>`;
}
function actionsFor(t) {
  const m = S.mode, P = MODES[m].primary;
  const btn = (id, icon, txt, primary) => `<button type="button" class="btn ${primary ? 'primary' : ''}" id="${id}">${ic(icon, 15)} ${txt}</button>`;
  const rover = btn('aRover', 'route', L('Ensayo de rover', 'Rover test'), P === 'rover'), eva = btn('aEva', 'tent', L('Ensayo EVA', 'EVA test'), P === 'eva'), samp = btn('aSamp', 'flask', L('Ruta de muestreo', 'Sampling route'), P === 'sample');
  const sim = btn('aSim', 'search', L('Lugares parecidos', 'Similar places'), false);
  return `<div class="acts2">${P === 'rover' ? rover + eva : P === 'eva' ? eva + rover : samp + sim}</div>
    <div class="dd"><button type="button" class="btn sm" id="aExp" aria-haspopup="true" aria-expanded="false">${ic('download', 14)} ${L('Exportar', 'Export')} ${ic('chevD', 13)}</button>
    <div class="menu hidden" id="expMenu" role="menu"><button type="button" role="menuitem" id="aRep">${ic('file', 14)} ${L('Informe PDF (ES/EN)', 'PDF report (ES/EN)')}</button><button type="button" role="menuitem" id="aCsv">${ic('download', 14)} ${L('Datos CSV', 'CSV data')}</button><button type="button" role="menuitem" id="aGeo">${ic('download', 14)} GeoJSON</button></div></div>`;
}
function tabRes(t, s) {
  const z = t.z, w = whyData(t, s), r = t.kind === 'zone' ? range(t.id) : null, col = { hi: PAL.ok, mid: PAL.iron, lo: PAL.bad }[w.levelKey];
  return `${z ? `<img class="photo" src="${z.img}" alt="${esc(z.name)}"><div class="phcap">${L('Imagen satelital de la zona', 'Satellite image of the zone')}</div>` : ''}
  <div class="rings">${Charts.ring(s.sim, plasmaHex(Math.max(.45, s.sim / 100)), L('Similitud ambiental', 'Environmental similarity') + gl('sim'), 96, r ? `${L('rango', 'range')} ${nf(r[0])}–${nf(r[2])} · ${s.nInd}/3 ${L('datos', 'data')}` : `${s.nInd}/3 ${L('datos', 'data')}`)}
    ${Charts.ring(s.apt, MODES[S.mode].color, L(`Aptitud · ${mname(S.mode)}`, `Suitability · ${mname(S.mode)}`) + gl('apt'), 96, L('% del área', '% of area'))}</div>
  ${reqLine(t, s)}
  <div class="card why"><h6 class="subh">${L('¿Por qué este lugar?', 'Why this place?')}</h6>
    <div class="list">${w.reasons.map(x => `<div class="it"><span style="color:${IND[x.k].color}">${ic(IND[x.k].icon, 14)}</span><span>${x.t}</span></div>`).join('')}
    ${w.weak ? `<div class="it"><span class="dim">${ic('alert', 14)}</span><span>${w.weak.t}</span></div>` : ''}${w.missing ? `<div class="it"><span class="ko">${ic('alert', 14)}</span><span>${w.missing}</span></div>` : ''}</div>
    <button type="button" class="confchip" id="confBtn" aria-expanded="false" style="--cc:${col}">${L('Confianza', 'Confidence')} ${w.level} · ${w.n}/4 ${ic('chevD', 12)}</button>${gl('conf')}
    <div class="list hidden" id="confList">${w.checks.map(c => `<div class="it"><span class="${c.ok ? 'ok' : 'ko'}">${ic(c.ok ? 'check' : 'x', 13)}</span><span>${c.t}</span></div>`).join('')}</div></div>
  ${z && z.note ? `<div class="fact">${ic('info', 15)}<span>${L(z.note, 'Analog studied with NASA Ames (Valdivia-Silva, McKay). Threatened by land invasions.')}</span></div>` : ''}
  ${actionsFor(t)}
  <div id="simList"></div>`;
}
function tabAna(t, s) {
  const m = S.mode, Y = yungay(), U = utah(), yN = analogNorm(Y), uN = analogNorm(U), name = selName(t), allSim = Array.from(S.sim);
  const chip = (k, v) => `<div class="chip" style="--c:${IND[k].color}"><div class="l">${ic(IND[k].icon, 13)} ${iname(k)}</div><div class="v">${v}</div><div class="s"><i style="width:${(s.ind[k] ?? 0) * 100}%"></i></div></div>`;
  const cards = {
    ind: `<div class="card" data-key="ind"><h5>${L('Indicadores frente a análogos', 'Indicators vs analogs')} <span>0–1</span></h5>${Charts.groups(['T', 'A', 'M'].map(k => ({ label: iname(k, 1), color: IND[k].color })), [
      { name, color: MODES[m].color, vals: ['T', 'A', 'M'].map(k => s.ind[k]) }, { name: 'Yungay', color: PAL.yungay, vals: ['T', 'A', 'M'].map(k => yN[k]) }, { name: 'Utah MDRS', color: PAL.utah, vals: ['T', 'A', 'M'].map(k => uN[k]) }])}
      <p class="note">${L('Similitud', 'Similarity')}: ${nf(s.sim)} · Yungay ${nf(analogScore(Y))} · Utah ${nf(analogScore(U))}</p></div>`,
    terr: `<div class="card" data-key="terr"><h5>${L('Terreno para operar', 'Terrain for operations')} <span>${L('aptitud, no similitud', 'suitability, not similarity')}</span></h5>
      <table class="cmp"><tr><td>${L('Pendiente media', 'Mean slope')}</td><td>${nf(s.slope, 1)}°</td></tr><tr><td>${L('Tu límite', 'Your limit')}</td><td>${S.f.slope}°</td></tr><tr><td>${L('Área con pendiente ≤ límite', 'Area with slope ≤ limit')}</td><td>${nf(100 * areaOf(t.cells.filter(i => S.G.slope[i] != null && S.G.slope[i] <= S.f.slope)) / s.area)}%</td></tr></table>
      <p class="note">${L('La pendiente no entra en la similitud con Marte: un terreno plano no es más marciano, es más operable.', 'Slope is not part of Mars similarity: flat terrain is not more Martian, it is more operable.')}</p></div>`,
    arid: `<div class="card" data-key="arid"><h5>${L('Aridez · índice PNUMA', 'Aridity · UNEP index')} ${gl('ai')}<span>AI = P / ET₀</span></h5>${Charts.bars([
      { label: name.slice(0, 20), v: s.ai, color: MODES[m].color, hl: true, txt: nf(s.ai, 3) }, { label: 'Yungay', v: Y.vals.ai, color: PAL.yungay, txt: nf(Y.vals.ai, 4) },
      { label: L('Límite hiperárido', 'Hyper-arid limit'), v: .05, color: '#9aa3b2', txt: '0.050' }, { label: L('Límite árido', 'Arid limit'), v: .2, color: '#6f7888', txt: '0.200' }, { label: 'Utah MDRS', v: U.vals.ai, color: PAL.utah, txt: nf(U.vals.ai, 3) }], .25)}
      <p class="note">${L(`Lluvia: TerraClimate ${nf(s.pr_tc)} mm · GPM ${nf(s.pr_gpm)} mm. Los dos productos no coinciden en desiertos costeros; ninguno es medición de campo.`, `Rainfall: TerraClimate ${nf(s.pr_tc)} mm · GPM ${nf(s.pr_gpm)} mm. The two products disagree in coastal deserts; neither is a field measurement.`)}</p></div>`,
    min: `<div class="card" data-key="min"><h5>${L('Minerales', 'Minerals')} ${gl('emit')}<span>NASA EMIT</span></h5>${Charts.gauge2([{ label: L('Óxidos de hierro', 'Iron oxides'), v: s.fe, color: PAL.iron }, { label: L('Sulfatos y arcillas', 'Sulfates and clays'), v: s.cs, color: PAL.arid }])}
      <p class="note">${L(`% de píxeles con detección · cobertura ${nf(s.emitCov)}%. Indicio satelital, no muestra.`, `% of pixels with detection · coverage ${nf(s.emitCov)}%. Remote indication, not a sample.`)}</p></div>`,
    therm: `<div class="card" data-key="therm"><h5>${L('Oscilación térmica del suelo', 'Ground thermal swing')} ${gl('modis')}<span>°C</span></h5>${Charts.bars([
      { label: name.slice(0, 20), v: s.dT, color: PAL.temp, hl: true, txt: nf(s.dT, 1) }, { label: 'Yungay', v: Y.vals.dT, color: PAL.yungay, txt: nf(Y.vals.dT, 1) },
      { label: 'Utah MDRS', v: U.vals.dT, color: PAL.utah, txt: nf(U.vals.dT, 1) }, { label: L('Marte · Gale (REMS)', 'Mars · Gale (REMS)'), v: AN.T_mars, color: PAL.mars, txt: '≈ 80' }], 90)}
      <p class="note">${L('Referencia, no equivalencia: sensores, escalas y planetas distintos.', 'A reference, not an equivalence: different sensors, scales and planets.')}</p></div>`,
    pow: `<div class="card" data-key="pow"><h5>${L('Radiación solar mensual', 'Monthly solar radiation')} <span>NASA POWER · 1°</span></h5>${Charts.line(Object.entries(S.M.power).map(([n, v]) => ({ name: n, vals: v.sw, color: ({ 'Atacama (Yungay)': PAL.yungay, 'Utah (MDRS)': PAL.utah, 'La Joya (Arequipa)': PAL.arid, 'Clemesí (Moquegua)': PAL.terr })[n], hl: n === (s.lat > -16.9 ? 'La Joya (Arequipa)' : 'Clemesí (Moquegua)') })), L('EFMAMJJASOND', 'JFMAMJJASOND').split(''), 'kWh/m²/' + L('día', 'day'))}</div>`,
    hist: `<div class="card" data-key="hist"><h5>${L('Dónde se ubica', 'Where it ranks')} <span>${L('percentil', 'percentile')} ${nf(s.pct)}</span></h5>${Charts.hist(allSim, s.sim)}</div>`
  };
  const order = m === 'probar' ? ['terr', 'ind', 'arid', 'therm', 'min', 'pow', 'hist'] : m === 'estudiar' ? ['min', 'ind', 'arid', 'therm', 'terr', 'hist', 'pow'] : ['ind', 'therm', 'arid', 'terr', 'min', 'pow', 'hist'];
  return `<div class="chips">${chip('T', `${nf(s.dT, 1)} °C`)}${chip('A', `${nf(s.ai, 3)} <small>${s.cls}</small>`)}${chip('M', s.fe == null ? L('sin dato', 'no data') : `${nf(s.fe)} / ${nf(s.cs)} %`)}</div>` + order.map(k => cards[k]).join('') +
    `<button type="button" class="btn sm full" id="aSim2">${ic('search', 14)} ${L('Buscar lugares con perfil parecido', 'Find places with a similar profile')}</button><div id="simList2"></div>`;
}
function tabMars(t, s) {
  const z = t.z;
  return `<div class="twin"><figure><img src="${z ? z.img : 'img/clemesi_field.jpg'}" alt=""><figcaption>${z ? z.name + L(' · Tierra', ' · Earth') : L('Imagen ilustrativa · Pampa de Clemesí (no es el punto elegido)', 'Illustrative image · Pampa de Clemesí (not the selected point)')}</figcaption></figure>
    <figure class="mars"><img src="img/gale_3km.jpg" alt="Gale"><figcaption>${L('Gale, Marte · NASA Mars Trek', 'Gale, Mars · NASA Mars Trek')}</figcaption></figure></div>
    <p class="note">${L('Comparación visual ilustrativa: el parecido de imagen no demuestra equivalencia mineral, térmica ni de movilidad.', 'Illustrative visual comparison: visual likeness does not prove mineral, thermal or mobility equivalence.')}</p>
    <table class="cmp"><tr><th>${L('Variable', 'Variable')}</th><th>${L('Aquí', 'Here')}</th><th>${L('Marte', 'Mars')}</th><th></th></tr>
      <tr><td>${L('Aridez', 'Aridity')}</td><td>${s.cls}</td><td class="m">${L('sin agua líquida', 'no liquid water')}</td><td class="ok">${L('se parece', 'similar')}</td></tr>
      <tr><td>${L('Oscilación del suelo', 'Ground swing')}</td><td>${nf(s.dT, 1)} °C</td><td class="m">≈ 80 °C</td><td class="ok">${nf(100 * s.dT / AN.T_mars)}%</td></tr>
      <tr><td>${L('Fe / sulfatos', 'Fe / sulfates')}</td><td>${s.fe == null ? '—' : nf(s.fe) + ' / ' + nf(s.cs) + ' %'}</td><td class="m">${L('presentes', 'present')}</td><td class="ok">${L('se parece', 'similar')}</td></tr>
      <tr><td>${L('Gravedad', 'Gravity')}</td><td>9.81 m/s²</td><td class="m">3.71 m/s²</td><td class="ko">${L('no se copia', 'not reproduced')}</td></tr>
      <tr><td>${L('Presión', 'Pressure')}</td><td>≈ 1013 hPa</td><td class="m">≈ 6 hPa</td><td class="ko">${L('no se copia', 'not reproduced')}</td></tr>
      <tr><td>${L('Radiación', 'Radiation')}</td><td>≈ 0.007 mSv/d</td><td class="m">≈ 0.64 mSv/d</td><td class="ko">${L('no se copia', 'not reproduced')}</td></tr></table>
    <div class="card" data-key="log"><h5>${L('Tierra frente a Marte', 'Earth vs Mars')} <span>${L('escala log', 'log scale')}</span></h5>${Charts.logbars([
      { label: L('Gravedad', 'Gravity'), unit: 'm/s²', e: 9.81, m: 3.71, et: '9.81', mt: '3.71' }, { label: L('Presión', 'Pressure'), unit: 'hPa', e: 1013, m: 6.1, et: '1013', mt: '6.1' },
      { label: L('Radiación', 'Radiation'), unit: L('mSv/día', 'mSv/day'), e: 0.007, m: 0.64, et: '0.007', mt: '0.64' }, { label: L('Oscilación', 'Swing'), unit: '°C', e: s.dT || 1, m: 80, et: nf(s.dT, 1), mt: '≈80' }])}</div>`;
}
function tabData(t, s) {
  const tw = nearestTown(s.lat, s.lon);
  return `<div class="card" data-key="logi"><h5>${L('Logística', 'Logistics')} <span>${L('datos, sin fórmula', 'data, no formula')}</span></h5>
    <table class="cmp"><tr><td>${L('Área', 'Area')}</td><td>${nf(s.area)} km² · ${s.n} ${L('celdas', 'cells')}</td></tr><tr><td>${L('Carretera más cercana', 'Nearest road')}</td><td>${nf(s.road, 1)} km</td></tr><tr><td>${L('Ciudad de apoyo', 'Support town')}</td><td>${tw.txt}</td></tr>
    <tr><td>${L('Luz nocturna (VIIRS)', 'Night light (VIIRS)')}</td><td>${nf(s.ntl, 2)}</td></tr><tr><td>${L('Área protegida', 'Protected area')}</td><td>${s.anp ? L('sí, en parte', 'partly') : 'no'}</td></tr><tr><td>${L('Elevación media', 'Mean elevation')}</td><td>${nf(s.elev)} m</td></tr></table></div>
  <div class="card" data-key="trace"><h5>${L('Trazabilidad', 'Traceability')} <span>${L('resolución nativa → usada', 'native → used resolution')}</span></h5>
    <table class="cmp small"><tr><th>${L('Dato', 'Data')}</th><th>${L('Resolución', 'Resolution')}</th><th>${L('Periodo', 'Period')}</th><th>${L('Tipo', 'Type')}</th></tr>${TRACE.map(r => `<tr><td>${r.d}<br><small class="dim">${L(r.u[0], r.u[1])}</small></td><td>${r.r}</td><td>${r.p}</td><td>${L(r.t[0], r.t[1])}</td></tr>`).join('')}</table>
    <p class="note">${L('"Interpolado" significa que se muestra a 1 km sin tener precisión de 1 km.', '"Interpolated" means shown at 1 km without 1 km accuracy.')}</p></div>
  <div class="card" data-key="meth"><h5>${L('Cómo se calcula', 'How it is computed')}</h5>
    <p><b>${L('Similitud ambiental', 'Environmental similarity')}</b> = ${L('promedio de térmica, aridez y minerales (0–1)', 'mean of thermal, aridity and minerals (0–1)')}. <b>${L('Aptitud', 'Suitability')}</b> = ${L('% del área que cumple tus requisitos', '% of area meeting your requirements')}.</p>
    <button type="button" class="btn sm" id="aMeth">${ic('book', 14)} ${L('Ver método y validación', 'See method & validation')}</button></div>`;
}
function openFicha(t, doFly = true) {
  if (S.sel?.id !== t.id) stopSim();
  S.sel = t; const s = ctxStats(t), z = t.z;
  document.body.classList.add('ficha-open'); const F = $('#ficha'); F.classList.remove('hidden', 'collapsed');
  if (doFly) fly(s.lon, s.lat, t.kind === 'zone' ? 26000 : 12000, -38, 15);
  const tabs = [['res', L('Resumen', 'Summary')], ['ana', L('Análisis', 'Analysis')], ['mars', L('Marte', 'Mars')], ['data', L('Datos', 'Data')]];
  const body = { res: tabRes, ana: tabAna, mars: tabMars, data: tabData }[S.ftab](t, s);
  F.innerHTML = `<div class="phead fh"><div><small>${z ? z.region : L('Celda de ~1 km', '~1 km cell')} · ${nf(s.area)} km²</small><h2>${esc(selName(t))}${z && z.new ? `<span class="badge">${L('NUEVA', 'NEW')}</span>` : ''}</h2></div>
     <div class="hbtns"><button type="button" class="icbtn" id="fFold" aria-label="${L('Plegar ficha', 'Collapse sheet')}">${ic('minus')}</button><button type="button" class="icbtn" id="fClose" aria-label="${L('Cerrar ficha', 'Close sheet')}">${ic('x')}</button></div></div>
    <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" role="tab" data-t="${k}" aria-selected="${S.ftab === k}" class="${S.ftab === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div class="tabbody" id="fBody">${body}</div>`;
  F.querySelectorAll('.tabs [data-t]').forEach(b => b.onclick = () => { S.ftab = b.dataset.t; openFicha(t, false); });
  $('#fClose').onclick = closeFicha; $('#fFold').onclick = () => F.classList.toggle('collapsed');
  const on = (id, fn) => { const e = document.getElementById(id); if (e) e.onclick = fn; };
  on('aRover', () => Rover.open()); on('aEva', () => Eva.open('eva')); on('aSamp', () => Eva.open('sample'));
  on('aSim', () => fobosSay(similar('simList'), L('acción · parecidos', 'action · similar'))); on('aSim2', () => fobosSay(similar('simList2'), L('acción · parecidos', 'action · similar')));
  on('aMeth', openMethod);
  on('confBtn', () => { const l = $('#confList'); l.classList.toggle('hidden'); $('#confBtn').setAttribute('aria-expanded', !l.classList.contains('hidden')); });
  on('aExp', () => { const mnu = $('#expMenu'); mnu.classList.toggle('hidden'); $('#aExp').setAttribute('aria-expanded', !mnu.classList.contains('hidden')); });
  on('aRep', () => Report.open(reportCtx())); on('aCsv', () => Report.csv(reportCtx())); on('aGeo', () => Report.geojson(reportCtx()));
  if (S.ftab === 'ana' || S.ftab === 'data') accordionize($('#fBody'), S.ftab === 'ana' ? 2 : 3);
  highlight(t);
}
function closeFicha() { stopSim(); $('#ficha').classList.add('hidden'); document.body.classList.remove('ficha-open'); S.sel = null; clearEnts(); }
function clearEnts() { S.ents.forEach(e => viewer.entities.remove(e)); S.ents = []; }
function cellOutline(cells) {
  const G = S.G, set = new Set(cells), segs = [];
  cells.forEach(i => { const r = Math.floor(i / G.w), c = i % G.w, x0 = G.west + c * G.dx, y0 = G.north + r * G.dy, x1 = x0 + G.dx, y1 = y0 + G.dy;
    if (!set.has(i - G.w)) segs.push([x0, y0, x1, y0]); if (!set.has(i + G.w)) segs.push([x0, y1, x1, y1]);
    if (c === 0 || !set.has(i - 1)) segs.push([x0, y0, x0, y1]); if (c === G.w - 1 || !set.has(i + 1)) segs.push([x1, y0, x1, y1]); });
  return segs;
}
function highlight(t) { clearEnts(); const col = Cesium.Color.fromCssColorString(MODES[S.mode].color); cellOutline(t.cells).forEach(sg => S.ents.push(viewer.entities.add({ polyline: { positions: Cesium.Cartesian3.fromDegreesArray(sg), width: 2, clampToGround: true, material: col } }))); }

/* ---------- Similar places (environmental profile) ---------- */
function similar(target = 'simList') {
  if (!S.sel) return L('Primero abre una zona o haz clic en el mapa.', 'First open a zone or click on the map.');
  const s = ctxStats(S.sel), v = s.ind, cand = [];
  for (let i = 0; i < S.sim.length; i++) {
    if (!passes(i)) continue; const c = cellLL(i); if (hav(c.lat, c.lon, s.lat, s.lon) < 25) continue;
    const o = S.ind[i]; let d = 0, n = 0; for (const k of ['T', 'A', 'M']) if (v[k] != null && o[k] != null) { d += (v[k] - o[k]) ** 2; n++; }
    if (n >= 2) cand.push({ i, d: Math.sqrt(d / n), c, n });
  }
  cand.sort((a, b) => a.d - b.d); const pick = [];
  for (const c of cand) { if (pick.every(p => hav(p.c.lat, p.c.lon, c.c.lat, c.c.lon) > 12)) pick.push(c); if (pick.length === 5) break; }
  if (!pick.length) return L('No hay lugares parecidos que cumplan tus requisitos. Relaja la pendiente o la distancia a carretera.', 'No similar places meet your requirements. Relax the slope or road distance.');
  pick.forEach((p, k) => S.ents.push(viewer.entities.add({ position: Cesium.Cartesian3.fromDegrees(p.c.lon, p.c.lat),
    point: { pixelSize: 12, color: Cesium.Color.fromCssColorString(PAL.estudiar), outlineColor: Cesium.Color.BLACK, outlineWidth: 2, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, disableDepthTestDistance: 5e5 },
    label: { text: `#${k + 1} · d = ${nf(p.d, 2)}`, font: '14px IBM Plex Sans', pixelOffset: new Cesium.Cartesian2(0, -18), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('rgba(8,14,28,.7)'), disableDepthTestDistance: 5e5 } })));
  const box = document.getElementById(target);
  if (box) {
    box.innerHTML = `<div class="card"><h5>${L('Perfil parecido', 'Similar profile')} <span>${L('a más de 25 km', 'beyond 25 km')}</span></h5>${pick.map((p, k) => `<button type="button" class="rk" data-i="${p.i}"><span class="n">${k + 1}</span><span class="nm"><b>${nf(p.c.lat, 3)}, ${nf(p.c.lon, 3)}</b><small>${L('similitud', 'similarity')} ${nf(S.sim[p.i])} · d = ${nf(p.d, 2)} · ${nearestTown(p.c.lat, p.c.lon).n}</small></span></button>`).join('')}
      <p class="note">${L('d = distancia entre perfiles de térmica, aridez y minerales (0 = idénticos).', 'd = distance between thermal, aridity and mineral profiles (0 = identical).')}</p></div>`;
    box.querySelectorAll('.rk').forEach(el => el.onclick = () => { const c = cellLL(+el.dataset.i); fly(c.lon, c.lat, 15000, -40); });
  }
  fly(s.lon, s.lat, 200000, -70, 0, 2);
  return L(`Encontré ${pick.length} lugares con perfil ambiental parecido; los marqué en verde.`, `Found ${pick.length} places with a similar environmental profile; marked in green.`);
}

/* Ajustes por modelo 3D (revisados con la geometría de cada .glb):
   - mark3.glb mira hacia -Z del glTF, por eso se gira 180° para que camine de frente.
   - curiosity.glb mira hacia +Z (brazo robótico adelante), no necesita giro.
   - minPx/maxScale moderados: antes 180 px y x150 lo volvían gigante y flotante. */
const MODEL_FIX = {
  'models/mark3.glb': { minPx: 56, maxScale: 10, headingOffset: Math.PI, sway: true, viewFrom: [-7, -10, 5] },
  'models/curiosity.glb': { minPx: 72, maxScale: 10, headingOffset: 0, sway: false, viewFrom: [-14, -20, 10] }
};

const MapCamera = {
  controls() {
    let box = $('#mapZoom');
    if (!box) {
      box = document.createElement('div'); box.id = 'mapZoom'; box.className = 'map-zoom glass ui';
      box.setAttribute('role', 'group');
      box.innerHTML = '<button type="button" id="zoomIn">+</button><button type="button" id="zoomOut">−</button>';
      document.body.appendChild(box);
      $('#zoomIn').onclick = () => this.zoom(.7); $('#zoomOut').onclick = () => this.zoom(1 / .7);
    }
    box.setAttribute('aria-label', L('Zoom del mapa', 'Map zoom'));
    for (const [id, es, en] of [['zoomIn','Acercar','Zoom in'],['zoomOut','Alejar','Zoom out']]) {
      const button = $('#' + id); button.title = L(es, en); button.setAttribute('aria-label', L(es, en));
    }
  },
  zoom(factor) {
    if (!viewer) return;
    window.stopMapOrbit?.(); viewer.camera.cancelFlight();
    if (viewer.trackedEntity && SimulationView.actor === viewer.trackedEntity) {
      const offset = SimulationView.actor.viewFrom.getValue ? SimulationView.actor.viewFrom.getValue(viewer.clock.currentTime) : SimulationView.actor.viewFrom;
      if (offset) {
        const length = Cesium.Cartesian3.magnitude(offset), next = Math.max(5, Math.min(20000, length * factor));
        SimulationView.actor.viewFrom = Cesium.Cartesian3.multiplyByScalar(offset, next / length, new Cesium.Cartesian3());
        const actor = SimulationView.actor; viewer.trackedEntity = undefined; viewer.trackedEntity = actor;
        return;
      }
    }
    const camera = viewer.camera;
    const hit = pickLL(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2));
    let distance = Math.max(20, camera.positionCartographic.height);
    if (hit) {
      const ground = viewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(hit.lon, hit.lat)) || 0;
      distance = Cesium.Cartesian3.distance(camera.positionWC, Cesium.Cartesian3.fromDegrees(hit.lon, hit.lat, ground));
    }
    const amount = Math.max(2, distance * Math.abs(1 - factor));
    if (factor < 1) camera.zoomIn(Math.min(amount, Math.max(0, distance - 5))); else camera.zoomOut(amount);
  },
  fitRoute(points) {
    if (!points?.length) return;
    window.stopMapOrbit?.(); viewer.trackedEntity = undefined; viewer.camera.cancelFlight();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    const canvas = viewer.canvas.getBoundingClientRect();
    let left = 18, right = canvas.width - 18, top = 130, bottom = canvas.height - 35;
    for (const id of ['#left', '#sim', '#ficha', '#ares']) {
      const el = $(id); if (!el || el.classList.contains('hidden') || el.classList.contains('collapsed') || !el.getClientRects().length) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height < canvas.height * .32) continue;
      if (rect.left + rect.width / 2 < canvas.left + canvas.width / 2) left = Math.max(left, rect.right - canvas.left + 18);
      else right = Math.min(right, rect.left - canvas.left - 18);
    }
    // On narrow screens use the whole map rather than an unusably small gap.
    if (right - left < 260) { left = 18; right = canvas.width - 18; }
    const sphere = Cesium.BoundingSphere.fromPoints(points);
    const fovy = viewer.camera.frustum.fovy || Math.PI / 3;
    const verticalFov = 2 * Math.atan(Math.tan(fovy / 2) * Math.max(.25, (bottom - top) / canvas.height));
    const horizontalFov = 2 * Math.atan(Math.tan(fovy / 2) * canvas.width / canvas.height * (right - left) / canvas.width);
    const range = Math.max(180, sphere.radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2) * 1.12);
    viewer.camera.flyToBoundingSphere(sphere, { duration: 1.2,
      offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-55), range),
      complete: () => {
        const metersPerPixel = 2 * range * Math.tan(fovy / 2) / canvas.height;
        viewer.camera.moveRight((canvas.width / 2 - (left + right) / 2) * metersPerPixel);
        viewer.camera.moveUp(((top + bottom) / 2 - canvas.height / 2) * metersPerPixel);
      }
    });
  }
};

const SimulationView = {
  generation: 0, cleanups: [], actor: null, route: null, finished: false, ready: false,
  clear() {
    this.generation++;
    this.cleanups.splice(0).forEach(dispose => dispose());
    this.actor = null; this.ready = false; this.route = null; this.preferredView = 'follow';
    if (this.previousLight) { viewer.scene.light = this.previousLight; this.previousLight = null; }
    viewer.clock.shouldAnimate = false;
  },
  mount(name) {
    $('#simPlayback')?.remove();
    const box = document.createElement('div'); box.id = 'simPlayback'; box.className = 'card';
    box.style.cssText = 'margin:10px 0;border-color:var(--accent)';
    box.innerHTML = `<h5>${name} ${L('en 3D','in 3D')}</h5>
      <p id="simStatus" role="status" aria-live="polite" style="font-size:14.5px;margin:6px 0">${L('Preparando terreno y modelo…','Preparing terrain and model…')}</p>
      <div class="acts"><button class="btn sm" id="simFollow" disabled>${L('Seguir modelo','Follow model')}</button><button class="btn sm" id="simOverview">${L('Ver ruta completa','Full route')}</button></div>
      <div class="acts" style="margin-top:6px"><button class="btn sm" id="simPause" disabled>${L('Pausar','Pause')}</button><button class="btn sm" id="simReplay" disabled>${L('Repetir','Replay')}</button></div>
      <p class="note" style="margin:8px 0 0">${L('Reproducción acelerada. El modelo 3D se muestra más grande para que se vea.','Accelerated playback. The 3D model is enlarged for visibility.')}</p>`;
    const runButton = $('#rRun') || $('#eRun'); runButton.insertAdjacentElement('afterend', box);
    $('#simFollow').onclick = () => { this.preferredView = 'follow'; this.follow(); };
    $('#simOverview').onclick = () => this.overview();
    $('#simPause').onclick = () => {
      if (!this.ready || this.finished) return;
      viewer.clock.shouldAnimate = !viewer.clock.shouldAnimate;
      $('#simPause').textContent = viewer.clock.shouldAnimate ? L('Pausar','Pause') : L('Continuar','Resume');
      this.status(viewer.clock.shouldAnimate ? L('En recorrido','Moving') + (this.speedTxt || '') : L('Pausado','Paused'));
    };
    $('#simReplay').onclick = () => {
      if (!this.ready) return;
      this.finished = false; viewer.clock.currentTime = this.start.clone();
      viewer.clock.shouldAnimate = this.moving;
      $('#simPause').disabled = !this.moving; $('#simPause').textContent = L('Pausar','Pause');
      this.status(this.moving ? L('En recorrido','Moving') + (this.speedTxt || '') : this.endMessage); this.follow();
    };
  },
  status(text) { const el = $('#simStatus'); if (el) el.textContent = text; },
  follow() {
    if (!this.actor || !this.ready) return;
    viewer.camera.cancelFlight(); viewer.trackedEntity = undefined;
    const vf = (MODEL_FIX[this.uri] || {}).viewFrom || [-20, -28, 18];
    this.actor.viewFrom = new Cesium.Cartesian3(vf[0], vf[1], vf[2]);
    viewer.trackedEntity = this.actor;
  },
  overview() { this.preferredView = 'overview'; MapCamera.fitRoute(this.route); },
  async terrain(points) {
    const carto = points.map(p => Cesium.Cartographic.fromDegrees(p.lon, p.lat));
    let timer;
    try {
      const result = await Promise.race([
        Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, carto),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('terrain timeout')), 12000); })
      ]);
      return result.map((p, k) => ({ ...points[k], height: Number.isFinite(p.height) ? p.height : this.fallbackHeight(points[k]) }));
    } catch (_) { return points.map(p => ({ ...p, height: this.fallbackHeight(p) })); }
    finally { clearTimeout(timer); }
  },
  fallbackHeight(p) {
    const i = llCell(p.lat, p.lon); return i >= 0 && Number.isFinite(S.G.elev[i]) ? S.G.elev[i] : 0;
  },
  // getBoundingSphere is public and returns PENDING until the model is ready.
  waitForModel(actor, generation) {
    return new Promise(resolve => {
      let done = false, timer, off;
      const finish = value => {
        if (done) return; done = true; clearTimeout(timer); if (off) off();
        const i = this.cleanups.indexOf(cancel); if (i >= 0) this.cleanups.splice(i, 1);
        resolve(value);
      };
      const cancel = () => finish(false);
      this.cleanups.push(cancel);
      off = viewer.scene.postRender.addEventListener(() => {
        if (generation !== this.generation) return finish(false);
        const state = viewer.dataSourceDisplay.getBoundingSphere(actor, false, new Cesium.BoundingSphere());
        if (state === Cesium.BoundingSphereState.DONE) finish(true);
      });
      timer = setTimeout(() => finish(false), 45000);
      viewer.scene.requestRender();
    });
  },
  play(options) {
    const generation = this.generation;
    return this.playRoute(options).catch(error => {
      console.error('No se pudo preparar la reproducción 3D:', error);
      if (generation === this.generation) this.status(L('No se pudo preparar el modelo. Vuelve a ejecutar el ensayo.','Could not prepare the model. Run the test again.'));
    });
  },
  async playRoute({ points, overviewPoints, uri, name, seconds = 40, endMessage = L('Recorrido finalizado','Route finished'), heading = 0, realSeconds = 0 }) {
    const generation = this.generation;
    const fix = MODEL_FIX[uri] || { minPx: 64, maxScale: 10, headingOffset: 0, sway: false };
    this.uri = uri;
    const dense = [points[0]];
    points.slice(1).forEach((q, k) => {
      const a = points[k], steps = Math.max(1, Math.ceil(hav(a.lat, a.lon, q.lat, q.lon) / .1));
      for (let n = 1; n <= steps; n++) dense.push({ lat: a.lat + (q.lat - a.lat) * n / steps, lon: a.lon + (q.lon - a.lon) * n / steps });
    });
    const ground = await this.terrain(dense);
    if (generation !== this.generation) return;
    const xyz = ground.map(q => Cesium.Cartesian3.fromDegrees(q.lon, q.lat, q.height));
    this.route = overviewPoints ? overviewPoints.map(q => Cesium.Cartesian3.fromDegrees(q.lon, q.lat, this.fallbackHeight(q))) : xyz;
    this.start = Cesium.JulianDate.now(); this.finished = false;
    const distances = [0];
    for (let k = 1; k < ground.length; k++) distances.push(distances[k - 1] + hav(ground[k - 1].lat, ground[k - 1].lon, ground[k].lat, ground[k].lon));
    const total = distances[distances.length - 1];
    this.moving = total > .000001; this.endMessage = endMessage;
    this.stop = Cesium.JulianDate.addSeconds(this.start, this.moving ? seconds : 1, new Cesium.JulianDate());
    const pos = new Cesium.SampledPositionProperty();
    if (this.moving) xyz.forEach((p, k) => pos.addSample(Cesium.JulianDate.addSeconds(this.start, seconds * distances[k] / total, new Cesium.JulianDate()), p));
    else pos.addSample(this.start, xyz[0]);
    pos.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    pos.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    // Orientación solo horizontal (sin inclinarse en pendientes) + leve balanceo al caminar.
    let lastHeading = heading;
    const pNow = new Cesium.Cartesian3(), pNext = new Cesium.Cartesian3(), enu = new Cesium.Matrix4(), inv = new Cesium.Matrix4(), loc = new Cesium.Cartesian3(), later = new Cesium.JulianDate();
    const startRef = this.start;
    const orientation = new Cesium.CallbackProperty(time => {
      const p = pos.getValue(time, pNow); if (!p) return undefined;
      const q = pos.getValue(Cesium.JulianDate.addSeconds(time, 0.3, later), pNext);
      let walking = false;
      if (q && Cesium.Cartesian3.distance(p, q) > 0.01) {
        Cesium.Transforms.eastNorthUpToFixedFrame(p, undefined, enu); Cesium.Matrix4.inverseTransformation(enu, inv);
        Cesium.Matrix4.multiplyByPoint(inv, q, loc);
        lastHeading = Math.atan2(-loc.y, loc.x); walking = true;
      }
      let roll = 0, pitch = 0;
      if (fix.sway && walking && viewer.clock.shouldAnimate) {
        const t = Cesium.JulianDate.secondsDifference(time, startRef);
        roll = 0.07 * Math.sin(t * Math.PI * 2 * 1.7); pitch = 0.03 * Math.sin(t * Math.PI * 4 * 1.7);
      }
      return Cesium.Transforms.headingPitchRollQuaternion(p, new Cesium.HeadingPitchRoll(lastHeading + fix.headingOffset, pitch, roll));
    }, false);
    Object.assign(viewer.clock, { startTime: this.start.clone(), currentTime: this.start.clone(), stopTime: this.stop.clone(),
      clockRange: Cesium.ClockRange.CLAMP_TO_END, multiplier: 1, shouldAnimate: false });
    // Stable studio shading preserves relief without depending on the simulated Sun.
    const shader = new Cesium.CustomShader({ lightingModel: Cesium.LightingModel.UNLIT,
      fragmentShaderText: `void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        float fill = 0.35 + 0.65 * max(dot(normalize(material.normalEC), normalize(vec3(0.4, 0.6, 1.0))), 0.0);
        material.diffuse *= fill;
      }` });
    this.cleanups.push(() => { if (!shader.isDestroyed()) shader.destroy(); });
    const actor = addE({ name, position: pos, orientation,
      model: { uri, minimumPixelSize: fix.minPx, maximumScale: fix.maxScale, incrementallyLoadTextures: false,
        customShader: shader,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, shadows: Cesium.ShadowMode.DISABLED,
        imageBasedLightingFactor: new Cesium.Cartesian2(1.5, 1), lightColor: new Cesium.Cartesian3(2, 2, 2),
        color: Cesium.Color.WHITE, colorBlendMode: Cesium.ColorBlendMode.MIX, colorBlendAmount: .1 } });
    this.actor = actor;
    // A camera-facing fill light keeps the suits visible even at local night.
    this.previousLight = viewer.scene.light;
    const light = new Cesium.DirectionalLight({ direction: Cesium.Cartesian3.clone(viewer.camera.directionWC), intensity: 2 });
    viewer.scene.light = light;
    this.cleanups.push(viewer.scene.preRender.addEventListener(() => {
      Cesium.Cartesian3.clone(viewer.camera.directionWC, light.direction);
    }));
    this.status(L('Cargando modelo 3D…','Loading 3D model…')); MapCamera.fitRoute(this.route);
    const loaded = await this.waitForModel(actor, generation);
    if (generation !== this.generation) return;
    if (!loaded) {
      this.status(L('No se pudo cargar el modelo 3D. Vuelve a ejecutar para reintentar.','The 3D model could not load. Run again to retry.'));
      // A clearly labelled locator remains useful when a model or decoder fails.
      addE({ position: pos, point: { pixelSize: 14, color: Cesium.Color.CYAN, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
        label: { text: name + L(' · modelo no disponible',' · model unavailable'), showBackground: true, font: '15px sans-serif', pixelOffset: new Cesium.Cartesian2(0, -28), disableDepthTestDistance: Number.POSITIVE_INFINITY } });
      return;
    }
    this.ready = true;
    // A separate label must not let the readiness check succeed before the model.
    addE({ position: pos, label: { text: name, font: '15px sans-serif', showBackground: true,
      fillColor: Cesium.Color.WHITE, backgroundColor: Cesium.Color.fromCssColorString('rgba(8,14,28,.8)'),
      pixelOffset: new Cesium.Cartesian2(0, -(fix.minPx + 26)), heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(150, 1e7),
      disableDepthTestDistance: Number.POSITIVE_INFINITY } });
    $('#simFollow').disabled = false; $('#simReplay').disabled = false; $('#simPause').disabled = !this.moving;
    viewer.clock.currentTime = this.start.clone();
    if (this.preferredView === 'overview') this.overview(); else this.follow();
    this.speedTxt = this.moving && realSeconds > seconds ? ` · ${L('reproducción','playback')} ×${Math.round(realSeconds / seconds)}` : '';
    this.status(this.moving ? L('En recorrido','Moving') + this.speedTxt : endMessage); viewer.clock.shouldAnimate = this.moving;
    this.cleanups.push(viewer.clock.onTick.addEventListener(clock => {
      if (!this.moving || this.finished || !Cesium.JulianDate.greaterThanOrEquals(clock.currentTime, this.stop)) return;
      this.finished = true; clock.shouldAnimate = false;
      this.status(endMessage); $('#simPause').disabled = true;
    }));
  }
};



/* ---------- Simulation shell ---------- */
function simStart() { S.simOn = true; if (S.overlay) S.overlay.show = false; $('#left').classList.add('collapsed'); $('#ficha').scrollTop = 0; $('#ficha').classList.add('collapsed'); $('#tip').classList.add('hidden'); clearSimEnts(); }
function clearSimEnts() { if (typeof SimulationView !== 'undefined') SimulationView.clear(); S.simEnts.forEach(e => viewer.entities.remove(e)); S.simEnts = []; viewer.trackedEntity = undefined; }
function stopSim() { S.simRequest++; clearSimEnts(); S.simOn = false; S.simKind = null; if (S.overlay) S.overlay.show = true; $('#sim').classList.add('hidden'); $('#ficha').classList.remove('collapsed'); }
const addE = o => { const e = viewer.entities.add(o); S.simEnts.push(e); return e; };
function sampleStatus(lat, lon, limit) {
  const i = llCell(lat, lon), G = S.G;
  if (i < 0 || G.status[i] === 0) return { i, v: null, st: 'nod' };
  if (G.status[i] !== 1 || (S.f.anp && G.anp[i])) return { i, v: G.slope[i], st: 'exc' };
  if (G.slope[i] == null) return { i, v: null, st: 'nod' };
  return { i, v: G.slope[i], st: G.slope[i] > limit ? 'over' : 'ok' };
}
function polySegs(pts, segs) {
  const col = { ok: PAL.terr, over: PAL.bad, exc: '#C9A3D9', nod: PAL.nod }; let start = 0;
  for (let k = 1; k <= segs.length; k++) if (k === segs.length || segs[k].st !== segs[start].st) {
    const p = pts.slice(start, k + 1); if (p.length > 1) addE({ polyline: { positions: p.map(q => Cesium.Cartesian3.fromDegrees(q.lon, q.lat)), width: 5, clampToGround: true, material: Cesium.Color.fromCssColorString(col[segs[start].st]) } });
    start = k;
  }
}
function movePt(lat, lon, km, ang) { return { lat: lat + km * Math.cos(ang) / 111.32, lon: lon + km * Math.sin(ang) / (111.32 * Math.cos(lat * Math.PI / 180)) }; }
const HD = () => S.lang === 'en' ? ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] : ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
const hd = h => HD()[Math.round(h / (Math.PI / 8)) % 16];
function readNum(id, min, max, label) { // strict validation: finite and inside limits
  const el = document.getElementById(id), v = Number(el.value);
  el.classList.remove('bad'); el.removeAttribute('aria-invalid');
  if (el.value.trim() === '' || !Number.isFinite(v) || v < min || v > max) { el.classList.add('bad'); el.setAttribute('aria-invalid', 'true'); el.focus(); throw new Error(L(`${label}: ingresa un valor entre ${min} y ${max}.`, `${label}: enter a value between ${min} and ${max}.`)); }
  return v;
}
const stepper = (k, n) => `<ol class="steps">${[L('Configurar', 'Set up'), L('Resultado', 'Result'), L('Comparar', 'Compare')].slice(0, n).map((x, i) => `<li class="${i < k ? 'done' : i === k ? 'on' : ''}">${i + 1}. ${x}</li>`).join('')}</ol>`;
const runMeta = () => ({ id: S.sel.id, name: selName(S.sel), lat: ctxStats(S.sel).lat, lon: ctxStats(S.sel).lon, mode: S.mode, f: { ...S.f }, time: new Date().toISOString() });

/* ---------- Rover test (preliminary route assessment) ---------- */
const Rover = {
  cfg() { return { limit: S.last.rLimit ?? S.f.slope, km: S.last.rKm ?? 3, goal: S.last.rGoal ?? 'suave' }; },
  evalRoute(lat, lon, h, km, limit) {
    const n = Math.round(km * 10) + 1, pts = [], segs = [];
    for (let k = 0; k < n; k++) pts.push(movePt(lat, lon, km * k / (n - 1), h + .1 * Math.sin(k / 4)));
    for (let k = 1; k < n; k++) { const a = pts[k - 1], b = pts[k], mid = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 }; segs.push({ ...sampleStatus(mid.lat, mid.lon, limit), len: hav(a.lat, a.lon, b.lat, b.lon) }); }
    return this.metrics({ h, km, limit, pts, segs, src: 'grid' });
  },
  metrics(r) {
    const segs = r.segs, len = st => segs.filter(x => x.st === st).reduce((a, x) => a + x.len, 0), vals = segs.map(x => x.v).filter(v => v != null);
    r.length = segs.reduce((a, x) => a + x.len, 0);
    r.ok = 100 * len('ok') / r.length; r.overKm = len('over'); r.excKm = len('exc'); r.nodKm = len('nod');
    r.over = segs.filter(x => x.st === 'over').length; r.exc = segs.filter(x => x.st === 'exc').length; r.nod = 100 * r.nodKm / r.length;
    r.first = segs.findIndex(x => x.st === 'over' || x.st === 'exc');
    r.mean = mean(vals); r.max = vals.length ? Math.max(...vals) : null; r.sd = vals.length ? Math.sqrt(mean(vals.map(v => (v - r.mean) ** 2))) : 0;
    let gain = 0;
    if (r.hts) for (let k = 1; k < r.hts.length; k++) { const d = r.hts[k] - r.hts[k - 1]; if (d > 0) gain += d; }
    else for (let k = 1; k < segs.length; k++) { const a = S.G.elev[segs[k - 1].i], b = S.G.elev[segs[k].i]; if (a != null && b != null && b > a) gain += b - a; }
    r.gain = gain; r.cells = new Set(segs.filter(x => x.i >= 0).map(x => x.i)).size; return r;
  },
  async refine(routes) { // along-track grade between consecutive points from Cesium World Terrain (~30 m)
    if (!viewer.terrainProvider || viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) return false;
    const pts = routes.flatMap(r => r.pts); let res, timer;
    try { res = await Promise.race([Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, pts.map(p => Cesium.Cartographic.fromDegrees(p.lon, p.lat))), new Promise((_, rj) => { timer = setTimeout(() => rj(new Error('timeout')), 15000); })]); }
    catch (e) { return false; } finally { clearTimeout(timer); }
    const hs = res.map(c => c.height); if (hs.some(h => !Number.isFinite(h)) || hs.every(h => Math.abs(h) < 1)) return false;
    let o = 0;
    routes.forEach(r => {
      const H = hs.slice(o, o + r.pts.length); o += r.pts.length; r.hts = H;
      r.segs = r.segs.map((x, k) => { const v = Math.atan(Math.abs(H[k + 1] - H[k]) / Math.max(x.len * 1000, 1)) * 180 / Math.PI; return (x.i < 0 || x.st === 'exc') ? { ...x, v } : { ...x, v, st: v > r.limit ? 'over' : 'ok' }; });
      r.src = 'terrain'; this.metrics(r);
    });
    return true;
  },
  choose(all, cfg) {
    const key = r => r.excKm * 1000 + r.overKm * 100 + r.nodKm * 10 + (r.mean || 0); let best;
    if (cfg.goal === 'variado') best = all.filter(r => r.exc === 0 && r.over === 0 && r.nodKm === 0).sort((a, b) => b.sd - a.sd)[0];
    if (!best) best = [...all].sort((a, b) => key(a) - key(b))[0];
    return { best, alts: [...all].sort((a, b) => key(a) - key(b)).filter(r => r !== best).slice(0, 3), cfg };
  },
  async plan(lat, lon, cfg) { const all = []; for (let h = 0; h < 16; h++) all.push(this.evalRoute(lat, lon, h * Math.PI / 8, cfg.km, cfg.limit)); const ok = await this.refine(all); const p = this.choose(all, cfg); p.src = ok ? 'terrain' : 'grid'; return p; },
  verdict(r) {
    if (r.exc > 0) return { cls: 'ko', key: 'exc', t: L('No compatible', 'Not compatible'), d: L(`Cruza ${nf(r.excKm, 1)} km de zona excluida (clima, vegetación o área protegida).`, `Crosses ${nf(r.excKm, 1)} km of excluded area (climate, vegetation or protected).`) };
    if (r.over > 0) return { cls: 'ko', key: 'over', t: L('No compatible con tu límite', 'Not compatible with your limit'), d: L(`${nf(r.overKm, 1)} km superan ${r.limit}°.`, `${nf(r.overKm, 1)} km exceed ${r.limit}°.`) };
    if (r.nodKm > 0) return { cls: 'warn', key: 'nod', t: L('Evaluación incompleta', 'Incomplete assessment'), d: L(`${nf(r.nod)}% del recorrido no se pudo evaluar. No se declara compatible.`, `${nf(r.nod)}% of the route could not be evaluated. Not declared compatible.`) };
    return { cls: 'ok', key: 'ok', t: L('Compatible con tus límites', 'Compatible with your limits'), d: L('Corredor candidato para un ensayo. Requiere reconocimiento de campo.', 'Candidate corridor for a test. Field reconnaissance required.') };
  },
  open(keep) {
    if (!keep) stopSim(); if (!S.sel) openZone(ranked('sim')[0].z.id);
    S.simKind = 'rover'; const c = this.cfg(), P = $('#sim'), done = keep && S.last.rover && S.last.rover.id === S.sel.id; P.classList.remove('hidden');
    P.innerHTML = `<div class="phead"><h3>${ic('route', 18)} ${L('Ensayo de rover', 'Rover test')}</h3><button type="button" class="icbtn" id="simX" aria-label="${L('Cerrar', 'Close')}">${ic('x')}</button></div>
      ${stepper(done ? 1 : 0, 3)}<p class="hint">${L('¿Mi rover puede operar aquí?', 'Can my rover operate here?')} · ${esc(selName(S.sel))}</p>
      <div id="cfg" class="${done ? 'hidden' : ''}"><div class="form"><label>${L('Pendiente máx. de tu equipo (°)', 'Your equipment max slope (°)')}<input id="rLimit" type="number" inputmode="decimal" min="3" max="35" step="1" value="${c.limit}"></label>
        <label>${L('Distancia', 'Distance')}<select id="rKm">${[1, 3, 5].map(k => `<option value="${k}" ${k == c.km ? 'selected' : ''}>${k} km</option>`).join('')}</select></label>
        <label class="full">${L('Objetivo', 'Goal')}<select id="rGoal"><option value="suave" ${c.goal === 'suave' ? 'selected' : ''}>${L('Ruta más suave (navegación básica)', 'Smoothest route (basic navigation)')}</option><option value="variado" ${c.goal === 'variado' ? 'selected' : ''}>${L('Circuito con pendientes variadas', 'Circuit with varied slopes')}</option></select></label></div>
        <p class="note">${L('Referencia de cribado: 10° deslizamiento y 17° atascamiento en arena (ensayos JPL con Curiosity). El límite real es el de tu equipo.', 'Screening reference: 10° slip and 17° embedding in sand (JPL tests with Curiosity). The real limit is your equipment’s.')}</p></div>
      <div id="cfgSum" class="sum ${done ? '' : 'hidden'}"><span>${c.limit}° · ${c.km} km · ${c.goal === 'suave' ? L('ruta suave', 'smooth') : L('circuito variado', 'varied')}</span><button type="button" class="linkbtn" id="cfgEdit">${L('Editar', 'Edit')}</button></div>
      <p class="err hidden" id="rErr" role="alert"></p>
      <button type="button" class="btn primary full" id="rRun">${ic('play', 14)} ${L('Evaluar 16 rutas', 'Evaluate 16 routes')}</button><div id="rOut"></div>`;
    $('#simX').onclick = stopSim; $('#rRun').onclick = () => this.run(); $('#cfgEdit').onclick = () => { $('#cfg').classList.remove('hidden'); $('#cfgSum').classList.add('hidden'); };
    if (done) this.render(S.last.rover.plan, S.last.rover.active);
  },
  async run() {
    const request = ++S.simRequest, selection = S.sel?.id, runButton = $('#rRun');
    try {
      S.last.rLimit = readNum('rLimit', 3, 35, L('Pendiente máxima', 'Maximum slope'));
      $('#rErr').classList.add('hidden'); S.last.rKm = +$('#rKm').value; S.last.rGoal = $('#rGoal').value;
      if (runButton) runButton.disabled = true;
      $('#rOut').innerHTML = `<p class="note" role="status">${L('Midiendo pendientes con el relieve (~30 m)…', 'Measuring slopes from terrain (~30 m)…')}</p>`;
      const cfg = this.cfg(), s = ctxStats(S.sel), meta = runMeta(), plan = await this.plan(s.lat, s.lon, cfg);
      if (request !== S.simRequest || selection !== S.sel?.id || S.simKind !== 'rover' || !$('#rOut')) return null;
      S.last.rover = { ...meta, cfg, plan, active: plan.best }; S.last.roverCmp = null;
      $('#cfg').classList.add('hidden'); $('#cfgSum').classList.remove('hidden'); $('#cfgSum span').textContent = `${cfg.limit}° · ${cfg.km} km · ${cfg.goal === 'suave' ? L('ruta suave', 'smooth') : L('circuito variado', 'varied')}`;
      simStart(); this.show(plan.best); this.render(plan, plan.best);
      return S.last.rover;
    } catch (error) {
      if (request === S.simRequest && $('#rErr')) { $('#rErr').textContent = error.message; $('#rErr').classList.remove('hidden'); }
      return null;
    } finally { if (runButton?.isConnected) runButton.disabled = false; }
  },
  show(r) {
    clearSimEnts(); SimulationView.mount(L('Rover', 'Rover')); polySegs(r.pts, r.segs);
    const stopAt = r.first >= 0 ? r.first : r.pts.length - 1, pts = r.pts.slice(0, stopAt + 1); let message = L('Recorrido finalizado', 'Route finished');
    if (r.first >= 0) { const p = r.pts[r.first], sg = r.segs[r.first]; message = sg.st === 'exc' ? L('Detenido: zona excluida', 'Stopped: excluded area') : L(`Detenido: ${nf(sg.v, 1)}° > ${r.limit}°`, `Stopped: ${nf(sg.v, 1)}° > ${r.limit}°`);
      addE({ position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat), point: { pixelSize: 12, color: Cesium.Color.fromCssColorString(PAL.bad), outlineColor: Cesium.Color.WHITE, outlineWidth: 2, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, disableDepthTestDistance: 5e5 },
        label: { text: message, font: '14px IBM Plex Sans', pixelOffset: new Cesium.Cartesian2(0, -20), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('rgba(8,14,28,.75)'), disableDepthTestDistance: 5e5 } }); }
    SimulationView.play({ points: pts.length > 1 ? pts : [pts[0]], overviewPoints: r.pts, uri: 'models/curiosity.glb', name: 'Rover Curiosity', seconds: Math.max(12, 45 * pts.length / r.pts.length), endMessage: message, heading: r.h, realSeconds: r.length * (pts.length / r.pts.length) / 0.1 * 3600 });
  },
  render(plan, r) {
    const v = this.verdict(r), isBest = r === plan.best;
    $('#rOut').innerHTML = `<div class="verdict ${v.cls}"><b>${v.t}</b>${v.d}</div>
      ${isBest ? '' : `<p class="note">${L('Mostrando una alternativa; el informe y la exportación usan esta ruta activa.', 'Showing an alternative; report and export use this active route.')}</p>`}
      <div class="kv"><div>${L('Rumbo', 'Heading')}<b>${hd(r.h)}</b></div><div>${L('Longitud real', 'Actual length')}<b>${nf(r.length, 2)} km</b></div><div>${L('Bajo tu límite', 'Under your limit')}<b>${nf(r.ok)}%</b>${L('de la longitud', 'of length')}</div><div>${L('Pendiente máx.', 'Max slope')}<b>${nf(r.max, 1)}°</b></div></div>
      <div class="card"><h5>${L('Perfil de pendiente', 'Slope profile')}</h5>${Charts.profile(r.segs, r.limit)}</div>
      <div class="card" data-key="ralt"><h5>${L('Alternativas', 'Alternatives')} <span>${plan.alts.length}</span></h5>${[plan.best, ...plan.alts].filter(a => a !== r).slice(0, 3).map((a, k) => `<button type="button" class="rk" data-h="${a.h}"><span class="n">${hd(a.h)}</span><span class="nm"><b>${this.verdict(a).t}</b><small>${nf(a.ok)}% ${L('bajo el límite', 'under limit')} · ${L('máx.', 'max')} ${nf(a.max, 1)}°</small></span></button>`).join('')}</div>
      <div class="card" data-key="rcmp"><h5>${L('Comparar en otra zona', 'Compare in another zone')}</h5><div class="form" style="grid-template-columns:1fr auto;margin:0"><select id="rCmpZ" aria-label="${L('Zona a comparar', 'Zone to compare')}">${S.M.zones.filter(z => !S.sel.z || z.id !== S.sel.z.id).map(z => `<option value="${z.id}">${z.name}</option>`).join('')}</select><button type="button" class="btn sm" id="rCmp">${ic('cmp', 14)} ${L('Comparar', 'Compare')}</button></div><div id="rCmpOut"></div></div>
      <div class="card" data-key="rdet"><h5>${L('Detalles y alcance', 'Details and scope')}</h5><table class="cmp"><tr><td>${L('Desnivel acumulado', 'Cumulative gain')}</td><td>${nf(r.gain)} m</td></tr><tr><td>${L('Sin evaluar', 'Not evaluated')}</td><td>${nf(r.nod)}%</td></tr><tr><td>${L('Celdas de 1 km cruzadas', '1 km cells crossed')}</td><td>${r.cells}</td></tr></table>
        <p class="note">${plan.src === 'terrain' ? L('Datos usados para evaluar: pendiente a lo largo de la ruta entre puntos cada 100 m, con el relieve de Cesium World Terrain (~30 m). Requisitos de clima y exclusiones: celdas de 1 km.', 'Data used to evaluate: along-route slope between points every 100 m from Cesium World Terrain (~30 m). Climate and exclusion requirements: 1 km cells.') : L('Relieve detallado no disponible: pendiente media de celdas de 1 km (SRTM). Muestrear cada 100 m no agrega resolución.', 'Detailed terrain unavailable: mean slope of 1 km cells (SRTM). Sampling every 100 m adds no resolution.')} ${L('Es un corredor preliminar, no una simulación de navegación: no detecta rocas, arena ni firmeza del suelo.', 'A preliminary corridor, not a navigation simulation: it does not detect rocks, sand or soil bearing.')}</p></div>
      <div class="acts2"><button type="button" class="btn sm" id="rRep">${ic('file', 14)} ${L('Informe PDF', 'PDF report')}</button><button type="button" class="btn sm" id="rStop">${ic('stop', 14)} ${L('Terminar', 'Finish')}</button></div>`;
    $('#rOut').querySelectorAll('.rk[data-h]').forEach(el => el.onclick = () => { const a = [plan.best, ...plan.alts].find(x => String(x.h) === el.dataset.h); S.last.rover.active = a; S.last.roverCmp = null; this.show(a); this.render(plan, a); });
    accordionize($('#rOut'), 1); $('#rCmp').onclick = () => this.compare($('#rCmpZ').value); $('#rStop').onclick = stopSim; $('#rRep').onclick = () => Report.open(reportCtx());
    $('#sim').querySelector('.steps').outerHTML = stepper(1, 3);
  },
  async compare(zid) {
    const request = ++S.simRequest, original = S.last.rover, output = $('#rCmpOut');
    if (!original || !output) return;
    $('#rCmpOut').innerHTML = `<p class="note">${L('Evaluando…', 'Evaluating…')}</p>`;
    const z = zoneById(zid), s = S.zstats[zid], A = S.last.rover, B = await this.plan(s.lat, s.lon, A.cfg), ra = A.active, rb = B.best, va = this.verdict(ra), vb = this.verdict(rb);
    if (request !== S.simRequest || S.last.rover !== original || !output.isConnected || S.simKind !== 'rover') return;
    S.last.roverCmp = { of: A.time, plan: B, name: z.name };
    const rank = v => ({ ok: 2, warn: 1, ko: 0 })[v.cls];
    let cls, title, txt;
    if (rank(va) === 0 && rank(vb) === 0) { cls = 'ko'; title = L('Ninguna cumple tus límites', 'Neither meets your limits'); const lw = ra.ok >= rb.ok ? A.name : z.name; txt = L(`La menos desfavorable es ${lw} (más longitud bajo el límite), pero no se recomienda para este ensayo.`, `The least unfavourable is ${lw} (more length under the limit), but it is not recommended for this test.`); }
    else if (rank(va) === 1 && rank(vb) === 1) { cls = 'warn'; title = L('Información insuficiente', 'Insufficient information'); txt = L('Ambas rutas tienen tramos sin evaluar. Hace falta reconocimiento antes de decidir.', 'Both routes have unevaluated segments. Reconnaissance is needed before deciding.'); }
    else if (rank(va) === rank(vb) && Math.abs(ra.ok - rb.ok) < 2 && Math.abs((ra.max || 0) - (rb.max || 0)) < 1) { cls = 'warn'; title = L('Empate técnico', 'Technical tie'); txt = L('Con estos criterios no hay diferencia relevante; decide por logística.', 'With these criteria there is no relevant difference; decide on logistics.'); }
    else { const aWin = rank(va) > rank(vb) || (rank(va) === rank(vb) && (ra.ok > rb.ok || (ra.ok === rb.ok && (ra.max || 0) <= (rb.max || 0)))); cls = 'ok'; title = L(`Investigar primero: ${aWin ? A.name : z.name}`, `Investigate first: ${aWin ? A.name : z.name}`); txt = L('Mismos límites; su ruta candidata es más compatible.', 'Same limits; its candidate route is more compatible.'); }
    const row = (l, a, b) => `<tr><td>${l}</td><td>${a}</td><td>${b}</td></tr>`;
    $('#rCmpOut').innerHTML = `<table class="cmp" style="margin-top:8px"><tr><th></th><th>${esc(A.name)}</th><th>${z.name}</th></tr>${row(L('Veredicto', 'Verdict'), va.t, vb.t)}${row(L('Bajo el límite', 'Under limit'), nf(ra.ok) + '%', nf(rb.ok) + '%')}${row(L('Pendiente máx.', 'Max slope'), nf(ra.max, 1) + '°', nf(rb.max, 1) + '°')}${row(L('Sin evaluar', 'Not evaluated'), nf(ra.nod) + '%', nf(rb.nod) + '%')}${row(L('Carretera', 'Road'), nf(ctxStats(S.sel).road, 1) + ' km', nf(s.road, 1) + ' km')}</table>
      <div class="verdict ${cls}"><b>${title}</b>${txt}</div>`;
    $('#sim').querySelector('.steps').outerHTML = stepper(2, 3);
  }
};


/* ---------- EVA / sampling route ---------- */
const OBJ = { fe: [L.bind(null, 'Óxidos de hierro', 'Iron oxides')], cs: [L.bind(null, 'Sulfatos y arcillas', 'Sulfates and clays')], sim: [L.bind(null, 'Mayor similitud', 'Highest similarity')] };
const objLab = k => OBJ[k][0]();
function objWhy(o) { const G = S.G; return o.k === 'fe' ? L(`Indicio EMIT: Fe ${nf(G.fe[o.i])}%`, `EMIT indication: Fe ${nf(G.fe[o.i])}%`) : o.k === 'cs' ? L(`Indicio EMIT: sulfatos/arcillas ${nf(G.cs[o.i])}%`, `EMIT indication: sulfates/clays ${nf(G.cs[o.i])}%`) : L(`Similitud ${nf(S.sim[o.i])}`, `Similarity ${nf(S.sim[o.i])}`); }
function objReason(r) {
  if (!r) return '';
  if (r.k === 'time') return L(`no alcanza el tiempo (${nf(r.need, 1)} h > ${nf(r.have, 1)} h útiles)`, `not enough time (${nf(r.need, 1)} h > ${nf(r.have, 1)} usable h)`);
  if (r.k === 'exc') return L(`el camino de ${r.leg === 'back' ? 'regreso' : 'ida'} cruza una zona excluida`, `the ${r.leg === 'back' ? 'return' : 'outbound'} path crosses an excluded area`);
  return L(`el camino de ${r.leg === 'back' ? 'regreso' : 'ida'} supera ${r.limit}° (${nf(r.v, 1)}°)`, `the ${r.leg === 'back' ? 'return' : 'outbound'} path exceeds ${r.limit}° (${nf(r.v, 1)}°)`);
}
const Eva = {
  kind: 'eva',
  cfg() { return Object.assign({ R: 2, hours: 4, speed: 2, reserve: 25, task: 20, limit: Math.min(S.f.slope, 15) }, S.last.evaCfg || {}); },
  open(kind = this.kind, keep) {
    if (!keep) stopSim(); if (!S.sel) openZone(ranked('sim')[0].z.id);
    this.kind = kind; S.simKind = 'eva'; const c = this.cfg(), P = $('#sim'), st = kind === 'sample', done = keep && S.last.eva && S.last.eva.id === S.sel.id; P.classList.remove('hidden');
    const inp = (id, l, v, min, max, sp = 1) => `<label>${l}<input id="${id}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${sp}" value="${v}"></label>`;
    P.innerHTML = `<div class="phead"><h3>${ic(st ? 'flask' : 'tent', 18)} ${st ? L('Ruta de muestreo', 'Sampling route') : L('Ensayo de misión análoga', 'Analog mission test')}</h3><button type="button" class="icbtn" id="simX" aria-label="${L('Cerrar', 'Close')}">${ic('x')}</button></div>
      ${stepper(done ? 1 : 0, 2)}<p class="hint">${st ? L('¿Qué puntos minerales alcanzo a pie desde una base?', 'Which mineral points can I reach on foot from a base?') : L('¿Dónde va el hábitat y qué objetivos alcanza la tripulación?', 'Where does the habitat go and which objectives can the crew reach?')} · ${esc(selName(S.sel))}</p>
      <div id="cfg" class="${done ? 'hidden' : ''}"><div class="form">${inp('eR', L('Radio (km)', 'Radius (km)'), c.R, .5, 5, .5)}${inp('eH', L('Tiempo de EVA (h)', 'EVA time (h)'), c.hours, .5, 10, .5)}${inp('eV', L('Velocidad a pie (km/h)', 'Walking speed (km/h)'), c.speed, .5, 6, .5)}${inp('eRes', L('Reserva de regreso (%)', 'Return reserve (%)'), c.reserve, 0, 60, 5)}${inp('eT', L('Tiempo por objetivo (min)', 'Time per objective (min)'), c.task, 0, 120, 5)}${inp('eL', L('Pendiente máx. a pie (°)', 'Max walking slope (°)'), c.limit, 3, 35, 1)}</div>
        <p class="note">${L('Supuestos tuyos. Sirve para comparar escenarios; no certifica la seguridad de una caminata real.', 'Your assumptions. Useful to compare scenarios; it does not certify the safety of a real walk.')}</p></div>
      <div id="cfgSum" class="sum ${done ? '' : 'hidden'}"><span>${c.R} km · ${c.hours} h · ${c.speed} km/h · ${c.limit}°</span><button type="button" class="linkbtn" id="cfgEdit">${L('Editar', 'Edit')}</button></div>
      <p class="err hidden" id="eErr" role="alert"></p>
      <button type="button" class="btn primary full" id="eRun">${ic('play', 14)} ${L('Planificar', 'Plan')}</button><div id="eOut"></div>`;
    $('#simX').onclick = stopSim; $('#eRun').onclick = () => this.run(false); $('#cfgEdit').onclick = () => { $('#cfg').classList.remove('hidden'); $('#cfgSum').classList.add('hidden'); };
    if (done) this.render(S.last.eva.p);
  },
  leg(a, b, limit) { // samples every ~200 m; tracks max slope, first blocking sample and unevaluated length
    const d = hav(a.lat, a.lon, b.lat, b.lon), n = Math.max(2, Math.ceil(d * 5)); let max = 0, bad = null, nodKm = 0;
    for (let k = 1; k <= n; k++) { const p = { lat: a.lat + (b.lat - a.lat) * (k - .5) / n, lon: a.lon + (b.lon - a.lon) * (k - .5) / n }, st = sampleStatus(p.lat, p.lon, limit);
      if (st.v != null) max = Math.max(max, st.v); if (st.st === 'nod') nodKm += d / n; if (!bad && (st.st === 'over' || st.st === 'exc')) bad = st; }
    return { d, max, bad, nodKm };
  },
  plan(c, force) {
    const G = S.G, s = ctxStats(S.sel), st = this.kind === 'sample';
    const pool = S.sel.kind === 'zone' ? S.sel.cells : (() => { const out = []; for (let i = 0; i < G.status.length; i++) { if (G.status[i] !== 1) continue; const p = cellLL(i); if (hav(p.lat, p.lon, s.lat, s.lon) <= 3) out.push(i); } return out; })();
    const sorter = (a, b) => (G.slope[a] - G.slope[b]) || ((G.road[a] ?? 99) - (G.road[b] ?? 99));
    const valid = pool.filter(i => passes(i) && G.slope[i] != null && G.slope[i] <= c.limit).sort(sorter);
    let habC = valid[0], forced = false;
    if (habC == null) { if (!force) return { c, noSite: true, s }; habC = pool.filter(i => G.slope[i] != null).sort(sorter)[0]; forced = true; }
    const hab = cellLL(habC), near = [];
    for (let i = 0; i < G.status.length; i++) { if (G.status[i] !== 1 || i === habC) continue; const p = cellLL(i), d = hav(p.lat, p.lon, hab.lat, hab.lon); if (d <= c.R && d > .4) near.push({ i, d, p }); }
    const chosen = [], pick = (fn, k) => { const b = near.filter(n => fn(n.i) != null && !chosen.some(x => x.i === n.i)).sort((a, b) => fn(b.i) - fn(a.i))[0]; if (b) chosen.push({ ...b, k }); };
    pick(i => G.fe[i], 'fe'); pick(i => G.fe[i] == null ? null : G.cs[i], 'cs'); if (!st) pick(i => S.sim[i], 'sim'); else { pick(i => G.fe[i], 'fe'); pick(i => G.fe[i] == null ? null : G.cs[i], 'cs'); }
    const budget = c.hours * 60 * (1 - c.reserve / 100), plan = [], out = []; let cur = hab, t = 0, dist = 0, maxS = 0, nodKm = 0; const rest = [...chosen];
    while (rest.length) {
      rest.sort((a, b) => hav(cur.lat, cur.lon, a.p.lat, a.p.lon) - hav(cur.lat, cur.lon, b.p.lat, b.p.lon)); const o = rest.shift();
      const go = this.leg(cur, o.p, c.limit), back = this.leg(o.p, hab, c.limit), tGo = go.d / c.speed * 60, tBack = back.d / c.speed * 60;
      if (go.bad) { out.push({ ...o, reason: { k: go.bad.st === 'exc' ? 'exc' : 'slope', leg: 'go', v: go.bad.v, limit: c.limit } }); continue; }
      if (back.bad) { out.push({ ...o, reason: { k: back.bad.st === 'exc' ? 'exc' : 'slope', leg: 'back', v: back.bad.v, limit: c.limit } }); continue; }
      if (t + tGo + c.task + tBack > budget) { out.push({ ...o, reason: { k: 'time', need: (t + tGo + c.task + tBack) / 60, have: budget / 60 } }); continue; }
      t += tGo + c.task; dist += go.d; maxS = Math.max(maxS, go.max); nodKm += go.nodKm; plan.push(o); cur = o.p;
    }
    const ret = this.leg(cur, hab, c.limit); t += ret.d / c.speed * 60; dist += ret.d; maxS = Math.max(maxS, ret.max); nodKm += ret.nodKm;
    return { c, hab, habC, forced, plan, out, t, dist, maxS, nodKm, retBad: ret.bad, s, reserveLeft: c.hours * 60 - t, kind: this.kind };
  },
  run(force) {
    let c;
    try { c = { R: readNum('eR', .5, 5, L('Radio', 'Radius')), hours: readNum('eH', .5, 10, L('Tiempo', 'Time')), speed: readNum('eV', .5, 6, L('Velocidad', 'Speed')), reserve: readNum('eRes', 0, 60, L('Reserva', 'Reserve')), task: readNum('eT', 0, 120, L('Tiempo por objetivo', 'Time per objective')), limit: readNum('eL', 3, 35, L('Pendiente', 'Slope')) }; }
    catch (e) { $('#eErr').textContent = e.message; $('#eErr').classList.remove('hidden'); return; }
    $('#eErr').classList.add('hidden'); S.last.evaCfg = c;
    const p = this.plan(c, force);
    if (p.noSite) {
      $('#eOut').innerHTML = `<div class="verdict ko"><b>${L('No hay emplazamiento compatible', 'No compatible site')}</b>${L(`Ninguna celda cumple tus requisitos con pendiente ≤ ${c.limit}°.`, `No cell meets your requirements with slope ≤ ${c.limit}°.`)}</div>
        <button type="button" class="btn sm" id="eForce">${L('Usar la celda más plana aunque no cumpla', 'Use the flattest cell even if it does not comply')}</button>`;
      $('#eForce').onclick = () => this.run(true); return;
    }
    S.last.eva = { ...runMeta(), cfg: c, p };
    $('#cfg').classList.add('hidden'); $('#cfgSum').classList.remove('hidden'); $('#cfgSum span').textContent = `${c.R} km · ${c.hours} h · ${c.speed} km/h · ${c.limit}°`;
    simStart(); this.draw(p); this.render(p);
  },
  verdict(p) {
    if (!p.plan.length) return { cls: 'ko', t: L('Ningún objetivo alcanzable', 'No reachable objective'), d: L('Con estos supuestos no hay objetivos dentro del tiempo y la pendiente.', 'With these assumptions no objective fits time and slope.') };
    if (p.retBad) return { cls: 'ko', t: L('Regreso final incompatible', 'Final return not compatible'), d: L('El camino de vuelta al hábitat supera tus límites.', 'The way back to the habitat exceeds your limits.') };
    if (p.nodKm > 0) return { cls: 'warn', t: L('Plan con tramos sin evaluar', 'Plan with unevaluated segments'), d: L(`${nf(p.nodKm, 1)} km sin datos; no se declara completo.`, `${nf(p.nodKm, 1)} km without data; not declared complete.`) };
    if (p.out.length) return { cls: 'warn', t: L(`Plan parcial: ${p.plan.length} de ${p.plan.length + p.out.length}`, `Partial plan: ${p.plan.length} of ${p.plan.length + p.out.length}`), d: L('Algunos objetivos se descartaron.', 'Some objectives were discarded.') };
    return { cls: 'ok', t: L('Plan completo dentro de tus límites', 'Complete plan within your limits'), d: L('Ida, regreso y reserva verificados con datos de 1 km.', 'Outbound, return and reserve checked with 1 km data.') };
  },
  async draw(p) {
    SimulationView.mount(p.kind === 'sample' ? L('Muestreo', 'Sampling') : L('Astronauta', 'Astronaut'));
    const gen = SimulationView.generation, { hab, plan, c } = p, [g] = await SimulationView.terrain([hab]); if (gen !== SimulationView.generation) return;
    addE({ position: Cesium.Cartesian3.fromDegrees(hab.lon, hab.lat, g.height), ellipsoid: { radii: new Cesium.Cartesian3(40, 40, 28), maximumCone: Cesium.Math.PI_OVER_TWO, material: Cesium.Color.fromCssColorString('rgba(182,164,240,.25)'), outline: true, outlineColor: Cesium.Color.WHITE.withAlpha(.6), slicePartitions: 24, stackPartitions: 12 },
      label: { text: p.forced ? L('Hábitat (no cumple requisitos)', 'Habitat (does not comply)') : L('Hábitat · celda más plana válida', 'Habitat · flattest valid cell'), font: '14px IBM Plex Sans', pixelOffset: new Cesium.Cartesian2(0, -30), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('rgba(8,14,28,.7)'), disableDepthTestDistance: 5e5 } });
    const ring = []; for (let k = 0; k <= 72; k++) { const q = movePt(hab.lat, hab.lon, c.R, k / 72 * Math.PI * 2); ring.push(q.lon, q.lat); }
    addE({ polyline: { positions: Cesium.Cartesian3.fromDegreesArray(ring), width: 2, clampToGround: true, material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString(PAL.entrenar), dashLength: 18 }) } });
    [...plan, ...p.out].forEach(o => { const inc = plan.includes(o);
      addE({ position: Cesium.Cartesian3.fromDegrees(o.p.lon, o.p.lat), point: { pixelSize: 12, color: Cesium.Color.fromCssColorString(inc ? PAL.iron : PAL.nod), outlineColor: Cesium.Color.WHITE, outlineWidth: 2, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, disableDepthTestDistance: 5e5 },
        label: { text: `${objLab(o.k)} · ${objWhy(o)}${inc ? '' : L(' · descartado', ' · discarded')}`, font: '13px IBM Plex Sans', pixelOffset: new Cesium.Cartesian2(0, -18), showBackground: true, backgroundColor: Cesium.Color.fromCssColorString('rgba(8,14,28,.75)'), disableDepthTestDistance: 5e5 } }); });
    const route = [hab, ...plan.map(o => o.p), hab];
    addE({ polyline: { positions: route.map(q => Cesium.Cartesian3.fromDegrees(q.lon, q.lat)), width: 4, clampToGround: true, material: Cesium.Color.fromCssColorString(PAL.iron).withAlpha(.9) } });
    SimulationView.play({ points: route, uri: 'models/mark3.glb', name: L('Astronauta Mark III', 'Mark III astronaut'), seconds: Math.min(90, Math.max(35, p.dist * 10)), realSeconds: p.t * 60,
      endMessage: plan.length ? L('Regreso al hábitat', 'Back at the habitat') : L('En el hábitat: ningún objetivo alcanzable', 'At the habitat: no reachable objective') });
  },
  render(p) {
    const { c } = p, t = nearestTown(p.hab.lat, p.hab.lon), G = S.G, hi = p.habC, v = this.verdict(p);
    const chk = (ok, txt) => `<div class="it"><span class="${ok ? 'ok' : 'ko'}">${ic(ok ? 'check' : 'x', 14)}</span><span>${txt}</span></div>`;
    $('#eOut').innerHTML = `<div class="verdict ${v.cls}"><b>${v.t}</b>${v.d}</div>${p.forced ? `<p class="err">${L('Hábitat elegido por ti aunque no cumple los requisitos.', 'Habitat chosen by you although it does not comply.')}</p>` : ''}
      <div class="kv"><div>${L('Distancia', 'Distance')}<b>${nf(p.dist, 1)} km</b></div><div>${L('Tiempo', 'Time')}<b>${nf(p.t / 60, 1)} h</b>${L('de', 'of')} ${c.hours} h</div><div>${L('Reserva', 'Reserve')}<b>${nf(p.reserveLeft)} min</b></div><div>${L('Pendiente máx.', 'Max slope')}<b>${nf(p.maxS, 1)}°</b></div></div>
      <div class="card"><h5>${L('Objetivos', 'Objectives')}</h5><div class="list">
        ${p.plan.map(o => `<div class="it"><span class="ok">${ic('check', 14)}</span><span><b>${objLab(o.k)}</b> · ${objWhy(o)}</span></div>`).join('')}
        ${p.out.map(o => `<div class="it"><span class="ko">${ic('x', 14)}</span><span><b>${objLab(o.k)}</b> · ${L('descartado', 'discarded')}: ${objReason(o.reason)}</span></div>`).join('')}
        ${!p.plan.length && !p.out.length ? `<div class="it">${L('No hay celdas candidatas dentro del radio.', 'No candidate cells within the radius.')}</div>` : ''}</div>
        <p class="note">${L('Indicios satelitales (EMIT ~60 m agregado a 1 km), no muestras confirmadas.', 'Remote indications (EMIT ~60 m aggregated to 1 km), not confirmed samples.')}</p></div>
      <div class="card" data-key="ereq"><h5>${L('Requisitos de la misión', 'Mission requirements')}</h5><div class="list">
        ${chk((G.road[hi] ?? 99) <= S.f.road, L(`Acceso: carretera a ${nf(G.road[hi], 1)} km (límite ${S.f.road})`, `Access: road at ${nf(G.road[hi], 1)} km (limit ${S.f.road})`))}
        ${chk(t.d <= 60, L('Ciudad de apoyo: ', 'Support town: ') + t.txt)}
        ${chk((G.slope[hi] ?? 99) <= 5, L(`Hábitat en terreno plano: ${nf(G.slope[hi], 1)}°`, `Habitat on flat ground: ${nf(G.slope[hi], 1)}°`))}
        ${chk((G.ntl[hi] ?? 0) <= .5, L(`Cielo oscuro: VIIRS ${nf(G.ntl[hi], 2)}`, `Dark sky: VIIRS ${nf(G.ntl[hi], 2)}`))}
        ${chk(!G.anp[hi], L('Fuera de área protegida', 'Outside protected area'))}
        ${chk(!p.retBad, L('Regreso final verificado', 'Final return checked'))}</div></div>
      <div class="acts2"><button type="button" class="btn sm" id="eRep">${ic('file', 14)} ${L('Informe PDF', 'PDF report')}</button><button type="button" class="btn sm" id="eStop">${ic('stop', 14)} ${L('Terminar', 'Finish')}</button></div>`;
    accordionize($('#eOut'), 2); $('#eStop').onclick = stopSim; $('#eRep').onclick = () => Report.open(reportCtx());
    $('#sim').querySelector('.steps').outerHTML = stepper(1, 2);
  }
};


/* ---------- Report context (only results that belong to the current selection) ---------- */
function reportCtx() {
  const t = S.sel || { kind: 'zone', id: ranked('sim')[0].z.id, z: ranked('sim')[0].z, cells: ranked('sim')[0].z.cells }, s = ctxStats(t);
  let snap = null; try { viewer.render(); snap = viewer.canvas.toDataURL('image/jpeg', .82); } catch (e) { }
  const R = S.last.rover && S.last.rover.id === t.id ? S.last.rover : null, E = S.last.eva && S.last.eva.id === t.id ? S.last.eva : null;
  return { t, s, lang: S.lang, name: selName(t), region: t.z ? t.z.region : L('Sur del Perú', 'Southern Peru'), mode: S.mode, mname: mname(S.mode), f: { ...S.f },
    Y: yungay(), U: utah(), yS: analogScore(yungay()), uS: analogScore(utah()), yN: analogNorm(yungay()), uN: analogNorm(utah()), range: t.kind === 'zone' ? range(t.id) : null,
    rover: R, roverCmp: R && S.last.roverCmp && S.last.roverCmp.of === R.time ? S.last.roverCmp : null, eva: E,
    town: nearestTown(s.lat, s.lon), refs: REFS, AN, G: S.G, overlay: overlayCanvas, outline: cellOutline(t.cells), cellsLL: t.cells.map(cellLL),
    verdictRover: r => Rover.verdict(r), verdictEva: p => Eva.verdict(p), objLab, objWhy, objReason, whyF: st => whyData(t, st), statsF: () => statsOf(t.cells), aiClass, trace: TRACE, robust: S.M.robust, allSim: Array.from(S.sim), passes, snap, modeName: k => mname(k) };
}

/* ---------- Method & validation page ---------- */
function openMethod() {
  const M = $('#method'), R = S.M.robust, oos = S.M.oos, ids = ['algarrobal', 'islay', 'ilojb', 'yungay', 'lajoya', 'clemesi', 'utah'];
  const names = { yungay: 'Yungay (Atacama)', utah: 'Utah MDRS' }; S.M.zones.forEach(z => names[z.id] = z.name);
  const W = 560, rh = 26, X = v => 150 + (W - 170) * v / 100;
  let svg = `<line x1="${X(0)}" x2="${X(100)}" y1="${ids.length * rh + 4}" y2="${ids.length * rh + 4}" stroke="rgba(255,255,255,.2)"/>`;
  [0, 25, 50, 75, 100].forEach(v => svg += `<text x="${X(v)}" y="${ids.length * rh + 18}" text-anchor="middle">${v}</text>`);
  ids.forEach((k, j) => { const r = R.range[k], y = j * rh + 12, col = k === 'yungay' ? PAL.yungay : k === 'utah' ? PAL.utah : plasmaHex(r[1] / 100);
    const def = k === 'yungay' ? analogScore(yungay()) : k === 'utah' ? analogScore(utah()) : S.zstats[k].sim;
    svg += `<text x="0" y="${y + 4}" style="fill:#e3e6ec">${names[k]}</text><line x1="${X(r[0])}" x2="${X(r[2])}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity=".55"/><circle cx="${X(r[1])}" cy="${y}" r="5" fill="${col}"/><line x1="${X(def)}" x2="${X(def)}" y1="${y - 8}" y2="${y + 8}" stroke="#fff" stroke-width="2"/><text x="${X(r[2]) + 8}" y="${y + 4}">${nf(r[0])}–${nf(r[2])}</text>`; });
  M.innerHTML = `<div class="mpage">
    <div class="mhead"><button type="button" class="btn" id="mBack">${ic('back', 15)} ${L('Volver al mapa', 'Back to the map')}</button><h2>${L('Método y validación', 'Method and validation')}</h2></div>
    <section class="mgrid">
      <div class="mcard"><h3>1 · ${L('Similitud ambiental con Marte', 'Environmental similarity to Mars')}</h3>
        <p>${L('¿Se parece el clima y el suelo a Marte? Igual para todos los usuarios.', 'Do climate and soil resemble Mars? Same for every user.')}</p>
        <ul class="f"><li><b style="color:${PAL.temp}">${iname('T')}</b> = ΔT / 80 °C <small>${L('(suelo de Gale, REMS)', '(Gale ground, REMS)')}</small></li>
          <li><b style="color:${PAL.arid}">${iname('A')}</b> = (0.20 − AI) / (0.20 − AI<sub>Yungay</sub>) <small>(${L('PNUMA; Yungay es el ancla', 'UNEP; Yungay is the anchor')})</small></li>
          <li><b style="color:${PAL.iron}">${iname('M')}</b> = ½ (Fe% + ${L('sulf./arc.', 'sulf./clays')}%) <small>(NASA EMIT)</small></li>
          <li>${L('Promedio simple de los indicadores disponibles (OCDE/JRC). Se muestra cuántos se usaron.', 'Simple mean of available indicators (OECD/JRC). The number used is shown.')}</li></ul></div>
      <div class="mcard"><h3>2 · ${L('Aptitud para tu misión', 'Suitability for your mission')}</h3>
        <p>${L('¿Puedo operar ahí? Cambia según el modo y tus requisitos (análogos funcionales, Foucher et al. 2021).', 'Can I operate there? Changes with mode and requirements (functional analogues, Foucher et al. 2021).')}</p>
        <ul class="f"><li>${L('Pendiente ≤ tu límite (cribado inspirado en ensayos JPL)', 'Slope ≤ your limit (screening inspired by JPL tests)')}</li><li>${L('Carretera ≤ tu distancia', 'Road ≤ your distance')}</li><li>${L('Fuera de áreas protegidas · cielo oscuro · datos EMIT (según modo)', 'Outside protected areas · dark sky · EMIT data (by mode)')}</li>
          <li>${L('Aptitud = % del área que cumple todo.', 'Suitability = % of area meeting all.')}</li></ul></div>
    </section>
    <section class="mcard"><h3>3 · ${L('Robustez: ¿cambia el resultado si cambio el método?', 'Robustness: does the result change if the method changes?')}</h3>
      <p>${L(`${R.runs} corridas: referencia térmica 60/80/100 °C, aridez lineal o logarítmica, dos anclas de aridez y pesos al azar (semilla ${R.seed}).`, `${R.runs} runs: thermal reference 60/80/100 °C, linear or log aridity, two aridity anchors and random weights (seed ${R.seed}).`)}</p>
      <div class="stats"><div><b>${nf(R.top3_new)}%</b><small>${L('las 3 zonas nuevas forman el top 3', 'the 3 new zones form the top 3')}</small></div><div><b>${nf(R.lajoya_gt_utah)}%</b><small>${L('La Joya supera a Utah', 'La Joya above Utah')}</small></div><div><b>${nf(R.yungay_gt_utah)}%</b><small>${L('Yungay supera a Utah', 'Yungay above Utah')}</small></div></div>
      <svg width="100%" viewBox="0 0 ${W} ${ids.length * rh + 24}">${svg}</svg>
      <p class="note">${L('Barra = rango de 5% a 95%; punto = mediana; línea blanca = nota del mapa (configuración por defecto). El orden es estable; la cifra exacta depende del método. Por eso mostramos rangos.', 'Bar = 5% to 95% range; dot = median; white tick = map score (default settings). The ranking is stable; the exact figure depends on the method. That is why we show ranges.')}</p></section>
    <section class="mgrid">
      <div class="mcard"><h3>4 · ${L('Prueba fuera de muestra', 'Out-of-sample test')}</h3>
        ${oos ? `<p>${L(`Análogos publicados frente a ${oos.n_background} puntos de tierra al azar. AUC = ${nf(oos.auc, 2)} (0.5 = azar, 1 = perfecto).`, `Published analogs vs ${oos.n_background} random land points. AUC = ${nf(oos.auc, 2)} (0.5 = chance, 1 = perfect).`)}</p><table class="cmp">${oos.sites.map(x => `<tr><td>${x.site}</td><td>${x.percentile_vs_random_land == null ? '—' : nf(x.percentile_vs_random_land) + '%'}</td></tr>`).join('')}</table>`
        : `<p>${L('Pendiente de ejecutar. Compara 10 análogos publicados (Atacama, Mojave, Valles Secos, Río Tinto…) con 500 puntos de tierra al azar usando térmica y aridez.', 'Pending. Compares 10 published analogs (Atacama, Mojave, Dry Valleys, Rio Tinto…) with 500 random land points using thermal and aridity.')}</p><p class="note"><code>analysis/gee_out_of_sample.js</code> → <code>analysis/oos_validate.py</code></p>`}</div>
      <div class="mcard"><h3>5 · ${L('Validación en campo (plan)', 'Field validation (plan)')}</h3>
        <ol><li>${L('La Joya (estudios publicados): registrador de temperatura del suelo día/noche.', 'La Joya (published studies): day/night soil temperature logger.')}</li><li>${L('El Algarrobal: muestras de suelo y difracción de rayos X para confirmar EMIT.', 'El Algarrobal: soil samples and X-ray diffraction to confirm EMIT.')}</li><li>${L('Perfil de pendiente con GPS en la ruta del rover propuesta.', 'GPS slope profile along the proposed rover route.')}</li></ol>
        <p class="note">${L('Hasta entonces: modelo de cribado con comprobaciones de consistencia, no un modelo validado.', 'Until then: a screening model with consistency checks, not a validated model.')}</p></div>
    </section>
    <section class="mcard"><h3>${L('Limitaciones', 'Limitations')}</h3><ul>
      <li>${L('Resolución de ~1 km; TerraClimate (~4.6 km) y GPM (~11 km) están interpolados.', '~1 km resolution; TerraClimate (~4.6 km) and GPM (~11 km) are interpolated.')}</li>
      <li>${L('Yungay es el ancla de la aridez; no sirve como prueba independiente.', 'Yungay anchors aridity; it cannot be an independent test.')}</li>
      <li>${L('Utah está en el límite árido/semiárido (AI ≈ 0.20).', 'Utah sits at the arid/semi-arid boundary (AI ≈ 0.20).')}</li>
      <li>${L(`EMIT cubre ${nf(S.M.emitCovAll)}% de las celdas áridas; sin EMIT se usan 2 de 3 indicadores.`, `EMIT covers ${nf(S.M.emitCovAll)}% of arid cells; without EMIT 2 of 3 indicators are used.`)}</li>
      <li>${L('Ningún análogo copia la gravedad, la presión ni la radiación de Marte.', 'No analog reproduces Martian gravity, pressure or radiation.')}</li></ul></section>
    <details class="mcard"><summary><h3 style="display:inline">${L('Referencias', 'References')}</h3></summary><ol class="refs">${Object.values(REFS).map(r => `<li>${r}</li>`).join('')}</ol>
      <p class="note">${L('Scripts reproducibles en la carpeta', 'Reproducible scripts in the folder')} <code>analysis/</code>.</p></details></div>`;
  M.classList.remove('hidden'); $('#mBack').onclick = closeMethod; $('#mBack').focus();
}
function closeMethod() { $('#method').classList.add('hidden'); }

/* ---------- Intro / home ---------- */
function renderIntro() {
  $('#introKicker').textContent = L('NASA SPACE APPS CHALLENGE 2026 · MOQUEGUA, PERÚ', 'NASA SPACE APPS CHALLENGE 2026 · MOQUEGUA, PERU');
  $('#introH1').innerHTML = L('Encontramos <span>Marte</span><br>sin salir de Moquegua', 'We found <span>Mars</span><br>without leaving Moquegua');
  $('#introP').textContent = L('De los datos satelitales a la elección de sitios para ensayos análogos: encuentra, compara y planifica dónde probar un rover, entrenar una tripulación o estudiar un suelo parecido a Marte.', 'From satellite data to choosing analog test sites: find, compare and plan where to test a rover, train a crew or study Mars-like soil.');
  $('#introSteps').innerHTML = [['search', L('Encontrar', 'Find'), L('zonas hiperáridas parecidas a Marte', 'hyper-arid Mars-like zones')], ['cmp', L('Comparar', 'Compare'), L('con Yungay, Utah y el cráter Gale', 'with Yungay, Utah and Gale crater')], ['route', L('Planificar', 'Plan'), L('un ensayo y descargar el informe', 'a test and download the report')]]
    .map(([i, a, b]) => `<li>${ic(i, 18)}<span><b>${a}</b> ${b}</span></li>`).join('');
  if (S.G && S.zstats.algarrobal) {
  const best = ranked('sim')[0], newZones = S.M.zones.filter(z => z.new && S.zstats[z.id].cls === aiClass(.01)).length;
  const arid = areaOf(Array.from(S.G.status).map((v, i) => v === 1 ? i : -1).filter(i => i >= 0));
  $('#introStats').innerHTML = `<div class="istat"><b>${nf(arid)}</b><small>${L('km² áridos evaluados', 'arid km² evaluated')}</small></div><div class="istat"><b>${newZones}</b><small>${L('zonas hiperáridas nuevas', 'new hyper-arid zones')}</small></div><div class="istat"><b style="color:#f0d36b">${nf(best.s.sim)}</b><small>${best.z.name} · ${L('rango', 'range')} ${rangeTxt(best.z.id)}</small></div>`; }
  $('#btnExplore').textContent = L('Explorar el mapa', 'Explore the map'); $('#btnIntroTour').textContent = L('Recorrido de 60 s', '60 s tour');
  $('#btnGameIntro').innerHTML = ic('globe', 16) + ' ' + L('Juega: ¿Marte o Tierra?', 'Play: Mars or Earth?');
  $('#introFoot').textContent = L('Equipo 404 Sleep Not Found · Reto: Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars', 'Team 404 Sleep Not Found · Challenge: Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars');
  $('#loading').textContent = S.G ? L('Datos listos', 'Data ready') : L('Cargando datos…', 'Loading data…');
}
function home() { stopSim(); closeFicha(); closeMethod(); S.tourOn = false; $('#caption').classList.add('hidden'); $('#intro').classList.remove('out'); $('#btnExplore').focus(); }
function explore() { spinOn = false; $('#intro').classList.add('out'); flyAOI(); }

/* ---------- Tour ---------- */
const TOUR = () => [
  { t: L('La NASA prueba rovers, entrena tripulaciones y calibra instrumentos en lugares de la Tierra parecidos a Marte.', 'NASA tests rovers, trains crews and calibrates instruments in Mars-like places on Earth.'), s: L('EL RETO', 'THE CHALLENGE'), go: () => fly(-75, -12, 1.4e7, -90, 0, 4) },
  { t: L('Separamos dos preguntas: ¿se parece a Marte? y ¿sirve para mi misión?', 'We separate two questions: does it resemble Mars? and is it useful for my mission?'), s: L('DOS ÍNDICES', 'TWO INDICES'), go: () => flyAOI() },
  { t: L('Similitud ambiental: térmica, aridez (PNUMA) y minerales (EMIT), anclados a Yungay y al cráter Gale.', 'Environmental similarity: thermal, aridity (UNEP) and minerals (EMIT), anchored to Yungay and Gale crater.'), s: L('SIMILITUD', 'SIMILARITY'), go: () => { S.layer = 'sim'; drawOverlay(); fly(-71.3, -17.2, 120000, -50, 20, 4); } },
  { t: L('Tres pampas hiperáridas de Moquegua, Islay e Ilo quedan al nivel de Yungay.', 'Three hyper-arid plains in Moquegua, Islay and Ilo rank at Yungay’s level.'), s: L('HALLAZGO', 'FINDING'), go: () => openZone('algarrobal') },
  { t: L('Un equipo de robótica fija su límite de pendiente; el sistema evalúa 16 rutas con el relieve real.', 'A robotics team sets its slope limit; the system evaluates 16 routes with real terrain.'), s: L('PROBAR', 'TEST'), go: () => { setMode('probar'); Rover.open(); Rover.run(); } },
  { t: L('Una tripulación ubica su hábitat y planifica una EVA con ida, regreso y reserva verificados.', 'A crew places its habitat and plans an EVA with checked outbound, return and reserve.'), s: L('ENTRENAR', 'TRAIN'), go: () => { stopSim(); setMode('entrenar'); Eva.open('eva'); Eva.run(false); } },
  { t: L('Todo termina en un informe con fuentes, rango de incertidumbre y lo que falta verificar en campo.', 'Everything ends in a report with sources, uncertainty range and what to verify in the field.'), s: L('INFORME', 'REPORT'), go: () => { stopSim(); setMode('estudiar'); openZone('algarrobal'); } }
];
async function tour() {
  if (S.tourOn) return; S.tourOn = true; spinOn = false; $('#intro').classList.add('out'); const C = $('#caption'); C.classList.remove('hidden'); const T = TOUR();
  for (let k = 0; k < T.length && S.tourOn; k++) {
    C.innerHTML = `${T[k].t}<small>${T[k].s} · ${k + 1}/${T.length} &nbsp; <button type="button" class="linkbtn" id="tourX">${L('Salir', 'Exit')}</button></small><div class="bar"><i style="width:${100 * (k + 1) / T.length}%"></i></div>`;
    $('#tourX').onclick = () => { S.tourOn = false; };
    try { T[k].go(); } catch (e) { console.warn(e); }
    await new Promise(r => setTimeout(r, 7500));
  }
  S.tourOn = false; C.classList.add('hidden');
}

/* ---------- FOBOS UI ---------- */
function fobosSay(text, via, who = 'a', actions) {
  const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text;
  if (actions && actions.length) { const ab = document.createElement('div'); ab.className = 'ab'; actions.forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.textContent = a.label; b.onclick = a.fn; ab.appendChild(b); }); d.appendChild(ab); }
  if (via) { const v = document.createElement('span'); v.className = 'via'; v.textContent = via; d.appendChild(v); }
  $('#aresLog').appendChild(d); $('#aresLog').scrollTop = 1e9;
}
function draggable(handle, target, onClick, key) {
  let drag = null, suppressClick = false;
  const clamp = (x, y) => {
    const r = target.getBoundingClientRect();
    target.style.left = Math.max(8, Math.min(Math.max(8, innerWidth - r.width - 8), x)) + 'px';
    target.style.top = Math.max(8, Math.min(Math.max(8, innerHeight - r.height - 8), y)) + 'px';
    target.style.right = 'auto'; target.style.bottom = 'auto';
  };
  try { const p = JSON.parse(localStorage.getItem(key) || 'null'); if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) clamp(p.x, p.y); } catch (_) {}
  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0 || (e.target.closest('button,input,select,textarea,a') && e.target.closest('button,input,select,textarea,a') !== handle)) return;
    const r = target.getBoundingClientRect(); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top, moved: false };
  });
  handle.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drag = null; return; }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) {
      drag.moved = true; if (!handle.hasPointerCapture(e.pointerId)) handle.setPointerCapture(e.pointerId);
      clamp(drag.left + dx, drag.top + dy);
    }
  });
  const finish = (e, cancelled = false) => {
    if (!drag || drag.id !== e.pointerId) return;
    const moved = drag.moved; drag = null;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    suppressClick = moved || cancelled;
    if (moved) try { const r = target.getBoundingClientRect(); localStorage.setItem(key, JSON.stringify({ x: r.left, y: r.top })); } catch (_) {}
  };
  handle.addEventListener('pointerup', e => finish(e));
  window.addEventListener('pointerup', e => { if (drag) finish(e); });
  handle.addEventListener('pointercancel', e => finish(e, true));
  handle.addEventListener('lostpointercapture', () => { drag = null; });
  handle.addEventListener('click', e => { if (suppressClick) { suppressClick = false; e.preventDefault(); return; } if (onClick) onClick(); });
  handle.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && onClick) { e.preventDefault(); onClick(); } });
  window.addEventListener('resize', () => { if (!target.classList.contains('hidden')) { const r = target.getBoundingClientRect(); clamp(r.left, r.top); } });
}
function openFobos() {
  const o = $('#aresOrb').getBoundingClientRect(), A = $('#ares'); A.classList.remove('hidden');
  const rect = A.getBoundingClientRect();
  A.style.left = Math.max(8, Math.min(innerWidth - rect.width - 8, o.right - rect.width)) + 'px';
  A.style.top = Math.max(8, Math.min(innerHeight - rect.height - 8, o.bottom - rect.height)) + 'px';
  $('#aresOrb').classList.add('hidden'); $('#aresIn').focus();
}
function renderFobosChips() {
  const c = { probar: [L('¿Dónde pruebo mi rover?', 'Where do I test my rover?'), L('Ensayo de rover', 'Rover test')], entrenar: [L('Mejores zonas', 'Best zones'), L('Ensayo EVA', 'EVA test')], estudiar: [L('Compara con Atacama', 'Compare with Atacama'), L('Lugares parecidos', 'Similar places')] }[S.mode].concat([L('¿Cómo se calcula?', 'How is it computed?')]);
  $('#aresChips').innerHTML = c.map(x => `<button type="button">${x}</button>`).join('');
  $('#aresChips').querySelectorAll('button').forEach(b => b.onclick = () => askFobos(b.textContent));
  $('#aresIn').placeholder = L('Pregunta a FOBOS…', 'Ask FOBOS…');
}
let activeFobosRequest = null;
async function askFobos(raw) {
  const q = String(raw || '').trim(); if (!q) return;
  if (activeFobosRequest) { activeFobosRequest.controller.abort(); S.simRequest++; }
  const request = { controller: new AbortController() }; activeFobosRequest = request;
  fobosSay(q, null, 'u');
  const pending = document.createElement('div'); pending.className = 'msg a pending'; pending.setAttribute('role', 'status');
  pending.textContent = L('FOBOS está procesando tu consulta…', 'FOBOS is processing your request…');
  $('#aresLog').appendChild(pending); $('#aresLog').scrollTop = 1e9;
  const cancel = () => { if (pending.isConnected) { pending.classList.remove('pending'); pending.textContent = L('Consulta anterior cancelada.', 'Previous request cancelled.'); } };
  request.controller.signal.addEventListener('abort', cancel, { once: true });
  $('#aresForm').setAttribute('aria-busy', 'true');
  try {
    const result = await FOBOS.ask(q, { signal: request.controller.signal });
    if (request.controller.signal.aborted) return;
    pending.remove();
    fobosSay(result?.text || L('No pude completar esa acción. Intenta nuevamente.', 'Could not complete that action. Please retry.'), result?.via, 'a', result?.actions);
  } catch (error) {
    if (!request.controller.signal.aborted) {
      console.error('FOBOS action failed:', error); pending.remove();
      fobosSay(L('No pude completar esa acción. Puedes volver a intentarlo o elegir otra opción.', 'Could not complete that action. You can retry or choose another option.'), L('acción no disponible', 'action unavailable'));
    }
  } finally {
    request.controller.signal.removeEventListener('abort', cancel);
    if (activeFobosRequest === request) { activeFobosRequest = null; $('#aresForm').removeAttribute('aria-busy'); }
  }
}
window.askFobos = askFobos;
function fobosMode() { const c = FOBOS.cfg(); $('#aresMode').textContent = FOBOS.hasAI() ? L('Reglas + IA · ', 'Rules + AI · ') + (c.prov === 'gemini' ? 'Gemini' : 'Groq') : L('Reglas', 'Rules'); }
function initFobos() {
  $('#aresClose').innerHTML = ic('minus'); $('#aresSend').innerHTML = ic('send', 15); $('#aresGrip').innerHTML = ic('grip', 14); $('#aresGear').innerHTML = ic('gear', 15);
  draggable($('#aresOrb'), $('#aresOrb'), openFobos, 'ares_orb'); draggable($('#aresHead'), $('#ares'), null, 'ares_win');
  $('#aresClose').onclick = () => { $('#ares').classList.add('hidden'); $('#aresOrb').classList.remove('hidden'); };
  $('#aresGear').onclick = openAI;
  $('#aresForm').onsubmit = e => { e.preventDefault(); const q = $('#aresIn').value.trim(); if (q) { $('#aresIn').value = ''; askFobos(q); } };
  renderFobosChips(); fobosMode();
  fobosSay(L('Soy FOBOS, como la luna de Marte. Respondo con los datos del mapa: abro zonas, comparo con Yungay o Utah, lanzo ensayos y genero informes.', 'I am FOBOS, like the moon of Mars. I answer with the map’s data: I open zones, compare with Yungay or Utah, run tests and build reports.'), L('reglas', 'rules'));
}
function modal(html) { $('#modalBox').innerHTML = html; $('#modal').classList.remove('hidden'); const x = $('#mClose'); if (x) x.onclick = closeModal; }
function closeModal() { $('#modal').classList.add('hidden'); $('#modalBox').innerHTML = ''; }
function openAI() {
  const c = FOBOS.cfg();
  modal(`<h3>${L('Conectar IA a FOBOS', 'Connect AI to FOBOS')} <button type="button" class="icbtn" id="mClose" aria-label="${L('Cerrar', 'Close')}">${ic('x')}</button></h3>
  <p>${L('Opcional. La IA solo elige una acción de una lista cerrada; las cifras salen del mapa. La clave se guarda solo en este navegador.', 'Optional. The AI only picks an action from a closed list; numbers come from the map. The key stays in this browser only.')}</p>
  <label for="aiProv">${L('Proveedor', 'Provider')}</label><select id="aiProv"><option value="groq">Groq</option><option value="gemini">Google Gemini</option></select>
  <label for="aiModel">${L('Modelo', 'Model')}</label><input id="aiModel"><label for="aiKey">${L('Clave de API', 'API key')}</label><input id="aiKey" type="password" autocomplete="off">
  <div class="row"><button type="button" class="btn" id="aiForget">${L('Olvidar clave', 'Forget key')}</button><button type="button" class="btn primary" id="aiSave">${ic('key', 14)} ${L('Guardar', 'Save')}</button></div>`);
  const pv = $('#aiProv'), md = $('#aiModel'); pv.value = c.prov; md.value = c.model || FOBOS.DEF[c.prov]; $('#aiKey').value = c.key ? '••••••••' : '';
  pv.onchange = () => md.value = FOBOS.DEF[pv.value];
  $('#aiSave').onclick = () => { localStorage.setItem(FOBOS.LS.prov, pv.value); localStorage.setItem(FOBOS.LS.model, md.value.trim()); const k = $('#aiKey').value.trim(); if (k && !/^•+$/.test(k)) localStorage.setItem(FOBOS.LS.key, k); closeModal(); fobosMode(); fobosSay(L('IA conectada. Uso reglas primero.', 'AI connected. I use rules first.'), 'config'); };
  $('#aiForget').onclick = () => { localStorage.removeItem(FOBOS.LS.key); closeModal(); fobosMode(); fobosSay(L('Clave eliminada.', 'Key removed.'), 'config'); };
}

/* ---------- Public API used by FOBOS ---------- */
const APP = {
  setMode, openZone, tour, home, openMethod, similar: () => similar(S.ftab === 'ana' ? 'simList2' : 'simList'),
  zoneActions: () => [[L('Ensayo de rover', 'Rover test'), 'rover test'], [L('Ensayo EVA', 'EVA test'), 'eva'], [L('Informe PDF', 'PDF report'), 'report']],
  rover: async () => { Rover.open(); const R = await Rover.run(); if (!R) return L('Revisa los parámetros del ensayo.', 'Check the test parameters.'); const r = R.active, v = Rover.verdict(r); return L(`Ensayo en ${R.name} con límite ${r.limit}°: ${v.t}. ${nf(r.ok)}% de ${nf(r.length, 2)} km bajo el límite; máx. ${nf(r.max, 1)}°.`, `Test at ${R.name} with a ${r.limit}° limit: ${v.t}. ${nf(r.ok)}% of ${nf(r.length, 2)} km under the limit; max ${nf(r.max, 1)}°.`); },
  eva: async () => { Eva.open(S.mode === 'estudiar' ? 'sample' : 'eva'); Eva.run(false); const E = S.last.eva; if (!E) return L('No hay emplazamiento compatible; revisa los requisitos.', 'No compatible site; check requirements.'); const p = E.p; return `${Eva.verdict(p).t}. ${L(`${p.plan.length} objetivos, ${nf(p.dist, 1)} km, ${nf(p.t / 60, 1)} h.`, `${p.plan.length} objectives, ${nf(p.dist, 1)} km, ${nf(p.t / 60, 1)} h.`)}`; },
  report: () => { Report.open(reportCtx()); return L('Abrí el informe en una pestaña nueva (ES/EN, guardar como PDF).', 'Opened the report in a new tab (ES/EN, save as PDF).'); },
  data: () => { Report.csv(reportCtx()); Report.geojson(reportCtx()); return L('Descargué CSV y GeoJSON de la selección.', 'Downloaded CSV and GeoJSON for the selection.'); },
  helpText: () => L('Puedo mostrar el ranking, cambiar de modo, abrir una zona, comparar con Yungay o Utah, explicar el método, buscar lugares parecidos, hacer ensayos y generar informes.', 'I can show the ranking, switch mode, open a zone, compare with Yungay or Utah, explain the method, find similar places, run tests and build reports.'),
  modeText: () => { const r = ranked('apt')[0]; return L(`Modo ${mname(S.mode)}. Mayor aptitud: ${r.z.name} (${nf(r.s.apt)}% del área cumple).`, `${mname(S.mode)} mode. Highest suitability: ${r.z.name} (${nf(r.s.apt)}% of area meets).`); },
  rankingText: () => L('Similitud ambiental: ', 'Environmental similarity: ') + ranked('sim').map((r, i) => `${i + 1}. ${r.z.name} ${nf(r.s.sim)} (${rangeTxt(r.z.id)})`).join(' · ') + `. Yungay ${nf(analogScore(yungay()))}.`,
  compareText: id => {
    if (id === 'haughton') return L('Haughton (Canadá) es un análogo citado por el reto; no lo evaluamos.', 'Haughton (Canada) is an analog cited by the challenge; not evaluated here.');
    const a = S.M.analogs.find(x => x.id === id), best = ranked('sim')[0];
    return L(`${a.name}: similitud ${nf(analogScore(a))} (rango ${rangeTxt(id === 'atacama' ? 'yungay' : 'utah')}), AI ${nf(a.vals.ai, 3)} (${aiClass(a.vals.ai)}). ${best.z.name}: ${nf(best.s.sim)}.${id === 'utah' ? ' Utah está en el límite árido/semiárido.' : ''}`,
      `${a.name}: similarity ${nf(analogScore(a))} (range ${rangeTxt(id === 'atacama' ? 'yungay' : 'utah')}), AI ${nf(a.vals.ai, 3)} (${aiClass(a.vals.ai)}). ${best.z.name}: ${nf(best.s.sim)}.${id === 'utah' ? ' Utah sits at the arid/semi-arid boundary.' : ''}`);
  },
  explainText: () => L('Similitud ambiental = promedio de térmica (ΔT/80 °C, Gale), aridez (PNUMA, ancla en Yungay) y minerales (EMIT). La pendiente no es similitud: va en la Aptitud para tu misión, junto con acceso y otros requisitos.', 'Environmental similarity = mean of thermal (ΔT/80 °C, Gale), aridity (UNEP, Yungay anchor) and minerals (EMIT). Slope is not similarity: it belongs to mission Suitability, with access and other requirements.'),
  setFilter: (k, v) => { if (!(k in S.f)) return L('Ese requisito no existe.', 'No such requirement.'); S.f[k] = v; renderLeft(); schedule(); return L('Requisito actualizado.', 'Requirement updated.'); },
  sourcesText: () => L('Datos: ', 'Data: ') + Object.values(S.M.sources).join('; ') + '.',
  marsText: () => L('Gale: gravedad 3.71 m/s², presión ≈ 6 hPa, radiación ≈ 0.64 mSv/día (RAD) y ≈ 80 °C de oscilación del suelo (REMS).', 'Gale: gravity 3.71 m/s², pressure ≈ 6 hPa, radiation ≈ 0.64 mSv/day (RAD) and ≈ 80 °C ground swing (REMS).')
};
window.APP = APP;

/* ---------- Boot ---------- */
function initChrome() {
  MapCamera.controls();
  $('#langctl').querySelectorAll('button').forEach(b => b.onclick = () => setLang(b.dataset.l));
  $('#btnHome').onclick = home; $('.brand').onclick = home; $('#btnMethod').onclick = openMethod; $('#btnTour').onclick = tour;
  const clean = () => { document.body.classList.toggle('clean'); $('#hud').classList.remove('hidden'); };
  $('#btnClean').onclick = clean;
  $('#leftToggle').innerHTML = ic('chevL'); $('#leftToggle').onclick = () => { const Lp = $('#left'); Lp.classList.toggle('collapsed'); $('#leftToggle').innerHTML = ic(Lp.classList.contains('collapsed') ? 'chevR' : 'chevL'); };
  $('#mapToggle').innerHTML = ic('minus'); $('#mapToggle').onclick = () => $('#mapbox').classList.toggle('collapsed');
  $('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
  $('#btnExplore').onclick = explore; $('#btnIntroTour').onclick = tour; $('#btnGameIntro').onclick = () => window.openGame && window.openGame();
  $('#minimap').onclick = e => { const r = e.target.getBoundingClientRect(), G = S.G, c = (e.clientX - r.left) / r.width * G.w, rr = (e.clientY - r.top) / r.height * G.h; fly(G.west + c * G.dx, G.north + rr * G.dy, 40000, -45); };
  document.addEventListener('keydown', e => { if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; if (e.key === 'Escape') { closeModal(); if (!$('#method').classList.contains('hidden')) closeMethod(); else stopSim(); } if (e.key.toLowerCase() === 'h') clean(); });
  document.addEventListener('click', e => { const m = $('#expMenu'); if (m && !m.classList.contains('hidden') && !e.target.closest('.dd')) m.classList.add('hidden'); });
}
async function boot() {
  renderTop(); renderIntro();
  const [G, M] = await Promise.all([fetch('data/grid.json').then(r => r.json()), fetch('data/meta.json').then(r => r.json())]);
  S.G = G; S.M = M; AN = M.anchors; buildArea(); S.zoneOf = new Int8Array(G.w * G.h).fill(-1); M.zones.forEach((z, k) => z.cells.forEach(i => S.zoneOf[i] = k));
  { let a = 0, e = 0; for (let i = 0; i < G.status.length; i++) if (G.status[i] === 1) { a++; if (G.fe[i] != null) e++; } M.emitCovAll = 100 * e / a; }
  S.f = { ...MODES[S.mode].f }; document.documentElement.style.setProperty('--accent', MODES[S.mode].color);
  initViewer(); computeScores(); addMarkers(); drawOverlay(); renderLeft(); initPointer(); initFobos(); initChrome(); renderIntro();
  viewer.camera.changed.addEventListener(() => { drawMini(); updateHUD(); }); viewer.camera.percentageChanged = .02;
  updateHUD(); spin();
}
boot().catch(e => { console.error(e); $('#loading').textContent = L('Error al cargar: abre el sitio desde un servidor (GitHub Pages o Live Server), no con doble clic.', 'Loading error: open the site from a server (GitHub Pages or Live Server), not by double-clicking.'); });
