/**
 * Library entry point for standalone (non-widget) usage.
 * Re-exports all chart classes and the shared config object.
 */
import Bar from './Bar';
import Line from './Line';
import Pie from './Pie';
import Radar from './Radar';
import Scatter from './Scatter';
import StackedBar from './StackedBar';
import config from './config';

module.exports = {
  config, Bar, Line, Pie, Radar, Scatter, StackedBar
};
