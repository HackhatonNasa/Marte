// Google Earth Engine (Code Editor) · Out-of-sample check of the climatic part of the index
// Extracts, with the SAME products used by the app, the ground thermal swing (MODIS MOD11A2, 2023)
// and the UNEP aridity index (TerraClimate P / ET0, 1991-2020) for:
//   (a) published Mars analog field sites (coordinates are approximate site centres; edit if needed)
//   (b) 500 random land points (background) between 56°S and 60°N
// Output: CSV in Google Drive folder 'marte_moquegua'. Then run: python analysis/oos_validate.py <csv>
var analogs = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-69.95, -24.08]),  {site: 'Yungay, Atacama (Chile)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-71.88, -16.62]),  {site: 'Pampas de La Joya (Peru)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-110.792, 38.406]), {site: 'Mars Desert Research Station (Utah, USA)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-116.83, 36.25]),  {site: 'Death Valley (California, USA)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-115.79, 34.54]),  {site: 'Amboy crater, Mojave (USA)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-6.59, 37.69]),    {site: 'Rio Tinto (Spain)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([139.33, -30.31]),  {site: 'Arkaroola (Australia)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-155.49, 19.60]),  {site: 'HI-SEAS, Mauna Loa (Hawaii, USA)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([-89.68, 75.38]),   {site: 'Haughton crater (Devon Island, Canada)', group: 'analog'}),
  ee.Feature(ee.Geometry.Point([160.74, -77.86]),  {site: 'University Valley, Dry Valleys (Antarctica)', group: 'analog'})
]);
var land = ee.Image('USGS/SRTMGL1_003').mask();
var bg = ee.FeatureCollection.randomPoints({region: ee.Geometry.Rectangle([-180, -56, 180, 60], null, false), points: 4000, seed: 1})
  .map(function (f) { return f.set('land', land.reduceRegion(ee.Reducer.first(), f.geometry(), 1000).values().get(0)); })
  .filter(ee.Filter.notNull(['land'])).limit(500).map(function (f) { return f.set({site: 'background', group: 'background'}); });
var lst = ee.ImageCollection('MODIS/061/MOD11A2').filterDate('2023-01-01', '2024-01-01');
var dT = lst.select('LST_Day_1km').mean().multiply(0.02).subtract(lst.select('LST_Night_1km').mean().multiply(0.02)).rename('dT');
var tc = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE').filterDate('1991-01-01', '2021-01-01');
var ai = tc.select('pr').sum().divide(tc.select('pet').sum().multiply(0.1)).rename('ai');
var ndvi = ee.ImageCollection('MODIS/061/MOD13A2').filterDate('2023-01-01', '2024-01-01').select('NDVI').mean().multiply(0.0001).rename('ndvi');
var pts = analogs.merge(bg);
var out = dT.addBands(ai).addBands(ndvi).reduceRegions({collection: pts, reducer: ee.Reducer.mean(), scale: 1000});
Export.table.toDrive({collection: out, description: 'oos_points', folder: 'marte_moquegua', fileFormat: 'CSV', selectors: ['site', 'group', 'dT', 'ai', 'ndvi', '.geo']});
print('Analog sites', out.filter(ee.Filter.eq('group', 'analog')));
