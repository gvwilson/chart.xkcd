import { axisBottom, axisLeft } from 'd3-axis';
import config from '../config';

function styleAxisParts(parent, { fontFamily, unxkcdify, stroke }) {
  parent.selectAll('.domain')
    .attr('filter', !unxkcdify ? config.filterUrl : null)
    .style('stroke', stroke);

  parent.selectAll('.tick > text')
    .style('font-family', fontFamily)
    .style('font-size', config.tickFontSize)
    .style('fill', stroke);
}

const yAxis = (parent, {
  yScale, tickCount, fontFamily, unxkcdify, stroke,
}) => {
  parent
    .append('g')
    .call(
      axisLeft(yScale)
        .tickSize(1)
        .tickPadding(10)
        .ticks(tickCount, 's'),
    );
  styleAxisParts(parent, { fontFamily, unxkcdify, stroke });
};

const xAxis = (parent, {
  xScale, tickCount, moveDown, fontFamily, unxkcdify, stroke,
}) => {
  parent
    .append('g')
    .attr('transform', `translate(0,${moveDown})`)
    .call(
      axisBottom(xScale)
        .tickSize(0)
        .tickPadding(6)
        .ticks(tickCount),
    );
  styleAxisParts(parent, { fontFamily, unxkcdify, stroke });
};

export default {
  xAxis, yAxis,
};
