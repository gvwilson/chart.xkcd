import { line, curveMonotoneX } from 'd3-shape';
import { select, event as d3Event } from 'd3-selection';
import { scaleLinear, scaleTime, scaleSqrt } from 'd3-scale';
import dayjs from 'dayjs';

import addAxis from './utils/addAxis';
import addLegend from './utils/addLegend';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, setupMargin, resolveFilterAndFont,
  createSvgEl, setupChartGroup, createTooltip,
} from './utils/initChart';

/**
 * Scatter (XY) chart with optional connecting lines and bubble mode.
 *
 * Each dataset contains an array of `{x, y}` points. When any point
 * includes an `r` field the chart enters bubble mode: dot radii are
 * scaled by `r` using a square-root scale so area encodes magnitude.
 *
 * Supports `xRef`/`yRef` reference lines, explicit axis bounds
 * (`xMin`, `xMax`, `yMin`, `yMax`), time-formatted x-values, click/
 * shift-click selection, and drag-to-select box selection.
 *
 * @param {SVGElement} svg - Target SVG element.
 * @param {Object} params
 * @param {string} [params.title] - Chart title.
 * @param {string} [params.xLabel] - X-axis label.
 * @param {string} [params.yLabel] - Y-axis label.
 * @param {Object} params.data
 * @param {Object[]} params.data.datasets - Array of dataset objects, each with
 *   `data` ({x, y[, r]}[]), optional `label`, and optional `color`.
 * @param {Object} [params.options]
 * @param {number} [params.options.dotSize=1] - Base dot size multiplier.
 * @param {boolean} [params.options.showLine=false] - Connect dots with lines.
 * @param {string} [params.options.timeFormat] - dayjs format for temporal x.
 * @param {number} [params.options.xTickCount=3] - Number of x-axis ticks.
 * @param {number} [params.options.yTickCount=3] - Number of y-axis ticks.
 * @param {number} [params.options.xMin] - Minimum x-axis value.
 * @param {number} [params.options.xMax] - Maximum x-axis value.
 * @param {number} [params.options.yMin] - Minimum y-axis value.
 * @param {number} [params.options.yMax] - Maximum y-axis value.
 * @param {Array<{value:number, label:string}>} [params.options.xRef] - Vertical
 *   reference lines at the given x values.
 * @param {Array<{value:number, label:string}>} [params.options.yRef] - Horizontal
 *   reference lines at the given y values.
 */
class Scatter {
  constructor(svg, {
    title, xLabel, yLabel, data: { datasets }, options,
  }) {
    this.options = applyDefaults({
      dotSize: 1,
      showLine: false,
      timeFormat: '',
      xTickCount: config.defaultTickCount,
      yTickCount: config.defaultTickCount,
      legendPosition: config.positionType.upLeft,
      showLegend: true,
      xMin: null,
      xMax: null,
      yMin: null,
      yMax: null,
      xRef: [],
      yRef: [],
      ...options,
    }, datasets);
    this.title = title;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.data = { datasets };

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

    if (this.options.timeFormat) {
      this.data.datasets.forEach((dataset) => {
        dataset.data.forEach((d) => {
          d.x = dayjs(d.x);
        });
      });
    }

    const allData = this.data.datasets
      .reduce((pre, cur) => pre.concat(cur.data), []);

    const allDataX = allData.map((d) => d.x);
    const allDataY = allData.map((d) => d.y);

    const xDomainMin = this.options.xMin != null ? this.options.xMin : Math.min(...allDataX);
    const xDomainMax = this.options.xMax != null ? this.options.xMax : Math.max(...allDataX);
    const yDomainMin = this.options.yMin != null ? this.options.yMin : Math.min(...allDataY);
    const yDomainMax = this.options.yMax != null ? this.options.yMax : Math.max(...allDataY);

    let xScale = scaleLinear()
      .domain([xDomainMin, xDomainMax])
      .range([0, this.width]);

    if (this.options.timeFormat) {
      xScale = scaleTime()
        .domain([xDomainMin, xDomainMax])
        .range([0, this.width]);
    }

    const yScale = scaleLinear()
      .domain([yDomainMin, yDomainMax])
      .range([this.height, 0]);

    // Bubble mode: use scaleSqrt when any point has an r field
    const allR = allData.filter((d) => d.r != null).map((d) => d.r);
    const hasBubble = allR.length > 0;
    const dotInitSize = config.dotInitRadius * (this.options.dotSize || 1);
    const dotHoverSize = config.dotHoverRadius * (this.options.dotSize || 1);
    let rScale;
    if (hasBubble) {
      rScale = scaleSqrt()
        .domain([0, Math.max(...allR)])
        .range([0, dotInitSize * 4]);
    }

    const graphPart = this.chart.append('g')
      .attr('pointer-events', 'all');

    addAxis.xAxis(graphPart, {
      xScale,
      tickCount: this.options.xTickCount,
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

    // Reference lines (drawn before data)
    (this.options.xRef || []).forEach((ref) => {
      const xPos = xScale(ref.value);
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

    // lines
    if (this.options.showLine) {
      const theLine = line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))
        .curve(curveMonotoneX);

      graphPart.selectAll('.xkcd-chart-xyline')
        .data(this.data.datasets)
        .enter()
        .append('path')
        .attr('class', 'xkcd-chart-xyline')
        .attr('d', (d) => theLine(d.data))
        .attr('fill', 'none')
        .attr('stroke', (d, i) => this.options.dataColors[i])
        .attr('filter', this.filter);
    }

    // dots / bubbles
    graphPart.selectAll('.xkcd-chart-xycircle-group')
      .data(this.data.datasets)
      .enter()
      .append('g')
      .attr('class', '.xkcd-chart-xycircle-group')
      .attr('filter', this.filter)
      .attr('xy-group-index', (d, i) => i)
      .selectAll('.xkcd-chart-xycircle-circle')
      .data((dataset) => dataset.data)
      .enter()
      .append('circle')
      .style('stroke', (d, i, nodes) => {
        const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
        return this.options.dataColors[xyGroupIndex];
      })
      .style('fill', (d, i, nodes) => {
        const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
        return this.options.dataColors[xyGroupIndex];
      })
      .attr('r', (d) => {
        if (hasBubble) return rScale(d.r != null ? d.r : 0);
        return dotInitSize;
      })
      .attr('fill-opacity', hasBubble ? 0.6 : 1)
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('pointer-events', 'all')
      .on('click', (d, i, nodes) => {
        if (this.options.onSelect) {
          const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
          this.options.onSelect({
            dataset_index: xyGroupIndex,
            point_index: i,
            label: this.data.datasets[xyGroupIndex].label,
            x: d.x,
            y: d.y,
            ...(d.r != null ? { r: d.r } : {}),
          }, d3Event.shiftKey);
        }
      })
      .on('mouseover', (d, i, nodes) => {
        const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
        const currentR = hasBubble ? rScale(d.r != null ? d.r : 0) : dotInitSize;
        select(nodes[i]).attr('r', currentR + (dotHoverSize - dotInitSize));
        const tipX = xScale(d.x) + this.margin.left + config.scatterMouseOffset;
        const tipY = yScale(d.y) + this.margin.top + config.scatterMouseOffset;
        const xLabel = this.options.timeFormat
          ? dayjs(this.data.datasets[xyGroupIndex].data[i].x).format(this.options.timeFormat)
          : `${this.data.datasets[xyGroupIndex].data[i].x}`;
        const valueText = d.r != null
          ? `${this.data.datasets[xyGroupIndex].label || ''}: ${d.y} (r=${d.r})`
          : `${this.data.datasets[xyGroupIndex].label || ''}: ${d.y}`;
        tooltip.update({
          title: xLabel,
          items: [{
            color: this.options.dataColors[xyGroupIndex],
            text: valueText,
          }],
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType(tipX, tipY, this.width, this.height),
          },
        });
        tooltip.show();
      })
      .on('mouseout', (d, i, nodes) => {
        const currentR = hasBubble ? rScale(d.r != null ? d.r : 0) : dotInitSize;
        select(nodes[i]).attr('r', currentR);
        tooltip.hide();
      });

    // Box selection
    if (this.options.onSelect) {
      let dragStart = null;
      const selRect = graphPart.append('rect')
        .attr('class', 'xkcd-chart-select-rect')
        .attr('fill', 'rgba(0,0,0,0.1)')
        .attr('stroke', this.options.strokeColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('visibility', 'hidden');

      graphPart.insert('rect', ':first-child')
        .attr('class', 'xkcd-chart-drag-overlay')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mousedown', () => {
          const e = d3Event;
          if (e.button !== 0) return;
          const svgNode = this.svgEl.node();
          const pt = svgNode.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const local = pt.matrixTransform(graphPart.node().getScreenCTM().inverse());
          dragStart = { x: local.x, y: local.y };
          selRect.style('visibility', 'hidden');
        });

      select(window)
        .on('mousemove.scatter-box', () => {
          if (!dragStart) return;
          const e = d3Event;
          const svgNode = this.svgEl.node();
          const pt = svgNode.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const local = pt.matrixTransform(graphPart.node().getScreenCTM().inverse());
          const x = Math.max(0, Math.min(dragStart.x, local.x));
          const y = Math.max(0, Math.min(dragStart.y, local.y));
          const w = Math.min(Math.abs(local.x - dragStart.x), this.width - x);
          const h = Math.min(Math.abs(local.y - dragStart.y), this.height - y);
          selRect
            .attr('x', x).attr('y', y)
            .attr('width', w).attr('height', h)
            .style('visibility', 'visible');
        })
        .on('mouseup.scatter-box', () => {
          if (!dragStart) return;
          const e = d3Event;
          const svgNode = this.svgEl.node();
          const pt = svgNode.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const local = pt.matrixTransform(graphPart.node().getScreenCTM().inverse());
          const x0 = Math.min(dragStart.x, local.x);
          const x1 = Math.max(dragStart.x, local.x);
          const y0 = Math.min(dragStart.y, local.y);
          const y1 = Math.max(dragStart.y, local.y);
          dragStart = null;
          selRect.style('visibility', 'hidden');

          if (x1 - x0 < config.boxSelectMinDrag
            && y1 - y0 < config.boxSelectMinDrag) return;

          const dataX0 = xScale.invert(x0);
          const dataX1 = xScale.invert(x1);
          const dataY0 = yScale.invert(y1); // y is inverted
          const dataY1 = yScale.invert(y0);
          const selected = [];
          this.data.datasets.forEach((dataset, dsIdx) => {
            dataset.data.forEach((d, ptIdx) => {
              if (d.x >= dataX0 && d.x <= dataX1 && d.y >= dataY0 && d.y <= dataY1) {
                selected.push({
                  dataset_index: dsIdx,
                  point_index: ptIdx,
                  label: dataset.label,
                  x: d.x,
                  y: d.y,
                  ...(d.r != null ? { r: d.r } : {}),
                });
              }
            });
          });
          if (selected.length > 0) {
            this.options.onSelect(selected, e.shiftKey);
          }
        });
    }

    // Legend
    if (this.options.showLegend) {
      const legendItems = this.data.datasets.map(
        (dataset, i) => ({
          color: this.options.dataColors[i],
          text: dataset.label,
        }),
      );

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

export default Scatter;
