import { select, event as d3Event } from 'd3-selection';
import { line, curveLinearClosed } from 'd3-shape';
import { scaleLinear } from 'd3-scale';

import addLegend from './utils/addLegend';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, resolveFilterAndFont,
  createSvgEl, setupChartGroupSimple, createTooltip,
} from './utils/initChart';

const angleOffset = -Math.PI / 2;

class Radar {
  constructor(svg, {
    title, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      showLabels: false,
      ticksCount: config.defaultTickCount,
      showLegend: false,
      legendPosition: config.positionType.upLeft,
      dotSize: 1,
      ...options,
    }, datasets);
    this.title = title;
    this.data = { labels, datasets };
    this.directionsCount = datasets[0].data.length;

    const { filter, fontFamily } = resolveFilterAndFont(this.options, true);
    this.filter = filter;
    this.fontFamily = fontFamily;
    this.svgEl = createSvgEl(svg, { fontFamily, backgroundColor: this.options.backgroundColor });
    const { chart, width, height } = setupChartGroupSimple(
      this.svgEl, { title, strokeColor: this.options.strokeColor },
    );
    this.chart = chart;
    this.width = width;
    this.height = height;
    this.render();
  }

  render() {
    const tooltip = createTooltip(this.svgEl, this.options);

    const dotInitSize = config.dotInitRadius * (this.options.dotSize || 1);
    const dotHoverSize = config.dotHoverRadius * (this.options.dotSize || 1);
    const radius = Math.min(this.width, this.height) / 2 - config.marginScalar;
    const angleStep = (Math.PI * 2) / this.directionsCount;

    const allDataValues = this.data.datasets
      .reduce((acc, cur) => acc.concat(cur.data), []);
    const maxValue = Math.max(...allDataValues);
    const allMaxData = Array(this.directionsCount).fill(maxValue);
    const valueScale = scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);
    const getX = (d, i) => valueScale(d) * Math.cos(angleStep * i + angleOffset);
    const getY = (d, i) => valueScale(d) * Math.sin(angleStep * i + angleOffset);

    const theLine = line()
      .x(getX)
      .y(getY)
      .curve(curveLinearClosed);

    // grid
    const ticks = valueScale.ticks(this.options.ticksCount || config.defaultTickCount);
    const grid = this.chart.append('g')
      .attr('class', 'xkcd-chart-radar-grid')
      .attr('stroke-width', '1')
      .attr('filter', this.filter);

    grid.selectAll('.xkcd-chart-radar-level')
      .data(ticks)
      .enter()
      .append('path')
      .attr('class', 'xkcd-chart-radar-level')
      .attr('d', (d) => theLine(Array(this.directionsCount).fill(d)))
      .style('fill', 'none')
      .attr('stroke', this.options.strokeColor)
      .attr('stroke-dasharray', '7,7');

    grid.selectAll('.xkcd-chart-radar-line')
      .data(allMaxData)
      .enter()
      .append('line')
      .attr('class', '.xkcd-chart-radar-line')
      .attr('stroke', this.options.strokeColor)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', getX)
      .attr('y2', getY);

    grid.selectAll('.xkcd-chart-radar-tick')
      .data(ticks)
      .enter()
      .append('text')
      .attr('class', 'xkcd-chart-radar-tick')
      .attr('x', (d) => getX(d, 0))
      .attr('y', (d) => getY(d, 0))
      .style('font-size', config.tickFontSize)
      .style('fill', this.options.strokeColor)
      .attr('text-anchor', 'end')
      .attr('dx', '-.125em')
      .attr('dy', '.35em')
      .text((d) => d);

    if (this.options.showLabels) {
      grid.selectAll('.xkcd-chart-radar-label')
        .data(allMaxData.map((d) => d * 1.15))
        .enter()
        .append('text')
        .attr('class', 'xkcd-chart-radar-label')
        .style('font-size', config.tickFontSize)
        .style('fill', this.options.strokeColor)
        .attr('x', (d, i) => (radius + 10) * Math.cos(angleStep * i + angleOffset))
        .attr('y', (d, i) => (radius + 10) * Math.sin(angleStep * i + angleOffset))
        .attr('dy', '.35em')
        .attr('text-anchor', (d, i, nodes) => {
          const node = select(nodes[i]);
          return node.attr('x') < 0 ? 'end' : 'start';
        })
        .text((d, i) => this.data.labels[i]);
    }

    // layers
    const layers = this.chart.selectAll('.xkcd-chart-radar-group')
      .data(this.data.datasets)
      .enter()
      .append('g')
      .attr('class', 'xkcd-chart-radar-group')
      .attr('filter', this.filter)
      .attr('stroke', (d, i) => this.options.dataColors[i])
      .attr('fill', (d, i) => this.options.dataColors[i]);

    layers.selectAll('circle')
      .data((dataset) => dataset.data)
      .enter()
      .append('circle')
      .attr('r', dotInitSize)
      .attr('cx', getX)
      .attr('cy', getY)
      .attr('pointer-events', 'all')
      .on('click', (d, i) => {
        if (this.options.onSelect) {
          this.options.onSelect({
            index: i,
            label: this.data.labels[i],
            values: this.data.datasets.map((dataset) => ({
              label: dataset.label,
              value: dataset.data[i],
            })),
          }, d3Event.shiftKey);
        }
      })
      .on('mouseover', (d, i, nodes) => {
        select(nodes[i]).attr('r', dotHoverSize);

        const tipX = getX(d, i) + this.width / 2;
        const tipY = getY(d, i) + this.height / 2;
        tooltip.update({
          title: this.data.labels[i],
          items: this.data.datasets.map((dataset, datasetIndex) => ({
            color: this.options.dataColors[datasetIndex],
            text: `${dataset.label || ''}: ${dataset.data[i]}`,
          })),
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

    layers.selectAll('path')
      .data((dataset) => ([dataset.data]))
      .enter()
      .append('path')
      .attr('d', theLine)
      .attr('pointer-events', 'none')
      .style('fill-opacity', config.radarAreaOpacity);

    // legend
    if (this.options.showLegend) {
      const legendItems = this.data.datasets
        .map((data, i) => ({ color: this.options.dataColors[i], text: data.label || '' }));

      const legendG = this.svgEl.append('g')
        .attr('transform', 'translate(0, 30)');

      addLegend(legendG, {
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

export default Radar;
