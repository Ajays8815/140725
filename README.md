# 140725
# STRATA Engineering Lab

STRATA CAD 3D V11 is a browser-based conceptual mine-planning workspace for a dozer-and-dragline sequence. It includes a 3D terrain view, scenario presets, a volume ledger, and CSV/JSON/OBJ export. The repository also contains the Mining Equipment Selector.

## Run locally

```bash
cd mining-equipment-selector
npm install
npm start
```

Open [http://localhost:3000/140725](http://localhost:3000/140725). The STRATA CAD workspace opens first; the equipment selector and equipment database remain available in the tabs.

## Scenario settings

In the STRATA sidebar, optionally remember your last successful run on this device, save named scenarios in this browser, export/import settings as JSON, or copy a share link. Automatic session saving can be turned off independently of named scenarios. Share links include the selected scenario inputs in the URL; do not use them for sensitive project data.

The standalone V11 file is [STRATA_CAD_3D_V11.html](./STRATA_CAD_3D_V11.html). Engineering assumptions and the reproducible scenario checks are documented in [STRATA_V11_METHOD.md](./STRATA_V11_METHOD.md) and [STRATA_V11_Validation.json](./STRATA_V11_Validation.json).

## Publish

The `Deploy STRATA Engineering Lab` workflow builds the React app and publishes it to GitHub Pages when changes are pushed to `main`. For this repository, the expected site URL is [https://ajays8815.github.io/140725/](https://ajays8815.github.io/140725/).

## Engineering limitations

This is concept-planning software, not an approved mine design, blast forecast, geotechnical assessment, or OEM-certified operating plan. Validate assumptions and results using measured site data and qualified mine-planning, geotechnical, and OEM personnel before operational use. The supplied technical prompt refers to a V10 file, but only V9 was available in the repository; the V10-specific audit numbers therefore cannot be independently checked.
