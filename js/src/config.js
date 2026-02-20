const config = {
  positionType: {
    upLeft: 1,
    upRight: 2,
    downLeft: 3,
    downRight: 4,
  },

  // Font families
  fontFamily: 'xkcd',
  fallbackFontFamily: 'Arial, sans-serif',

  // SVG filter IDs
  filterUrl: 'url(#xkcdify)',
  filterUrlPie: 'url(#xkcdify-pie)',

  // SVG defaults
  svgStrokeWidth: 3,
  aspectRatio: 2 / 3,

  // Margins for charts with axes
  margin: {
    top: 50,
    right: 30,
    bottom: 50,
    left: 50,
  },
  marginTopWithTitle: 60,
  marginLeftWithYLabel: 70,

  // Margin for charts without axes (Pie, Radar)
  marginScalar: 50,

  // Axis and label font sizes
  tickFontSize: 16,
  titleFontSize: 20,
  labelFontSize: 17,
  tooltipFontSize: 15,

  // Dot sizes (multiplied by dotSize option)
  dotInitRadius: 3.5,
  dotHoverRadius: 6,

  // Bar chart
  barCornerRadius: 2,
  barStrokeWidth: 3,
  bandPadding: 0.4,

  // Pie chart
  pieStrokeWidth: 2,

  // Tooltip/legend shared
  tooltipMouseOffset: 10,
  scatterMouseOffset: 5,
  swatchSize: 8,
  swatchCornerRadius: 2,
  itemRowHeight: 20,
  itemTextOffset: 12,
  itemXOffset: 15,
  backgroundCornerRadius: 5,
  backgroundStrokeWidth: 2,
  tooltipBackgroundOpacity: 0.9,
  legendBackgroundOpacity: 0.85,

  // Default tick counts
  defaultTickCount: 3,

  // Radar chart
  radarAreaOpacity: 0.2,

  // Selection box
  boxSelectMinDrag: 4,
};

export default config;
