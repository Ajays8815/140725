# STRATA CAD 3D V11: engineering method and validation notes

## What this release is

V11 is a conservative screening release derived from the checked-in V9 HTML. The requested V10 source and reference diagrams were not present in the workspace, so this is not represented as a V10-to-V11 audit or a validated production model. V11 keeps the existing browser simulator and adds stricter example-route defaults, qualification of full-completion unit costs, and local last-run restore.

The scenarios are conceptual. They are not blast designs, surveyed terrain, geotechnical acceptance, OEM-certified operating envelopes, or operating instructions.

## Calculation method in the available engine

### Terrain, spoil design, and capacity

The engine represents the prior-strip spoil as a one-sided wedge, with old-spoil height increasing toward its assumed toe:

`z_old(x) = base_floor + max(0, old_toe - x) tan(theta)`

The new-spoil design envelope is the higher of existing ground and the capped inclined target:

`z_design(x) = max(z_old(x), min(crest_limit, base_floor + max(0, design_toe - x) tan(theta)))`

Thus `H = D tan(theta)` is the cross-section relation used for the target face. The target toe is found by bisection against the lesser of required loose inventory and the modeled envelope capacity. Capacity is numerically integrated across piecewise-linear profile intervals and multiplied by strike length. Actual deposits remain distinct from the target envelope; local deposition is limited by cell capacity and neighboring-slope headroom.

Limitations: this is a regularized, discrete conceptual surface, not a surveyed triangulated surface or geotechnical stability calculation. The grid-based neighbor slope limit does not certify a continuous 38-degree design face. Separate old/new spoil separation, drainage geometry, temporary post-blast stockpiles, ramp construction, and surveyed old-spoil topography are not modeled.

### Bank and loose material

The engine converts a source bank volume to loose material using:

`loose volume = bank volume × (1 + swell factor)`

Transfers reduce fragmented source bank inventory and increase receiving loose inventory. The reported bank-equivalent reconciliation is:

`mass error = initial BCM - remaining BCM - deposited LCM / (1 + swell factor)`

The engine asserts a small numerical tolerance on stage balances and receiving-cell capacity. This establishes bookkeeping conservation within the model; it does not validate the modeled blast shape, material behavior, or geometry.

The cast step creates a smoothed, volume-fitted source and receiving profile for each strike station. It places only into the modeled final spoil cells. There is no separate temporary muckpile inventory, so the model cannot yet represent temporary placement outside the final envelope followed by later dozer or dragline rehandling.

### Dozer cycle estimate

The implemented dozer cycle estimate uses:

`cycle seconds = 3.6 × push distance / forward km/h + 3.6 × return distance / reverse km/h + fixed seconds`

`machine hours = loose volume / (blade capacity × fill factor) × cycle seconds / (3600 × efficiency)`

The values are deterministic planning assumptions. Terrain grade is screened against a user limit, but cycle time is not corrected with Caterpillar grade/power/traction performance curves; cutting resistance, operator variability, slot sequencing, and ramp build/recovery are not resolved. The calculated geometric pivot is reported separately from an illustrative economic crossover; neither is a site-validated optimum.

Published sources describe bulk push as geometry- and operation-dependent. MEC defines the pivot point as the intersection of the blast profile and final lowwall and discusses the trade-off between dozer handling and later rehandle. ACARP C24037 describes a measured/validated simulation framework for pivot-push sequencing and compares operational variants. STRATA's current nearest-feasible-cell push heuristic is not that published framework.

### Dragline cycle and reach screening

The engine limits effective loose bucket volume to the lesser of bucket capacity times fill factor and the residual payload allowance divided by loose density. Its cycle estimate adds illustrative swing-angle and excavation-depth adjustments to a user-entered base cycle, then applies operating efficiency. It uses a simplified reach/depth curve and a 40.5 m screening cap from the existing implementation.

This is not a coupled OEM load chart. The LMD 1200's published configuration-dependent figures include up to 30 t maximum lifting capacity at 40 m working radius, bucket options up to 12.25 m³, digging depths up to 25 m, and variable boom configurations. The V11 model's default 7.65 m³ effective bucket assumption and 25 t gross-load input are not equivalent to a certified operating configuration. Users must supply the actual machine/boom/bucket configuration and OEM-approved operating chart before relying on a reach or payload decision.

Caterpillar's D11 specifications list multiple blade configurations; the 34.4 m³ value retained in STRATA corresponds to a particular specification option, not every D11 setup. Dozer cycle inputs are not Caterpillar production-handbook outputs.

## V11 changes made

1. The reference presets no longer silently enable conditional D11 route bypass. If users manually enable conditional routes, the existing warning identifies the route and ramp as unverified.
2. The headline cost per removed BCM is now withheld unless the model reports complete excavation, no retained support, no outside residual, an acceptable modeled existing spoil slope, and strict routes. Modeled total cost and partial cost per excavated BCM remain in JSON for transparency; partial cases are not presented as comparable completed-case unit costs.
3. The sidebar now says explicitly that conditional-route mode does not design a ramp or verify access.
4. The standalone HTML includes the local scenario tools and session restore, so the V11 HTML works without a separate JavaScript file.

## Source references and what they support

- [MEC Mining: Reduce Operating Costs through Effective Bulk Dozer Push](https://mecmining.com.au/resources/reduce-operating-costs-through-effective-bulk-dozer-push/) — pivot-point concept and operational trade-offs. Supports the concept, not STRATA's cell-placement or productivity formula.
- [ACARP C24037: Automated Bulk Dozer Push—Reducing the Cost of Overburden Removal](https://www.acarp.com.au/abstracts.aspx?repId=C24037) — University of Queensland/Caterpillar work describing a survey-geometry/material/machine-input simulation, sequence productivity, and comparison with measured operation. The full report is not embedded in this release.
- [University of Queensland: A treatise on the productivity of semi-automated pivot push bulldozing](https://espace.library.uq.edu.au/view/UQ:18ede80) — research summary reports geometry-sensitive productivity and variant-dependent preferred tactics; the repository page was access-restricted during this review.
- [3D-Dig dragline bench-design guidance](https://3ddig.online/hm_dragline_bench_design.htm) — describes longitudinal bench profiling against reach and maximum-dig-depth limits. It does not validate STRATA's specific machine footprint or support model.
- [Liebherr LMD 1200 product information](https://www.liebherr.com/en-int/material-handling/products/duty-cycle-crawler-cranes/mining-9288505) and [Liebherr launch release](https://www.liebherr.com/en-us/n/liebherr-presents-new-dragline-machine-lmd-1200-271875-3782185) — OEM-published configuration-dependent capacity, radius, bucket, boom, and depth figures.
- [Caterpillar D11 technical specifications](https://s7d2.scene7.com/is/content/Caterpillar/CM20240130-2d0b5-7ecb5) — OEM blade/configuration specifications. The selected blade must match the actual machine.

The geometry identity and bank/loose conversion are dimensional relationships; the cycle-time equations above are simplified model assumptions, not formulas attributed to these sources.

## Validation status and outstanding work

`STRATA_V11_Validation.json` contains the outputs from the checked-in JavaScript engine for the requested case matrix, angle sensitivity, and old-spoil footprint sensitivity. These are numerical simulation checks, not browser screenshots or operational validation. The tests confirm mass balance and report failed handovers/residual inventory rather than forcing completion.

The 20 m OB / 24 m active / 30 m previous-strip case with the V9 reference preset reproduces approximately 42.3% removal and about 26,368 LCM modeled receiving capacity; it produces no dragline excavation. The V9 `finish38` demo preset produces 94.272% removal only with 1,120 BCM moved under its conditional-route option. V11 strict routing rejects that sequence and leaves 40% cast-only removal. The prompt's reported 87.87% V10 default result is not reproduced by the available V9 source and cannot be checked without the V10 file.

Not implemented in this release: temporary muckpile storage/rehandling, surveyed terrain import, route surface/ramp construction and recovery, validated pivot-push optimization, coupled OEM load charts, detailed blast mechanics, D11 or dragline rigid-body machine animation, a two-minute narrated tutorial, automated geometry optimization, or geotechnical assessment. A real Chromium browser and screenshot environment were unavailable during this pass; jsdom/Node checks are not a substitute for the requested manual browser and console tests.
