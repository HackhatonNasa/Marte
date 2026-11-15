import numpy as np, rasterio, json, math
from scipy import ndimage
D='data/'
with rasterio.open(D+'stack3.tif') as r:
    dT,ndvi,slope,ntl,rain,elev,anp=[r.read(i).astype(float) for i in range(1,8)]; T=r.transform; H,W=r.height,r.width
fe=np.load(D+'emit_fe.npy'); cs=np.load(D+'emit_gy.npy'); cov=np.load(D+'emit_cov.npy'); dist=np.load(D+'dist_road_km.npy')
land=~np.isnan(dT)&~np.isnan(ndvi)
veg=land&(ndvi>0.15); urb=land&(ntl>2); wet=land&(rain>100); ok=land&~veg&~urb&~wet
def pr(x,m): a,b=np.nanpercentile(x[m],[5,95]); return [round(float(a),3),round(float(b),3)]
M=0.5*fe+0.5*cs
ranges={'dT':pr(dT,ok),'rain':pr(rain,ok),'min':pr(M,ok&cov)}
ln=np.log10(ntl+1e-3); ranges['ntl_log']=pr(ln,ok)
def r1(a,n=1):
    out=[]
    for v in a.ravel():
        out.append(None if (v is None or (isinstance(v,float) and math.isnan(v))) else round(float(v),n))
    return out
status=np.zeros((H,W),int)  # 0 mar,1 ok,2 veg,3 urb,4 lluvia
status[land]=1; status[wet]=4; status[veg]=2; status[urb]=3
grid={'w':W,'h':H,'west':T.c,'north':T.f,'dx':T.a,'dy':T.e,
 'ranges':ranges,
 'status':status.ravel().tolist(),
 'dT':r1(np.where(land,dT,np.nan)),'slope':r1(np.where(land,slope,np.nan)),'rain':r1(np.where(land,rain,np.nan),0),
 'ndvi':r1(np.where(land,ndvi,np.nan),2),'ntl':r1(np.where(land,ntl,np.nan),2),'elev':r1(np.where(land,elev,np.nan),0),
 'fe':r1(np.where(cov&land,fe*100,np.nan),0),'cs':r1(np.where(cov&land,cs*100,np.nan),0),
 'road':r1(np.where(land,dist,np.nan),1),'anp':(anp==1).astype(int).ravel().tolist()}
json.dump(grid,open('site/data/grid.json','w'),separators=(',',':'))
# zones
def win(lat,lon,k=2):
    c,r=~T*(lon,lat); r,c=int(r),int(c); idx=[]
    for i in range(r-k,r+k+1):
        for j in range(c-k,c+k+1):
            if 0<=i<H and 0<=j<W and ok[i,j]: idx.append(i*W+j)
    return idx
sim=np.load(D+'final_sim.npy'); v=sim[ok]; thr=np.nanpercentile(v,90)
lab,n=ndimage.label(ok&(sim>=thr),structure=np.ones((3,3)))
def cluster_at(lat,lon):
    c,r=~T*(lon,lat); l=lab[int(r),int(c)]
    if l==0:
        # nearest labeled
        rr,cc=np.where(lab>0); d=(rr-int(r))**2+(cc-int(c))**2; k=d.argmin(); l=lab[rr[k],cc[k]]
    rr,cc=np.where(lab==l); return [int(a*W+b) for a,b in zip(rr,cc)]
zones=[
 dict(id='algarrobal',name='Pampas de El Algarrobal',region='Ilo, Moquegua',lat=-17.403,lon=-71.242,new=True,img='img/el_algarrobal.jpg',cells=cluster_at(-17.403,-71.242)),
 dict(id='islay',name='Pampas costeras de Islay',region='Islay, Arequipa',lat=-16.762,lon=-71.973,new=True,img='img/islay.jpg',cells=cluster_at(-16.762,-71.973)),
 dict(id='ilojb',name='Pampas de Ilo–Jorge Basadre',region='Límite Moquegua–Tacna',lat=-17.59,lon=-71.051,new=True,img='img/ilo_jorge_basadre.jpg',cells=cluster_at(-17.59,-71.051)),
 dict(id='clemesi',name='Pampa de Clemesí',region='Moquegua',lat=-17.25,lon=-71.28,new=False,img='img/clemesi.jpg',cells=win(-17.25,-71.28)),
 dict(id='lajoya',name='Pampas de La Joya',region='Arequipa',lat=-16.62,lon=-71.88,new=False,img='img/la_joya.jpg',cells=win(-16.62,-71.88),
      note='Análogo estudiado con NASA Ames (Valdivia-Silva, McKay). Amenazado por lotización e invasiones.'),
]
for z in zones: z['km2']=len(z['cells'])
# analogs (outside grid) indicator raw values
def ext(tif,emitp,lat,lon):
    with rasterio.open(tif) as r: A=[r.read(i).astype(float) for i in range(1,8)]; TA=r.transform
    c,rr=~TA*(lon,lat); w=(slice(int(rr)-2,int(rr)+3),slice(int(c)-2,int(c)+3))
    d=dict(dT=float(np.nanmean(A[0][w])),slope=float(np.nanmean(A[2][w])),rain=float(np.nanmean(A[4][w])),elev=float(np.nanmean(A[5][w])),ndvi=float(np.nanmean(A[1][w])))
    f=np.load(emitp+'_fe.npy'); g=np.load(emitp+'_gy.npy'); cv=np.load(emitp+'_cov.npy')
    if cv[w].any(): d['fe']=float(np.nanmean(f[w])*100); d['cs']=float(np.nanmean(g[w])*100)
    return {k:round(v,2) for k,v in d.items()}
analogs=[
 dict(id='atacama',name='Desierto de Atacama (Yungay)',country='Chile',lat=-24.08,lon=-69.95,img='img/atacama_yungay.jpg',ref='Análogo de Marte usado por NASA (proyecto ARADS).',vals=ext(D+'atacama.tif',D+'emitA',-24.08,-69.95)),
 dict(id='utah',name='Mars Desert Research Station',country='Utah, EE. UU.',lat=38.406,lon=-110.792,img='img/utah_mdrs.jpg',ref='Sede del University Rover Challenge (Mars Society).',vals=ext(D+'utah.tif',D+'emitU',38.406,-110.792)),
 dict(id='haughton',name='Cráter Haughton',country='Isla Devon, Canadá',lat=75.38,lon=-89.68,img=None,ref='Análogo citado por el reto NASA. No evaluado en este MVP.',vals=None),
]
power={'Clemesí (Moquegua)':{'sw':[7.2571,7.0891,6.7483,5.5987,4.4549,3.625,3.641,4.1398,4.8703,5.9023,6.7987,7.3198],'uv':2.26,'sw_ann':5.6136},
 'La Joya (Arequipa)':{'sw':[6.6372,5.9542,6.2383,6.2875,5.874,5.4734,5.6167,6.4018,7.1846,7.9202,8.2738,7.6483],'uv':2.7,'sw_ann':6.629},
 'Atacama (Yungay)':{'sw':[9.161,8.527,7.6481,6.3478,5.118,4.5643,4.8228,5.8812,7.2444,8.4461,9.289,9.4908],'uv':2.64,'sw_ann':7.2058},
 'Utah (MDRS)':{'sw':[2.5901,3.6418,5.2721,6.5554,7.4633,8.2188,7.4438,6.6254,5.7857,4.3632,3.1138,2.311],'uv':1.44,'sw_ann':5.2874}}
towns=[('Moquegua',-17.19,-70.935),('Ilo',-17.64,-71.34),('Arequipa',-16.40,-71.54),('La Joya',-16.42,-71.82),('Mollendo',-17.02,-72.01),('Punta de Bombón',-17.17,-71.79),('Tacna',-18.01,-70.25),('Omate',-16.67,-70.97),('Torata',-17.08,-70.84),('Ite',-17.86,-70.96)]
meta=dict(ranges=ranges,zones=zones,analogs=analogs,power=power,towns=towns,
 mars=dict(g=3.71,p_hpa=6.1,rad_msv_day=0.64,air_dT=70,ground_max_K=[250,290],ground_min_K=[170,210]),
 earth=dict(g=9.81,rad_msv_day=0.008),
 sources={'MODIS':'NASA MODIS MOD11A2 / MOD13A2 (2023)','SRTM':'NASA SRTM GL1','GPM':'NASA GPM IMERG V07 (2023)','EMIT':'NASA EMIT L2B MIN V002','VIIRS':'NASA VIIRS Black Marble VNP46A2','POWER':'NASA POWER (CERES SYN1deg, 2001–2025)','OSM':'OpenStreetMap','WDPA':'WDPA / SERNANP','REMS':'NASA MSL REMS (Gale)','RAD':'NASA MSL RAD (Hassler et al., 2014)'})
json.dump(meta,open('site/data/meta.json','w'),ensure_ascii=False,separators=(',',':'))
print('grid KB',round(len(open('site/data/grid.json').read())/1024),'zones',[(z['id'],z['km2']) for z in zones])
print('analogs',[(a['id'],a['vals']) for a in analogs])
