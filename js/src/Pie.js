import { select, mouse, event as d3Event } from 'd3-selection';
import { pie, arc } from 'd3-shape';

import addLegend from './utils/addLegend';
import { tooltipPositionType } from './components/Tooltip';
import config from './config';
import {
  applyDefaults, resolveFilterAndFont,
  createSvgEl, setupChartGroupSimple, createTooltip,
} from './utils/initChart';

/**
 * Pie / donut chart.
 *
 * Renders a single dataset as arc segments. The `innerRadius`
 * option (0..1) controls the donut hole size; set to 0 for a
 * solid pie. Segments dim on hover and show a tooltip.
 * Supports click/shift-click selection and an optional legend.
 *
 * @param {SVGElement} svg - Target SVG element.
 * @param {Object} params
 * @param {string} [params.title] - Chart title.
 * @param {Object} params.data
 * @param {string[]} params.data.labels - Slice labels.
 * @param {Object[]} params.data.datasets - Array with a single dataset
 *   containing `data` (number[]) and optional `label`.
 * @param {Object} [params.options] - Includes `innerRadius`, `showLegend`,
 *   `legendPosition`, and all common options from `applyDefaults`.
 */
class Pie {
  constructor(svg, {
    title, data: { labels, datasets }, options,
  }) {
    this.options = applyDefaults({
      innerRadius: 0.5,
      legendPosition: config.positionType.upLeft,
      showLegend: true,
      ...options,
    });
    this.title = title;
    this.data = { labels, datasets };

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

    const radius = Math.min(this.width, this.height) / 2 - config.marginScalar;
    const thePie = pie();
    const dataReady = thePie(this.data.datasets[0].data);
    const theArc = arc()
      .innerRadius(radius * (this.options.innerRadius || 0.5))
      .outerRadius(radius);

    this.chart.selectAll('.xkcd-chart-arc')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('class', '.xkcd-chart-arc')
      .attr('d', theArc)
      .attr('fill', 'none')
      .attr('stroke', this.options.strokeColor)
      .attr('stroke-width', config.pieStrokeWidth)
      .attr('fill', (d, i) => this.options.dataColors[i])
      .attr('filter', this.filter)
      .on('mouseover', (d, i, nodes) => {
        select(nodes[i]).attr('fill-opacity', 0.6);
        tooltip.show();
      })
      .on('mouseout', (d, i, nodes) => {
        select(nodes[i]).attr('fill-opacity', 1);
        tooltip.hide();
      })
      .on('click', (d, i) => {
        if (this.options.onSelect) {
          this.options.onSelect({
            index: i, label: this.data.labels[i], value: d.data,
          }, d3Event.shiftKey);
        }
      })
      .on('mousemove', (d, i, nodes) => {
        const tipX = mouse(nodes[i])[0] + (this.width / 2) + config.tooltipMouseOffset;
        const tipY = mouse(nodes[i])[1] + (this.height / 2) + config.tooltipMouseOffset;

        tooltip.update({
          title: this.data.labels[i],
          items: [{
            color: this.options.dataColors[i],
            text: `${this.data.datasets[0].label || ''}: ${d.data}`,
          }],
          position: {
            x: tipX,
            y: tipY,
            type: tooltipPositionType(tipX, tipY, this.width, this.height),
          },
        });
      });

    // Legend
    if (this.options.showLegend) {
      const legendItems = this.data.datasets[0].data
        .map((data, i) => ({ color: this.options.dataColors[i], text: this.data.labels[i] }));

      const legendG = this.svgEl.append('g')
        .attr('transform', 'translate(0, 30)');

      addLegend(legendG, {
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

export default Pie;
