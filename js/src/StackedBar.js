import { select, mouse, event as d3Event } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';

import addAxis from './utils/addAxis';
import addLegend from './utils/addLegend';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, setupMargin, resolveFilterAndFont,
  createSvgEl, setupChartGroup, createTooltip,
} from './utils/initChart';

/**
 * Stacked bar chart supporting multiple datasets.
 *
 * When `normalize` is true each column is rescaled so all segments sum
 * to 100%, giving a 100% stacked bar chart. Supports explicit y-axis
 * bounds via `yMin` / `yMax`.
 *
 * @param {SVGElement} svg - Target SVG element.
 * @param {Object} params
 * @param {string} [params.title] - Chart title.
 * @param {string} [params.xLabel] - X-axis label.
 * @param {string} [params.yLabel] - Y-axis label.
 * @param {Object} params.data
 * @param {string[]} params.data.labels - Category labels for the x-axis.
 * @param {Object[]} params.data.datasets - Array of dataset objects, each with
 *   `data` (number[]), optional `label`, and optional `color`.
 * @param {Object} [params.options]
 * @param {boolean} [params.options.normalize=false] - Scale each column to 100%.
 * @param {number} [params.options.yMin] - Minimum y-axis value (default 0).
 * @param {number} [params.options.yMax] - Maximum y-axis value (default data max).
 * @param {boolean} [params.options.showLegend=true] - Show legend.
 * @param {number} [params.options.legendPosition] - Legend placement.
 */
class StackedBar {
  constructor(svg, {
    title, xLabel, yLabel, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      yTickCount: config.defaultTickCount,
      legendPosition: config.positionType.upLeft,
      showLegend: true,
      normalize: false,
      yMin: null,
      yMax: null,
      ...options,
    }, datasets);
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

    // Column totals (used for normalize and y-scale max)
    const allCols = this.data.datasets
      .reduce((r, a) => a.data.map((b, i) => (r[i] || 0) + b), []);

    // Optionally rescale each column to 100%
    const displayDatasets = this.options.normalize
      ? this.data.datasets.map((ds) => ({
        ...ds,
        data: ds.data.map((v, j) => (allCols[j] ? (v / allCols[j]) * 100 : 0)),
      }))
      : this.data.datasets;

    const yDomainMax = this.options.normalize
      ? 100
      : (this.options.yMax != null ? this.options.yMax : Math.max(...allCols));
    const yDomainMin = this.options.yMin != null ? this.options.yMin : 0;

    const yScale = scaleLinear()
      .domain([yDomainMin, yDomainMax])
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

    const mergedData = displayDatasets
      .reduce((pre, cur) => pre.concat(cur.data), []);

    const dataLength = displayDatasets[0].data.length;

    const offsets = displayDatasets
      .reduce((r, x, i) => {
        if (i > 0) {
          r.push(x.data.map((y, j) => displayDatasets[i - 1].data[j] + r[i - 1][j]));
        } else {
          r.push(new Array(x.data.length).fill(0));
        }
        return r;
      }, []).flat();

    graphPart.selectAll('.xkcd-chart-stacked-bar')
      .data(mergedData)
      .enter()
      .append('rect')
      .attr('class', 'xkcd-chart-stacked-bar')
      .attr('x', (d, i) => xScale(this.data.labels[i % dataLength]))
      .attr('width', xScale.bandwidth())
      .attr('y', (d, i) => yScale(d + offsets[i]))
      .attr('height', (d) => this.height - yScale(d))
      .attr('fill', (d, i) => this.options.dataColors[Math.floor(i / dataLength)])
      .attr('pointer-events', 'all')
      .attr('stroke', this.options.strokeColor)
      .attr('stroke-width', config.barStrokeWidth)
      .attr('rx', config.barCornerRadius)
      .attr('filter', this.filter)
      .on('mouseover', () => tooltip.show())
      .on('mouseout', () => tooltip.hide())
      .on('click', (d, i) => {
        const colIndex = i % dataLength;
        const dsIndex = Math.floor(i / dataLength);
        if (this.options.onSelect) {
          this.options.onSelect({
            index: colIndex,
            label: this.data.labels[colIndex],
            dataset: this.data.datasets[dsIndex].label,
            value: d,
          }, d3Event.shiftKey);
        }
      })
      .on('mousemove', (d, i, nodes) => {
        const tipX = mouse(nodes[i])[0] + this.margin.left + config.tooltipMouseOffset;
        const tipY = mouse(nodes[i])[1] + this.margin.top + config.tooltipMouseOffset;

        const colIndex = i % dataLength;
        const tooltipItems = this.data.datasets.map((dataset, j) => {
          const raw = dataset.data[colIndex];
          const text = this.options.normalize
            ? `${dataset.label || ''}: ${raw} (${allCols[colIndex] ? ((raw / allCols[colIndex]) * 100).toFixed(1) : 0}%)`
            : `${dataset.label || ''}: ${raw}`;
          return { color: this.options.dataColors[j], text };
        }).reverse();

        tooltip.update({
          title: this.data.labels[colIndex],
          items: tooltipItems,
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType(tipX, tipY, this.width, this.height),
          },
        });
      });

    if (this.options.showLegend) {
      const legendItems = this.data.datasets.map((dataset, j) => ({
        color: this.options.dataColors[j],
        text: `${this.data.datasets[j].label || ''}`,
      })).reverse();

      addLegend(graphPart, {
        items: legendItems,
        position: this.options.legendPosition,
        unxkcdify: this.options.unxkcdify,
        parentWidth: this.width,
        parentHeight: this.height,
        strokeColor: this.options.strokeColor,
        backgroundColor: this.options.backgroundColor,
        legendScale: this.options.legendScale,
      });
    }
  }
}

export default StackedBar;
