import numpy as np, rasterio, json
g=json.load(open('site/data/grid.json')); m=json.load(open('site/data/meta.json'))
H,W=g['h'],g['w']
AR=rasterio.open('data/aridez_moquegua.tif').read().astype(float)  # pet_tc pr_tc pr_gpm ai_tc ai_gpm
A=lambda k:np.array([np.nan if v is None else v for v in g[k]],float).reshape(H,W)
dT,ndvi,ntl=A('dT'),A('ndvi'),A('ntl')
land=~np.isnan(dT)&~np.isnan(ndvi)&(np.array(g['status']).reshape(H,W)>0)
ai=AR[3]
st=np.zeros((H,W),int); st[land]=1
st[land&(ai>=0.2)]=4; st[land&(ndvi>0.15)]=2; st[land&(ntl>2)]=3
def r(a,n):
    return [None if (np.isnan(v)) else round(float(v),n) for v in a.ravel()]
g['status']=st.ravel().tolist()
g['ai']=r(np.where(land,ai,np.nan),4); g['pr_tc']=r(np.where(land,AR[1],np.nan),0); g['pr_gpm']=r(np.where(land,AR[2],np.nan),0); g['pet']=r(np.where(land,AR[0],np.nan),0)
g.pop('ranges',None)
json.dump(g,open('site/data/grid.json','w'),separators=(',',':'))
def pt(f,lat,lon):
    rr=rasterio.open(f); a=rr.read().astype(float); c,ro=~rr.transform*(lon,lat); w=(slice(int(ro)-2,int(ro)+3),slice(int(c)-2,int(c)+3))
    return [float(np.nanmean(a[i][w])) for i in range(5)]
for a,f in [(m['analogs'][0],'data/aridez_atacama.tif'),(m['analogs'][1],'data/aridez_utah.tif')]:
    v=pt(f,a['lat'],a['lon']); a['vals'].update(pet=round(v[0]),pr_tc=round(v[1],1),pr_gpm=round(v[2]),ai=round(v[3],4))
m['analogs'][0]['ref']='Suelo "tipo Marte" según Navarro-González et al. (2003, Science). Ancla de aridez del índice.'
m['analogs'][1]['ref']='Mars Desert Research Station (Mars Society). Semiárido según el índice PNUMA.'
m.pop('ranges',None); m.pop('power',None) if False else None
m['mars'].update(ground_dT=80)
m['anchors']=dict(T_mars=80, ai_zero=0.2, ai_one=m['analogs'][0]['vals']['ai'], slope_ok=10, slope_max=22)
m['sources'].update(TC='TerraClimate (Abatzoglou et al., 2018) · P y ET0 Penman-Monteith', GPM='NASA GPM IMERG V07 (2001–2020)')
json.dump(m,open('site/data/meta.json','w'),ensure_ascii=False,separators=(',',':'))
print('ok cells',int((st==1).sum()),'anchor ai',m['anchors']['ai_one'],m['analogs'][0]['vals'],m['analogs'][1]['vals'])
