/**
 * Chart label helpers for title, x-axis label, and y-axis label.
 */
import config from '../config';

/**
 * Render a centered title at the top of the SVG.
 *
 * @param {d3.Selection} parent - Root SVG selection.
 * @param {string} text - Title text.
 * @param {string} fill - Text fill color.
 */
const title = (parent, text, fill) => {
  parent
    .append('text')
    .style('font-size', config.titleFontSize)
    .style('font-weight', 'bold')
    .style('fill', fill)
    .attr('x', '50%')
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .text(text);
};

/**
 * Render a centered x-axis label at the bottom of the SVG.
 *
 * @param {d3.Selection} parent - Root SVG selection.
 * @param {string} text - Label text.
 * @param {string} fill - Text fill color.
 */
const xLabel = (parent, text, fill) => {
  parent
    .append('text')
    .style('font-size', config.labelFontSize)
    .style('fill', fill)
    .attr('x', '50%')
    .attr('y', parent.attr('height') - 10)
    .attr('text-anchor', 'middle')
    .text(text);
};

/**
 * Render a rotated y-axis label along the left edge of the SVG,
 * vertically centered.
 *
 * @param {d3.Selection} parent - Root SVG selection.
 * @param {string} text - Label text.
 * @param {string} fill - Text fill color.
 */
const yLabel = (parent, text, fill) => {
  parent
    .append('text')
    .attr('text-anchor', 'end')
    .attr('dy', '.75em')
    .attr('transform', 'rotate(-90)')
    .style('font-size', config.labelFontSize)
    .style('fill', fill)
    .text(text)
    .attr('y', 6)
    .call((f) => {
      const textLength = f.node().getComputedTextLength();
      f.attr('x', 0 - (parent.attr('height') / 2) + (textLength / 2));
    });
};

export default {
  title, xLabel, yLabel,
};
