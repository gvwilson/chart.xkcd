import { select, mouse, event as d3Event } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';

import addAxis from './utils/addAxis';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, setupMargin, resolveFilterAndFont,
  createSvgEl, setupChartGroup, createTooltip,
} from './utils/initChart';

/**
 * Simple bar chart with one dataset.
 *
 * Renders vertical bars with an xkcd hand-drawn style filter.
 * Supports hover tooltips, click selection, and shift-click
 * multi-selection.
 *
 * @param {SVGElement} svg - Target SVG element (usually inside a sized container).
 * @param {Object} params
 * @param {string} [params.title] - Chart title displayed above the plot.
 * @param {string} [params.xLabel] - Label for the x-axis.
 * @param {string} [params.yLabel] - Label for the y-axis.
 * @param {Object} params.data
 * @param {string[]} params.data.labels - Category labels for the x-axis.
 * @param {Object[]} params.data.datasets - Array with a single dataset object
 *   containing a `data` array of numeric values and an optional `label`.
 * @param {Object} [params.options] - See `applyDefaults` for common options.
 */
class Bar {
  constructor(svg, {
    title, xLabel, yLabel, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      yTickCount: config.defaultTickCount,
      ...options,
    });
    this.title = title;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.data = { labels, datasets };

    const margin = setupMargin({ title, xLabel, yLabel });
    const { filter, fontFamily } = resolveFilterAndFont(this.options, false);
    this.filter = filter;
    this.fontFamily = fontFamily;
    this.svgEl = createSvgEl(svg, { fontFamily, backgroundColor: this.options.backgroundColor });
    const { chart, width, height } = setupChartGroup(
      this.svgEl, margin, { title, xLabel, yLabel, strokeColor: this.options.strokeColor },
    );
    this.chart = chart;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.render();
  }

  render() {
    const tooltip = createTooltip(this.svgEl, this.options);

    const xScale = scaleBand()
      .range([0, this.width])
      .domain(this.data.labels)
      .padding(config.bandPadding);

    const allData = this.data.datasets
      .reduce((pre, cur) => pre.concat(cur.data), []);

    const yScale = scaleLinear()
      .domain([0, Math.max(...allData)])
      .range([this.height, 0]);

    const graphPart = this.chart.append('g');

    addAxis.xAxis(graphPart, {
      xScale,
      tickCount: config.defaultTickCount,
      moveDown: this.height,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });
    addAxis.yAxis(graphPart, {
      yScale,
      tickCount: this.options.yTickCount,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });

    graphPart.selectAll('.xkcd-chart-bar')
      .data(this.data.datasets[0].data)
      .enter()
      .append('rect')
      .attr('class', 'xkcd-chart-bar')
      .attr('x', (d, i) => xScale(this.data.labels[i]))
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d))
      .attr('height', (d) => this.height - yScale(d))
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('stroke', this.options.strokeColor)
      .attr('stroke-width', config.barStrokeWidth)
      .attr('rx', config.barCornerRadius)
      .attr('filter', this.filter)
      .on('mouseover', (d, i, nodes) => {
        select(nodes[i]).attr('fill', this.options.dataColors[i]);
        tooltip.show();
      })
      .on('mouseout', (d, i, nodes) => {
        select(nodes[i]).attr('fill', 'none');
        tooltip.hide();
      })
      .on('click', (d, i) => {
        if (this.options.onSelect) {
          this.options.onSelect({ index: i, label: this.data.labels[i], value: d }, d3Event.shiftKey);
        }
      })
      .on('mousemove', (d, i, nodes) => {
        const tipX = mouse(nodes[i])[0] + this.margin.left + config.tooltipMouseOffset;
        const tipY = mouse(nodes[i])[1] + this.margin.top + config.tooltipMouseOffset;
        tooltip.update({
          title: this.data.labels[i],
          items: [{
            color: this.options.dataColors[i],
            text: `${this.data.datasets[0].label || ''}: ${d}`,
          }],
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType(tipX, tipY, this.width, this.height),
          },
        });
      });
  }
}

export default Bar;
