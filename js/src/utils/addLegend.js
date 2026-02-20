import config from '../config';

export default function addLegend(parent, {
  items, position, unxkcdify, parentWidth, parentHeight, strokeColor, backgroundColor,
}) {
  const filter = !unxkcdify ? config.filterUrl : null;

  const legend = parent.append('svg');
  const backgroundLayer = legend.append('svg');
  const textLayer = legend.append('svg');

  items.forEach((item, i) => {
    const itemY = 17 + config.itemRowHeight * i;

    textLayer.append('rect')
      .style('fill', item.color)
      .attr('width', config.swatchSize)
      .attr('height', config.swatchSize)
      .attr('filter', filter)
      .attr('rx', config.swatchCornerRadius)
      .attr('ry', config.swatchCornerRadius)
      .attr('x', config.itemXOffset)
      .attr('y', itemY);

    textLayer.append('text')
      .style('font-size', config.tooltipFontSize)
      .style('fill', strokeColor)
      .attr('x', config.itemXOffset + config.itemTextOffset)
      .attr('y', itemY + config.swatchSize)
      .text(item.text);
  });

  setTimeout(() => {
    const bbox = textLayer.node().getBBox();
    const backgroundWidth = bbox.width + config.itemXOffset;
    const backgroundHeight = bbox.height + 10;

    let legendX = 0;
    let legendY = 0;
    if (
      position === config.positionType.downLeft
      || position === config.positionType.downRight
    ) {
      legendY = parentHeight - backgroundHeight - 13;
    }
    if (
      position === config.positionType.upRight
      || position === config.positionType.downRight
    ) {
      legendX = parentWidth - backgroundWidth - 13;
    }

    backgroundLayer.append('rect')
      .style('fill', backgroundColor)
      .attr('filter', filter)
      .attr('fill-opacity', config.legendBackgroundOpacity)
      .attr('stroke', strokeColor)
      .attr('stroke-width', config.backgroundStrokeWidth)
      .attr('width', backgroundWidth)
      .attr('height', backgroundHeight)
      .attr('rx', config.backgroundCornerRadius)
      .attr('ry', config.backgroundCornerRadius)
      .attr('x', 8)
      .attr('y', 5);

    legend
      .attr('x', legendX)
      .attr('y', legendY);
  }, 10);
}
