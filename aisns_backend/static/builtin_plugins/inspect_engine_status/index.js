const InspectEngineStatusPlugin = {
    info: {
        id: 'inspect-engine-status',
        name: 'Inspect Engine Status',
        version: '1.0.0',
        description: 'Inspect SNS engine variables and call engine functions'
    },

    async render(container, api) {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px; padding:12px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div style="font-weight:600;">Inspect Engine Status</div>
                    <button class="btn btn-secondary" type="button" id="ies_refresh">Refresh</button>
                </div>

                <div style="font-size:12px; color:var(--text-secondary,#666);" id="ies_status"></div>

                <div class="settings-section" style="margin:0;">
                    <div class="settings-section-title" style="margin:0 0 6px 0;">
                        <span>Default Snapshot</span>
                    </div>
                    <pre style="white-space:pre-wrap; word-break:break-word; background: var(--bg-secondary,#f5f5f5); padding:10px; border-radius:6px; max-height:220px; overflow:auto;" id="ies_default"></pre>
                </div>

                <div class="settings-section" style="margin:0;">
                    <div class="settings-section-title" style="margin:0 0 6px 0;">
                        <span>Watch Variables</span>
                    </div>

                    <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap;">
                        <div class="form-group" style="flex:1; min-width:220px; margin:0;">
                            <label>Variable path</label>
                            <input class="form-input" id="ies_var_name" placeholder="e.g. started_flag or taskmng.current_objective" />
                        </div>
                        <button class="btn btn-primary" type="button" id="ies_var_add">Add</button>
                    </div>

                    <div id="ies_watch_list" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;"></div>
                </div>

                <div class="settings-section" style="margin:0;">
                    <div class="settings-section-title" style="margin:0 0 6px 0;">
                        <span>Call Function</span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <div class="form-group" style="margin:0;">
                            <label>Function path</label>
                            <input class="form-input" id="ies_fn_name" placeholder="e.g. get_status" />
                        </div>

                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1; min-width:220px; margin:0;">
                                <label>Args (JSON)</label>
                                <input class="form-input" id="ies_fn_args" placeholder="[]" />
                            </div>
                            <div class="form-group" style="flex:1; min-width:220px; margin:0;">
                                <label>Kwargs (JSON)</label>
                                <input class="form-input" id="ies_fn_kwargs" placeholder="{}" />
                            </div>
                        </div>

                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <button class="btn btn-primary" type="button" id="ies_fn_call">Call</button>
                            <div style="font-size:12px; color:var(--text-secondary,#666);">Calling functions may change engine state.</div>
                        </div>

                        <pre style="white-space:pre-wrap; word-break:break-word; background: var(--bg-secondary,#f5f5f5); padding:10px; border-radius:6px; max-height:220px; overflow:auto;" id="ies_fn_result"></pre>
                    </div>
                </div>
            </div>
        `;

        const statusEl = container.querySelector('#ies_status');
        const refreshBtn = container.querySelector('#ies_refresh');
        const defaultEl = container.querySelector('#ies_default');
        const varNameEl = container.querySelector('#ies_var_name');
        const varAddBtn = container.querySelector('#ies_var_add');
        const watchListEl = container.querySelector('#ies_watch_list');
        const fnNameEl = container.querySelector('#ies_fn_name');
        const fnArgsEl = container.querySelector('#ies_fn_args');
        const fnKwargsEl = container.querySelector('#ies_fn_kwargs');
        const fnCallBtn = container.querySelector('#ies_fn_call');
        const fnResultEl = container.querySelector('#ies_fn_result');

        const watchers = new Map();

        const setStatus = (t) => {
            if (!statusEl) return;
            statusEl.textContent = t ? String(t) : '';
        };

        const safeStringify = (obj) => {
            try {
                return JSON.stringify(obj, null, 2);
            } catch (e) {
                try {
                    return String(obj);
                } catch (e2) {
                    return '';
                }
            }
        };

        const renderDefault = (resp) => {
            if (!defaultEl) return;
            defaultEl.textContent = safeStringify(resp);
        };

        const refreshDefault = async () => {
            const resp = await api.sns.getJson('/api/sns/engine-inspect/default');
            renderDefault(resp);
            if (resp && resp.success === false) {
                setStatus(resp.message || 'Engine inspect failed.');
            } else {
                setStatus('');
            }
            return resp;
        };

        const fetchVar = async (name) => {
            return await api.sns.postJson('/api/sns/engine-inspect/var', { name });
        };

        const refreshWatcher = async (name) => {
            const rec = watchers.get(name);
            if (!rec) return;

            rec.valueEl.textContent = 'Loading...';
            try {
                const resp = await fetchVar(name);
                if (resp && resp.success) {
                    rec.valueEl.textContent = safeStringify(resp.value);
                } else {
                    rec.valueEl.textContent = resp && resp.message ? String(resp.message) : 'Failed';
                    if (resp && resp.success === false && resp.message) {
                        setStatus(resp.message);
                    }
                }
            } catch (e) {
                rec.valueEl.textContent = e && e.message ? String(e.message) : String(e);
            }
        };

        const renderWatcherRow = (name) => {
            if (!watchListEl) return;
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.flexDirection = 'column';
            row.style.gap = '6px';
            row.style.border = '1px solid var(--border-color, #e6e6e6)';
            row.style.borderRadius = '8px';
            row.style.padding = '10px';
            row.dataset.watch = name;

            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.justifyContent = 'space-between';
            header.style.gap = '8px';

            const title = document.createElement('div');
            title.style.fontWeight = '600';
            title.style.fontSize = '12px';
            title.textContent = name;

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '8px';

            const btnRefresh = document.createElement('button');
            btnRefresh.className = 'btn btn-secondary';
            btnRefresh.type = 'button';
            btnRefresh.textContent = 'Refresh';

            const btnRemove = document.createElement('button');
            btnRemove.className = 'btn btn-secondary';
            btnRemove.type = 'button';
            btnRemove.textContent = 'Remove';

            actions.appendChild(btnRefresh);
            actions.appendChild(btnRemove);

            header.appendChild(title);
            header.appendChild(actions);

            const valueEl = document.createElement('pre');
            valueEl.style.whiteSpace = 'pre-wrap';
            valueEl.style.wordBreak = 'break-word';
            valueEl.style.background = 'var(--bg-secondary,#f5f5f5)';
            valueEl.style.padding = '10px';
            valueEl.style.borderRadius = '6px';
            valueEl.style.margin = '0';
            valueEl.style.maxHeight = '160px';
            valueEl.style.overflow = 'auto';
            valueEl.textContent = 'Loading...';

            row.appendChild(header);
            row.appendChild(valueEl);
            watchListEl.appendChild(row);

            btnRefresh.addEventListener('click', async () => {
                await refreshWatcher(name);
            });

            btnRemove.addEventListener('click', () => {
                watchers.delete(name);
                row.remove();
            });

            watchers.set(name, { row, valueEl });
        };

        const addWatcher = async () => {
            const name = String(varNameEl ? varNameEl.value : '').trim();
            if (!name) {
                api.ui.toast('error', 'Variable path is required.');
                return;
            }
            if (watchers.has(name)) {
                api.ui.toast('info', 'This variable is already watched.');
                return;
            }

            renderWatcherRow(name);
            await refreshWatcher(name);

            try {
                if (varNameEl) varNameEl.value = '';
            } catch (e) {
            }
        };

        const refreshAll = async () => {
            await refreshDefault();
            for (const name of watchers.keys()) {
                // sequential refresh to keep UI responsive
                await refreshWatcher(name);
            }
        };

        const parseJsonOrToast = (raw, fallback, label) => {
            const s = String(raw || '').trim();
            if (!s) return fallback;
            try {
                return JSON.parse(s);
            } catch (e) {
                api.ui.toast('error', `${label} must be valid JSON.`);
                return null;
            }
        };

        const callFunction = async () => {
            const name = String(fnNameEl ? fnNameEl.value : '').trim();
            if (!name) {
                api.ui.toast('error', 'Function path is required.');
                return;
            }

            const args = parseJsonOrToast(fnArgsEl ? fnArgsEl.value : '[]', [], 'Args');
            if (args === null) return;
            const kwargs = parseJsonOrToast(fnKwargsEl ? fnKwargsEl.value : '{}', {}, 'Kwargs');
            if (kwargs === null) return;

            if (fnResultEl) fnResultEl.textContent = 'Calling...';
            try {
                const resp = await api.sns.postJson('/api/sns/engine-inspect/call', {
                    name,
                    args,
                    kwargs
                });
                if (fnResultEl) fnResultEl.textContent = safeStringify(resp);
                if (resp && resp.success === false && resp.message) {
                    setStatus(resp.message);
                }
            } catch (e) {
                if (fnResultEl) fnResultEl.textContent = e && e.message ? String(e.message) : String(e);
            }
        };

        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await refreshAll();
            });
        }

        if (varAddBtn) {
            varAddBtn.addEventListener('click', async () => {
                await addWatcher();
            });
        }

        if (varNameEl) {
            varNameEl.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await addWatcher();
                }
            });
        }

        if (fnCallBtn) {
            fnCallBtn.addEventListener('click', async () => {
                await callFunction();
            });
        }

        await refreshAll();
    },

    dispose() {
        // No timers to clean up.
    }
};

export default InspectEngineStatusPlugin;
