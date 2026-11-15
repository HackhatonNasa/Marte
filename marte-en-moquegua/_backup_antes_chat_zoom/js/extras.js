/* Extras de interfaz:
   1) Tamaño de texto (A+/A-)
   2) Cortina Tierra vs Marte en la ficha
   3) Juego "¿Marte o Tierra?"
   4) Órbita automática de la cámara al abrir una zona + número de similitud animado */
(() => {
  const $ = s => document.querySelector(s);
  const EN = () => window.__lang === 'en';
  const L = (es, en) => EN() ? en : es;

  /* ---------- 1. Tamaño de texto ---------- */
  const KEY = 'mm_fz', MIN = 0.85, MAX = 1.35, STEP = 0.1;
  let fz = 1;
  try { fz = parseFloat(localStorage.getItem(KEY)) || 1; } catch (e) { }
  const applyFz = () => { document.documentElement.style.setProperty('--fz', fz.toFixed(2)); try { localStorage.setItem(KEY, fz); } catch (e) { } };
  applyFz();

  /* ---------- 2. Cortina Tierra vs Marte ---------- */
  function buildSwipe(twin) {
    const figs = twin.querySelectorAll('figure');
    if (figs.length < 2) return;
    const earth = figs[0].querySelector('img'), mars = figs[1].querySelector('img');
    const capE = figs[0].querySelector('figcaption')?.textContent || '', capM = figs[1].querySelector('figcaption')?.textContent || '';
    const box = document.createElement('div'); box.className = 'swipe';
    box.innerHTML = `<img class="sw-m" src="${mars.getAttribute('src')}" alt="">
      <img class="sw-e" src="${earth.getAttribute('src')}" alt="">
      <div class="sw-line"><span class="sw-knob" aria-hidden="true">⟷</span></div>
      <span class="sw-tag sw-l"></span><span class="sw-tag sw-r"></span>
      <input type="range" min="0" max="100" value="50" class="sw-range">`;
    box.querySelector('.sw-l').textContent = capE; box.querySelector('.sw-r').textContent = capM;
    const r = box.querySelector('.sw-range'), e = box.querySelector('.sw-e'), line = box.querySelector('.sw-line');
    const setP = v => { e.style.clipPath = `inset(0 ${100 - v}% 0 0)`; line.style.left = v + '%'; };
    r.oninput = () => setP(+r.value);
    r.setAttribute('aria-label', L('Desliza para comparar la Tierra con Marte', 'Slide to compare Earth with Mars'));
    setP(50);
    const hint = document.createElement('p'); hint.className = 'note sw-hint';
    hint.textContent = L('Arrastra la línea: a la izquierda la Tierra, a la derecha Marte.', 'Drag the line: Earth on the left, Mars on the right.');
    twin.replaceWith(box); box.after(hint);
    // Pequeña animación inicial para invitar a usarla
    let t = 0; const seq = [50, 72, 28, 50];
    const step = () => { if (t >= seq.length - 1) return; const a = seq[t], b = seq[t + 1], t0 = performance.now();
      const tick = now => { const k = Math.min(1, (now - t0) / 650); const v = a + (b - a) * (0.5 - Math.cos(k * Math.PI) / 2); r.value = v; setP(v);
        if (k < 1) requestAnimationFrame(tick); else { t++; step(); } };
      requestAnimationFrame(tick); };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(step, 500);
  }

  /* ---------- 4b. Número de similitud animado ---------- */
  function countUp(el) {
    if (el.dataset.counted) return; el.dataset.counted = '1';
    const target = parseFloat(el.textContent); if (!isFinite(target)) return;
    const t0 = performance.now(), dur = 900;
    const tick = now => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  function scanFicha() {
    const f = $('#ficha'); if (!f) return;
    f.querySelectorAll('.twin').forEach(buildSwipe);
    f.querySelectorAll('.ring .rv').forEach(countUp);
  }

  /* ---------- 4. Órbita automática al abrir una zona ---------- */
  let orbit = null;
  function stopOrbit() {
    if (!orbit) return;
    orbit.off(); orbit = null;
    try { viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); } catch (e) { }
    $('#orbitChip')?.classList.add('hidden');
  }
  function startOrbit(lon, lat) {
    stopOrbit();
    if (typeof viewer === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const center = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
    let heading = viewer.camera.heading;
    const pitch = Cesium.Math.toRadians(-38), range = 42000;
    const off = viewer.clock.onTick.addEventListener(() => {
      if (typeof S !== 'undefined' && (S.simOn || S.tourOn)) return stopOrbit();
      heading += 0.0016;
      viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
    });
    orbit = { off };
    let chip = $('#orbitChip');
    if (!chip) { chip = document.createElement('button'); chip.id = 'orbitChip'; chip.className = 'glass ui'; chip.type = 'button'; chip.onclick = stopOrbit; document.body.appendChild(chip); }
    chip.textContent = L('Órbita automática · clic o arrastra para detener', 'Auto orbit · click or drag to stop');
    chip.classList.remove('hidden');
  }
  ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, e => {
    if (orbit && !(e.target && e.target.id === 'orbitChip')) stopOrbit();
  }, { passive: true, capture: true }));

  function wrapGlobals() {
    if (typeof openZone === 'function' && !openZone._wrapped) {
      const orig = openZone;
      window.openZone = function (id) {
        stopOrbit();
        const out = orig.apply(this, arguments);
        try {
          const z = S.M.zones.find(x => x.id === id);
          if (z) setTimeout(() => { if (!S.simOn && !S.tourOn && !orbit) startOrbit(z.lon, z.lat); }, 3000);
        } catch (e) { }
        return out;
      };
      window.openZone._wrapped = true;
    }
    if (typeof fly === 'function' && !fly._wrapped) {
      const of = fly; window.fly = function () { stopOrbit(); return of.apply(this, arguments); }; window.fly._wrapped = true;
    }
  }

  /* ---------- 3. Juego ¿Marte o Tierra? ---------- */
  const TILES = [
    { id: 'm1', mars: true, es: 'Cráter Gale, Marte (relieve de NASA Mars Trek)', en: 'Gale crater, Mars (NASA Mars Trek relief)' },
    { id: 'm2', mars: true, es: 'Monte Sharp (Aeolis Mons), Marte', en: 'Mount Sharp (Aeolis Mons), Mars' },
    { id: 'm3', mars: true, es: 'Gale, Marte · zona del rover Curiosity', en: 'Gale, Mars · Curiosity rover area' },
    { id: 'm4', mars: true, es: 'Gale, Marte · capas sedimentarias', en: 'Gale, Mars · sedimentary layers' },
    { id: 't1', mars: false, es: 'Yungay, desierto de Atacama (Chile)', en: 'Yungay, Atacama Desert (Chile)' },
    { id: 't2', mars: false, es: 'Pampa de Clemesí, Moquegua (Perú)', en: 'Pampa de Clemesí, Moquegua (Peru)' },
    { id: 't3', mars: false, es: 'Pampas de El Algarrobal, Ilo (Perú)', en: 'Pampas de El Algarrobal, Ilo (Peru)' },
    { id: 't4', mars: false, es: 'Pampas de Ilo–Jorge Basadre (Perú)', en: 'Pampas de Ilo–Jorge Basadre (Peru)' },
    { id: 't5', mars: false, es: 'Mars Desert Research Station, Utah (EE. UU.)', en: 'Mars Desert Research Station, Utah (USA)' }
  ];
  let G = null;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function openGame() {
    stopOrbit();
    G = { list: shuffle(TILES.slice()), i: 0, ok: 0, answered: false };
    let el = $('#game');
    if (!el) { el = document.createElement('div'); el.id = 'game'; el.innerHTML = '<div class="game-box glass" role="dialog" aria-modal="true" aria-labelledby="gameTitle"></div>'; document.body.appendChild(el);
      el.addEventListener('click', e => { if (e.target === el) closeGame(); }); }
    el.classList.remove('hidden'); renderGame();
  }
  function closeGame() { $('#game')?.classList.add('hidden'); G = null; }
  function renderGame() {
    const box = $('#game .game-box'); if (!box || !G) return;
    if (G.i >= G.list.length) {
      const n = G.list.length;
      box.innerHTML = `<h3 id="gameTitle">${L('¿Marte o Tierra?', 'Mars or Earth?')}</h3>
        <div class="game-score">${G.ok} / ${n}</div>
        <p>${L('Si te costó distinguirlos, esa es la idea: estos desiertos se parecen a Marte en textura, aridez y minerales. Por eso sirven para probar rovers y entrenar tripulaciones.',
               'If they were hard to tell apart, that is the point: these deserts resemble Mars in texture, aridity and minerals. That is why they are useful to test rovers and train crews.')}</p>
        <div class="game-row"><button class="btn" id="gAgain">${L('Jugar otra vez', 'Play again')}</button><button class="btn primary" id="gClose">${L('Volver al mapa', 'Back to the map')}</button></div>`;
      $('#gAgain').onclick = openGame; $('#gClose').onclick = closeGame; $('#gClose').focus(); return;
    }
    const t = G.list[G.i];
    box.innerHTML = `<div class="game-head"><h3 id="gameTitle">${L('¿Marte o Tierra?', 'Mars or Earth?')}</h3><span class="mono">${G.i + 1} / ${G.list.length} · ${L('aciertos', 'correct')} ${G.ok}</span><button class="icbtn" id="gX" aria-label="${L('Cerrar', 'Close')}">✕</button></div>
      <p class="game-q">${L('Todas las imágenes están en gris para que el color no delate la respuesta.', 'All images are in grayscale so color does not give the answer away.')}</p>
      <div class="game-img"><img id="gImg" src="img/game/${t.id}_g.jpg" alt="${L('Imagen satelital sin identificar', 'Unidentified satellite image')}"></div>
      <div class="game-row" id="gBtns"><button class="btn game-btn mars" data-a="1">${L('Marte', 'Mars')}</button><button class="btn game-btn earth" data-a="0">${L('Tierra', 'Earth')}</button></div>
      <div id="gFb" class="game-fb" role="status" aria-live="polite"></div>`;
    $('#gX').onclick = closeGame;
    box.querySelectorAll('.game-btn').forEach(b => b.onclick = () => answer(b.dataset.a === '1'));
    box.querySelector('.game-btn').focus();
  }
  function answer(saysMars) {
    if (!G || G.answered) return; G.answered = true;
    const t = G.list[G.i], right = saysMars === t.mars; if (right) G.ok++;
    $('#gImg').src = `img/game/${t.id}_c.jpg`;
    $('#gBtns').innerHTML = `<button class="btn primary" id="gNext">${G.i + 1 < G.list.length ? L('Siguiente', 'Next') : L('Ver resultado', 'See result')}</button>`;
    $('#gFb').className = 'game-fb ' + (right ? 'ok' : 'ko');
    $('#gFb').innerHTML = `<b>${right ? L('¡Correcto!', 'Correct!') : L('No era', 'Not quite')}</b> ${t.mars ? L('Es Marte', 'It is Mars') : L('Es la Tierra', 'It is Earth')}: ${EN() ? t.en : t.es}.
      <small>${t.mars ? L('Pista: cráteres pequeños y ninguna huella humana.', 'Clue: small craters and no human traces.') : L('Pista: caminos, cauces secos o marcas de actividad humana.', 'Clue: roads, dry channels or marks of human activity.')}</small>`;
    $('#gNext').onclick = () => { G.i++; G.answered = false; renderGame(); }; $('#gNext').focus();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && G) closeGame(); });
  window.addEventListener('langchange', () => { if (G) { const ans = G.answered; renderGame(); if (ans) { G.answered = false; } } });

  /* ---------- Arranque ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const up = $('#fzUp'), down = $('#fzDown');
    if (up) up.onclick = () => { fz = Math.min(MAX, fz + STEP); applyFz(); };
    if (down) down.onclick = () => { fz = Math.max(MIN, fz - STEP); applyFz(); };

    window.openGame = openGame;
    const f = $('#ficha');
    if (f) new MutationObserver(scanFicha).observe(f, { childList: true, subtree: true });
    const iv = setInterval(() => { if (typeof openZone === 'function' && typeof fly === 'function' && typeof viewer !== 'undefined' && viewer) { wrapGlobals(); clearInterval(iv); } }, 400);
  });
})();
