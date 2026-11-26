# 140725
# STRATA Engineering Lab

STRATA is a browser-based conceptual mine-planning workspace for a dozer-and-dragline sequence. It includes a 3D terrain view, scenario presets, a volume ledger, and CSV/JSON/OBJ export. The repository also contains the Mining Equipment Selector.

## Run locally

```bash
cd mining-equipment-selector
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The STRATA CAD workspace opens first; the equipment selector and equipment database remain available in the tabs.

## Scenario settings

In the STRATA sidebar, save scenarios in this browser, export/import settings as JSON, or copy a share link. Share links include the selected scenario inputs in the URL; do not use them for sensitive project data.

## Publish

The `Deploy STRATA Engineering Lab` workflow builds the React app and publishes it to GitHub Pages when changes are pushed to `main`. For this repository, the expected site URL is [https://ajays8815.github.io/140725/](https://ajays8815.github.io/140725/).

## Engineering limitations

This is concept-planning software, not an approved mine design, blast forecast, geotechnical assessment, or OEM-certified operating plan. Validate assumptions and results using measured site data and qualified mine-planning, geotechnical, and OEM personnel before operational use.
