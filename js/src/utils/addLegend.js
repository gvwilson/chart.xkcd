import config from '../config';

/**
 * Render a chart legend with colored swatches and text labels.
 *
 * The legend background is positioned in one of four corners
 * (upLeft, upRight, downLeft, downRight) based on `position`.
 * A short `setTimeout` is used so the browser can compute the
 * bounding box of the text layer before the background rect
 * is sized and the legend is placed.
 *
 * @param {d3.Selection} parent - Group to append the legend into.
 * @param {Object} opts
 * @param {Array<{color: string, text: string}>} opts.items - Legend entries.
 * @param {number} opts.position - One of `config.positionType.*`.
 * @param {boolean} opts.unxkcdify - Skip the hand-drawn filter.
 * @param {number} opts.parentWidth - Width of the containing chart area.
 * @param {number} opts.parentHeight - Height of the containing chart area.
 * @param {string} opts.strokeColor - Stroke color for the background border.
 * @param {string} opts.backgroundColor - Fill color for the background.
 * @param {number} [opts.legendScale=100] - Scale the legend to this
 *   percentage of its default size (1-100). Affects text, swatches,
 *   spacing, and background proportionally.
 */
export default function addLegend(parent, {
  items, position, unxkcdify, parentWidth, parentHeight, strokeColor, backgroundColor,
  legendScale,
}) {
  const filter = !unxkcdify ? config.filterUrl : null;
  const s = (legendScale || 100) / 100;

  const legend = parent.append('svg');
  const backgroundLayer = legend.append('svg');
  const textLayer = legend.append('svg');

  items.forEach((item, i) => {
    const itemY = 17 * s + config.itemRowHeight * s * i;

    textLayer.append('rect')
      .style('fill', item.color)
      .attr('width', config.swatchSize * s)
      .attr('height', config.swatchSize * s)
      .attr('filter', filter)
      .attr('rx', config.swatchCornerRadius * s)
      .attr('ry', config.swatchCornerRadius * s)
      .attr('x', config.itemXOffset * s)
      .attr('y', itemY);

    textLayer.append('text')
      .style('font-size', config.tooltipFontSize * s)
      .style('fill', strokeColor)
      .attr('x', (config.itemXOffset + config.itemTextOffset) * s)
      .attr('y', itemY + config.swatchSize * s)
      .text(item.text);
  });

  setTimeout(() => {
    const bbox = textLayer.node().getBBox();
    const backgroundWidth = bbox.width + config.itemXOffset * s;
    const backgroundHeight = bbox.height + 10 * s;

    let legendX = 0;
    let legendY = 0;
    if (
      position === config.positionType.downLeft
      || position === config.positionType.downRight
    ) {
      legendY = parentHeight - backgroundHeight - 13;
    }
    if (
      position === config.positionType.upRight
      || position === config.positionType.downRight
    ) {
      legendX = parentWidth - backgroundWidth - 13;
    }

    backgroundLayer.append('rect')
      .style('fill', backgroundColor)
      .attr('filter', filter)
      .attr('fill-opacity', config.legendBackgroundOpacity)
      .attr('stroke', strokeColor)
      .attr('stroke-width', config.backgroundStrokeWidth * s)
      .attr('width', backgroundWidth)
      .attr('height', backgroundHeight)
      .attr('rx', config.backgroundCornerRadius * s)
      .attr('ry', config.backgroundCornerRadius * s)
      .attr('x', 8 * s)
      .attr('y', 5 * s);

    legend
      .attr('x', legendX)
      .attr('y', legendY);
  }, 10);
}
