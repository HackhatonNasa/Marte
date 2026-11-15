"""Robustness of the Mars environmental similarity index (thermal, aridity, minerals).

    python analysis/robustness.py

Varies (1) the thermal reference (60, 80, 100 °C), (2) the aridity scaling
(linear or log10), (3) the aridity '1' anchor (Yungay AI or AI = 0.01) and
(4) the weights (200 Dirichlet(1,1,1) draws per configuration, seed = 1).
12 configurations x 200 draws = 2,400 runs. Writes analysis/robustness_runs.csv
and analysis/robustness_summary.json (also copied into data/meta.json).
"""
import csv, json, os, itertools
import numpy as np
np.seterr(all='ignore')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(ROOT, 'data', 'grid.json'))); M = json.load(open(os.path.join(ROOT, 'data', 'meta.json')))
arr = lambda k: np.array([np.nan if v is None else v for v in G[k]], float)
st = np.array(G['status']); dT, ai, fe, cs = arr('dT'), arr('ai'), arr('fe'), arr('cs')
YAI = M['anchors']['ai_one']; SEED, DRAWS = 1, 200
clip = lambda x: np.clip(x, 0, 1)

def comps(dT, ai, fe, cs, tref, form, one):
    T = clip(dT / tref)
    if form == 'lin': A = clip((0.2 - ai) / (0.2 - one))
    else: A = clip((np.log10(0.2) - np.log10(np.maximum(ai, 1e-5))) / (np.log10(0.2) - np.log10(one)))
    return np.stack([np.asarray(T, float), np.asarray(A, float), np.asarray(clip((fe + cs) / 200), float)])

def score(I, w):
    if I.ndim == 1:
        ok = ~np.isnan(I); return float(100 * np.sum(I[ok] * w[ok]) / np.sum(w[ok]))
    ok = ~np.isnan(I); return 100 * np.nansum(I * w[:, None], 0) / (ok * w[:, None]).sum(0)

zones = M['zones']; ids = [z['id'] for z in zones]; new3 = {'algarrobal', 'islay', 'ilojb'}
Y, U = M['analogs'][0]['vals'], M['analogs'][1]['vals']
an = lambda v, cfg: comps(np.array(v['dT']), np.array(v['ai']), np.array(v['fe']), np.array(v['cs']), *cfg)
rng = np.random.default_rng(SEED); rows = []; vals = {k: [] for k in ids + ['yungay', 'utah']}
cfgs = list(itertools.product([60, 80, 100], ['lin', 'log'], [YAI, 0.01]))
for cfg in cfgs:
    I = comps(dT, ai, fe, cs, *cfg); I[:, st != 1] = np.nan
    for _ in range(DRAWS):
        w = rng.dirichlet(np.ones(3)); s = score(I, w)
        zs = {z['id']: float(np.nanmean(s[z['cells']])) for z in zones}
        ys, us = score(an(Y, cfg), w), score(an(U, cfg), w)
        r = sorted(zs, key=zs.get, reverse=True)
        for k in ids: vals[k].append(zs[k])
        vals['yungay'].append(ys); vals['utah'].append(us)
        rows.append([cfg[0], cfg[1], round(cfg[2], 4), *np.round(w, 4), *[round(zs[k], 2) for k in ids], round(ys, 2), round(us, 2), '|'.join(r)])
R = [row for row in rows]
top3 = np.mean([set(row[-1].split('|')[:3]) == new3 for row in rows])
yu = np.mean([row[-3] > row[-2] for row in rows]); ju = np.mean([row[6 + ids.index('lajoya')] > row[-2] for row in rows])
with open(os.path.join(ROOT, 'analysis', 'robustness_runs.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['thermal_ref', 'aridity_form', 'aridity_one', 'w_T', 'w_A', 'w_M', *ids, 'yungay', 'utah', 'ranking']); w.writerows(rows)
summary = {'runs': len(rows), 'configs': len(cfgs), 'seed': SEED,
           'top3_new': round(100 * top3, 1), 'yungay_gt_utah': round(100 * yu, 1), 'lajoya_gt_utah': round(100 * ju, 1),
           'range': {k: [round(float(np.percentile(vals[k], p)), 1) for p in (5, 50, 95)] for k in vals}}
json.dump(summary, open(os.path.join(ROOT, 'analysis', 'robustness_summary.json'), 'w'), indent=1)
M['robust'] = summary; json.dump(M, open(os.path.join(ROOT, 'data', 'meta.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
# default configuration (80 °C, linear, Yungay anchor, equal weights)
I = comps(dT, ai, fe, cs, 80, 'lin', YAI); I[:, st != 1] = np.nan; s = score(I, np.ones(3))
print('Default:', {z['id']: round(float(np.nanmean(s[z['cells']])), 1) for z in zones}, 'Yungay', round(score(an(Y, (80, 'lin', YAI)), np.ones(3)), 1), 'Utah', round(score(an(U, (80, 'lin', YAI)), np.ones(3)), 1))
print(json.dumps(summary))
