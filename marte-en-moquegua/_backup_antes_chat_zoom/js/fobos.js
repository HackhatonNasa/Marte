/* FOBOS · asistente del mapa (nombre de la luna de Marte).
   Capa A (reglas, principal): interpreta la pregunta en español o inglés y ejecuta una acción de una lista cerrada.
   Capa B (IA opcional, Groq o Gemini): SOLO traduce la pregunta a una acción de esa lista. Nunca redacta cifras:
   todos los números salen de las funciones del mapa. La clave se guarda solo en este navegador (localStorage). */
const FOBOS = (() => {
  const ZONES = { algarrobal: /algarrobal/, islay: /islay/, ilojb: /basadre|jorge|ilo.?j/, clemesi: /clemes|clames/, lajoya: /joya/ };
  const ANALOGS = { atacama: /atacama|yungay|chile/, utah: /utah|mdrs|desert research/ };
  const MODES = { probar: /probar|rover|robot|test my|testing/, entrenar: /entrenar|tripulaci|astronaut|anal[oó]ga|train|crew/, estudiar: /estudiar|suelo|mineral|cient|study|soil|scien/ };
  const ACTIONS = ['report', 'data', 'ranking', 'set_mode', 'open_zone', 'compare', 'explain_score', 'method', 'sim_rover', 'sim_eva', 'similar', 'tour', 'home', 'filter', 'sources', 'mars_facts', 'help', 'off_topic'];
  const LS = { prov: 'ares_provider', model: 'ares_model', key: 'ares_key' };
  const DEF = { groq: 'llama-3.3-70b-versatile', gemini: 'gemini-2.5-flash' };
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const find = (map, q) => Object.keys(map).find(k => map[k].test(q));

  function rules(raw) {
    const q = norm(raw), zone = find(ZONES, q), analog = find(ANALOGS, q);
    if (/^(hola|hi|hello|ayuda|help)\b|que puedes|what can you/.test(q)) return { action: 'help' };
    if (/tour|recorrido guiado|guided/.test(q)) return { action: 'tour' };
    if (/inicio|portada|home|pagina principal|main page/.test(q)) return { action: 'home' };
    if (/informe|reporte|pdf|report/.test(q)) return { action: 'report', params: { zone } };
    if (/csv|geojson|descarga|download|export/.test(q)) return { action: 'data', params: { zone } };
    if (/valida|robust|sensibil|metodo completo|method|validation/.test(q)) return { action: 'method' };
    if (/fuente|referencia|source|reference/.test(q) && !zone) return { action: 'sources' };
    if (/formula|como (se )?calcula|por que|explica|normaliz|peso|how .*(calculat|comput)|why|weight/.test(q)) return { action: 'explain_score' };
    if (/rover|curiosity/.test(q) && /simula|ensayo|prueba|recorre|ruta|test|run|drive|route/.test(q)) return { action: 'sim_rover', params: { zone } };
    if (/\beva\b|caminata|habitat|muestreo|sampling|walk/.test(q) || (/astronauta|tripulaci|crew/.test(q) && /simula|ensayo|planifica|plan/.test(q))) return { action: 'sim_eva', params: { zone } };
    if (/parecid|similar|otros lugares|mas lugares|other places/.test(q)) return { action: 'similar' };
    let m = q.match(/(pendiente|slope)[^0-9]*(\d+)/); if (m) return { action: 'filter', params: { key: 'slope', value: +m[2] } };
    m = q.match(/(carretera|camino|via|road)[^0-9]*(\d+)/); if (m) return { action: 'filter', params: { key: 'road', value: +m[2] } };
    if (/cielo oscuro|oscur|dark sky/.test(q)) return { action: 'filter', params: { key: 'dark', value: !/sin|quita|desactiva|off|without/.test(q) } };
    if (analog) return { action: 'compare', params: { analog } };
    if (/gale|curiosity|gravedad|gravity|radiacion|radiation|presion|pressure|en marte|on mars/.test(q)) return { action: 'mars_facts' };
    const mode = find(MODES, q);
    if (mode && /modo|mode|cambia|switch|quiero|necesito|soy|i need|i am|i want/.test(q)) return { action: 'set_mode', params: { mode } };
    if (zone) return { action: 'open_zone', params: { zone } };
    if (/ranking|top|mejor|best|zonas?|zones?|lugar|place|sitio|site|analogo|analog|recomiend|recommend|donde|where/.test(q)) return { action: 'ranking', params: mode ? { mode } : {} };
    if (mode) return { action: 'set_mode', params: { mode } };
    return null;
  }

  const SYS = `You convert a user's question about the web app "Marte en Moquegua" (Mars analog sites in southern Peru) into ONE JSON action.
Reply with JSON only: {"action": "...", "params": {...}}. Never answer the question yourself. Never output numbers.
Allowed actions: ranking {mode?}; set_mode {mode: "probar"|"entrenar"|"estudiar"}; open_zone {zone: "algarrobal"|"islay"|"ilojb"|"clemesi"|"lajoya"};
compare {analog: "atacama"|"utah"}; explain_score {}; method {} (full method and validation page); sim_rover {zone?}; sim_eva {zone?}; similar {}; tour {}; home {};
report {zone?}; data {zone?}; filter {key: "slope"|"road"|"dark", value}; sources {}; mars_facts {}; help {};
off_topic {} for anything not about Mars analogs, this map, its data, rovers, analog missions or Martian soils.
Modes: probar = test a rover; entrenar = train a crew; estudiar = study Mars-like soil.`;

  const cfg = () => ({ prov: localStorage.getItem(LS.prov) || 'groq', model: localStorage.getItem(LS.model) || '', key: localStorage.getItem(LS.key) || '' });
  const hasAI = () => { try { return !!cfg().key; } catch (e) { return false; } };

  async function llm(q) {
    const c = cfg(); if (!c.key) return null;
    const model = c.model || DEF[c.prov]; let txt;
    if (c.prov === 'gemini') {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': c.key },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: SYS }] }, contents: [{ role: 'user', parts: [{ text: q.slice(0, 400) }] }], generationConfig: { temperature: 0, maxOutputTokens: 120, responseMimeType: 'application/json' } }) });
      if (!r.ok) throw new Error('Gemini ' + r.status); txt = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.key },
        body: JSON.stringify({ model, temperature: 0, max_tokens: 120, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYS }, { role: 'user', content: q.slice(0, 400) }] }) });
      if (!r.ok) throw new Error('Groq ' + r.status); txt = (await r.json()).choices?.[0]?.message?.content;
    }
    return validate(JSON.parse(txt || '{}'));
  }
  function validate(o) {
    if (!o || !ACTIONS.includes(o.action)) return null;
    const p = o.params || {}, out = { action: o.action, params: {} };
    if (['probar', 'entrenar', 'estudiar'].includes(p.mode)) out.params.mode = p.mode;
    if (Object.keys(ZONES).includes(p.zone)) out.params.zone = p.zone;
    if (['atacama', 'utah'].includes(p.analog)) out.params.analog = p.analog;
    if (['slope', 'road', 'dark'].includes(p.key)) { out.params.key = p.key; out.params.value = p.key === 'dark' ? !!p.value : Math.max(1, Math.min(60, +p.value || 1)); }
    if ((o.action === 'set_mode' && !out.params.mode) || (o.action === 'open_zone' && !out.params.zone) || (o.action === 'compare' && !out.params.analog) || (o.action === 'filter' && !out.params.key)) return null;
    return out;
  }
  async function run(a) {
    const P = a.params || {}, act = (label, q) => ({ label, fn: () => window.askFobos && window.askFobos(q) }), z = () => { if (P.zone) APP.openZone(P.zone); };
    switch (a.action) {
      case 'help': return { text: APP.helpText(), actions: [act(L('Mejores zonas', 'Best zones'), L('mejores zonas', 'best zones')), act(L('Método y validación', 'Method & validation'), 'method')] };
      case 'ranking': if (P.mode) APP.setMode(P.mode); return { text: APP.rankingText(), actions: [act(L('¿Cómo se calcula?', 'How is it computed?'), L('cómo se calcula', 'how is it computed'))] };
      case 'set_mode': APP.setMode(P.mode); return { text: APP.modeText() };
      case 'open_zone': return { text: APP.openZone(P.zone), actions: APP.zoneActions().map(x => act(x[0], x[1])) };
      case 'compare': return { text: APP.compareText(P.analog) };
      case 'explain_score': return { text: APP.explainText(), actions: [act(L('Método y validación', 'Method & validation'), 'method')] };
      case 'method': APP.openMethod(); return { text: L('Abrí la página de método y validación.', 'I opened the method and validation page.') };
      case 'sim_rover': z(); return { text: await APP.rover() };
      case 'sim_eva': z(); return { text: await APP.eva() };
      case 'similar': return { text: APP.similar() };
      case 'tour': APP.tour(); return { text: L('Iniciando el recorrido guiado.', 'Starting the guided tour.') };
      case 'home': APP.home(); return { text: L('Volvimos a la página principal.', 'Back to the home page.') };
      case 'filter': return { text: APP.setFilter(P.key, P.value) };
      case 'sources': return { text: APP.sourcesText() };
      case 'mars_facts': return { text: APP.marsText() };
      case 'report': z(); return { text: APP.report() };
      case 'data': z(); return { text: APP.data() };
      case 'off_topic': return { text: L('Solo puedo ayudarte con el buscador de análogos de Marte: zonas, requisitos, datos, ensayos e informes.', 'I can only help with the Mars analog finder: zones, requirements, data, tests and reports.') };
    }
    return null;
  }
  async function ask(q) {
    let a = rules(q), via = L('reglas', 'rules');
    if (!a && hasAI()) { try { a = await llm(q); via = L('IA → acción', 'AI → action'); } catch (e) { via = L('reglas (IA no disponible)', 'rules (AI unavailable)'); } }
    if (!a) return { text: L('No entendí. Solo respondo sobre este buscador de análogos de Marte. Prueba: "mejores zonas", "compara con Atacama" o "ensayo de rover".', 'I did not understand. I only answer about this Mars analog finder. Try: "best zones", "compare with Atacama" or "rover test".'), via };
    const r = (await run(a)) || { text: '—' };
    return { text: r.text, actions: r.actions, via: via + ' · ' + a.action };
  }
  return { ask, cfg, hasAI, DEF, LS };
})();
