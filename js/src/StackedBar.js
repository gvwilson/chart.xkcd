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

class StackedBar {
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

    const xScale = scaleBand()
      .range([0, this.width])
      .domain(this.data.labels)
      .padding(config.bandPadding);

    const allCols = this.data.datasets
      .reduce((r, a) => a.data.map((b, i) => (r[i] || 0) + b), []);

    const yScale = scaleLinear()
      .domain([0, Math.max(...allCols)])
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

    const mergedData = this.data.datasets
      .reduce((pre, cur) => pre.concat(cur.data), []);

    const dataLength = this.data.datasets[0].data.length;

    const offsets = this.data.datasets
      .reduce((r, x, i) => {
        if (i > 0) {
          r.push(x.data.map((y, j) => this.data.datasets[i - 1].data[j] + r[i - 1][j]));
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

        const tooltipItems = this.data.datasets.map((dataset, j) => ({
          color: this.options.dataColors[j],
          text: `${this.data.datasets[j].label || ''}: ${this.data.datasets[j].data[i % dataLength]}`,
        })).reverse();

        tooltip.update({
          title: this.data.labels[i],
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
      });
    }
  }
}

export default StackedBar;
