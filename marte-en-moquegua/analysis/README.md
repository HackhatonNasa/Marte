# Analysis and data pipeline

Everything needed to reproduce the numbers shown in the app.

| File | What it does | Runs on |
|---|---|---|
| `prepare_v6.py` | Recomputes AI = P / ET0 per cell from the stored TerraClimate components and rebuilds the exclusion mask | `data/` |
| `robustness.py` | 2,400 runs (12 method configurations x 200 weightings, seed 1). Writes `robustness_runs.csv`, `robustness_summary.json` and `data/meta.json -> robust` | `data/` |
| `gee_aridity_index.js` | Earth Engine export of TerraClimate P, ET0 (1991-2020), NASA GPM P (2001-2020) and AI on the app grid | Earth Engine |
| `gee_out_of_sample.js` | Extracts thermal swing and AI for 10 published analog sites + 500 random land points | Earth Engine |
| `oos_validate.py` | Percentile of each analog vs random land and AUC; writes `oos_results.json` and `data/meta.json -> oos` | CSV from the step above |
| `pipeline/` | Original processing: EMIT binning (`emit2.py`), scoring (`final.py`), grid export (`export_web*.py`). Raw rasters not included | raw GeoTIFF / netCDF |

## Data manifest

| Variable | Product (Earth Engine ID) | Period | Native resolution | Processing |
|---|---|---|---|---|
| Thermal swing | MODIS/061/MOD11A2 | 2023 | 1 km | mean LST day − mean LST night |
| NDVI | MODIS/061/MOD13A2 | 2023 | 1 km | annual mean; filter > 0.15 |
| Slope, elevation | USGS/SRTMGL1_003 | 2000 | 30 m | slope aggregated to 1 km |
| Night lights | NASA/VIIRS/002/VNP46A2 | annual | 500 m | filters > 2 and <= 0.5 |
| Rainfall | NASA/GPM_L3/IMERG_MONTHLY_V07 | 2001-2020 | ~11 km | annual mean, bilinear to 1 km |
| P, ET0 | IDAHO_EPSCOR/TERRACLIMATE | 1991-2020 | ~4.6 km | annual sums, bilinear to 1 km; AI = P / ET0 |
| Minerals | NASA EMIT L2B MIN V002 | available scenes | 60 m | % pixels with Fe oxides; % with sulfates/clays |
| Protected areas | WCMC/WDPA/current/polygons | current | vector | rasterised |
| Roads | OpenStreetMap (Overpass) | 2026 | vector | distance to trunk/primary/secondary/tertiary |

Grid: EPSG:4326, 224 x 190 cells of 0.008983 deg (about 1 km). Cell areas are computed geodesically in the app.

## Run

```
python analysis/prepare_v6.py      # only once, already applied to data/
python analysis/robustness.py
python analysis/oos_validate.py oos_points.csv   # after running gee_out_of_sample.js
```
