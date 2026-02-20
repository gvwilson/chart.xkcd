import config from '../config';

/**
 * Determine which corner quadrant the tooltip should open toward
 * based on the cursor position within the chart area, so the
 * tooltip doesn't overflow the visible chart bounds.
 *
 * @param {number} tipX - Cursor x position in SVG coordinates.
 * @param {number} tipY - Cursor y position in SVG coordinates.
 * @param {number} width - Chart area width.
 * @param {number} height - Chart area height.
 * @returns {number} One of `config.positionType.*`.
 */
export function tooltipPositionType(tipX, tipY, width, height) {
  if (tipX > width / 2 && tipY < height / 2) {
    return config.positionType.downLeft;
  } else if (tipX > width / 2 && tipY > height / 2) {
    return config.positionType.upLeft;
  } else if (tipX < width / 2 && tipY > height / 2) {
    return config.positionType.upRight;
  }
  return config.positionType.downRight;
}

/**
 * Floating tooltip displayed on hover over chart elements.
 *
 * Consists of a title, a list of colored items (swatch + text),
 * and a semi-transparent rounded-rect background. Position and
 * content are updated dynamically via `update()`.
 *
 * @param {Object} opts
 * @param {d3.Selection} opts.parent - SVG element to append the tooltip into.
 * @param {string} opts.title - Initial title text.
 * @param {Array<{color: string, text: string}>} opts.items - Data items.
 * @param {Object} opts.position - `{x, y, type}` where type is a positionType.
 * @param {boolean} opts.unxkcdify - Skip the hand-drawn filter.
 * @param {string} opts.backgroundColor - Tooltip background fill.
 * @param {string} opts.strokeColor - Border and text color.
 */
class Tooltip {
  constructor({
    parent, title, items, position, unxkcdify, backgroundColor, strokeColor,
  }) {
    this.title = title;
    this.items = items;
    this.position = position;
    this.filter = !unxkcdify ? config.filterUrl : null;
    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;

    this.svg = parent.append('svg')
      .attr('x', this._getUpLeftX())
      .attr('y', this._getUpLeftY())
      .style('visibility', 'hidden');

    this.tipBackground = this.svg.append('rect')
      .style('fill', this.backgroundColor)
      .attr('fill-opacity', config.tooltipBackgroundOpacity)
      .attr('stroke', strokeColor)
      .attr('stroke-width', config.backgroundStrokeWidth)
      .attr('rx', config.backgroundCornerRadius)
      .attr('ry', config.backgroundCornerRadius)
      .attr('filter', this.filter)
      .attr('width', this._getBackgroundWidth())
      .attr('height', this._getBackgroundHeight())
      .attr('x', 5)
      .attr('y', 5);

    this.tipTitle = this.svg.append('text')
      .style('font-size', config.tooltipFontSize)
      .style('font-weight', 'bold')
      .style('fill', this.strokeColor)
      .attr('x', config.itemXOffset)
      .attr('y', 25)
      .text(title);

    this.tipItems = items.map((item, i) => this._generateTipItem(item, i));
  }

  show() {
    this.svg.style('visibility', 'visible');
  }

  hide() {
    this.svg.style('visibility', 'hidden');
  }

  update({ title, items, position }) {
    if (title && title !== this.title) {
      this.title = title;
      this.tipTitle.text(title);
    }

    if (items && JSON.stringify(items) !== JSON.stringify(this.items)) {
      this.items = items;

      this.tipItems.forEach((g) => g.svg.remove());

      this.tipItems = this.items.map((item, i) => this._generateTipItem(item, i));

      const maxWidth = Math.max(
        ...this.tipItems.map((item) => item.width),
        this.tipTitle.node().getBBox().width,
      );

      this.tipBackground
        .attr('width', maxWidth + config.itemXOffset)
        .attr('height', this._getBackgroundHeight());
    }

    if (position) {
      this.position = position;
      this.svg.attr('x', this._getUpLeftX());
      this.svg.attr('y', this._getUpLeftY());
    }
  }

  _generateTipItem(item, i) {
    const svg = this.svg.append('svg');
    const itemY = 37 + config.itemRowHeight * i;

    svg.append('rect')
      .style('fill', item.color)
      .attr('width', config.swatchSize)
      .attr('height', config.swatchSize)
      .attr('rx', config.swatchCornerRadius)
      .attr('ry', config.swatchCornerRadius)
      .attr('filter', this.filter)
      .attr('x', config.itemXOffset)
      .attr('y', itemY);

    svg.append('text')
      .style('font-size', config.tooltipFontSize)
      .style('fill', this.strokeColor)
      .attr('x', config.itemXOffset + config.itemTextOffset)
      .attr('y', itemY + config.swatchSize)
      .text(item.text);

    const bbox = svg.node().getBBox();
    return {
      svg,
      width: bbox.width + config.itemXOffset,
      height: bbox.height + 10,
    };
  }

  _getBackgroundWidth() {
    const maxItemLength = this.items.reduce(
      (pre, cur) => (pre > cur.text.length ? pre : cur.text.length), 0,
    );
    const maxLength = Math.max(maxItemLength, this.title.length);
    return maxLength * 7.4 + 25;
  }

  _getBackgroundHeight() {
    const rows = this.items.length + 1;
    return rows * config.itemRowHeight + 10;
  }

  _getUpLeftX() {
    if (this.position.type === config.positionType.upRight
      || this.position.type === config.positionType.downRight) {
      return this.position.x;
    }
    return this.position.x - this._getBackgroundWidth() - config.itemRowHeight;
  }

  _getUpLeftY() {
    if (this.position.type === config.positionType.downLeft
      || this.position.type === config.positionType.downRight) {
      return this.position.y;
    }
    return this.position.y - this._getBackgroundHeight() - config.itemRowHeight;
  }
}

export default Tooltip;
