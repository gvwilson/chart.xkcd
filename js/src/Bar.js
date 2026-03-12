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
 * Bar chart with optional grouped multi-dataset mode.
 *
 * When `grouped` is false (default) only `datasets[0]` is rendered.
 * When `grouped` is true all datasets are rendered as side-by-side bars
 * within each category using a nested scaleBand.
 *
 * @param {SVGElement} svg - Target SVG element.
 * @param {Object} params
 * @param {string} [params.title] - Chart title.
 * @param {string} [params.xLabel] - X-axis label.
 * @param {string} [params.yLabel] - Y-axis label.
 * @param {Object} params.data
 * @param {string[]} params.data.labels - Category labels for the x-axis.
 * @param {Object[]} params.data.datasets - Dataset objects with `data` (number[])
 *   and optional `label` and `color`.
 * @param {Object} [params.options]
 * @param {boolean} [params.options.grouped=false] - Render datasets as
 *   grouped (side-by-side) bars instead of using only the first dataset.
 * @param {number} [params.options.yMin] - Minimum y-axis value (default 0).
 * @param {number} [params.options.yMax] - Maximum y-axis value (default data max).
 */
class Bar {
  constructor(svg, {
    title, xLabel, yLabel, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      yTickCount: config.defaultTickCount,
      grouped: false,
      yMin: null,
      yMax: null,
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

    const yMin = this.options.yMin != null ? this.options.yMin : 0;
    const yMax = this.options.yMax != null ? this.options.yMax : Math.max(...allData);

    const yScale = scaleLinear()
      .domain([yMin, yMax])
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

    if (this.options.grouped && this.data.datasets.length > 1) {
      // Nested scaleBand for sub-bars within each category
      const xSubScale = scaleBand()
        .domain(this.data.datasets.map((_, i) => i))
        .range([0, xScale.bandwidth()])
        .padding(0.05);

      const groupedData = this.data.datasets.flatMap((ds, dsIdx) =>
        ds.data.map((value, labelIdx) => ({ value, labelIdx, dsIdx }))
      );

      graphPart.selectAll('.xkcd-chart-bar')
        .data(groupedData)
        .enter()
        .append('rect')
        .attr('class', 'xkcd-chart-bar')
        .attr('x', (d) => xScale(this.data.labels[d.labelIdx]) + xSubScale(d.dsIdx))
        .attr('width', xSubScale.bandwidth())
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => this.height - yScale(d.value))
        .attr('fill', (d) => this.options.dataColors[d.dsIdx])
        .attr('fill-opacity', 0.7)
        .attr('pointer-events', 'all')
        .attr('stroke', this.options.strokeColor)
        .attr('stroke-width', config.barStrokeWidth)
        .attr('rx', config.barCornerRadius)
        .attr('filter', this.filter)
        .on('mouseover', (d, i, nodes) => {
          select(nodes[i]).attr('fill-opacity', 1);
          tooltip.show();
        })
        .on('mouseout', (d, i, nodes) => {
          select(nodes[i]).attr('fill-opacity', 0.7);
          tooltip.hide();
        })
        .on('click', (d) => {
          if (this.options.onSelect) {
            this.options.onSelect({
              index: d.labelIdx,
              label: this.data.labels[d.labelIdx],
              dataset: this.data.datasets[d.dsIdx].label,
              value: d.value,
            }, d3Event.shiftKey);
          }
        })
        .on('mousemove', (d, i, nodes) => {
          const tipX = mouse(nodes[i])[0] + this.margin.left + config.tooltipMouseOffset;
          const tipY = mouse(nodes[i])[1] + this.margin.top + config.tooltipMouseOffset;
          tooltip.update({
            title: this.data.labels[d.labelIdx],
            items: [{
              color: this.options.dataColors[d.dsIdx],
              text: `${this.data.datasets[d.dsIdx].label || ''}: ${d.value}`,
            }],
            position: {
              x: tipX,
              y: tipY,
              type: tooltipPositionType(tipX, tipY, this.width, this.height),
            },
          });
        });
    } else {
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
}

export default Bar;
