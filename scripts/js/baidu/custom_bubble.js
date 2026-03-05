/**
 * Custom Bubble InfoWindow for Baidu Maps (WebGL)
 *
 * Implements a custom overlay extending BMapGL.Overlay to render a modern
 * bubble-style InfoWindow. This replaces the default BMapGL.InfoWindow
 * with full styling control.
 *
 * Public API:
 *   openBaiduBubble(point, options, mapInstance) - Open a bubble at a map point
 *   closeBaiduBubble()                           - Close the currently open bubble
 *   buildBaiduBubbleHTML(options)                 - Build bubble HTML (for advanced use)
 */

/* global BMapGL */

// Track the currently open bubble overlay instance
var _currentBaiduBubble = null;

/**
 * Build the HTML markup for the Baidu bubble content.
 *
 * @param {Object} options
 * @param {string}  [options.title]     - Header title text (HTML allowed)
 * @param {string}  [options.body]      - Body content (HTML allowed)
 * @param {boolean} [options.showClose] - Whether to show the close button (default true)
 * @param {string}  [options.extraClass]- Extra CSS class for the wrapper
 * @returns {string} HTML string
 */
function buildBaiduBubbleHTML(options) {
    var title = options.title || '';
    var body = options.body || '';
    var showClose = options.showClose !== false;
    var extraClass = options.extraClass || '';

    var hasHeader = !!(title || showClose);

    var headerHTML = '';
    if (hasHeader) {
        headerHTML =
            '<div class="bubble-header">' +
                '<div class="bubble-title">' + title + '</div>' +
                (showClose
                    ? '<button class="bubble-close" data-bubble-close="true" title="Close">&#10005;</button>'
                    : '') +
            '</div>';
    }

    var wrapperClass = 'bubble-infowindow' + (hasHeader ? '' : ' bubble-simple') + (extraClass ? ' ' + extraClass : '');

    return '<div class="' + wrapperClass + '">' +
        headerHTML +
        '<div class="bubble-body">' + body + '</div>' +
    '</div>';
}

/**
 * CustomBubbleOverlay constructor.
 *
 * @param {BMapGL.Point} point   - Map point to anchor the bubble to
 * @param {Object}       options
 * @param {string}  [options.title]
 * @param {string}  [options.body]
 * @param {boolean} [options.showClose]
 * @param {string}  [options.extraClass]
 * @param {Object}  [options.offset]    - {x, y} pixel offset from the anchor point
 * @param {Function}[options.onClose]   - Callback invoked when the bubble is closed
 */
function CustomBubbleOverlay(point, options) {
    this._point = point;
    this._options = options || {};
    this._div = null;
    this._map = null;
    this._isOpen = false;
}

// Extend BMapGL.Overlay
CustomBubbleOverlay.prototype = new BMapGL.Overlay();

/**
 * Called when the overlay is added to the map via map.addOverlay().
 * Creates the DOM element and appends it to the float pane.
 */
CustomBubbleOverlay.prototype.initialize = function (map) {
    this._map = map;

    // Create container div
    var container = document.createElement('div');
    container.className = 'baidu-bubble-overlay';
    container.style.position = 'absolute';

    // Build inner HTML
    container.innerHTML = buildBaiduBubbleHTML(this._options);

    // Attach close button handler
    var self = this;
    var closeBtn = container.querySelector('[data-bubble-close]');
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            self.close();
        });
    }

    // Prevent map click-through
    container.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    container.addEventListener('dblclick', function (e) { e.stopPropagation(); });
    container.addEventListener('wheel', function (e) { e.stopPropagation(); });

    // Append to the float pane (highest z-index pane)
    map.getPanes().floatPane.appendChild(container);
    this._div = container;
    this._isOpen = true;

    return container;
};

/**
 * Called whenever the map state changes (pan, zoom, resize).
 * Re-positions the bubble so its arrow tip points at the anchor coordinate.
 */
CustomBubbleOverlay.prototype.draw = function () {
    if (!this._div || !this._map) return;

    var pixel = this._map.pointToOverlayPixel(this._point);
    if (!pixel) return;

    var offsetX = (this._options.offset && this._options.offset.x) || 0;
    var offsetY = (this._options.offset && this._options.offset.y) || 0;

    // Measure the bubble element
    var bubbleEl = this._div.querySelector('.bubble-infowindow');
    if (!bubbleEl) return;

    var bubbleWidth = bubbleEl.offsetWidth || 200;
    var bubbleHeight = bubbleEl.offsetHeight || 100;

    // Center horizontally on the point, position above the point
    // 12 = arrow height + small gap
    this._div.style.left = (pixel.x - bubbleWidth / 2 + offsetX) + 'px';
    this._div.style.top = (pixel.y - bubbleHeight - 12 + offsetY) + 'px';
};

/**
 * Close this bubble overlay (remove from map).
 */
CustomBubbleOverlay.prototype.close = function () {
    if (!this._isOpen) return;
    this._isOpen = false;

    if (this._map) {
        try {
            this._map.removeOverlay(this);
        } catch (e) {
            console.warn('Error removing bubble overlay:', e);
        }
    }

    // Clean up DOM if still attached
    if (this._div && this._div.parentNode) {
        this._div.parentNode.removeChild(this._div);
    }
    this._div = null;

    // Fire onClose callback
    if (this._options.onClose) {
        try {
            this._options.onClose();
        } catch (e) {
            console.warn('Error in bubble onClose callback:', e);
        }
    }

    // Clear global reference if this is the current bubble
    if (_currentBaiduBubble === this) {
        _currentBaiduBubble = null;
    }

    console.log('Baidu bubble closed');
};

/**
 * Open a custom bubble InfoWindow on the Baidu Map.
 *
 * @param {BMapGL.Point} point      - Map point to anchor to
 * @param {Object}       options    - Same options as CustomBubbleOverlay constructor
 * @param {BMapGL.Map}   mapInstance - The Baidu map instance
 * @returns {CustomBubbleOverlay} The opened bubble overlay
 */
function openBaiduBubble(point, options, mapInstance) {
    // Close any previously open bubble
    closeBaiduBubble();

    // Also close any native BMapGL InfoWindow that might be open
    try {
        if (mapInstance && typeof mapInstance.closeInfoWindow === 'function') {
            mapInstance.closeInfoWindow();
        }
    } catch (e) {}

    var bubble = new CustomBubbleOverlay(point, options);
    mapInstance.addOverlay(bubble);
    _currentBaiduBubble = bubble;

    console.log('Baidu bubble opened');
    return bubble;
}

/**
 * Close the currently open Baidu bubble InfoWindow.
 * Suppresses the onClose callback to prevent recursion when closing programmatically.
 * The onClose callback only fires when the user clicks the close button directly.
 */
function closeBaiduBubble() {
    if (_currentBaiduBubble && _currentBaiduBubble._isOpen) {
        // Suppress onClose to prevent callback chains
        _currentBaiduBubble._options.onClose = null;
        _currentBaiduBubble.close();
    }
    _currentBaiduBubble = null;
}
