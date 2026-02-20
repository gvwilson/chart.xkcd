/**
 * Font loading utilities.
 *
 * The xkcd handwriting font is embedded as a base64 data-URL in
 * fontData.js (generated at build time by bin/font_encode.py).
 * Two loading mechanisms are provided:
 *
 * - `loadFont()` registers the font via the CSS Font Loading API
 *   so the browser can render text with it. Used by the widget
 *   entry point before any chart is constructed.
 * - `addFont()` injects an `@font-face` rule into an SVG's
 *   `<defs>` so the font is available inside the SVG context.
 *   Called by each chart's setup helpers.
 */
import fontDataUrl from './fontData';

/** Prevents registering the font more than once per page load. */
let fontLoaded = false;

/**
 * Register the xkcd font with the browser using the FontFace API.
 * Subsequent calls are no-ops.
 */
export async function loadFont() {
  if (fontLoaded) return;
  const font = new FontFace('xkcd', `url("${fontDataUrl}")`);
  const loaded = await font.load();
  document.fonts.add(loaded);
  fontLoaded = true;
}

/**
 * Inject an @font-face CSS rule into the SVG's <defs> so the
 * xkcd font is available for text elements inside the SVG.
 *
 * @param {d3.Selection} parent - d3 selection of the root SVG element.
 */
export default function addFont(parent) {
  parent.append('defs')
    .append('style')
    .attr('type', 'text/css')
    .text(`@font-face {
      font-family: "xkcd";
      src: url("${fontDataUrl}") format("truetype");
    }`);
}
