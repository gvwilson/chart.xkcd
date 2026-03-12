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
 * Heatmap chart with two categorical axes and color-encoded cell values.
 *
 * Cell fill opacity is scaled linearly from the data minimum to maximum
 * so lighter cells represent lower values and darker cells represent
 * higher values. Hover shows a tooltip with exact coordinates and value.
 *
 * @param {SVGElement} svg - Target SVG element.
 * @param {Object} params
 * @param {string} [params.title] - Chart title.
 * @param {string} [params.xLabel] - X-axis label.
 * @param {string} [params.yLabel] - Y-axis label.
 * @param {Object} params.data
 * @param {string[]} params.data.labels - Column (x-axis) labels.
 * @param {string[]} params.data.yLabels - Row (y-axis) labels.
 * @param {Object[]} params.data.datasets - Array with one dataset whose
 *   `data` property is a 2-D number array shaped [rowIndex][colIndex],
 *   matching `yLabels` × `labels`.
 * @param {Object} [params.options]
 * @param {number} [params.options.cellPadding=0.05] - Fractional gap between cells.
 * @param {number} [params.options.minOpacity=0.08] - Opacity for minimum value cells.
 * @param {number} [params.options.maxOpacity=0.92] - Opacity for maximum value cells.
 */
class Heatmap {
  constructor(svg, {
    title, xLabel, yLabel, data: { labels, yLabels, datasets }, options,
  }) {
    this.options = applyDefaults({
      cellPadding: 0.05,
      minOpacity: 0.08,
      maxOpacity: 0.92,
      ...options,
    });
    this.title = title;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.data = { labels, yLabels, datasets };

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
      .padding(this.options.cellPadding);

    const yScale = scaleBand()
      .range([0, this.height])
      .domain(this.data.yLabels)
      .padding(this.options.cellPadding);

    const matrix = this.data.datasets[0].data;
    const allValues = matrix.reduce((acc, row) => acc.concat(row), []);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const opacityScale = scaleLinear()
      .domain([minVal, maxVal])
      .range([this.options.minOpacity, this.options.maxOpacity]);

    const cellColor = this.options.dataColors[0];

    const graphPart = this.chart.append('g');

    // x-axis (bottom)
    addAxis.xAxis(graphPart, {
      xScale,
      tickCount: this.data.labels.length,
      moveDown: this.height,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });

    // y-axis (left)
    addAxis.yAxis(graphPart, {
      yScale,
      tickCount: this.data.yLabels.length,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });

    // Flatten grid into [{xLabel, yLabel, value, rowIdx, colIdx}]
    const cellData = [];
    this.data.yLabels.forEach((yLab, rowIdx) => {
      this.data.labels.forEach((xLab, colIdx) => {
        cellData.push({
          xLab,
          yLab,
          value: (matrix[rowIdx] || [])[colIdx] != null ? matrix[rowIdx][colIdx] : 0,
          rowIdx,
          colIdx,
        });
      });
    });

    graphPart.selectAll('.xkcd-chart-heatmap-cell')
      .data(cellData)
      .enter()
      .append('rect')
      .attr('class', 'xkcd-chart-heatmap-cell')
      .attr('x', (d) => xScale(d.xLab))
      .attr('y', (d) => yScale(d.yLab))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', cellColor)
      .attr('fill-opacity', (d) => opacityScale(d.value))
      .attr('stroke', this.options.strokeColor)
      .attr('stroke-width', 0.5)
      .attr('rx', config.barCornerRadius)
      .attr('filter', this.filter)
      .attr('pointer-events', 'all')
      .on('mouseover', () => tooltip.show())
      .on('mouseout', () => tooltip.hide())
      .on('mousemove', (d, i, nodes) => {
        const tipX = mouse(nodes[i])[0] + this.margin.left + config.tooltipMouseOffset;
        const tipY = mouse(nodes[i])[1] + this.margin.top + config.tooltipMouseOffset;
        tooltip.update({
          title: `${d.xLab} × ${d.yLab}`,
          items: [{
            color: cellColor,
            text: `value: ${d.value}`,
          }],
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType(tipX, tipY, this.width, this.height),
          },
        });
      })
      .on('click', (d) => {
        if (this.options.onSelect) {
          this.options.onSelect({
            xLabel: d.xLab,
            yLabel: d.yLab,
            value: d.value,
            rowIndex: d.rowIdx,
            colIndex: d.colIdx,
          }, d3Event.shiftKey);
        }
      });
  }
}

export default Heatmap;
