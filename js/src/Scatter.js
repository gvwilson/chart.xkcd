import { line, curveMonotoneX } from 'd3-shape';
import { select, event as d3Event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import dayjs from 'dayjs';

import addAxis from './utils/addAxis';
import addLegend from './utils/addLegend';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, setupMargin, resolveFilterAndFont,
  createSvgEl, setupChartGroup, createTooltip,
} from './utils/initChart';

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

    let xScale = scaleLinear()
      .domain([Math.min(...allDataX), Math.max(...allDataX)])
      .range([0, this.width]);

    if (this.options.timeFormat) {
      xScale = scaleTime()
        .domain([Math.min(...allDataX), Math.max(...allDataX)])
        .range([0, this.width]);
    }

    const yScale = scaleLinear()
      .domain([Math.min(...allDataY), Math.max(...allDataY)])
      .range([this.height, 0]);

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

    // dots
    const dotInitSize = config.dotInitRadius * (this.options.dotSize || 1);
    const dotHoverSize = config.dotHoverRadius * (this.options.dotSize || 1);
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
      .attr('r', dotInitSize)
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
          }, d3Event.shiftKey);
        }
      })
      .on('mouseover', (d, i, nodes) => {
        const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
        select(nodes[i]).attr('r', dotHoverSize);
        const tipX = xScale(d.x) + this.margin.left + config.scatterMouseOffset;
        const tipY = yScale(d.y) + this.margin.top + config.scatterMouseOffset;
        tooltip.update({
          title: this.options.timeFormat
            ? dayjs(this.data.datasets[xyGroupIndex].data[i].x).format(this.options.timeFormat)
            : `${this.data.datasets[xyGroupIndex].data[i].x}`,
          items: [{
            color: this.options.dataColors[xyGroupIndex],
            text: `${this.data.datasets[xyGroupIndex].label || ''}: ${d.y}`,
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
        select(nodes[i]).attr('r', dotInitSize);
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
      });
    }
  }
}

export default Scatter;
