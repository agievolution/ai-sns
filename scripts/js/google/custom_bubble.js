/**
 * Custom Bubble InfoWindow for Google Maps (3D)
 *
 * Uses native google.maps.InfoWindow for coordinate anchoring (supports altitude),
 * but injects custom-styled HTML content and hides the default InfoWindow chrome
 * via CSS overrides (see css/custom_bubble_infowindow.css).
 *
 * Public API:
 *   openBubble(options, mapInstance)  - Open a bubble; returns the InfoWindow instance
 *   closeBubble()                    - Close the currently open bubble
 *   buildBubbleHTML(options)          - Build bubble HTML string (for advanced use)
 */

/* global google */

/**
 * Build the HTML markup for the bubble content.
 *
 * @param {Object} options
 * @param {string}  [options.title]       - Header title text (HTML allowed)
 * @param {string}  [options.body]        - Body content (HTML allowed)
 * @param {boolean} [options.showClose]   - Whether to show the close button (default true)
 * @param {string}  [options.closeAction] - onclick JS string for close button
 * @param {string}  [options.extraClass]  - Extra CSS class for the wrapper
 * @returns {string} HTML string
 */
function buildBubbleHTML(options) {
    var title = options.title || '';
    var body = options.body || '';
    var showClose = options.showClose !== false;
    var closeAction = options.closeAction || 'closeBubble()';
    var extraClass = options.extraClass || '';

    // Determine whether we need a header row
    var hasHeader = !!(title || showClose);

    var headerHTML = '';
    if (hasHeader) {
        headerHTML =
            '<div class="bubble-header">' +
                '<div class="bubble-title">' + title + '</div>' +
                (showClose
                    ? '<button class="bubble-close" onclick="' + closeAction + '" title="Close">&#10005;</button>'
                    : '') +
            '</div>';
    }

    // If there is no title and no close button, use the compact "simple" variant
    var wrapperClass = 'bubble-infowindow' + (hasHeader ? '' : ' bubble-simple') + (extraClass ? ' ' + extraClass : '');

    return '<div class="' + wrapperClass + '">' +
        headerHTML +
        '<div class="bubble-body">' + body + '</div>' +
    '</div>';
}

/**
 * Open a custom bubble InfoWindow on the Google Map.
 *
 * @param {Object} options
 * @param {string}  [options.title]       - Header title
 * @param {string}  [options.body]        - Body HTML
 * @param {Object}  options.position      - {lat, lng, altitude?} for anchoring
 * @param {google.maps.Size} [options.pixelOffset] - Pixel offset from anchor
 * @param {boolean} [options.showClose]   - Show close button (default true)
 * @param {string}  [options.closeAction] - Custom close onclick code
 * @param {string}  [options.extraClass]  - Extra CSS class
 * @param {google.maps.Map} mapInstance   - The map to open on
 * @returns {google.maps.InfoWindow} The opened InfoWindow instance
 */
function openBubble(options, mapInstance) {
    // Close any previously open bubble
    closeBubble();

    var content = buildBubbleHTML(options);
    var offset = options.pixelOffset || new google.maps.Size(0, -8);

    // Create the native InfoWindow (leverages altitude support)
    infowindow = new google.maps.InfoWindow({
        content: content,
        ariaLabel: options.title || 'Info',
        headerDisabled: true,
        position: options.position,
        pixelOffset: offset,
    });

    // After the InfoWindow DOM is ready, strip all default chrome
    // (background, box-shadow, border-radius) from every ancestor wrapper.
    // This is necessary because Google Maps sets inline styles that
    // cannot be reliably overridden by CSS alone.
    infowindow.addListener('domready', function () {
        _stripInfoWindowChrome();
    });

    infowindow.open({
        anchor: null,
        map: mapInstance,
    });

    console.log('Bubble InfoWindow opened');
    return infowindow;
}

/**
 * Walk up the DOM from our .bubble-infowindow element and force every
 * ancestor (up to .gm-style) to be fully transparent / unstyled.
 * This removes the semi-transparent rounded-corner "plate" that Google
 * Maps renders underneath the InfoWindow content.
 */
function _stripInfoWindowChrome() {
    try {
        // Find our bubble element inside the map container
        var bubble = document.querySelector('.gm-style .bubble-infowindow');
        if (!bubble) return;

        var el = bubble.parentElement;
        var maxDepth = 15; // safety limit
        while (el && maxDepth-- > 0) {
            // Stop when we reach the top-level map style container
            if (el.classList && el.classList.contains('gm-style')) break;

            el.style.setProperty('background', 'none', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background-image', 'none', 'important');
            el.style.setProperty('box-shadow', 'none', 'important');
            el.style.setProperty('border', 'none', 'important');
            el.style.setProperty('border-radius', '0', 'important');
            el.style.setProperty('outline', 'none', 'important');
            el.style.setProperty('overflow', 'visible', 'important');

            // Also nuke pseudo-element effects by removing any
            // content/backdrop that might leak through
            el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            el.style.setProperty('backdrop-filter', 'none', 'important');

            el = el.parentElement;
        }
        console.log('InfoWindow chrome stripped');
    } catch (e) {
        console.warn('Error stripping InfoWindow chrome:', e);
    }
}

/**
 * Close the currently open bubble InfoWindow.
 */
function closeBubble() {
    try {
        if (typeof infowindow !== 'undefined' && infowindow && typeof infowindow.close === 'function') {
            infowindow.close();
            console.log('Bubble InfoWindow closed');
        }
    } catch (e) {
        console.warn('Error closing bubble:', e);
    }
}
