/* Line icons (Lucide-style, stroke) + lightweight SVG charts. No dependencies. */
const ICON = {
  bot:'<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 16h.01M16 16h.01"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  flask:'<path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>',
  therm:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  drop:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  mountain:'<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  gem:'<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  play:'<polygon points="6 3 20 12 6 21 6 3"/>',
  stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  route:'<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  tent:'<path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/>',
  radio:'<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
  person:'<circle cx="12" cy="7" r="4"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>',
  box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  minus:'<path d="M5 12h14"/>',
  road:'<path d="M4 19 8 5"/><path d="m16 5 4 14"/><path d="M12 6v2M12 11v2M12 16v2"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  eye:'<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  chevL:'<path d="m15 18-6-6 6-6"/>', chevR:'<path d="m9 18 6-6-6-6"/>', file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>', download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>', check:'<path d="M20 6 9 17l-5-5"/>', cmp:'<path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3 14 10"/><path d="M3 21l7-7"/>', sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>', grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  map:'<path d="M14.1 6 9.9 4 3 7v13l6.9-3 4.2 2L21 16V3z"/><path d="M9.9 4v13M14.1 6v13"/>',
  gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  chevD:'<path d="m6 9 6 6 6-6"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
};
function ic(n, s = 16) {
  return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[n] || ''}</svg>`;
}

/* Plasma colormap (matplotlib) */
const PLASMA = [[13,8,135],[84,2,163],[139,10,165],[185,50,137],[219,92,104],[244,136,73],[254,188,43],[240,249,33]];
function plasma(t) {
  t = Math.max(0, Math.min(1, t)); const x = t * (PLASMA.length - 1); const i = Math.min(PLASMA.length - 2, Math.floor(x)); const f = x - i;
  const a = PLASMA[i], b = PLASMA[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
function plasmaHex(t) { const c = plasma(t); return '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
/* Bilingual helper: every visible string is written in both languages. */
const L = (es, en) => (window.__lang === 'en' ? en : es);
const fmt = (v, d = 0) => v == null || isNaN(v) ? '—' : Number(v).toFixed(d);

const PAL = { temp:'#F2A49A', arid:'#E8D5A3', terr:'#8FD8CF', iron:'#F3C27A', mars:'#DE8C6A', ok:'#9FD8A8', bad:'#F09A9A', nod:'#8A93A3', probar:'#7CC8F0', entrenar:'#B6A4F0', estudiar:'#B5DB8A', yungay:'#E0A47E', utah:'#A9B0BD', white:'#F4F6FA' };

const Charts = {
  ring(v, color, label, size = 96, sub = '') {
    const r = 38, c = 2 * Math.PI * r, p = v == null ? 0 : Math.max(0, Math.min(1, v / 100));
    return `<div class="ring"><svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="${r}" stroke="rgba(255,255,255,.12)" stroke-width="8" fill="none"/>
      <circle cx="50" cy="50" r="${r}" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 50 50)"/>
      <text x="50" y="57" text-anchor="middle" class="rv">${v == null ? '—' : Math.round(v)}</text></svg><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
  },
  radar(axes, series, size = 220) {
    const cx = size / 2, cy = size / 2 + 4, R = size / 2 - 36, n = axes.length;
    const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
    let g = '';
    [0.25, 0.5, 0.75, 1].forEach(k => { g += `<polygon points="${axes.map((_, i) => pt(i, k).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,${k === 1 ? .22 : .08})"/>`; });
    axes.forEach((a, i) => { const [x, y] = pt(i, 1), [lx, ly] = pt(i, 1.22); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.08)"/><text x="${lx}" y="${ly + 3}" text-anchor="middle" style="fill:${a.color};font-size:13.5px">${a.label}</text>`; });
    series.forEach(s => {
      g += `<polygon points="${s.vals.map((v, i) => pt(i, v == null ? 0 : v).join(',')).join(' ')}" fill="${s.fill || 'none'}" stroke="${s.color}" stroke-width="1.8" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    });
    const leg = series.map(s => `<span style="color:${s.color}">${s.dash ? '- - ' : '— '}${s.name}</span>`).join(' &nbsp; ');
    return `<div class="radar"><svg width="100%" viewBox="0 0 ${size} ${size}">${g}</svg></div><div class="note" style="text-align:center">${leg}</div>`;
  },
  bars(rows, max, unit = '', w = 380) {
    const rh = 24, lw = 132, h = rows.length * rh + 4; let g = '';
    rows.forEach((r, i) => {
      const y = i * rh + 4, full = w - lw - 48, bw = Math.max(1, full * Math.min(1, (r.v || 0) / max));
      g += `<text x="0" y="${y + 12}" style="fill:${r.hl ? '#fff' : ''}">${r.label}</text><rect x="${lw}" y="${y + 3}" width="${full}" height="12" rx="3" fill="rgba(255,255,255,.07)"/>`;
      g += `<rect x="${lw}" y="${y + 3}" width="${bw}" height="12" rx="3" fill="${r.color}"/>`;
      g += `<text x="${w - 2}" y="${y + 13}" text-anchor="end" style="fill:#eef0f4;font-family:IBM Plex Mono,monospace">${r.txt != null ? r.txt : fmt(r.v) + unit}</text>`;
    });
    return `<svg width="100%" viewBox="0 0 ${w} ${h}">${g}</svg>`;
  },
  groups(cats, series, w = 380, h = 150) { // grouped vertical bars 0..1
    const pl = 6, pb = 22, gw = (w - pl * 2) / cats.length, bw = Math.min(16, (gw - 14) / series.length); let g = '';
    [0, .5, 1].forEach(k => { const y = 6 + (h - pb - 6) * (1 - k); g += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.07)"/>`; });
    cats.forEach((c, i) => {
      const x0 = pl + i * gw + (gw - bw * series.length) / 2;
      series.forEach((s, k) => { const v = s.vals[i]; const bh = (h - pb - 6) * (v == null ? 0 : Math.min(1, v)); g += v == null ? `<text x="${x0 + k * bw + bw / 2}" y="${h - pb - 3}" text-anchor="middle" style="font-size:14.5px">${L('s/d','n/a')}</text>` : `<rect x="${x0 + k * bw}" y="${h - pb - bh}" width="${bw - 2}" height="${bh}" rx="2" fill="${s.color}"/>`; });
      g += `<text x="${pl + i * gw + gw / 2}" y="${h - 6}" text-anchor="middle" style="fill:${c.color}">${c.label}</text>`;
    });
    const leg = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
    return `<svg width="100%" viewBox="0 0 ${w} ${h}">${g}</svg><div class="leg">${leg}</div>`;
  },
  line(series, labels, unit = '', w = 380, h = 150) {
    const pl = 28, pb = 18, pt = 8, pr = 6, all = series.flatMap(s => s.vals), mx = Math.ceil(Math.max(...all)), mn = Math.floor(Math.min(0, ...all));
    const X = i => pl + i * (w - pl - pr) / (labels.length - 1), Y = v => pt + (h - pt - pb) * (1 - (v - mn) / (mx - mn)); let g = '';
    for (let k = 0; k <= 4; k++) { const v = mn + (mx - mn) * k / 4; g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.07)"/><text x="${pl - 4}" y="${Y(v) + 3}" text-anchor="end">${fmt(v)}</text>`; }
    labels.forEach((l, i) => { g += `<text x="${X(i)}" y="${h - 4}" text-anchor="middle">${l}</text>`; });
    series.forEach(s => { g += `<polyline points="${s.vals.map((v, i) => X(i) + ',' + Y(v)).join(' ')}" fill="none" stroke="${s.color}" stroke-width="${s.hl ? 2.6 : 1.4}" opacity="${s.hl ? 1 : .6}"/>`; });
    const leg = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
    return `<svg width="100%" viewBox="0 0 ${w} ${h}">${g}</svg><div class="leg">${leg}${unit ? `<span>${unit}</span>` : ''}</div>`;
  },
  hist(vals, marker, w = 380, h = 110) {
    const nb = 25, cnt = new Array(nb).fill(0);
    vals.forEach(v => { if (v != null && !isNaN(v)) cnt[Math.min(nb - 1, Math.floor(v / 100 * nb))]++; });
    const mx = Math.max(...cnt), bw = (w - 10) / nb; let g = '';
    cnt.forEach((c, i) => { const bh = (h - 22) * c / mx; g += `<rect x="${5 + i * bw}" y="${h - 16 - bh}" width="${bw - 1.5}" height="${bh}" rx="1.5" fill="${plasmaHex((i + .5) / nb)}" opacity=".75"/>`; });
    if (marker != null) { const x = 5 + marker / 100 * (w - 10); g += `<line x1="${x}" x2="${x}" y1="4" y2="${h - 16}" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 2"/><text x="${x}" y="12" text-anchor="${marker > 70 ? 'end' : 'start'}" dx="${marker > 70 ? -4 : 4}" style="fill:#fff">${L('este lugar','this site')}</text>`; }
    g += `<text x="5" y="${h - 3}">0</text><text x="${w / 2}" y="${h - 3}" text-anchor="middle">${L('similitud','similarity')}</text><text x="${w - 5}" y="${h - 3}" text-anchor="end">100</text>`;
    return `<svg width="100%" viewBox="0 0 ${w} ${h}">${g}</svg>`;
  },
  logbars(rows, w = 380) {
    const rh = 34, lw = 108, h = rows.length * rh + 18, lo = -3, hi = 3.2, X = v => lw + (w - lw - 44) * (Math.log10(Math.max(v, 1e-3)) - lo) / (hi - lo); let g = '';
    rows.forEach((r, i) => {
      const y = i * rh + 2;
      g += `<text x="0" y="${y + 13}" style="fill:#e3e6ec">${r.label}</text><text x="0" y="${y + 25}">${r.unit}</text>`;
      g += `<rect x="${lw}" y="${y + 4}" width="${X(r.e) - lw}" height="9" rx="2" fill="${PAL.terr}"/><text x="${X(r.e) + 4}" y="${y + 12}" style="font-family:IBM Plex Mono,monospace">${r.et}</text>`;
      g += `<rect x="${lw}" y="${y + 16}" width="${X(r.m) - lw}" height="9" rx="2" fill="${PAL.mars}"/><text x="${X(r.m) + 4}" y="${y + 24}" style="font-family:IBM Plex Mono,monospace">${r.mt}</text>`;
    });
    g += `<text x="${lw}" y="${h - 2}">${L('escala logarítmica','log scale')}</text>`;
    return `<svg width="100%" viewBox="0 0 ${w} ${h}">${g}</svg><div class="leg"><span><i style="background:${PAL.terr}"></i>${L('Este lugar','This site')}</span><span><i style="background:${PAL.mars}"></i>${L('Marte (Gale)','Mars (Gale)')}</span></div>`;
  },
  profile(segs, limit, w = 300, h = 96) { // segs: [{v, st:'ok'|'over'|'nod'|'exc'}]
    const vals = segs.map(s => s.v == null ? 0 : s.v), mx = Math.max(limit * 1.5, ...vals), n = segs.length;
    const X = i => 4 + i * (w - 8) / (n - 1), Y = v => 6 + (h - 22) * (1 - v / mx); let g = '';
    for (let i = 0; i < n - 1; i++) {
      const s = segs[i], col = s.st === 'ok' ? PAL.terr : s.st === 'over' ? PAL.bad : s.st === 'exc' ? '#C9A3D9' : PAL.nod;
      g += `<path d="M${X(i)},${Y(0)} L${X(i)},${Y(vals[i])} L${X(i + 1)},${Y(vals[i + 1])} L${X(i + 1)},${Y(0)} Z" fill="${col}" opacity=".85"/>`;
    }
    g += `<line x1="4" x2="${w - 4}" y1="${Y(limit)}" y2="${Y(limit)}" stroke="${PAL.bad}" stroke-dasharray="4 3"/><text x="${w - 4}" y="${Y(limit) - 3}" text-anchor="end" style="fill:${PAL.bad}">${L('tu límite','your limit')} ${limit}°</text>`;
    g += `<text x="4" y="${h - 3}">${L('inicio','start')}</text><text x="${w - 4}" y="${h - 3}" text-anchor="end">${L('fin','end')}</text>`;
    return `<svg width="100%" viewBox="0 0 ${w} ${h}">${g}</svg><div class="leg"><span><i style="background:${PAL.terr}"></i>${L('bajo el límite','under limit')}</span><span><i style="background:${PAL.bad}"></i>${L('supera el límite','over limit')}</span><span><i style="background:#C9A3D9"></i>${L('zona excluida','excluded')}</span><span><i style="background:${PAL.nod}"></i>${L('no evaluable','not evaluable')}</span></div>`;
  },
  gauge2(items) {
    const size = 116, c = size / 2; let g = '';
    items.forEach((it, k) => { const r = 48 - k * 13, C = 2 * Math.PI * r, p = it.v == null ? 0 : Math.min(1, it.v / 100);
      g += `<circle cx="${c}" cy="${c}" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="8" fill="none"/><circle cx="${c}" cy="${c}" r="${r}" stroke="${it.color}" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${C * p} ${C}" transform="rotate(-90 ${c} ${c})"/>`; });
    const leg = items.map(it => `<div style="display:flex;justify-content:space-between;gap:10px;margin:3px 0"><span style="color:${it.color}">${it.label}</span><b class="mono" style="font-weight:500;white-space:nowrap">${it.v == null ? L('sin dato','no data') : fmt(it.v) + ' %'}</b></div>`).join('');
    return `<div style="display:flex;align-items:center;gap:14px"><svg width="${size}" height="${size}">${g}</svg><div style="flex:1;font-size:14.5px">${leg}</div></div>`;
  }
};
