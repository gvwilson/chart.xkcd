import { line, curveMonotoneX } from 'd3-shape';
import { select, event as d3Event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import dayjs from 'dayjs';

import addAxis from './utils/addAxis';
import addLabels from './utils/addLabels';
import Tooltip from './components/Tooltip';
import addLegend from './utils/addLegend';
import addFont from './utils/addFont';
import addFilter from './utils/addFilter';
import colors from './utils/colors';
import config from './config';

const margin = {
  top: 50, right: 30, bottom: 50, left: 50,
};

class Scatter {
  constructor(svg, {
    title, xLabel, yLabel, data: { datasets }, options,
  }) {
    this.options = {
      unxkcdify: false,
      dotSize: 1,
      showLine: false,
      timeFormat: '',
      xTickCount: 3,
      yTickCount: 3,
      legendPosition: config.positionType.upLeft,
      dataColors: colors,
      fontFamily: 'xkcd',
      strokeColor: 'black',
      backgroundColor: 'white',
      showLegend: true,
      ...options,
    };
    this.options.dataColors = datasets.map(
      (ds, i) => ds.color || this.options.dataColors[i % this.options.dataColors.length],
    );
    // TODO: extract a function?
    if (title) {
      this.title = title;
      margin.top = 60;
    }
    if (xLabel) {
      this.xLabel = xLabel;
      margin.bottom = 50;
    }
    if (yLabel) {
      this.yLabel = yLabel;
      margin.left = 70;
    }
    this.data = {
      datasets,
    };

    this.filter = 'url(#xkcdify)';
    this.fontFamily = this.options.fontFamily || 'xkcd';
    if (this.options.unxkcdify) {
      this.filter = null;
      this.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }

    this.svgEl = select(svg)
      .style('stroke-width', 3)
      .style('font-family', this.fontFamily)
      .style('background', this.options.backgroundColor)
      .attr('width', svg.parentElement.clientWidth)
      .attr('height', Math.min((svg.parentElement.clientWidth * 2) / 3, window.innerHeight));
    this.svgEl.selectAll('*').remove();

    this.chart = this.svgEl.append('g')
      .attr('transform',
        `translate(${margin.left},${margin.top})`);

    this.width = this.svgEl.attr('width') - margin.left - margin.right;
    this.height = this.svgEl.attr('height') - margin.top - margin.bottom;
    addFont(this.svgEl);
    addFilter(this.svgEl);
    this.render();
  }

  render() {
    if (this.title) addLabels.title(this.svgEl, this.title, this.options.strokeColor);
    if (this.xLabel) addLabels.xLabel(this.svgEl, this.xLabel, this.options.strokeColor);
    if (this.yLabel) addLabels.yLabel(this.svgEl, this.yLabel, this.options.strokeColor);

    const tooltip = new Tooltip({
      parent: this.svgEl,
      title: '',
      items: [{ color: 'red', text: 'weweyang' }, { color: 'blue', text: 'timqian' }],
      position: { x: 60, y: 60, type: config.positionType.dowfnRight },
      unxkcdify: this.options.unxkcdify,
      strokeColor: this.options.strokeColor,
      backgroundColor: this.options.backgroundColor,
    });

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

    // axis
    addAxis.xAxis(graphPart, {
      xScale,
      tickCount: this.options.xTickCount === undefined ? 3 : this.options.xTickCount,
      moveDown: this.height,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });
    addAxis.yAxis(graphPart, {
      yScale,
      tickCount: this.options.yTickCount === undefined ? 3 : this.options.yTickCount,
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
        .attr('stroke', (d, i) => (this.options.dataColors[i]))
        .attr('filter', this.filter);
    }

    // dots
    const dotInitSize = 3.5 * (this.options.dotSize === undefined ? 1 : this.options.dotSize);
    const dotHoverSize = 6 * (this.options.dotSize === undefined ? 1 : this.options.dotSize);
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
        // FIXME: here I want to pass xyGroupIndex down to the circles by reading parent attrs
        // It might have perfomance issue with a large dataset, not sure there are better ways
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
        select(nodes[i])
          .attr('r', dotHoverSize);

        const tipX = xScale(d.x) + margin.left + 5;
        const tipY = yScale(d.y) + margin.top + 5;
        let tooltipPositionType = config.positionType.downRight;
        if (tipX > this.width / 2 && tipY < this.height / 2) {
          tooltipPositionType = config.positionType.downLeft;
        } else if (tipX > this.width / 2 && tipY > this.height / 2) {
          tooltipPositionType = config.positionType.upLeft;
        } else if (tipX < this.width / 2 && tipY > this.height / 2) {
          tooltipPositionType = config.positionType.upRight;
        }
        tooltip.update({
          title: this.options.timeFormat ? dayjs(this.data.datasets[xyGroupIndex].data[i].x).format(this.options.timeFormat) : `${this.data.datasets[xyGroupIndex].data[i].x}`,
          items: [{
            color: this.options.dataColors[xyGroupIndex],
            text: `${this.data.datasets[xyGroupIndex].label || ''}: ${d.y}`,
          }],
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType,
          },
        });
        tooltip.show();
      })
      .on('mouseout', (d, i, nodes) => {
        select(nodes[i])
          .attr('r', dotInitSize);

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

      // Invisible overlay behind dots to capture drag events on empty space
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

          // Only treat as box select if dragged more than 4px
          if (x1 - x0 < 4 && y1 - y0 < 4) return;

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
