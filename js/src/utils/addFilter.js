/**
 * Append feTurbulence + feDisplacementMap primitives to an SVG
 * filter element, producing the hand-drawn "wobble" effect.
 *
 * @param {d3.Selection} filter - d3 selection of an <filter> element.
 */
function addXkcdNoise(filter) {
  filter
    .call((f) => f.append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '0.05')
      .attr('result', 'noise'))
    .call((f) => f.append('feDisplacementMap')
      .attr('scale', '5')
      .attr('xChannelSelector', 'R')
      .attr('yChannelSelector', 'G')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'noise'));
}

/**
 * Add two SVG filter definitions to the parent element:
 *
 * - `#xkcdify` — used by axes, bars, lines, and dots. Uses
 *   `userSpaceOnUse` filter units with a small negative offset
 *   so strokes at the edges are not clipped.
 * - `#xkcdify-pie` — used by pie and radar charts. Uses the
 *   default `objectBoundingBox` filter units which work better
 *   for circular/radial shapes.
 *
 * @param {d3.Selection} parent - d3 selection of the root SVG element.
 */
export default function addFilter(parent) {
  addXkcdNoise(
    parent.append('filter')
      .attr('id', 'xkcdify')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('x', -5)
      .attr('y', -5)
      .attr('width', '100%')
      .attr('height', '100%'),
  );

  addXkcdNoise(
    parent.append('filter')
      .attr('id', 'xkcdify-pie'),
  );
}
