import { line, curveMonotoneX } from 'd3-shape';
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
 * Supports multiple datasets rendered as separate colored lines.
 * A vertical hover line snaps to the nearest label and shows
 * a tooltip with values from all datasets at that point.
 * Includes click/shift-click selection and an optional legend.
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
 * @param {Object} [params.options] - Includes `showLegend`, `legendPosition`,
 *   and all common options from `applyDefaults`.
 */
class Line {
  constructor(svg, {
    title, xLabel, yLabel, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      yTickCount: config.defaultTickCount,
      legendPosition: config.positionType.upLeft,
      showLegend: true,
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

    const yScale = scaleLinear()
      .domain([Math.min(...allData), Math.max(...allData)])
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
      });
    }
  }
}

export default Line;
