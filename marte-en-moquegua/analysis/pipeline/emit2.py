import netCDF4 as nc, numpy as np, rasterio, re, sys
def run(tif, files, out):
    with rasterio.open(tif) as r: T=r.transform; H,W=r.height,r.width
    cnt=np.zeros((H,W)); fe=np.zeros((H,W)); cs=np.zeros((H,W))
    for f in files:
        d=nc.Dataset('/mnt/user-data/uploads/'+f)
        nm=[str(a)+' '+str(b) for a,b in zip(d['mineral_metadata']['name'][:],d['mineral_metadata']['sample_name'][:])]
        idx=np.array(d['mineral_metadata']['index'][:])
        ids=lambda p: [int(idx[i]) for i in range(len(idx)) if re.search(p,nm[i],re.I)]
        feids=ids('hematite|goethite'); csids=ids('gypsum|jarosite|smectite|montmoril|nontronite|saponite')
        lat=np.array(d['location']['lat'][:]); lon=np.array(d['location']['lon'][:])
        g1=np.array(d['group_1_mineral_id'][:]); g2=np.array(d['group_2_mineral_id'][:]); b1=np.array(d['group_1_band_depth'][:]); b2=np.array(d['group_2_band_depth'][:])
        v=(lat>-90)&(b1>-9000); c,r=~T*(lon,lat); r=r.astype(int); c=c.astype(int); m=v&(r>=0)&(r<H)&(c>=0)&(c<W)
        np.add.at(cnt,(r[m],c[m]),1); np.add.at(fe,(r[m],c[m]),(np.isin(g1,feids)&(b1>0))[m]); np.add.at(cs,(r[m],c[m]),(np.isin(g2,csids)&(b2>0))[m])
        print(f,'pixels in grid',int(m.sum()))
    cov=cnt>20
    np.save(out+'_fe.npy',np.where(cov,fe/np.maximum(cnt,1),np.nan)); np.save(out+'_gy.npy',np.where(cov,cs/np.maximum(cnt,1),np.nan)); np.save(out+'_cov.npy',cov)
    print(out,'covered cells',int(cov.sum()))
moq=['EMIT_L2B_MIN_002_20241118T175738.nc','EMIT_L2B_MIN_002_20241122T162131.nc','EMIT_L2B_MIN_002_20261101T133703.nc']
run('data/stack3.tif',moq,'data/emit')
run('data/atacama.tif',['EMIT_L2B_MIN_002_20240916T181724.nc'],'data/emitA')
