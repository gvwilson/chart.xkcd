/**
 * Axis rendering helpers for charts with x/y axes.
 */
import { axisBottom, axisLeft } from 'd3-axis';
import config from '../config';

/**
 * Apply the xkcd filter and font styling to axis lines, ticks,
 * and tick labels after d3-axis has created them.
 *
 * @param {d3.Selection} parent - Group containing the axis elements.
 * @param {Object} opts
 * @param {string} opts.fontFamily - Font family for tick labels.
 * @param {boolean} opts.unxkcdify - If true, skip the hand-drawn filter.
 * @param {string} opts.stroke - Stroke/fill color for axis elements.
 */
function styleAxisParts(parent, { fontFamily, unxkcdify, stroke }) {
  parent.selectAll('.domain')
    .attr('filter', !unxkcdify ? config.filterUrl : null)
    .style('stroke', stroke);

  parent.selectAll('.tick > text')
    .style('font-family', fontFamily)
    .style('font-size', config.tickFontSize)
    .style('fill', stroke);
}

/**
 * Render a left-side y-axis with the given scale and tick count.
 *
 * @param {d3.Selection} parent - Group to append the axis into.
 * @param {Object} opts
 * @param {d3.Scale} opts.yScale - d3 scale for the y-axis.
 * @param {number} opts.tickCount - Approximate number of ticks.
 * @param {string} opts.fontFamily - Font family for labels.
 * @param {boolean} opts.unxkcdify - Skip the hand-drawn filter.
 * @param {string} opts.stroke - Stroke/fill color.
 */
const yAxis = (parent, {
  yScale, tickCount, fontFamily, unxkcdify, stroke,
}) => {
  parent
    .append('g')
    .call(
      axisLeft(yScale)
        .tickSize(1)
        .tickPadding(10)
        .ticks(tickCount, 's'),
    );
  styleAxisParts(parent, { fontFamily, unxkcdify, stroke });
};

/**
 * Render a bottom x-axis translated down by `moveDown` pixels.
 *
 * @param {d3.Selection} parent - Group to append the axis into.
 * @param {Object} opts
 * @param {d3.Scale} opts.xScale - d3 scale for the x-axis.
 * @param {number} opts.tickCount - Approximate number of ticks.
 * @param {number} opts.moveDown - Vertical offset (chart height).
 * @param {string} opts.fontFamily - Font family for labels.
 * @param {boolean} opts.unxkcdify - Skip the hand-drawn filter.
 * @param {string} opts.stroke - Stroke/fill color.
 */
const xAxis = (parent, {
  xScale, tickCount, moveDown, fontFamily, unxkcdify, stroke,
}) => {
  parent
    .append('g')
    .attr('transform', `translate(0,${moveDown})`)
    .call(
      axisBottom(xScale)
        .tickSize(0)
        .tickPadding(6)
        .ticks(tickCount),
    );
  styleAxisParts(parent, { fontFamily, unxkcdify, stroke });
};

export default {
  xAxis, yAxis,
};
