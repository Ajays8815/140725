const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');

function loadEngine(file) {
  const html = fs.readFileSync(file, 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  const exportMarker = "if(typeof module!=='undefined')module.exports={simulate,DEFAULT,PRESETS};";
  const markerIndex = script?.indexOf(exportMarker) ?? -1;
  assert.notEqual(markerIndex, -1, `Could not find simulation engine in ${file}`);

  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(script.slice(0, markerIndex + exportMarker.length), sandbox, { filename: file });
  return sandbox.module.exports;
}

const v11 = loadEngine(path.join(root, 'STRATA_CAD_3D_V11.html'));
const v9 = loadEngine(path.join(root, 'mining-equipment-selector/public/strata-cad-3d.html'));
const { simulate, DEFAULT, PRESETS } = v11;
const reference = { ...DEFAULT, ...PRESETS.reference, conditional_routes: false };

const cases = [
  {
    id: 'A-shallow',
    inputs: { ...DEFAULT, ...PRESETS.shallow, previous_width: 40, conditional_routes: false },
    note: '10 m OB, 20 m active strip, 40 m previous strip.',
  },
  {
    id: 'B-intermediate',
    inputs: { ...DEFAULT, ...PRESETS.reference30, conditional_routes: false },
    note: '20 m OB, 24 m active strip, 30 m previous strip; matches the V9 reference preset.',
  },
  {
    id: 'C-reference',
    inputs: reference,
    note: '20 m OB, 32 m active strip, 65 m previous strip.',
  },
  {
    id: 'D-deep',
    inputs: { ...DEFAULT, ob: 30, drilled: 30, width: 32, previous_width: 65, pad_target: 18 },
    note: '30 m OB, 32 m active strip, 65 m previous strip; full assumed drilling.',
  },
  {
    id: 'E-wide-void',
    inputs: { ...DEFAULT, ob: 30, drilled: 30, width: 40, previous_width: 80, pad_target: 18 },
    note: '30 m OB, 40 m active strip, 80 m previous strip; full assumed drilling.',
  },
  {
    id: 'F-partial-blast',
    inputs: { ...DEFAULT, ob: 30, drilled: 10, width: 32, previous_width: 65, pad_target: 18 },
    note: '30 m OB with 10 m drilled; remaining intact OB must stay residual.',
  },
  {
    id: 'G-toe-clearance',
    inputs: { ...reference, toe_clearance: 3 },
    note: '3 m active-edge/toe clearance. The model has no independent old/new spoil separation parameter.',
  },
  {
    id: 'H-zero-cast',
    inputs: { ...reference, cast_fraction: 0 },
    note: 'Zero direct cast.',
  },
  {
    id: 'I-zero-dozer',
    inputs: { ...reference, dozer_equivalent: 0 },
    note: 'Zero requested dozer allocation.',
  },
];

function resultRecord(id, inputs, note) {
  const { summary, inputs: modeledInputs } = simulate(inputs, false);
  const relativeError = Math.abs(summary.mass_error_bcm);
  assert.ok(relativeError < 1e-5, `${id}: material balance ${summary.mass_error_bcm}`);
  assert.ok(
    summary.max_spoil_slope_deg <= modeledInputs.spoil_angle + 1e-5,
    `${id}: modeled slope exceeds angle input`
  );
  assert.equal(modeledInputs.conditional_routes, false, `${id}: V11 test must screen routes strictly`);
  assert.equal(summary.conditional_route_bcm, 0, `${id}: strict route must not count bypassed volume`);
  if (summary.status !== 'screening_complete') {
    assert.equal(summary.cost_per_removed_bcm, null, `${id}: incomplete case must not publish comparable unit cost`);
  }

  return {
    id,
    note,
    inputs: {
      overburden_m: modeledInputs.ob,
      drilled_m: modeledInputs.drilled,
      active_width_m: modeledInputs.width,
      previous_width_m: modeledInputs.previous_width,
      strike_length_m: modeledInputs.length,
      spoil_angle_deg: modeledInputs.spoil_angle,
      old_spoil_fraction: modeledInputs.old_spoil_fraction,
      toe_clearance_m: modeledInputs.toe_clearance,
      cast_fraction: modeledInputs.cast_fraction,
      dozer_equivalent_m: modeledInputs.dozer_equivalent,
      conditional_routes: modeledInputs.conditional_routes,
    },
    result: {
      status: summary.status,
      completion_pct: Number((100 * summary.removed_bcm / summary.initial_bcm).toFixed(3)),
      initial_overburden_bcm: Number(summary.initial_bcm.toFixed(3)),
      cast_bcm: Number(summary.cast_bcm.toFixed(3)),
      dozer_bcm: Number(summary.dozer_bcm.toFixed(3)),
      dozer_rehandle_bcm: Number(summary.dozer_rehandle_bcm.toFixed(3)),
      dragline_bcm: Number(summary.dragline_bcm.toFixed(3)),
      unfragmented_bcm: Number(summary.unfragmented_bcm.toFixed(3)),
      residual_bcm: Number(summary.residual_bcm.toFixed(3)),
      retained_support_bcm: Number(summary.final_pad_bcm.toFixed(3)),
      spoil_required_lcm: Number(summary.full_loose_lcm.toFixed(3)),
      spoil_capacity_lcm: Number(summary.capacity_lcm.toFixed(3)),
      spoil_used_lcm: Number(summary.spoil_used_lcm.toFixed(3)),
      unused_capacity_lcm: Number(Math.max(0, summary.capacity_lcm - summary.spoil_used_lcm).toFixed(3)),
      design_profile_max_gap_m: Number(summary.spoil_design_max_gap_m.toFixed(3)),
      target_spoil_angle_deg: modeledInputs.spoil_angle,
      modeled_max_spoil_slope_deg: Number(summary.max_spoil_slope_deg.toFixed(3)),
      material_balance_error_bcm: summary.mass_error_bcm,
      d11_machine_hours: Number(summary.dozer_machine_h.toFixed(3)),
      dragline_machine_hours: Number(summary.dragline_work_h.toFixed(3)),
      dozer_bcm_per_machine_hour: summary.dozer_bcm_h,
      dragline_bcm_per_machine_hour: summary.dragline_bcm_h,
      modeled_total_cost: Number(summary.modeled_cost.toFixed(3)),
      comparable_complete_cost_per_bcm: summary.cost_per_removed_bcm,
      partial_cost_per_excavated_bcm: summary.partial_cost_per_removed_bcm == null
        ? null
        : Number(summary.partial_cost_per_removed_bcm.toFixed(6)),
      stations_worked: summary.stations_worked,
      stations_total: summary.stations_total,
      d11_handover_screen_passed: summary.stations_worked > 0,
      conditional_route_volume_bcm: summary.conditional_route_bcm,
      flags: summary.flags,
    },
    checks: {
      bank_loose_balance_within_1e_5_bcm: relativeError < 1e-5,
      max_modeled_slope_within_input_angle: summary.max_spoil_slope_deg <= modeledInputs.spoil_angle + 1e-5,
      strict_route_mode: !modeledInputs.conditional_routes,
      incomplete_cost_not_comparable: summary.status === 'screening_complete'
        || summary.cost_per_removed_bcm === null,
    },
  };
}

const scenarioResults = cases.map(test => resultRecord(test.id, test.inputs, test.note));
const angleResults = [30, 35, 38, 45].map(angle =>
  resultRecord(`C-angle-${angle}`, { ...reference, spoil_angle: angle }, `Reference case with ${angle} degree design angle.`)
);
const footprintResults = [0, 0.25, 0.5, 0.75].map(fraction =>
  resultRecord(`C-old-spoil-${fraction}`, { ...reference, old_spoil_fraction: fraction }, `Reference case with ${fraction * 100}% prior-spoil footprint.`)
);

const v9ReferenceEngine = loadEngine(path.join(root, 'mining-equipment-selector/public/strata-cad-3d.html'));
const v9Reference = v9ReferenceEngine.simulate(
  { ...v9ReferenceEngine.DEFAULT, ...v9ReferenceEngine.PRESETS.reference30 },
  false
).summary;
const v11Reference = simulate({ ...DEFAULT, ...PRESETS.reference30, conditional_routes: false }, false).summary;
const v9Demo = v9.simulate(
  { ...v9.DEFAULT, ...v9.PRESETS.finish38, conditional_routes: true },
  false
).summary;
const v11Demo = simulate({ ...DEFAULT, ...PRESETS.finish38, conditional_routes: false }, false).summary;
assert.ok(Math.abs((100 * v9Reference.removed_bcm / v9Reference.initial_bcm) - 42.3) < 0.1);
assert.ok(Math.abs(v9Reference.capacity_lcm - 26368) < 1);
assert.equal(v9Reference.dragline_bcm, 0);

const report = {
  title: 'STRATA CAD 3D V11 numerical screening validation',
  generated_at_utc: new Date().toISOString(),
  source_baseline: 'V9 checked-in HTML; the requested V10 HTML was not supplied.',
  execution: {
    engine: 'Standalone JavaScript simulation extracted from the deliverable HTML and executed in Node.js.',
    real_browser_run: false,
    screenshots_captured: false,
    full_browser_test_note: 'No local Chromium/Firefox binary or browser automation tool was available in this environment. These are numerical-engine checks only.',
    material_balance_tolerance_bcm: 1e-5,
    scope_note: 'Passing these checks verifies bookkeeping and configured slope bounds, not mining feasibility, geotechnical stability, OEM limits, or blast behavior.',
  },
  reproduction_of_prompt_case: {
    case: '20 m OB, 24 m active, 30 m previous; V9 reference30 preset',
    v9: {
      completion_pct: Number((100 * v9Reference.removed_bcm / v9Reference.initial_bcm).toFixed(3)),
      residual_bcm: Number(v9Reference.residual_bcm.toFixed(3)),
      capacity_lcm: Number(v9Reference.capacity_lcm.toFixed(3)),
      required_lcm: Number(v9Reference.full_loose_lcm.toFixed(3)),
      dragline_bcm: Number(v9Reference.dragline_bcm.toFixed(3)),
      mass_balance_error_bcm: v9Reference.mass_error_bcm,
      conditional_route_setting: v9ReferenceEngine.PRESETS.reference30.conditional_routes,
    },
    v11_strict_route: {
      completion_pct: Number((100 * v11Reference.removed_bcm / v11Reference.initial_bcm).toFixed(3)),
      residual_bcm: Number(v11Reference.residual_bcm.toFixed(3)),
      capacity_lcm: Number(v11Reference.capacity_lcm.toFixed(3)),
      required_lcm: Number(v11Reference.full_loose_lcm.toFixed(3)),
      dragline_bcm: Number(v11Reference.dragline_bcm.toFixed(3)),
      mass_balance_error_bcm: v11Reference.mass_error_bcm,
      conditional_route_setting: false,
      comparable_complete_cost_per_bcm: v11Reference.cost_per_removed_bcm,
      partial_cost_per_excavated_bcm: Number(v11Reference.partial_cost_per_removed_bcm.toFixed(6)),
    },
    interpretation: 'The V9 run independently reproduces approximately 42.3% removal, 26,368 LCM modeled capacity, and zero dragline BCM. Strict-route mode does not imply a route exists; the V11 run retains the modeled incomplete status and withholds a complete-case unit cost.',
  },
  default_demo_comparison: {
    preset: 'finish38',
    v9: {
      completion_pct: Number((100 * v9Demo.removed_bcm / v9Demo.initial_bcm).toFixed(3)),
      residual_bcm: Number(v9Demo.residual_bcm.toFixed(3)),
      dozer_bcm: Number(v9Demo.dozer_bcm.toFixed(3)),
      dragline_bcm: Number(v9Demo.dragline_bcm.toFixed(3)),
      conditional_route_volume_bcm: Number(v9Demo.conditional_route_bcm.toFixed(3)),
    },
    v11_strict_route: {
      completion_pct: Number((100 * v11Demo.removed_bcm / v11Demo.initial_bcm).toFixed(3)),
      residual_bcm: Number(v11Demo.residual_bcm.toFixed(3)),
      dozer_bcm: Number(v11Demo.dozer_bcm.toFixed(3)),
      dragline_bcm: Number(v11Demo.dragline_bcm.toFixed(3)),
      conditional_route_volume_bcm: Number(v11Demo.conditional_route_bcm.toFixed(3)),
    },
    interpretation: 'The prompt reports 87.87% for a V10 default demo. The available V9 finish38 preset produces 94.272% only with 1,120 BCM routed conditionally; strict V11 routes reject that sequence and leave cast-only 40% removal. The V10-specific result cannot be independently reproduced without its source.',
  },
  scenario_matrix: scenarioResults,
  spoil_angle_sensitivity: angleResults,
  prior_spoil_footprint_sensitivity: footprintResults,
  outstanding_requirements: [
    'Temporary post-blast muckpile inventory and later rehandling are not modeled.',
    'Old/new spoil separation is not an independent input; toe_clearance is not a substitute for that geometry.',
    'No surveyed surface import, ramp construction/recovery, or connected 3D route proof.',
    'Dragline reach/depth and payload are not a coupled OEM operating chart.',
    'Dozer/dragline cycle rates remain illustrative assumptions; no validated grade/power or field calibration.',
    'No site-specific geotechnical or blast model.',
    'No real-browser testing or stage screenshots in this validation run.',
    'V10-specific reported results cannot be verified without the V10 source file.',
  ],
};

const output = path.join(root, 'STRATA_V11_Validation.json');
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, output)} with ${scenarioResults.length} geometry cases, ${angleResults.length} angle cases, and ${footprintResults.length} prior-spoil cases.`);
