(() => {
  const storageKey = 'strata-cad-scenarios-v1';
  const draftKey = 'strata-cad-last-session-v1';
  const rememberKey = 'strata-cad-remember-session-v1';
  const allowedInputs = new Set(fields.map(([key]) => key));
  const tools = document.createElement('section');
  tools.className = 'scenario-tools';
  tools.innerHTML = `
    <h3>Scenario tools</h3>
    <label class="scenario-remember" for="scenarioRemember">
      <input id="scenarioRemember" type="checkbox">
      <span>Remember my last run on this device</span>
    </label>
    <p class="scenario-hint">Only saved in this browser. Shared links and named scenarios are managed separately.</p>
    <label for="scenarioName">Scenario name</label>
    <input id="scenarioName" type="text" maxlength="60" placeholder="e.g. East pit — 20 m strip">
    <div class="scenario-actions">
      <button id="scenarioSave" type="button">Save on this device</button>
      <button id="scenarioShare" type="button">Copy share link</button>
    </div>
    <label for="scenarioList">Saved scenarios</label>
    <select id="scenarioList" aria-label="Saved scenarios"></select>
    <div class="scenario-actions">
      <button id="scenarioLoad" type="button">Load</button>
      <button id="scenarioExport" type="button">Export settings</button>
      <button id="scenarioImport" type="button">Import settings</button>
    </div>
    <input id="scenarioFile" type="file" accept="application/json,.json" hidden>
    <textarea id="scenarioLink" aria-label="Shareable scenario link" readonly hidden></textarea>
    <p id="scenarioStatus" role="status" aria-live="polite"></p>`;
  $('preset').insertAdjacentElement('afterend', tools);

  const style = document.createElement('style');
  style.textContent = `
    .scenario-tools{margin:14px 0;padding:12px;background:#f4f7f2;border:1px solid #dce4dd;border-radius:8px}
    .scenario-tools h3{margin:0 0 8px}
    .scenario-tools>input[type=text],.scenario-tools select,.scenario-tools textarea{width:100%;padding:7px 8px;border:1px solid #cdd8d1;border-radius:6px;background:#fff;color:#24352e;font:inherit}
    .scenario-tools label{margin:9px 0 5px}
    .scenario-tools .scenario-remember{justify-content:flex-start;align-items:flex-start;margin:0;font-size:11px}
    .scenario-tools .scenario-remember input{margin:2px 3px 0 0}
    .scenario-hint{margin:4px 0 9px;color:#65776e;font-size:10px;line-height:1.4}
    .scenario-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
    .scenario-actions button{font-size:11px;padding:6px 8px}
    #scenarioLink{margin-top:8px;min-height:64px;font-size:11px;overflow-wrap:anywhere}
    #scenarioStatus{min-height:16px;margin:7px 0 0;color:#53675a;font-size:11px;line-height:1.4}
    #scenarioStatus[data-error=true]{color:#843b2e}
  `;
  document.head.append(style);

  const status = $('scenarioStatus');
  const announce = (text, error = false) => {
    status.textContent = text;
    status.dataset.error = String(error);
  };

  function normalizeScenario(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) {
      throw new Error('Unsupported scenario file. Expected a version 1 STRATA settings file.');
    }
    if (typeof value.preset !== 'string' || !Object.hasOwn(PRESETS, value.preset)) {
      throw new Error('Scenario has an unknown example preset.');
    }
    if (!value.inputs || typeof value.inputs !== 'object' || Array.isArray(value.inputs)) {
      throw new Error('Scenario is missing its input settings.');
    }

    for (const [key, input] of Object.entries(value.inputs)) {
      if (!allowedInputs.has(key)) throw new Error(`Unknown scenario input: ${key}`);
      const expected = DEFAULT[key];
      if (typeof input !== typeof expected || (typeof input === 'number' && !Number.isFinite(input))) {
        throw new Error(`Invalid value for ${key}.`);
      }
    }

    const config = { ...DEFAULT, ...PRESETS[value.preset], ...value.inputs };
    validate(config);
    const name = typeof value.name === 'string' ? value.name.trim().slice(0, 60) : '';
    return { version: 1, name, preset: value.preset, inputs: value.inputs };
  }

  function currentScenario(name = '') {
    const values = readInputs();
    const inputs = Object.fromEntries(fields.map(([key]) => [key, values[key]]));
    return normalizeScenario({ version: 1, name, preset: $('preset').value, inputs });
  }

  function savedScenarios() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const values = JSON.parse(raw);
    if (!Array.isArray(values)) throw new Error('Saved scenario data is not a list.');
    return values.map(value => {
      const scenario = normalizeScenario(value);
      if (!scenario.name) throw new Error('A saved scenario is missing its name.');
      return scenario;
    });
  }

  function renderSavedScenarios() {
    const select = $('scenarioList');
    const scenarios = savedScenarios();
    select.replaceChildren(new Option('Choose a saved scenario', ''));
    scenarios.forEach((scenario, index) => {
      select.add(new Option(scenario.name, String(index)));
    });
  }

  function applyScenario(scenario) {
    $('preset').value = scenario.preset;
    setInputs({ ...DEFAULT, ...PRESETS[scenario.preset], ...scenario.inputs });
    run();
    if (dirty) throw new Error('These settings could not be calculated; check the input validation message.');
    persistDraft();
  }

  function rememberEnabled() {
    return $('scenarioRemember').checked;
  }

  function persistDraft() {
    if (!rememberEnabled() || dirty) return;
    localStorage.setItem(draftKey, JSON.stringify(currentScenario()));
  }

  function reportDraftSave() {
    try {
      persistDraft();
      if (rememberEnabled() && !dirty) announce('Last run saved on this device.');
    } catch (error) {
      announce(`Could not save this device’s last run: ${error.message}`, true);
    }
  }

  function saveFile(name, value) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function encodeScenario(scenario) {
    const bytes = new TextEncoder().encode(JSON.stringify(scenario));
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeScenario(encoded) {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
    return normalizeScenario(JSON.parse(new TextDecoder().decode(bytes)));
  }

  $('scenarioSave').addEventListener('click', () => {
    try {
      const name = $('scenarioName').value.trim();
      if (!name) throw new Error('Enter a scenario name before saving.');
      const scenario = currentScenario(name);
      const scenarios = savedScenarios();
      const existing = scenarios.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
      if (existing < 0 && scenarios.length >= 20) {
        throw new Error('This device can store up to 20 scenarios. Export or remove one before saving another.');
      }
      if (existing < 0) scenarios.push(scenario);
      else scenarios[existing] = scenario;
      localStorage.setItem(storageKey, JSON.stringify(scenarios));
      renderSavedScenarios();
      $('scenarioList').value = String(existing < 0 ? scenarios.length - 1 : existing);
      announce(`Saved “${name}” on this device.`);
    } catch (error) {
      announce(error.message, true);
    }
  });

  $('scenarioLoad').addEventListener('click', () => {
    try {
      const index = Number($('scenarioList').value);
      if (!Number.isInteger(index) || index < 0) throw new Error('Choose a saved scenario first.');
      const scenario = savedScenarios()[index];
      if (!scenario) throw new Error('The selected scenario is no longer available.');
      applyScenario(scenario);
      $('scenarioName').value = scenario.name;
      announce(`Loaded “${scenario.name}”.`);
    } catch (error) {
      announce(error.message, true);
    }
  });

  $('scenarioExport').addEventListener('click', () => {
    try {
      const name = $('scenarioName').value.trim();
      const scenario = currentScenario(name);
      saveFile('strata-scenario-settings.json', scenario);
      announce('Scenario settings exported as JSON.');
    } catch (error) {
      announce(error.message, true);
    }
  });

  $('scenarioImport').addEventListener('click', () => $('scenarioFile').click());
  $('scenarioFile').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const scenario = normalizeScenario(JSON.parse(await file.text()));
      applyScenario(scenario);
      $('scenarioName').value = scenario.name;
      announce('Scenario settings imported and applied.');
    } catch (error) {
      announce(`Could not import settings: ${error.message}`, true);
    } finally {
      event.target.value = '';
    }
  });

  $('scenarioShare').addEventListener('click', async () => {
    try {
      const url = new URL(location.href);
      url.searchParams.set('scenario', encodeScenario(currentScenario()));
      try {
        await navigator.clipboard.writeText(url.href);
        $('scenarioLink').hidden = true;
        announce('Share link copied to the clipboard.');
      } catch {
        $('scenarioLink').value = url.href;
        $('scenarioLink').hidden = false;
        announce('Clipboard access is unavailable. Copy the share link shown below.');
      }
    } catch (error) {
      announce(error.message, true);
    }
  });

  try {
    renderSavedScenarios();
    $('scenarioRemember').checked = localStorage.getItem(rememberKey) !== 'false';
  } catch (error) {
    $('scenarioRemember').checked = false;
    announce(`Local scenario storage is unavailable: ${error.message}`, true);
  }

  $('scenarioRemember').addEventListener('change', () => {
    try {
      localStorage.setItem(rememberKey, String(rememberEnabled()));
      if (rememberEnabled()) {
        reportDraftSave();
        if (dirty) announce('Your next successful run will be remembered on this device.');
      } else {
        localStorage.removeItem(draftKey);
        announce('Automatic session saving is off. Named scenarios are unchanged.');
      }
    } catch (error) {
      announce(`Could not update the local save setting: ${error.message}`, true);
    }
  });

  $('run').addEventListener('click', () => queueMicrotask(reportDraftSave));
  $('preset').addEventListener('change', () => queueMicrotask(reportDraftSave));

  const shared = new URL(location.href).searchParams.get('scenario');
  if (shared) {
    try {
      const scenario = decodeScenario(shared);
      applyScenario(scenario);
      announce('Shared scenario loaded from this link.');
    } catch (error) {
      announce(`Could not load the shared scenario: ${error.message}`, true);
    }
  } else if ($('scenarioRemember').checked) {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        applyScenario(normalizeScenario(JSON.parse(raw)));
        announce('Restored your last successful run from this device.');
      }
    } catch (error) {
      announce(`Could not restore the last run: ${error.message}`, true);
    }
  }
})();
