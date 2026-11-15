import numpy as np, rasterio, json
with rasterio.open('data/stack3.tif') as r:
    dT,ndvi,slope,ntl,rain,elev,anp=[r.read(i).astype(float) for i in range(1,8)]; T=r.transform; H,W=r.height,r.width
fe=np.load('data/emit_fe.npy'); cs=np.load('data/emit_gy.npy'); cov=np.load('data/emit_cov.npy'); dist=np.load('data/dist_road_km.npy')
land=~np.isnan(dT)&~np.isnan(ndvi)
veg=land&(ndvi>0.15); urb=land&(ntl>2); wet=land&(rain>100)
ok=land&~veg&~urb&~wet
def nrm(x,mask,rev=False):
    a,b=np.nanpercentile(x[mask],[5,95]); s=np.clip((x-a)/(b-a),0,1); return (1-s if rev else s),(round(a,1),round(b,1))
s_dT,r1=nrm(dT,ok); s_ar,r2=nrm(rain,ok,True)
s_sl=np.where(slope<=15,1.0,np.clip(1-(slope-15)/10,0,1))
M=0.5*fe+0.5*cs; s_min,r3=nrm(M,ok&cov); s_min=np.where(cov,s_min,np.nan)
S=np.stack([s_dT,s_sl,s_ar,s_min]); n=np.sum(~np.isnan(S),0); sim=100*np.nansum(S,0)/np.maximum(n,1); sim[~ok]=np.nan
acc=np.clip(1-(dist-5)/25,0,1); ln=np.log10(ntl+1e-3); cielo,_=nrm(ln,ok,True)
via=100*(0.6*acc+0.4*cielo); via[~ok]=np.nan
print('ranges dT',r1,'rain',r2,'min',r3,'ok',ok.sum(),'ok&emit',(ok&cov).sum())
np.save('data/final_sim.npy',sim); np.save('data/final_via.npy',via); np.save('data/final_masks.npy',np.stack([land,veg,urb,wet,ok,anp==1]))
v=sim[ok]
pts={'Pampa de Clemesí':(-17.25,-71.28),'Pampas de La Joya':(-16.62,-71.88),'Huaynaputina':(-16.6167,-70.8532),'Laguna de Salinas':(-16.35,-71.13),'Valle de Moquegua':(-17.19,-70.935)}
res={}
for k,(la,lo) in pts.items():
    c,r_=~T*(lo,la); w=(slice(int(r_)-2,int(r_)+3),slice(int(c)-2,int(c)+3))
    sw=sim[w]; vw=via[w]
    res[k]=dict(sim=None if np.all(np.isnan(sw)) else round(float(np.nanmean(sw))), via=None if np.all(np.isnan(vw)) else round(float(np.nanmean(vw))),
      rank=None if np.all(np.isnan(sw)) else round(float((v<np.nanmean(sw)).mean()*100)), dT=round(float(np.nanmean(dT[w])),1), slope=round(float(np.nanmean(slope[w])),1),
      lluvia=round(float(np.nanmean(rain[w]))), fe=None if not cov[w].any() else round(float(np.nanmean(fe[w]))*100), arcilla_sulf=None if not cov[w].any() else round(float(np.nanmean(cs[w]))*100),
      km_carretera=round(float(np.nanmean(dist[w])),1), anp=bool(anp[w].max()==1), elev=round(float(np.nanmean(elev[w]))),
      motivo=('ok' if ok[w].mean()>0.5 else 'descartado: '+', '.join(x for x,m in [('vegetación',veg),('ciudad',urb),('lluvia',wet)] if m[w].mean()>0.3)))
    print(k,res[k])
json.dump(res,open('data/resultados.json','w'),ensure_ascii=False,indent=1)
# Yungay with same scales (no EMIT)
with rasterio.open('data/atacama.tif') as r: A=[r.read(i).astype(float) for i in range(1,8)]; TA=r.transform
c,r_=~TA*(-69.95,-24.08); w=(slice(int(r_)-2,int(r_)+3),slice(int(c)-2,int(c)+3))
dd,sl,ra=[np.nanmean(A[i][w]) for i in (0,2,4)]
def lin(x,ab,rev=False):
    s=np.clip((x-ab[0])/(ab[1]-ab[0]),0,1); return 1-s if rev else s
ys=100*(lin(dd,r1)+(1 if sl<=15 else max(0,1-(sl-15)/10))+lin(ra,r2,True))/3
print('Yungay sim(3 ind)',round(ys),'rank',round(float((v<ys).mean()*100)))
# top zones
print('pct',np.round(np.nanpercentile(v,[25,50,75,90]),1))
# Yungay 4 indicadores
feA=np.load('data/emitA_fe.npy'); csA=np.load('data/emitA_gy.npy'); covA=np.load('data/emitA_cov.npy')
c,r_=~TA*(-69.95,-24.08); w=(slice(int(r_)-2,int(r_)+3),slice(int(c)-2,int(c)+3))
print('Yungay emit cov cells',int(covA[w].sum()))
if covA[w].any():
    MA=0.5*np.nanmean(feA[w])+0.5*np.nanmean(csA[w]); sm=lin(MA,r3)
    y4=100*(lin(dd,r1)+(1 if sl<=15 else max(0,1-(sl-15)/10))+lin(ra,r2,True)+sm)/4
    print('Yungay fe',round(np.nanmean(feA[w])*100),'arc',round(np.nanmean(csA[w])*100),'sim4',round(y4),'rank',round(float((v<y4).mean()*100)))
