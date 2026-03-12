import { line, area, curveMonotoneX } from 'd3-shape';
import { select, mouse, event as d3Event } from 'd3-selection';
import { scalePoint, scaleLinear } from 'd3-scale';

import addAxis from './utils/addAxis';
import addLegend from './utils/addLegend';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, setupMargin, resolveFilterAndFont,
  createSvgEl, setupChartGroup, createTooltip,
} from './utils/initChart';

/**
 * Line chart with smooth (monotone-X) interpolation.
 *
 * Supports multiple datasets, optional area fill under each line,
 * optional reference lines (xRef / yRef), and explicit axis bounds
 * (yMin / yMax). A vertical hover line snaps to the nearest label
 * and shows a tooltip with all dataset values at that point.
 *
 * @param {SVGElement} svg - Target SVG element.
 * @param {Object} params
 * @param {string} [params.title] - Chart title.
 * @param {string} [params.xLabel] - X-axis label.
 * @param {string} [params.yLabel] - Y-axis label.
 * @param {Object} params.data
 * @param {string[]} params.data.labels - Labels for each point along the x-axis.
 * @param {Object[]} params.data.datasets - Array of dataset objects, each with
 *   `data` (number[]), optional `label`, and optional `color`.
 * @param {Object} [params.options]
 * @param {boolean} [params.options.showArea=false] - Fill the area under each line.
 * @param {number} [params.options.yMin] - Minimum y-axis value.
 * @param {number} [params.options.yMax] - Maximum y-axis value.
 * @param {Array<{value:string, label:string}>} [params.options.xRef] - Vertical
 *   reference lines at the given x-axis label values.
 * @param {Array<{value:number, label:string}>} [params.options.yRef] - Horizontal
 *   reference lines at the given y values.
 * @param {boolean} [params.options.showLegend=true] - Show legend.
 * @param {number} [params.options.legendPosition] - Legend placement.
 */
class Line {
  constructor(svg, {
    title, xLabel, yLabel, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      yTickCount: config.defaultTickCount,
      legendPosition: config.positionType.upLeft,
      showLegend: true,
      showArea: false,
      yMin: null,
      yMax: null,
      xRef: [],
      yRef: [],
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

    const xScale = scalePoint()
      .domain(this.data.labels)
      .range([0, this.width]);

    const allData = this.data.datasets
      .reduce((pre, cur) => pre.concat(cur.data), []);

    const yMin = this.options.yMin != null ? this.options.yMin : Math.min(...allData);
    const yMax = this.options.yMax != null ? this.options.yMax : Math.max(...allData);

    const yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([this.height, 0]);

    const graphPart = this.chart.append('g')
      .attr('pointer-events', 'all');

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

    this.svgEl.selectAll('.domain')
      .attr('filter', this.filter);

    // Reference lines (drawn before data so they appear behind)
    (this.options.xRef || []).forEach((ref) => {
      const xPos = xScale(ref.value);
      if (xPos == null) return;
      graphPart.append('line')
        .attr('x1', xPos).attr('x2', xPos)
        .attr('y1', 0).attr('y2', this.height)
        .attr('stroke', this.options.strokeColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4');
      if (ref.label) {
        graphPart.append('text')
          .attr('x', xPos + 4)
          .attr('y', 14)
          .style('font-size', config.tooltipFontSize)
          .style('fill', this.options.strokeColor)
          .text(ref.label);
      }
    });

    (this.options.yRef || []).forEach((ref) => {
      const yPos = yScale(ref.value);
      graphPart.append('line')
        .attr('x1', 0).attr('x2', this.width)
        .attr('y1', yPos).attr('y2', yPos)
        .attr('stroke', this.options.strokeColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4');
      if (ref.label) {
        graphPart.append('text')
          .attr('x', 4)
          .attr('y', yPos - 4)
          .style('font-size', config.tooltipFontSize)
          .style('fill', this.options.strokeColor)
          .text(ref.label);
      }
    });

    // Area fill (behind lines)
    if (this.options.showArea) {
      const theArea = area()
        .x((d, i) => xScale(this.data.labels[i]))
        .y0(this.height)
        .y1((d) => yScale(d))
        .curve(curveMonotoneX);

      graphPart.selectAll('.xkcd-chart-line-area')
        .data(this.data.datasets)
        .enter()
        .append('path')
        .attr('class', 'xkcd-chart-line-area')
        .attr('d', (d) => theArea(d.data))
        .attr('fill', (d, i) => this.options.dataColors[i])
        .attr('fill-opacity', 0.15)
        .attr('stroke', 'none');
    }

    const theLine = line()
      .x((d, i) => xScale(this.data.labels[i]))
      .y((d) => yScale(d))
      .curve(curveMonotoneX);

    graphPart.selectAll('.xkcd-chart-line')
      .data(this.data.datasets)
      .enter()
      .append('path')
      .attr('class', 'xkcd-chart-line')
      .attr('d', (d) => theLine(d.data))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => this.options.dataColors[i])
      .attr('filter', this.filter);

    // hover effect
    const verticalLine = graphPart.append('line')
      .attr('x1', 30)
      .attr('y1', 0)
      .attr('x2', 30)
      .attr('y2', this.height)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '7,7')
      .style('visibility', 'hidden');

    const circles = this.data.datasets.map((dataset, i) => graphPart
      .append('circle')
      .style('stroke', this.options.dataColors[i])
      .style('fill', this.options.dataColors[i])
      .attr('r', config.dotInitRadius)
      .style('visibility', 'hidden'));

    graphPart.append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .on('mouseover', () => {
        circles.forEach((circle) => circle.style('visibility', 'visible'));
        verticalLine.style('visibility', 'visible');
        tooltip.show();
      })
      .on('mouseout', () => {
        circles.forEach((circle) => circle.style('visibility', 'hidden'));
        verticalLine.style('visibility', 'hidden');
        tooltip.hide();
      })
      .on('click', (d, i, nodes) => {
        if (this.options.onSelect) {
          const labelXs = this.data.labels.map((label) => xScale(label) + this.margin.left);
          const mouseLabelDistances = labelXs.map(
            (labelX) => Math.abs(labelX - mouse(nodes[i])[0] - this.margin.left),
          );
          const nearestIndex = mouseLabelDistances.indexOf(Math.min(...mouseLabelDistances));
          this.options.onSelect({
            index: nearestIndex,
            label: this.data.labels[nearestIndex],
            values: this.data.datasets.map((dataset) => ({
              label: dataset.label,
              value: dataset.data[nearestIndex],
            })),
          }, d3Event.shiftKey);
        }
      })
      .on('mousemove', (d, i, nodes) => {
        const tipX = mouse(nodes[i])[0] + this.margin.left + config.tooltipMouseOffset;
        const tipY = mouse(nodes[i])[1] + this.margin.top + config.tooltipMouseOffset;

        const labelXs = this.data.labels.map((label) => xScale(label) + this.margin.left);
        const mouseLabelDistances = labelXs.map(
          (labelX) => Math.abs(labelX - mouse(nodes[i])[0] - this.margin.left),
        );
        const nearestIndex = mouseLabelDistances.indexOf(Math.min(...mouseLabelDistances));

        verticalLine
          .attr('x1', xScale(this.data.labels[nearestIndex]))
          .attr('x2', xScale(this.data.labels[nearestIndex]));

        this.data.datasets.forEach((dataset, j) => {
          circles[j]
            .style('visibility', 'visible')
            .attr('cx', xScale(this.data.labels[nearestIndex]))
            .attr('cy', yScale(dataset.data[nearestIndex]));
        });

        const tooltipItems = this.data.datasets.map((dataset, j) => ({
          color: this.options.dataColors[j],
          text: `${this.data.datasets[j].label || ''}: ${this.data.datasets[j].data[nearestIndex]}`,
        }));

        tooltip.update({
          title: this.data.labels[nearestIndex],
          items: tooltipItems,
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType(tipX, tipY, this.width, this.height),
          },
        });
      });

    if (this.options.showLegend) {
      const legendItems = this.data.datasets
        .map((dataset, i) => ({
          color: this.options.dataColors[i],
          text: dataset.label,
        }));

      addLegend(graphPart, {
        items: legendItems,
        position: this.options.legendPosition,
        unxkcdify: this.options.unxkcdify,
        parentWidth: this.width,
        parentHeight: this.height,
        backgroundColor: this.options.backgroundColor,
        strokeColor: this.options.strokeColor,
        legendScale: this.options.legendScale,
      });
    }
  }
}

export default Line;
