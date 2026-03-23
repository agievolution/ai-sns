const LogViewerPlugin = {
    info: {
        id: 'log-viewer',
        name: 'Log Viewer',
        version: '1.0.0',
        description: 'Browse backend LLM logs by date and file'
    },

    async render(container, api) {
        if (container) {
            container.style.height = '100%';
        }
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px; padding:12px; height:100%; min-height:0; box-sizing:border-box;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div style="font-weight:700; font-size:20px;">Log Viewer</div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-secondary" type="button" id="lv_reload">Reload</button>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
                    <div class="form-group" style="margin:0; width:100%;">
                        <label>Date</label>
                        <select class="form-input" id="lv_date" style="width:100%;">
                            <option value="">Loading...</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:0; width:100%;">
                        <label>File</label>
                        <select class="form-input" id="lv_file" style="width:100%;">
                            <option value="">Select a date first</option>
                        </select>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:10px; width:100%; flex:1 1 auto; min-height:0;">
                    <div class="form-group" style="margin:0; width:100%; display:flex; flex-direction:column; gap:12px; flex:1 1 auto; min-height:0;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                            <label style="margin:0;">Content</label>
                            <button type="button" id="lv_copy" class="btn btn-secondary" title="Copy" aria-label="Copy" style="padding:6px 8px; display:inline-flex; align-items:center; justify-content:center;">
                                <span style="display:inline-flex; width:16px; height:16px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
                                </span>
                            </button>
                        </div>
                        <div style="font-size:12px; color:var(--text-secondary,#666);" id="lv_status"></div>
                        <pre id="lv_content" style="white-space:pre-wrap; word-break:break-word; background: var(--bg-secondary,#f5f5f5); padding:10px; border-radius:6px; overflow:auto; user-select:text; width:100%; box-sizing:border-box; flex:1 1 auto; min-height:0;"></pre>
                    </div>
                </div>
            </div>
        `;

        const dateSel = container.querySelector('#lv_date');
        const fileSel = container.querySelector('#lv_file');
        const contentEl = container.querySelector('#lv_content');
        const statusEl = container.querySelector('#lv_status');
        const reloadBtn = container.querySelector('#lv_reload');
        const copyBtn = container.querySelector('#lv_copy');

        const EMPTY_PLACEHOLDER = 'No log content loaded yet.';
        let lastRawText = '';

        const setStatus = (t) => {
            if (statusEl) statusEl.textContent = t ? String(t) : '';
        };

        const setContent = (t) => {
            const v = (t === undefined || t === null) ? '' : String(t);
            lastRawText = v;
            if (!contentEl) return;
            const show = v ? v : EMPTY_PLACEHOLDER;
            contentEl.textContent = show;
            contentEl.style.color = v ? '' : 'var(--text-secondary,#666)';
        };

        const copyTextToClipboard = async (text) => {
            const v = (text === undefined || text === null) ? '' : String(text);
            if (!v) return false;
            try {
                if (window.electronAPI && typeof window.electronAPI.writeClipboardText === 'function') {
                    const res = await window.electronAPI.writeClipboardText(v);
                    if (res && res.success) return true;
                }
            } catch (e) {
            }
            try {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    await navigator.clipboard.writeText(v);
                    return true;
                }
            } catch (e) {
            }
            return false;
        };

        const _formatNdjson = (raw) => {
            const text = (raw === undefined || raw === null) ? '' : String(raw);
            if (!text.trim()) return '';
            const lines = text.split(/\r?\n/);
            const out = [];
            let idx = 1;
            for (const line of lines) {
                const rawLine = (line === undefined || line === null) ? '' : String(line);
                if (!rawLine.trim()) continue;
                out.push(`【${idx}】\n${rawLine}`);
                idx += 1;
            }
            return out.join('\n\n\n');
        };

        const safeJson = async (path) => {
            try {
                const res = await api.sns.getJson(path);
                return res;
            } catch (e) {
                return { success: false, error: e && e.message ? e.message : String(e) };
            }
        };

        const loadDates = async () => {
            setStatus('Loading dates...');
            const res = await safeJson('/api/system/logs/dates');
            if (!res || res.success === false) {
                setStatus(res && (res.message || res.error) ? (res.message || res.error) : 'Failed to load dates');
                if (dateSel) dateSel.innerHTML = '<option value="">No data</option>';
                return;
            }

            const dates = Array.isArray(res.data) ? res.data : [];
            if (!dates.length) {
                if (dateSel) dateSel.innerHTML = '<option value="">No log dates found</option>';
                setStatus('');
                return;
            }

            if (dateSel) {
                dateSel.innerHTML = '<option value="" disabled selected>Please select a date...</option>';
                for (const d of dates) {
                    const opt = document.createElement('option');
                    opt.value = String(d);
                    opt.textContent = String(d);
                    dateSel.appendChild(opt);
                }
            }
            setStatus('');
        };

        const loadFiles = async (date) => {
            const d = String(date || '').trim();
            if (!d) return;

            setStatus('Loading files...');
            if (fileSel) fileSel.innerHTML = '<option value="">Loading...</option>';

            const res = await safeJson(`/api/system/logs/files?date=${encodeURIComponent(d)}`);
            if (!res || res.success === false) {
                setStatus(res && (res.message || res.error) ? (res.message || res.error) : 'Failed to load files');
                if (fileSel) fileSel.innerHTML = '<option value="">No data</option>';
                return;
            }

            const files = Array.isArray(res.data) ? res.data : [];
            if (!files.length) {
                if (fileSel) fileSel.innerHTML = '<option value="">No log files found</option>';
                setStatus('');
                return;
            }

            if (fileSel) {
                fileSel.innerHTML = '<option value="" disabled selected>Please select a file...</option>';
                for (const f of files) {
                    const opt = document.createElement('option');
                    opt.value = String(f);
                    opt.textContent = String(f);
                    fileSel.appendChild(opt);
                }
            }
            setStatus('');
        };

        const refreshListsPreserveSelection = async () => {
            const prevDate = dateSel ? String(dateSel.value || '').trim() : '';
            const prevFile = fileSel ? String(fileSel.value || '').trim() : '';

            await loadDates();

            let activeDate = '';
            if (dateSel && prevDate) {
                const hasDate = Array.from(dateSel.options || []).some(o => String(o.value) === prevDate);
                if (hasDate) {
                    dateSel.value = prevDate;
                    activeDate = prevDate;
                }
            }

            if (!activeDate) {
                if (fileSel) {
                    fileSel.innerHTML = '<option value="">Select a date first</option>';
                }
                return;
            }

            await loadFiles(activeDate);

            if (fileSel && prevFile) {
                const hasFile = Array.from(fileSel.options || []).some(o => String(o.value) === prevFile);
                if (hasFile) {
                    fileSel.value = prevFile;
                }
            }
        };

        const loadFileContent = async () => {
            const date = String(dateSel ? dateSel.value : '').trim();
            const name = String(fileSel ? fileSel.value : '').trim();
            if (!date || !name) return;

            setStatus('Loading file...');
            setContent('');

            const res = await safeJson(`/api/system/logs/file?date=${encodeURIComponent(date)}&name=${encodeURIComponent(name)}`);
            if (!res || res.success === false) {
                setStatus(res && (res.message || res.error) ? (res.message || res.error) : 'Failed to load file');
                return;
            }

            const content = res.data && typeof res.data === 'object' ? (res.data.content || '') : '';
            const formatted = _formatNdjson(content);
            setContent(formatted);
            setStatus('');
        };

        if (dateSel) {
            dateSel.addEventListener('change', async () => {
                const date = String(dateSel.value || '').trim();
                setContent('');
                await loadFiles(date);
            });
        }

        if (fileSel) {
            fileSel.addEventListener('change', async () => {
                await loadFileContent();
            });
        }

        if (reloadBtn) {
            reloadBtn.addEventListener('click', async () => {
                await refreshListsPreserveSelection();
                const hasDate = !!(dateSel && String(dateSel.value || '').trim());
                const hasFile = !!(fileSel && String(fileSel.value || '').trim());
                if (hasDate && hasFile) {
                    await loadFileContent();
                } else {
                    setContent('');
                }
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const ok = await copyTextToClipboard(lastRawText);
                if (!ok) {
                    setStatus('Copy failed');
                    return;
                }
                setStatus('Copied to clipboard');
                setTimeout(() => {
                    if (statusEl && statusEl.textContent === 'Copied to clipboard') {
                        statusEl.textContent = '';
                    }
                }, 1200);
            });
        }

        setContent('');
        await loadDates();
    },

    dispose() {
    }
};

export default LogViewerPlugin;
