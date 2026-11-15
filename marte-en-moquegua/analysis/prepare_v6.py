"""Reconcile the aridity index (AI = P / ET0 from the same stored components) and
update data/grid.json + data/meta.json. Run once from the repository root."""
import json, os
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
gp, mp = os.path.join(ROOT, 'data', 'grid.json'), os.path.join(ROOT, 'data', 'meta.json')
G = json.load(open(gp)); M = json.load(open(mp))
arr = lambda k: np.array([np.nan if v is None else v for v in G[k]], float)
pr, pet, ndvi, ntl, st = arr('pr_tc'), arr('pet'), arr('ndvi'), arr('ntl'), np.array(G['status'])
land = st > 0
with np.errstate(invalid='ignore', divide='ignore'):
    ai = np.where(land & (pet > 0), pr / pet, np.nan)
new = np.zeros_like(st); new[land] = 1
new[land & (ai >= 0.2)] = 4; new[land & (ndvi > 0.15)] = 2; new[land & (ntl > 2)] = 3
G['status'] = new.tolist()
G['ai'] = [None if np.isnan(v) else round(float(v), 4) for v in ai]
json.dump(G, open(gp, 'w'), separators=(',', ':'))
for a in M['analogs']:
    if a.get('vals'): a['vals']['ai'] = round(a['vals']['pr_tc'] / a['vals']['pet'], 4)
M['anchors']['ai_one'] = M['analogs'][0]['vals']['ai']
M['analogs'][0]['ref'] = 'Ancla de la escala de aridez (Navarro-González et al., 2003).'
M['analogs'][1]['ref'] = 'Mars Desert Research Station. En el límite árido/semiárido del PNUMA (AI ≈ 0.20).'
M['aridity_note'] = 'AI = P / ET0 computed per 1 km cell from TerraClimate P and ET0 (1991-2020) after bilinear resampling.'
json.dump(M, open(mp, 'w'), ensure_ascii=False, separators=(',', ':'))
print('arid cells', int((new == 1).sum()), 'Yungay AI', M['anchors']['ai_one'], 'Utah AI', M['analogs'][1]['vals']['ai'])
