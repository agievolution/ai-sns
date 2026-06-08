/**
 * Startup bootstrap.
 *
 * Responsibilities:
 *   1. Show the global loading overlay (already present in index.html).
 *   2. Initialize the API client (resolve baseUrl/config).
 *   3. Poll the backend health endpoint until it is ready (infinite retry,
 *      with a manual Retry/Exit affordance shown after a grace period).
 *   4. Run App.init() and wait for the initial landing page module data
 *      to finish loading.
 *   5. Fade out the overlay.
 *
 * Notes:
 *   - Only the backend self-health endpoint (/api/health, fallback /health)
 *     is polled. Map config / static assets are intentionally NOT part of
 *     the readiness check, so the map window and map iframe are never
 *     blocked by this gate.
 *   - The overlay only covers the main renderer window. The map window is
 *     created via a separate IPC and keeps its own non-blocking loading.
 */

(function () {
    'use strict';

    const POLL_INTERVAL_MS = 1500;
    const MANUAL_ACTIONS_DELAY_MS = 30000;
    const REQUEST_TIMEOUT_MS = 2500;

    const overlay = {
        root: null,
        status: null,
        attempts: null,
        actions: null,
        retryBtn: null,
        exitBtn: null,

        cache() {
            this.root = document.getElementById('globalLoading');
            if (!this.root) return false;
            this.status = this.root.querySelector('#loadingStatus');
            this.attempts = this.root.querySelector('#loadingAttempts');
            this.actions = this.root.querySelector('#loadingActions');
            this.retryBtn = this.root.querySelector('#loadingRetryBtn');
            this.exitBtn = this.root.querySelector('#loadingExitBtn');
            return true;
        },

        setStatus(text) {
            if (this.status) this.status.textContent = text || '';
        },

        setAttempts(n) {
            if (this.attempts) {
                this.attempts.textContent = n > 0 ? `Attempt #${n}` : '';
            }
        },

        showActions() {
            if (this.actions) this.actions.classList.add('is-visible');
        },

        hideActions() {
            if (this.actions) this.actions.classList.remove('is-visible');
        },

        hide() {
            if (!this.root) return;
            this.root.classList.add('is-hidden');
            // Remove from DOM after fade-out completes
            setTimeout(() => {
                if (this.root && this.root.parentNode) {
                    this.root.parentNode.removeChild(this.root);
                }
            }, 500);
        },
    };

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function fetchWithTimeout(url, timeoutMs) {
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        let timer = null;
        if (controller) {
            timer = setTimeout(() => {
                try { controller.abort(); } catch (_) {}
            }, timeoutMs);
        }
        return fetch(url, controller ? { signal: controller.signal, cache: 'no-store' } : { cache: 'no-store' })
            .finally(() => {
                if (timer) clearTimeout(timer);
            });
    }

    function getBaseUrl() {
        try {
            if (window.api && typeof window.api.baseUrl === 'string' && window.api.baseUrl) {
                return window.api.baseUrl.replace(/\/+$/, '');
            }
        } catch (_) {}
        try {
            if (window.appConfig && window.appConfig.agent_server) {
                return String(window.appConfig.agent_server).replace(/\/+$/, '');
            }
        } catch (_) {}
        return '';
    }

    async function probeHealth() {
        const base = getBaseUrl();
        // Try /api/health first, then fall back to /health.
        const endpoints = ['/api/health', '/health'];
        for (const ep of endpoints) {
            const url = `${base}${ep}`;
            try {
                const resp = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
                if (!resp.ok) continue;
                const data = await resp.json().catch(() => null);
                if (data && (data.status === 'healthy' || data.success === true)) {
                    return true;
                }
            } catch (_) {
                // Ignore and try next endpoint
            }
        }
        return false;
    }

    async function ensureApiInitialized() {
        if (window.api && typeof window.api.init === 'function') {
            try {
                await window.api.init();
            } catch (e) {
                // Non-fatal: api.init() may also try to read /api/system/config
                // before the backend is ready. We will retry through the
                // health loop and rely on later module loads to refresh
                // config when needed.
                console.warn('[Bootstrap] api.init() failed (will retry later):', e);
            }
        }
    }

    async function waitForBackend() {
        let attempt = 0;
        let actionsShown = false;
        const startedAt = Date.now();

        overlay.setStatus('Connecting to backend...');
        overlay.setAttempts(0);

        // Manual actions appear only after the grace period
        const actionsTimer = setTimeout(() => {
            actionsShown = true;
            overlay.showActions();
        }, MANUAL_ACTIONS_DELAY_MS);

        try {
            // Allow the Retry button to short-circuit the current sleep
            let resolveRetry = null;
            if (overlay.retryBtn) {
                overlay.retryBtn.addEventListener('click', () => {
                    overlay.setStatus('Retrying...');
                    if (typeof resolveRetry === 'function') {
                        const fn = resolveRetry;
                        resolveRetry = null;
                        fn();
                    }
                });
            }

            // First, make sure the API client knows the base URL
            await ensureApiInitialized();

            // Infinite poll loop
            // eslint-disable-next-line no-constant-condition
            while (true) {
                attempt += 1;
                overlay.setAttempts(attempt);

                const ok = await probeHealth();
                if (ok) {
                    overlay.setStatus('Backend ready. Loading application...');
                    overlay.hideActions();
                    clearTimeout(actionsTimer);
                    return;
                }

                const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
                overlay.setStatus(
                    actionsShown
                        ? `Waiting for backend (${elapsedSec}s)... You can retry manually.`
                        : `Waiting for backend (${elapsedSec}s)...`
                );

                // Wait for the next tick, but allow Retry to short-circuit
                await new Promise((resolve) => {
                    const timer = setTimeout(resolve, POLL_INTERVAL_MS);
                    resolveRetry = () => {
                        clearTimeout(timer);
                        resolve();
                    };
                });

                // Refresh API base URL in case the user changed config externally
                if (attempt % 4 === 0) {
                    await ensureApiInitialized();
                }
            }
        } finally {
            clearTimeout(actionsTimer);
        }
    }

    function bindExitButton() {
        if (!overlay.exitBtn) return;
        overlay.exitBtn.addEventListener('click', () => {
            try {
                if (window.electronAPI && typeof window.electronAPI.quitApp === 'function') {
                    window.electronAPI.quitApp();
                    return;
                }
            } catch (_) {}
            try { window.close(); } catch (_) {}
        });
    }

    async function waitForAppReady() {
        // Wait until window.App is defined and the router has registered at
        // least one module. ES module scripts in index.html should already
        // have executed by DOMContentLoaded, but we add a small safety wait
        // to be robust against future ordering changes.
        const deadline = Date.now() + 5000;
        while (Date.now() < deadline) {
            const appOk = window.App && typeof window.App.init === 'function';
            const routerOk = window.router && window.router.modules
                && Object.keys(window.router.modules).length > 0;
            if (appOk && routerOk) return true;
            await sleep(50);
        }
        return false;
    }

    async function runAppInit() {
        // Drive App.init() once the backend is ready. App.init() is expected
        // to await the initial landing page module's data load (see
        // app.js / router.js changes).
        const ready = await waitForAppReady();
        if (!ready) {
            console.warn('[Bootstrap] App / router not ready within timeout; attempting init anyway');
        }
        if (!window.App || typeof window.App.init !== 'function') {
            console.warn('[Bootstrap] window.App.init is not available');
            return;
        }
        try {
            overlay.setStatus('Initializing application...');
            await window.App.init();
        } catch (e) {
            console.error('[Bootstrap] App.init() failed:', e);
            throw e;
        }
    }

    async function start() {
        if (!overlay.cache()) {
            // No overlay markup found; fall back to running App.init() directly.
            console.warn('[Bootstrap] #globalLoading not found, starting without gate');
            if (window.App && typeof window.App.init === 'function') {
                window.App.init().catch(console.error);
            }
            return;
        }

        bindExitButton();

        // Outer loop: if any step (health wait or App.init) fails, surface
        // the error and keep retrying so the overlay never silently dies.
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                await waitForBackend();
                await runAppInit();
                overlay.setStatus('Ready.');
                overlay.hide();
                return;
            } catch (e) {
                console.error('[Bootstrap] Startup attempt failed, will retry:', e);
                overlay.setStatus('Startup failed, retrying...');
                overlay.showActions();
                await sleep(POLL_INTERVAL_MS);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            start().catch((err) => console.error('[Bootstrap] Fatal error:', err));
        });
    } else {
        start().catch((err) => console.error('[Bootstrap] Fatal error:', err));
    }
})();
