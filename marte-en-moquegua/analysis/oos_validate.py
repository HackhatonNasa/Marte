"""Out-of-sample check: do published Mars analog sites score higher than random land?
    python analysis/oos_validate.py oos_points.csv
Uses the climatic part of the index (thermal + aridity, default anchors: 80 °C and Yungay AI).
Reports each analog's percentile among 500 random land points and the AUC (Mann-Whitney)."""
import csv, json, os, sys
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = json.load(open(os.path.join(ROOT, 'data', 'meta.json'))); YAI = M['anchors']['ai_one']
rows = list(csv.DictReader(open(sys.argv[1] if len(sys.argv) > 1 else 'oos_points.csv')))
def idx(r):
    try: dT, ai = float(r['dT']), float(r['ai'])
    except ValueError: return None
    T = np.clip(dT / 80, 0, 1); A = np.clip((0.2 - ai) / (0.2 - YAI), 0, 1); return 100 * (T + A) / 2
bg = np.array([v for v in (idx(r) for r in rows if r['group'] == 'background') if v is not None])
res = []
for r in rows:
    if r['group'] != 'analog': continue
    v = idx(r); res.append({'site': r['site'], 'index': None if v is None else round(float(v), 1), 'percentile_vs_random_land': None if v is None else round(float(100 * np.mean(bg < v)), 1)})
an = np.array([x['index'] for x in res if x['index'] is not None])
auc = float(np.mean([(a > b) + 0.5 * (a == b) for a in an for b in bg]))
out = {'n_background': int(len(bg)), 'auc': round(auc, 3), 'sites': res}
json.dump(out, open(os.path.join(ROOT, 'analysis', 'oos_results.json'), 'w'), indent=1, ensure_ascii=False)
M['oos'] = out; json.dump(M, open(os.path.join(ROOT, 'data', 'meta.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps(out, indent=1, ensure_ascii=False))
