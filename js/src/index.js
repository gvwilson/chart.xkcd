/**
 * Library entry point for standalone (non-widget) usage.
 * Re-exports all chart classes, the shared config object,
 * and the makeResponsive utility.
 */
import Bar from './Bar';
import Line from './Line';
import Pie from './Pie';
import Radar from './Radar';
import Scatter from './Scatter';
import StackedBar from './StackedBar';
import Heatmap from './Heatmap';
import config from './config';
import { makeResponsive } from './utils/initChart';

module.exports = {
  config, Bar, Line, Pie, Radar, Scatter, StackedBar, Heatmap, makeResponsive,
};
