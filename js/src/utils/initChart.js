import { select } from 'd3-selection';

import addFont from './addFont';
import addFilter from './addFilter';
import addLabels from './addLabels';
import Tooltip from '../components/Tooltip';
import colors from './colors';
import config from '../config';

/**
 * Apply default options shared by all chart types.
 * Chart-specific defaults should be spread before calling this.
 */
export function applyDefaults(options, datasets) {
  const merged = {
    unxkcdify: false,
    dataColors: colors,
    fontFamily: config.fontFamily,
    strokeColor: 'black',
    backgroundColor: 'white',
    ...options,
  };
  if (datasets) {
    merged.dataColors = datasets.map(
      (ds, i) => ds.color || merged.dataColors[i % merged.dataColors.length],
    );
  }
  return merged;
}

/**
 * Set up margin, title, xLabel, yLabel for charts with axes.
 * Returns a copy of the margin object (does not mutate the config default).
 */
export function setupMargin({ title, xLabel, yLabel }) {
  const m = { ...config.margin };
  if (title) m.top = config.marginTopWithTitle;
  if (yLabel) m.left = config.marginLeftWithYLabel;
  return m;
}

/**
 * Resolve filter URL and font family based on unxkcdify option.
 */
export function resolveFilterAndFont(options, usePieFilter) {
  if (options.unxkcdify) {
    return { filter: null, fontFamily: config.fallbackFontFamily };
  }
  return {
    filter: usePieFilter ? config.filterUrlPie : config.filterUrl,
    fontFamily: options.fontFamily || config.fontFamily,
  };
}

/**
 * Create and configure the root SVG element.
 */
export function createSvgEl(svg, { strokeWidth, fontFamily, backgroundColor }) {
  const svgEl = select(svg)
    .style('stroke-width', strokeWidth || config.svgStrokeWidth)
    .style('font-family', fontFamily)
    .style('background', backgroundColor)
    .attr('width', svg.parentElement.clientWidth)
    .attr('height', Math.min(svg.parentElement.clientWidth * config.aspectRatio, window.innerHeight));
  svgEl.selectAll('*').remove();
  return svgEl;
}

/**
 * Append the main chart group, add font/filter defs, and render labels.
 * Returns { chart, width, height }.
 */
export function setupChartGroup(svgEl, margin, { title, xLabel, yLabel, strokeColor }) {
  const chart = svgEl.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  const width = svgEl.attr('width') - margin.left - margin.right;
  const height = svgEl.attr('height') - margin.top - margin.bottom;

  addFont(svgEl);
  addFilter(svgEl);

  if (title) addLabels.title(svgEl, title, strokeColor);
  if (xLabel) addLabels.xLabel(svgEl, xLabel, strokeColor);
  if (yLabel) addLabels.yLabel(svgEl, yLabel, strokeColor);

  return { chart, width, height };
}

/**
 * Simplified setup for charts without axes (Pie, Radar).
 * Uses scalar margin and only renders a title.
 */
export function setupChartGroupSimple(svgEl, { title, strokeColor }) {
  const m = config.marginScalar;
  const chart = svgEl.append('g')
    .attr('transform', `translate(${svgEl.attr('width') / 2},${svgEl.attr('height') / 2})`);
  const width = svgEl.attr('width');
  const height = svgEl.attr('height');

  addFont(svgEl);
  addFilter(svgEl);

  if (title) addLabels.title(svgEl, title, strokeColor);

  return { chart, width, height };
}

/**
 * Create a tooltip with sensible defaults.
 */
export function createTooltip(svgEl, options) {
  return new Tooltip({
    parent: svgEl,
    title: '',
    items: [],
    position: { x: 0, y: 0, type: config.positionType.downRight },
    unxkcdify: options.unxkcdify,
    strokeColor: options.strokeColor,
    backgroundColor: options.backgroundColor,
  });
}
