// Google Earth Engine (Code Editor) · UNEP aridity index AI = P / ET0
// ET0: TerraClimate 'pet' (ASCE Penman-Monteith, scale 0.1 mm), 1991-2020 climatology
// P:   TerraClimate 'pr' (1991-2020) and NASA GPM IMERG V07 monthly (2001-2020)
// Output grids match data/grid.json (EPSG:4326, 0.008983152841195215 deg)
var DX = 0.008983152841195215;
var tc = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE').filterDate('1991-01-01', '2021-01-01');
var petTC = tc.select('pet').sum().multiply(0.1).divide(30).rename('pet_tc');
var prTC  = tc.select('pr').sum().divide(30).rename('pr_tc');
var gpm = ee.ImageCollection('NASA/GPM_L3/IMERG_MONTHLY_V07').filterDate('2001-01-01', '2021-01-01').select('precipitation')
  .map(function (img) { var d = ee.Date(img.get('system:time_start'));
    return img.multiply(d.advance(1, 'month').difference(d, 'hour')).copyProperties(img, ['system:time_start']); });
var prGPM = gpm.sum().divide(20).rename('pr_gpm');
var stack = ee.Image.cat([petTC, prTC, prGPM, prTC.divide(petTC).rename('ai_tc'), prGPM.divide(petTC).rename('ai_gpm')]).resample('bilinear').toFloat();
function exportar(name, west, north, w, h) {
  Export.image.toDrive({ image: stack, description: name, folder: 'marte_moquegua', fileNamePrefix: name,
    region: ee.Geometry.Rectangle([west, north - h * DX, west + w * DX, north], null, false),
    crs: 'EPSG:4326', crsTransform: [DX, 0, west, 0, -DX, north], maxPixels: 1e9 });
}
exportar('aridez_moquegua', -72.30539721878029, -16.196624572674974, 224, 190);
exportar('aridez_atacama',  -70.60758133179439, -23.59874251381983,  113, 101);
exportar('aridez_utah',    -111.20244902115557,  38.708405592710186,  90,  68);
