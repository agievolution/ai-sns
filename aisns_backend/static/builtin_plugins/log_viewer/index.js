const LogViewerPlugin = {
    info: {
        id: 'log-viewer',
        name: 'LLM Log',
        version: '1.0.0',
        description: 'Browse backend LLM logs by date and file'
    },

    async render(container, api) {
        if (container) {
            container.style.height = '100%';
        }
        container.innerHTML = `
            <style>
                .lv-log-viewer {
                    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
                }
                .lv-log-viewer #lv_content {
                    font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace;
                    font-size: 12px;
                    line-height: 1.55;
                    tab-size: 2;
                }
                .lv-log-viewer .lv-json-key { color: #0f766e; }
                .lv-log-viewer .lv-json-string { color: #1d4ed8; }
                .lv-log-viewer .lv-json-number { color: #b45309; }
                .lv-log-viewer .lv-json-boolean { color: #7c3aed; }
                .lv-log-viewer .lv-json-null { color: #6b7280; }
                .lv-log-viewer .lv-index { color: #6b7280; font-weight: 600; }
            </style>
            <div class="lv-log-viewer" style="display:flex; flex-direction:column; gap:12px; padding:12px; height:100%; min-height:0; box-sizing:border-box;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div style="font-weight:700; font-size:20px;">LLM Log</div>
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
                            <div style="display:flex; gap:8px;">
                                <button type="button" id="lv_format" class="btn btn-secondary" title="Format JSON" aria-label="Format JSON" style="padding:6px 8px; display:inline-flex; align-items:center; justify-content:center;">
                                    <span style="display:inline-flex; width:16px; height:16px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 5h2v2H7v10h2v2H7c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zm10 0h-2v2h2v10h-2v2h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM10 9h4v2h-4V9zm0 4h4v2h-4v-2z"/>
                                        </svg>
                                    </span>
                                </button>
                                <button type="button" id="lv_copy" class="btn btn-secondary" title="Copy" aria-label="Copy" style="padding:6px 8px; display:inline-flex; align-items:center; justify-content:center;">
                                    <span style="display:inline-flex; width:16px; height:16px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                        </svg>
                                    </span>
                                </button>
                            </div>
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
        const formatBtn = container.querySelector('#lv_format');

        const EMPTY_PLACEHOLDER = 'No log content loaded yet.';
        let lastCopyText = '';
        let lastFileRawContent = '';
        let viewMode = 'raw';
        let isFormatting = false;

        const setStatus = (t) => {
            if (statusEl) statusEl.textContent = t ? String(t) : '';
        };

        const setContentPlain = (t) => {
            const v = (t === undefined || t === null) ? '' : String(t);
            lastCopyText = v;
            if (!contentEl) return;
            const show = v ? v : EMPTY_PLACEHOLDER;
            contentEl.textContent = show;
            contentEl.style.whiteSpace = 'pre-wrap';
            contentEl.style.wordBreak = 'break-word';
            contentEl.style.color = v ? '' : 'var(--text-secondary,#666)';
        };

        const setContentHtml = (html, copyText, opts) => {
            const v = (copyText === undefined || copyText === null) ? '' : String(copyText);
            lastCopyText = v;
            if (!contentEl) return;
            const has = !!String(v || '').trim();
            contentEl.innerHTML = has ? String(html || '') : escapeHtml(EMPTY_PLACEHOLDER);
            const wrap = !!(opts && opts.wrap);
            contentEl.style.whiteSpace = wrap ? 'pre-wrap' : 'pre';
            contentEl.style.wordBreak = wrap ? 'break-word' : 'normal';
            contentEl.style.color = has ? '' : 'var(--text-secondary,#666)';
        };

        const getNextMode = (mode) => {
            if (mode === 'raw') return 'pretty';
            if (mode === 'pretty') return 'highlight';
            return 'raw';
        };

        const updateFormatButtonTooltip = () => {
            if (!formatBtn) return;
            const next = getNextMode(viewMode);
            const label = next === 'pretty'
                ? 'Pretty print + highlight'
                : (next === 'highlight' ? 'Highlight only' : 'Show raw');
            formatBtn.title = label;
            formatBtn.setAttribute('aria-label', label);
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

        const escapeHtml = (s) => {
            const v = (s === undefined || s === null) ? '' : String(s);
            return v
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const escapeHtmlForJsonHighlight = (s) => {
            const v = (s === undefined || s === null) ? '' : String(s);
            return v
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        const syntaxHighlightJson = (jsonText) => {
            const escaped = escapeHtmlForJsonHighlight(jsonText);
            return escaped.replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"\s*:|\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (m) => {
                    const t = String(m);
                    if (t === 'true' || t === 'false') return `<span class="lv-json-boolean">${t}</span>`;
                    if (t === 'null') return `<span class="lv-json-null">${t}</span>`;
                    if (/^-?\d/.test(t)) return `<span class="lv-json-number">${t}</span>`;
                    if (/^\".*\"\s*:$/.test(t)) return `<span class="lv-json-key">${t}</span>`;
                    return `<span class="lv-json-string">${t}</span>`;
                }
            );
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

        const buildPrettyHtmlFromRaw = (raw) => {
            const text = (raw === undefined || raw === null) ? '' : String(raw);
            const lines = text.split(/\r?\n/);
            const blocks = [];
            const copyBlocks = [];
            let idx = 1;

            for (const line of lines) {
                const rawLine = (line === undefined || line === null) ? '' : String(line);
                if (!rawLine.trim()) continue;

                let parsed = null;
                try {
                    parsed = JSON.parse(rawLine);
                } catch (e) {
                    parsed = null;
                }

                const headerHtml = `<span class="lv-index">【${idx}】</span>\n`;
                const headerCopy = `【${idx}】\n`;

                if (parsed !== null) {
                    const pretty = JSON.stringify(parsed, null, 2);
                    blocks.push(headerHtml + syntaxHighlightJson(pretty));
                    copyBlocks.push(headerCopy + pretty);
                } else {
                    blocks.push(headerHtml + escapeHtml(rawLine));
                    copyBlocks.push(headerCopy + rawLine);
                }

                idx += 1;
            }

            return {
                html: blocks.join('\n\n\n'),
                copyText: copyBlocks.join('\n\n\n')
            };
        };

        const buildHighlightOnlyHtmlFromRaw = (raw) => {
            const text = (raw === undefined || raw === null) ? '' : String(raw);
            const lines = text.split(/\r?\n/);
            const blocks = [];
            const copyBlocks = [];
            let idx = 1;

            for (const line of lines) {
                const rawLine = (line === undefined || line === null) ? '' : String(line);
                if (!rawLine.trim()) continue;

                let parsed = null;
                try {
                    parsed = JSON.parse(rawLine);
                } catch (e) {
                    parsed = null;
                }

                const headerHtml = `<span class="lv-index">【${idx}】</span>\n`;
                const headerCopy = `【${idx}】\n`;

                if (parsed !== null) {
                    blocks.push(headerHtml + syntaxHighlightJson(rawLine));
                    copyBlocks.push(headerCopy + rawLine);
                } else {
                    blocks.push(headerHtml + escapeHtml(rawLine));
                    copyBlocks.push(headerCopy + rawLine);
                }

                idx += 1;
            }

            return {
                html: blocks.join('\n\n\n'),
                copyText: copyBlocks.join('\n\n\n')
            };
        };

        const applyPrettyMode = () => {
            if (!contentEl) return;
            const raw = String(lastFileRawContent || '').trim();
            if (!raw) {
                setStatus('No content to format');
                return;
            }

            const { html, copyText } = buildPrettyHtmlFromRaw(lastFileRawContent);
            if (!String(copyText || '').trim()) {
                setStatus('No content to format');
                return;
            }
            setContentHtml(html, copyText, { wrap: false });
            viewMode = 'pretty';
            updateFormatButtonTooltip();
        };

        const applyHighlightOnlyMode = () => {
            const raw = String(lastFileRawContent || '').trim();
            if (!raw) {
                setContentPlain('');
                viewMode = 'highlight';
                updateFormatButtonTooltip();
                return;
            }
            const { html, copyText } = buildHighlightOnlyHtmlFromRaw(lastFileRawContent);
            setContentHtml(html, copyText, { wrap: true });
            viewMode = 'highlight';
            updateFormatButtonTooltip();
        };

        const applyRawMode = () => {
            const formatted = _formatNdjson(lastFileRawContent);
            setContentPlain(formatted);
            viewMode = 'raw';
            updateFormatButtonTooltip();
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
                dateSel.innerHTML = '';
                for (const d of dates) {
                    const opt = document.createElement('option');
                    opt.value = String(d);
                    opt.textContent = String(d);
                    dateSel.appendChild(opt);
                }
                dateSel.value = String(dates[0]);
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
                fileSel.innerHTML = '';
                for (const f of files) {
                    const opt = document.createElement('option');
                    opt.value = String(f);
                    opt.textContent = String(f);
                    fileSel.appendChild(opt);
                }
                fileSel.value = String(files[files.length - 1]);
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

            if (!activeDate && dateSel) {
                const current = String(dateSel.value || '').trim();
                if (current) activeDate = current;
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
            lastFileRawContent = '';
            viewMode = 'raw';
            updateFormatButtonTooltip();
            setContentPlain('');

            const res = await safeJson(`/api/system/logs/file?date=${encodeURIComponent(date)}&name=${encodeURIComponent(name)}`);
            if (!res || res.success === false) {
                setStatus(res && (res.message || res.error) ? (res.message || res.error) : 'Failed to load file');
                return;
            }

            const content = res.data && typeof res.data === 'object' ? (res.data.content || '') : '';
            lastFileRawContent = (content === undefined || content === null) ? '' : String(content);
            applyRawMode();
            setStatus('');
        };

        if (dateSel) {
            dateSel.addEventListener('change', async () => {
                const date = String(dateSel.value || '').trim();
                lastFileRawContent = '';
                viewMode = 'raw';
                updateFormatButtonTooltip();
                setContentPlain('');
                await loadFiles(date);
                await loadFileContent();
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
                    lastFileRawContent = '';
                    viewMode = 'raw';
                    updateFormatButtonTooltip();
                    setContentPlain('');
                }
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const ok = await copyTextToClipboard(lastCopyText);
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

        if (formatBtn) {
            formatBtn.addEventListener('click', async () => {
                if (isFormatting) return;
                isFormatting = true;
                formatBtn.disabled = true;
                setStatus('Formatting...');

                try {
                    await new Promise(r => setTimeout(r, 0));
                    const next = getNextMode(viewMode);
                    if (next === 'pretty') {
                        applyPrettyMode();
                    } else if (next === 'highlight') {
                        applyHighlightOnlyMode();
                    } else {
                        applyRawMode();
                    }
                } finally {
                    if (statusEl && statusEl.textContent === 'Formatting...') {
                        statusEl.textContent = '';
                    }
                    isFormatting = false;
                    formatBtn.disabled = false;
                }
            });
        }

        setContentPlain('');
        updateFormatButtonTooltip();
        await loadDates();
        if (dateSel && String(dateSel.value || '').trim()) {
            await loadFiles(String(dateSel.value || '').trim());
            await loadFileContent();
        }
    },

    dispose() {
    }
};

export default LogViewerPlugin;
